const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

dotenv.config();

const app = express();
const allowedOrigins = new Set(['https://overratedkino.ru', 'https://www.overratedkino.ru', 'https://kino-igra.onrender.com', 'https://serene.alwaysdata.net', 'http://localhost:5173', 'http://localhost:3001', 'http://localhost:4175']);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)) }));

// Отключение HTTP/3 (QUIC) для предотвращения сбоев подключения в РФ (блокировки UDP 443 провайдерами)
app.use((req, res, next) => {
    res.setHeader('Alt-Svc', 'clear');
    next();
});


const server = http.createServer(app);
const io = new Server(server, {
    allowRequest: (req, callback) => callback(null, !req.headers.origin || allowedOrigins.has(req.headers.origin)),
    cors: {
        origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)),
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 16384,
    pingInterval: 10000,
    pingTimeout: 20000
});

// Хранилище лобби в памяти (для MVP)
const lobbies = new Map();
const roomActions = require('./room-actions');
const lifecycle = require('./room-lifecycle');
const categoryIds = new Set(require('../shared/catalog-categories.json').map(c => c.id));
const modes = require('./match-modes')({lobbies, emit: emitLobbyUpdate, clearTimer: clearLobbyTimer, endRound});
const roomStore = require('./room-store')(lobbies);
let saveTimer;
function saveRooms() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { roomStore.save(); } catch (e) { console.error('[STATE SAVE]', e.message); } }, 100);
}

function publicPlayer(p) {
    const { id, nickname, color, emoji, vp, connected } = p;
    return { id, nickname, color, emoji, vp, connected };
}
function sanitizeLobby(lobby, playerId) {
    const { id, host, targetVP, state, movies, timeLeft, timerRunning, roundPoints, roundDetails,
        roundAverages, isFinalRound, pausedDueToDisconnect, disconnectedPlayerName, disconnectedPlayerId, roundId } = lobby;
    const progress = Object.fromEntries(lobby.players.map(p => [p.id, Object.keys(lobby.ratings[p.id] || {}).length]));
    const active = lobby.players.filter(p => p.connected);
    return modes.publicView(lobby, playerId, { id, host, targetVP, state, movies, timeLeft, timerRunning, roundPoints, roundDetails,
        roundAverages, isFinalRound, pausedDueToDisconnect, disconnectedPlayerName, disconnectedPlayerId, roundId,
        players: lobby.players.map(publicPlayer), winner: lobby.winner ? publicPlayer(lobby.winner) : null,
        allColors: COLORS, progress, categories: lobby.categories || ['films'],
        allVoted: state === 'round_start' && active.length > 0 && active.every(p => progress[p.id] === 5),
        ratings: state === 'round_start' ? (playerId ? { [playerId]: lobby.ratings[playerId] || {} } : {}) : lobby.ratings });
}
function emitLobbyUpdate(lobbyId, lobby) {
    saveRooms();
    for (const p of lobby.players) {
        if (p.connected && p.socketId) io.to(p.socketId).emit('lobby_update', sanitizeLobby(lobby, p.id));
    }
}

// Загрузка фильмов
let ALL_MOVIES = [];
try {
    const moviesPath = path.join(__dirname, 'movies.json');
    const data = fs.readFileSync(moviesPath, 'utf8');
    const parsed = JSON.parse(data);
    ALL_MOVIES = parsed.map((m, index) => ({
        id: m.id || (m.url ? m.url.split('/')[2] : `m-${index}`),
        title: m.title || m.name,
        category: m.category || 'films',
        posterUrl: m.posterUrl || m.image
    })).filter(m => m.posterUrl);
    console.log(`Loaded ${ALL_MOVIES.length} movies.`);
} catch (e) {
    throw new Error('Failed to load movies: ' + e.message);
}

function pickMoviesForRound(lobby) {
    return roomActions.draw(lobby, ALL_MOVIES, 5);
}

// Генерация случайного кода из 6 символов
const generateCode = () => { let code; do { code = crypto.randomBytes(3).toString('hex').toUpperCase(); } while (lobbies.has(code)); return code; };

// Shared stable identity keys for all characters, up to 16 players.
const COLORS = require('../shared/player-identities.json').map(({hex, colorName}) => ({hex, name: colorName, emoji: '🌧️'}));

function scheduleHostTransfer(lobby, lobbyId) {
    if (lobby.hostGraceTimer) clearTimeout(lobby.hostGraceTimer);
    lobby.hostGraceTimer = setTimeout(() => {
        const currentHost = lobby.players.find(p => p.id === lobby.host);
        if (!currentHost || !currentHost.connected) {
            const nextOnline = lobby.players.find(p => p.connected);
            if (nextOnline) {
                lobby.host = nextOnline.id;
                lobby.hostGraceTimer = null;
                console.log(`Host transferred to ${nextOnline.nickname} (${nextOnline.id}) in lobby ${lobbyId} after 30s timeout`);
                emitLobbyUpdate(lobbyId, lobby);
                io.to(lobbyId).emit('host_transferred', {
                    newHostId: nextOnline.id,
                    newHostName: nextOnline.nickname
                });
            }
        }
    }, 30000);
}

function clearLobbyTimer(lobby) {
    if (lobby.timerRunning && lobby.deadline) lobby.timeLeft = Math.max(0, Math.ceil((lobby.deadline - Date.now()) / 1000));
    if (lobby.timerInterval) {
        clearInterval(lobby.timerInterval);
        lobby.timerInterval = null;
    }
    lobby.timerRunning = false;
}

function closeRoom(lobbyId, message) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;
    clearLobbyTimer(lobby);
    if (lobby.hostGraceTimer) clearTimeout(lobby.hostGraceTimer);
    io.to(lobbyId).emit('lobby_closed', { message });
    io.in(lobbyId).socketsLeave(lobbyId);
    for (const client of io.sockets.sockets.values()) if (client.data.lobbyId === lobbyId) client.data.lobbyId = null;
    lobbies.delete(lobbyId);
    saveRooms();
}

function fillRemainingRatingsRandomly(lobby) {
    const allRatings = ['S', 'A', 'B', 'C', 'D'];
    lobby.players.forEach(p => {
        if (!lobby.ratings[p.id]) {
            lobby.ratings[p.id] = {};
        }
        const userRatings = lobby.ratings[p.id];
        for (const m of lobby.movies) if (!userRatings[m.id]) ((lobby.autoRatings ||= {})[p.id] ||= {})[m.id] = true;
        if (lobby.repeatRatings) { modes.fill(lobby,p.id); return; }
        const usedRatings = new Set(Object.values(userRatings));
        const unusedRatings = allRatings.filter(r => !usedRatings.has(r));

        const unratedMovies = lobby.movies.filter(m => !userRatings[m.id]);
        if (unratedMovies.length > 0 && unusedRatings.length > 0) {
            for (let i = unusedRatings.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [unusedRatings[i], unusedRatings[j]] = [unusedRatings[j], unusedRatings[i]];
            }
            unratedMovies.forEach(m => {
                if (unusedRatings.length > 0) {
                    userRatings[m.id] = unusedRatings.pop();
                }
            });
        }
    });
}

function endRound(lobbyId) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby || lobby.state !== 'round_start') return;

    clearLobbyTimer(lobby);

    // Автоматически рандомим оставшиеся оценки для игроков, которые не успели
    fillRemainingRatingsRandomly(lobby);

    // Подсчет очков за совпадения
    const roundPoints = {};
    lobby.players.forEach(p => {
        roundPoints[p.id] = 0;
    });

    const roundDetails = {}; // movieId -> { [rating]: [playerId] }

    lobby.movies.forEach(movie => {
        const ratingGroups = { S: [], A: [], B: [], C: [], D: [] };
        lobby.players.forEach(p => {
            const userRating = lobby.ratings[p.id]?.[movie.id];
            if (userRating && ratingGroups[userRating]) {
                ratingGroups[userRating].push(p.id);
            }
        });

        roundDetails[movie.id] = ratingGroups;

        // За каждое совпадение с другим игроком: +1 ПО
        Object.entries(ratingGroups).forEach(([rating, playerIds]) => {
            if (playerIds.length >= 2) {
                const pts = playerIds.length - 1;
                playerIds.forEach(pId => {
                    roundPoints[pId] = (roundPoints[pId] || 0) + pts;
                });
            }
        });
    });

    lobby.roundDetails = roundDetails;
    modes.score(lobby, roundPoints);
    // Начисляем очки игрокам
    lobby.players.forEach(p => {
        p.vp = (p.vp || 0) + (roundPoints[p.id] || 0);
    });

    // Средний балл для каждого фильма: S=5, A=4, B=3, C=2, D=1
    const roundAverages = {};
    const RATING_NUMBERS = { S: 5, A: 4, B: 3, C: 2, D: 1 };
    lobby.movies.forEach(movie => {
        let total = 0;
        let count = 0;
        lobby.players.forEach(p => {
            const r = lobby.ratings[p.id]?.[movie.id];
            if (r && RATING_NUMBERS[r]) {
                total += RATING_NUMBERS[r];
                count++;
            }
        });
        roundAverages[movie.id] = count > 0 ? (total / count).toFixed(1) : null;
    });

    lobby.roundPoints = roundPoints;
    lobby.roundDetails = roundDetails;
    lobby.roundAverages = roundAverages;

    // Проверяем победителя
    const reachedTarget = lobby.players.filter(p => p.vp >= lobby.targetVP);
    if (reachedTarget.length > 0) {
        reachedTarget.sort((a, b) => b.vp - a.vp);
        lobby.winner = reachedTarget[0];
        lobby.isFinalRound = true;
    } else {
        lobby.winner = null;
        lobby.isFinalRound = false;
    }

    // Всегда остаемся в 'reveal', чтобы все участники увидели оценки и средний балл
    lobby.allVoted = false;
    lobby.state = 'reveal';
    modes.complete(lobby);

    emitLobbyUpdate(lobbyId, lobby);
}

io.on('connection', (socket) => {
    socket.data.playerId = crypto.randomUUID();
    const transportId = socket.id;
    let windowStart = Date.now(), packetCount = 0, createdCount = 0;
    const hostEvents = new Set(['update_target_vp', 'launch_game', 'start_timer', 'pause_timer', 'resume_timer', 'end_round_early', 'next_round', 'finish_game', 'restart_game', 'close_lobby', 'kick_player', 'transfer_host', 'dismiss_disconnect_pause', 'delete_chat_message']);
    socket.use(([event, data, ack], next) => {
        const fail = message => { if (typeof ack === 'function') ack({ success: false, message }); else socket.emit('error_message', message); };
        if (Date.now() - windowStart > 10000) { windowStart = Date.now(); packetCount = 0; }
        if (++packetCount > 100) return fail('Слишком много действий. Подождите несколько секунд.');
        if (event === 'create_lobby') {
            if (!data || typeof data !== 'object' || ++createdCount > 10 || lobbies.size >= 1000) return fail('Не удалось создать комнату. Попробуйте позже.');
            return next();
        }
        const lobbyId = typeof data === 'string' ? data : data?.lobbyId;
        if (typeof lobbyId !== 'string' || !/^[A-Z0-9]{6}$/.test(lobbyId)) return fail('Неверный код комнаты');
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return fail('Лобби не найдено');
        if (lifecycle.isExpired(lobby)) {
            closeRoom(lobbyId, 'Комната закрыта после 15 минут без действий.');
            return fail('Лобби не найдено');
        }
        if (event === 'join_lobby') {
            if (typeof data !== 'object' || (data.nickname !== undefined && (typeof data.nickname !== 'string' || data.nickname.trim().length > 15)) || (data.sessionToken != null && (typeof data.sessionToken !== 'string' || data.sessionToken.length > 128))) return fail('Проверьте никнейм и код комнаты');
            return next();
        }
        const player = lobby.players.find(p => p.id === socket.data.playerId && p.socketId === transportId && p.connected);
        if (!player) return fail('Вы больше не участник этой комнаты');
        if (hostEvents.has(event) && lobby.host !== player.id) return fail('Это действие доступно только ведущему');
        if (['launch_game','start_timer','resume_timer','end_round_early','next_round'].includes(event) && lobby.players.filter(p=>p.connected).length<2) return fail('Ожидаем второго участника');
        if (event === 'submit_rating' && (lobby.state !== 'round_start' || !lobby.movies.some(m => m.id === data.movieId) || !['S','A','B','C','D'].includes(data.rating) || (data.roundId !== undefined && data.roundId !== lobby.roundId))) return fail('Оценка не принята: проверьте текущий раунд');
        if (event === 'change_color' && (typeof data.color !== 'string' || !COLORS.some(c => c.hex.toLowerCase() === data.color.toLowerCase()))) return fail('Выберите цвет из палитры');
        if (lobby.mode === 'opinion') {
            if (['start_timer','pause_timer','resume_timer','end_round_early','dismiss_disconnect_pause'].includes(event)) return fail('В этом режиме таймер управляется автоматически');
            if (['submit_rating','save_critic_ratings','next_round','launch_game'].includes(event) && lobby.players.filter(p=>p.connected).length < 2) return fail('Ожидаем второго участника');
            if (event === 'submit_rating' && ((lobby.phase === 'critic') !== (lobby.criticId === player.id))) return fail('Сейчас вы не выставляете оценки');
        }
        if (event === 'submit_rating' && lobby.savedRatings?.[player.id]) return fail('Нажмите «Изменить оценки»');
        if (['reroll_movie','save_guesser_ratings','edit_guesser_ratings'].includes(event) && data.roundId !== lobby.roundId) return fail('Раунд уже изменился');
        if (event === 'save_critic_ratings' && data.roundId !== undefined && data.roundId !== lobby.roundId) return fail('Раунд уже изменился');
        const required = { launch_game: 'lobby', next_round: 'reveal', finish_game: 'reveal', restart_game: 'game_over' };
        if (required[event] && lobby.state !== required[event]) return fail('Состояние игры изменилось');
        if (event === 'next_round' && lobby.isFinalRound) return fail('Игра завершена. Откройте итоги.');
        next();
    });
    const register = socket.on.bind(socket);
    socket.on = (event, handler) => register(event, (...args) => {
        try {
            if (event !== 'disconnect') {
                const ack = typeof args[1] === 'function' ? args[1] : () => {};
                let answered = false;
                const lobbyId = typeof args[0] === 'string' ? args[0] : args[0]?.lobbyId;
                const markActivity = () => {
                    const lobby = lobbies.get(lobbyId);
                    if (lobby && event !== 'join_lobby' && event !== 'leave_lobby') { lobby.lastActivityAt = Date.now(); saveRooms(); }
                };
                args[1] = response => { answered = true; if (response?.success) markActivity(); ack(response); };
                handler(...args);
                if (!answered) { markActivity(); ack({ success: true }); }
            } else handler(...args);
        } catch (error) { console.error('[EVENT]', event, error.message); if (typeof args[1] === 'function') args[1]({ success: false, message: ['reroll_movie','save_guesser_ratings','edit_guesser_ratings','send_chat_message','delete_chat_message'].includes(event) ? error.message : 'Не удалось выполнить действие' }); }
    });

    console.log('User connected:', socket.data.playerId);

    // Создание лобби
    socket.on('create_lobby', ({ targetVP }, callback) => {
        if (socket.data.lobbyId) return callback({ success: false, message: 'Сначала выйдите из текущей комнаты' });
        const lobbyId = generateCode();
        socket.data.lobbyId = lobbyId;
        lobbies.set(lobbyId, {
            id: lobbyId,
            lastActivityAt: Date.now(),
            host: socket.data.playerId,
            players: [],
            targetVP: Math.min(Math.max(Number(targetVP) || 30, 1), 999),
            categories: ['films'],
            roundId: 0,
            state: 'lobby', // lobby, round_start, reveal, game_over
            allColors: [...COLORS],
            movies: [],
            usedMovieIds: [],
            usedMovieTitles: [],
            allVoted: false,
            ratings: {}, // { playerId: { movieId: 'S', ... } }
            timeLeft: 60,
            timerRunning: false,
            timerInterval: null,
            roundPoints: {},
            roundDetails: {},
            roundAverages: {},
            winner: null,
            isFinalRound: false,
            pausedDueToDisconnect: false,
            disconnectedPlayerName: null,
            disconnectedPlayerId: null,
            hostGraceTimer: null
        });
        socket.join(lobbyId);
        callback({ success: true, lobbyId });
        console.log(`Lobby ${lobbyId} created by ${socket.data.playerId}`);
    });

    // Хост меняет цель победы в созданном лобби
    socket.on('update_target_vp', ({ lobbyId, targetVP, categories, mode, circles, hiddenMode, repeatRatings }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.host !== socket.data.playerId || lobby.state !== 'lobby') return;
        if (categories !== undefined && (!Array.isArray(categories) || !categories.length || categories.some(c => !categoryIds.has(c)))) {
            if (callback) callback({ success: false, message: 'Выберите хотя бы одну допустимую категорию' });
            return;
        }
        if (mode !== undefined && !['original','opinion'].includes(mode)) return callback({success:false,message:'Неизвестный режим'});
        if (circles !== undefined && (!Number.isInteger(circles)||circles<1||circles>999)) return callback({success:false,message:'Введите от 1 до 999 кругов'});
        if ([hiddenMode,repeatRatings].some(v=>v!==undefined&&typeof v!=='boolean')) return callback({success:false,message:'Неверные условия'});
        const val = Math.min(Math.max(Number(targetVP) || 30, 1), 999);
        Object.assign(lobby,{mode:mode??lobby.mode??'original',circles:circles??lobby.circles??1,hiddenMode:hiddenMode??lobby.hiddenMode??false,repeatRatings:repeatRatings??lobby.repeatRatings??false});
        lobby.targetVP = val;
        if (categories !== undefined) lobby.categories = [...new Set(categories)];
        emitLobbyUpdate(lobbyId, lobby);
        if (callback) callback({ success: true, targetVP: val });
    });

    // Подключение к лобби (с защитой по IP, уникальностью ников и запретом входа новых во время матча)
    socket.on('join_lobby', ({ lobbyId, nickname, sessionToken }, callback) => {
        if (!callback) callback = () => { };
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return callback({ success: false, message: 'Лобби не найдено' });

        const trimmedNick = (nickname || '').trim();

        if (socket.data.lobbyId && socket.data.lobbyId !== lobbyId) return callback({ success: false, message: 'Сначала выйдите из текущей комнаты' });
        const existingPlayer = sessionToken ? lobby.players.find(p => p.sessionToken === sessionToken) : null;
        if (!existingPlayer && lobby.players.some(p => p.socketId === transportId && p.connected)) return callback({ success: false, message: 'Вы уже в этой комнате' });
        const existingNick = lobby.players.find(p => p.nickname.toLowerCase() === trimmedNick.toLowerCase());
        if (!existingPlayer && existingNick) return callback({ success: false, message: 'Никнейм занят. Вернитесь из прежнего браузера или выберите другой.' });
        if (existingPlayer) {
            const oldSocketId = existingPlayer.id;
            if (existingPlayer.socketId && existingPlayer.socketId !== transportId) {
                const previous = io.sockets.sockets.get(existingPlayer.socketId);
                previous?.emit('session_replaced', { message: 'Игра открыта в другой вкладке.' });
                previous?.leave(lobbyId);
            }
            socket.data.playerId = existingPlayer.id;
            socket.data.lobbyId = lobbyId;
            existingPlayer.socketId = transportId;
            const wasDisconnected = !existingPlayer.connected;
            existingPlayer.connected = true;
            existingPlayer.voluntarilyLeft = false;
            modes.reconnect(lobby,existingPlayer,wasDisconnected);
            socket.join(lobbyId);
            if (!lobby.players.some(p => p.id === lobby.host && p.connected)) scheduleHostTransfer(lobby, lobbyId);

            // Если хост переподключился (отменяем 30-секундный таймер передачи хоста)
            if (lobby.host === existingPlayer.id) {
                if (lobby.hostGraceTimer) {
                    clearTimeout(lobby.hostGraceTimer);
                    lobby.hostGraceTimer = null;
                }
                lobby.host = socket.data.playerId;
            }

            // Если игра стояла на паузе из-за этого игрока, снимаем статус паузы
            if (lobby.disconnectedPlayerId === oldSocketId || lobby.disconnectedPlayerId === existingPlayer.id || lobby.disconnectedPlayerName === existingPlayer.nickname) {
                lobby.pausedDueToDisconnect = false;
                lobby.disconnectedPlayerName = null;
                lobby.disconnectedPlayerId = null;
            }

            // Рассылаем актуальный прогресс голосования
            const progress = {};
            lobby.players.forEach(p => {
                progress[p.id] = Object.keys(lobby.ratings[p.id] || {}).length;
            });
            if (!lobby.hiddenMode && lobby.mode !== 'opinion') io.to(lobbyId).emit('ratings_progress', progress);

            emitLobbyUpdate(lobbyId, lobby);
            return callback({ success: true, player: { ...publicPlayer(existingPlayer), sessionToken: existingPlayer.sessionToken }, lobby: sanitizeLobby(lobby, existingPlayer.id) });
        }

        // Если это новый игрок, никнейм обязателен
        if (!trimmedNick) return callback({ success: false, message: 'Введите никнейм' });

        // Если это НОВЫЙ игрок, но игра уже началась -> вход закрыт!
        if (lobby.state !== 'lobby') {
            return callback({ success: false, message: 'Игра уже началась! Вход новых участников закрыт.' });
        }

        if (lobby.players.length >= 16) return callback({ success: false, message: 'Лобби заполнено (макс. 16 игроков)' });

        // Choose the first unused identity from the 24 selectable variants.
        const colorObj = COLORS.find(c => !lobby.players.some(p => p.color.toLowerCase() === c.hex.toLowerCase())) || COLORS[0];
        const newToken = crypto.randomBytes(32).toString('hex');
        socket.data.lobbyId = lobbyId;
        const newPlayer = {
            id: socket.data.playerId,
            nickname: trimmedNick,
            color: colorObj.hex,
            emoji: colorObj.emoji,
            socketId: transportId,
            vp: 0,
            connected: true,
            sessionToken: newToken
        };

        lobby.players.push(newPlayer);
        lobby.lastActivityAt = Date.now();
        socket.join(lobbyId);

        emitLobbyUpdate(lobbyId, lobby);
        callback({ success: true, player: { ...publicPlayer(newPlayer), sessionToken: newPlayer.sessionToken }, lobby: sanitizeLobby(lobby, newPlayer.id) });
    });

    // Хост запускает игру
    socket.on('launch_game', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId) {
            if (lobby.players.filter(p => p.connected).length < 2) {
                return socket.emit('error_message', 'Для старта игры нужно минимум 2 игрока');
            }
            clearLobbyTimer(lobby);
            lobby.roundId = (lobby.roundId || 0) + 1;
            lobby.state = 'round_start';
            lobby.ratings = {};
            lobby.timeLeft = 60;
            lobby.timerRunning = false;
            lobby.roundPoints = {};
            lobby.roundDetails = {};
            lobby.winner = null;
            lobby.allVoted = false;

            // Выбираем 5 случайных фильмов без повторений в лобби
            if (!lobby.usedMovieIds) lobby.usedMovieIds = [];
            if (!lobby.usedMovieTitles) lobby.usedMovieTitles = [];
            lobby.movies = pickMoviesForRound(lobby);
            modes.start(lobby);

            // Сбрасываем счетчики выбора фильмов
            const resetProgress = {};
            lobby.players.forEach(p => { resetProgress[p.id] = 0; });
            io.to(lobbyId).emit('ratings_progress', resetProgress);

            emitLobbyUpdate(lobbyId, lobby);
        }
    });

    socket.on('save_critic_ratings', ({lobbyId}, callback) => {
        const l=lobbies.get(lobbyId);
        if(l.mode!=='opinion'||l.state!=='round_start'||l.phase!=='critic'||l.criticId!==socket.data.playerId||Object.keys(l.ratings[l.criticId]||{}).length!==5) return callback({success:false,message:'Сначала выставьте все пять оценок'});
        modes.guessing(l);callback({success:true});
    });

    socket.on('reroll_movie', ({lobbyId, movieId, roundId}, callback) => {
        const l = lobbies.get(lobbyId);
        roomActions.reroll(l, socket.data.playerId, movieId, roundId, ALL_MOVIES);
        emitLobbyUpdate(lobbyId, l); callback({success:true});
    });
    for (const event of ['save_guesser_ratings', 'edit_guesser_ratings']) socket.on(event, ({lobbyId, roundId}, callback) => {
        const l = lobbies.get(lobbyId);
        roomActions.saveVotes(l, socket.data.playerId, roundId, event === 'edit_guesser_ratings');
        if (roomActions.allSaved(l)) endRound(lobbyId);
        else emitLobbyUpdate(lobbyId, l);
        callback({success:true});
    });
    socket.on('send_chat_message', ({lobbyId, text}, callback) => {
        const l = lobbies.get(lobbyId), p = l.players.find(p => p.id === socket.data.playerId);
        const message = roomActions.sendChat(l, p, text);
        emitLobbyUpdate(lobbyId, l); callback({success:true, messageId:message.id});
    });
    socket.on('delete_chat_message', ({lobbyId, messageId}, callback) => {
        const l = lobbies.get(lobbyId);
        roomActions.deleteChat(l, socket.data.playerId, messageId);
        emitLobbyUpdate(lobbyId, l); callback({success:true});
    });

    // Запуск таймера хостом
    socket.on('start_timer', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId && lobby.state === 'round_start') {
            if (lobby.timerRunning) return;
            lobby.deadline = Date.now() + lobby.timeLeft * 1000;
            lobby.timerRunning = true;
            io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: true });
            emitLobbyUpdate(lobbyId, lobby);

            lobby.timerInterval = setInterval(() => {
                lobby.timeLeft = Math.max(0, Math.ceil((lobby.deadline - Date.now()) / 1000));
                if (lobby.timeLeft <= 0) {
                    endRound(lobbyId);
                } else {
                    io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: true });
                }
            }, 1000);
        }
    });

    // Пауза таймера хостом
    socket.on('pause_timer', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId && lobby.state === 'round_start') {
            clearLobbyTimer(lobby);
            io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: false });
            emitLobbyUpdate(lobbyId, lobby);
        }
    });

    // Возобновление таймера хостом
    socket.on('resume_timer', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId && lobby.state === 'round_start') {
            if (lobby.timerRunning || lobby.timeLeft <= 0) return;
            lobby.deadline = Date.now() + lobby.timeLeft * 1000;
            lobby.timerRunning = true;
            io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: true });
            emitLobbyUpdate(lobbyId, lobby);

            lobby.timerInterval = setInterval(() => {
                lobby.timeLeft = Math.max(0, Math.ceil((lobby.deadline - Date.now()) / 1000));
                if (lobby.timeLeft <= 0) {
                    endRound(lobbyId);
                } else {
                    io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: true });
                }
            }, 1000);
        }
    });

    // Досрочное завершение раунда хостом (без ожидания таймера)
    socket.on('end_round_early', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId && lobby.state === 'round_start') {
            endRound(lobbyId);
        }
    });

    // Выставление / изменение оценки (со свапом оценок и авто-заполнением 5-го фильма)
    socket.on('submit_rating', ({ lobbyId, movieId, rating }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.state !== 'round_start') return;
        if (!lobby.ratings[socket.data.playerId]) lobby.ratings[socket.data.playerId] = {};

        const userRatings = lobby.ratings[socket.data.playerId];
        if(lobby.autoRatings?.[socket.data.playerId]) delete lobby.autoRatings[socket.data.playerId][movieId];
        const movieWithRating = Object.keys(userRatings).find(mId => userRatings[mId] === rating);
        const oldRatingOfCurrentMovie = userRatings[movieId];

        if (!lobby.repeatRatings && movieWithRating && movieWithRating !== movieId) {
            // Свап: если буква уже стояла у другого фильма, меняем их местами
            userRatings[movieId] = rating;
            if (oldRatingOfCurrentMovie) {
                userRatings[movieWithRating] = oldRatingOfCurrentMovie;
            } else {
                delete userRatings[movieWithRating];
            }
        } else if (oldRatingOfCurrentMovie === rating) {
            // Если все 5 оценок уже выставлены, пользователь меняет их местами свапом.
            // Но если выставлено меньше 5, можно снять оценку повторным кликом
            if (Object.keys(userRatings).length < 5) {
                delete userRatings[movieId];
            }
        } else {
            userRatings[movieId] = rating;
        }

        // Если оценено 4 из 5 фильмов -> оставшаяся оценка автоматически выставляется последнему фильму
        const ratedKeys = Object.keys(userRatings).filter(id => userRatings[id]);
        if (!lobby.repeatRatings && ratedKeys.length === 4 && lobby.movies.length === 5) {
            const unratedMovie = lobby.movies.find(m => !userRatings[m.id]);
            const used = Object.values(userRatings);
            const remaining = ['S', 'A', 'B', 'C', 'D'].find(r => !used.includes(r));
            if (unratedMovie && remaining) {
                userRatings[unratedMovie.id] = remaining;
                // The fifth distinct rank is forced, not a random timeout answer.
                if (lobby.autoRatings?.[socket.data.playerId]) delete lobby.autoRatings[socket.data.playerId][unratedMovie.id];
            }
        }

        // Отправляем прогресс готовности игроков (сколько фильмов оценено) без раскрытия букв
        const progress = {};
        lobby.players.forEach(p => {
            progress[p.id] = Object.keys(lobby.ratings[p.id] || {}).length;
        });
        if (!lobby.hiddenMode && lobby.mode !== 'opinion') io.to(lobbyId).emit('ratings_progress', progress);

        // Проверяем: все ли активные игроки оценили все 5 фильмов
        const activePlayers = lobby.players.filter(p => p.connected);
        const allVoted = activePlayers.length > 0 && activePlayers.every(p => {
            return (progress[p.id] || 0) >= 5;
        });
        lobby.allVoted = allVoted;
        emitLobbyUpdate(lobbyId, lobby);

        if (callback) callback({ success: true, myRatings: userRatings });
    });

    // Следующий раунд
    socket.on('next_round', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId) {
            clearLobbyTimer(lobby);
            lobby.roundId = (lobby.roundId || 0) + 1;
            lobby.state = 'round_start';
            lobby.ratings = {};
            lobby.timeLeft = 60;
            lobby.timerRunning = false;
            lobby.roundPoints = {};
            lobby.roundDetails = {};
            lobby.roundAverages = {};
            lobby.isFinalRound = false;
            lobby.winner = null;
            lobby.allVoted = false;

            // Выбираем 5 случайных фильмов без повторений в лобби
            lobby.movies = pickMoviesForRound(lobby);
            modes.start(lobby);

            // Сбрасываем счетчики выбора фильмов при старте нового раунда
            const resetProgress = {};
            lobby.players.forEach(p => { resetProgress[p.id] = 0; });
            io.to(lobbyId).emit('ratings_progress', resetProgress);

            emitLobbyUpdate(lobbyId, lobby);
        }
    });

    // Хост нажимает "Итоги игры" после финального раунда для открытия финальной таблицы
    socket.on('finish_game', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId && lobby.winner) {
            lobby.state = 'game_over';
            emitLobbyUpdate(lobbyId, lobby);
        }
    });

    // Перезапуск игры с нуля
    socket.on('restart_game', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.data.playerId) {
            clearLobbyTimer(lobby);
            lobby.state = 'lobby';
            lobby.criticQueue=null;lobby.history=[];lobby.criticId=null;lobby.criticPlayer=null;lobby.phase=null;lobby.autoRatings={};lobby.perfect={};lobby.matchPoints={};lobby.revealedAt=null;lobby.opinionRemaining=null;
            lobby.ratings = {};
            lobby.timeLeft = 60;
            lobby.timerRunning = false;
            lobby.winner = null;
            lobby.isFinalRound = false;
            lobby.roundPoints = {};
            lobby.roundDetails = {};
            lobby.roundAverages = {};
            lobby.allVoted = false;
            // Не затираем историю использованных фильмов, чтобы они не повторялись и в новых играх
            if (!lobby.usedMovieIds) lobby.usedMovieIds = [];
            if (!lobby.usedMovieTitles) lobby.usedMovieTitles = [];
            lobby.players.forEach(p => p.vp = 0);

            emitLobbyUpdate(lobbyId, lobby);
        }
    });

    // Change the player's robot/color identity in the lobby.
    socket.on('change_color', ({ lobbyId, color }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.state !== 'lobby') return;

        // Проверяем, не занят ли цвет другим игроком
        const isTaken = lobby.players.some(p => p.id !== socket.data.playerId && p.color.toLowerCase() === color.toLowerCase());
        if (isTaken) {
            if (callback) callback({ success: false, message: 'Этот цвет уже занят' });
            return;
        }

        const colorObj = COLORS.find(c => c.hex.toLowerCase() === color.toLowerCase()) || { hex: color, emoji: '🌧️' };
        const player = lobby.players.find(p => p.id === socket.data.playerId);
        if (player) {
            player.color = colorObj.hex;
            player.emoji = colorObj.emoji;
            emitLobbyUpdate(lobbyId, lobby);
            if (callback) callback({ success: true, color: colorObj.hex, emoji: colorObj.emoji });
        }
    });

    // Добровольный выход игрока в главное меню (с сохранением его прогресса на случай возвращения)
    socket.on('leave_lobby', ({ lobbyId }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return;

        const player = lobby.players.find(p => p.id === socket.data.playerId);
        if (player) {
            player.connected = false;
            player.voluntarilyLeft = true;
            modes.disconnected(lobby,player,true);
                io.to(lobbyId).emit('player_connection_notice', {message: lobby.hiddenMode ? 'Один из игроков покинул игру' : `Игрок «${player.nickname}» покинул игру`});
            socket.leave(lobbyId);
            socket.data.lobbyId = null;

            if (lifecycle.everyoneLeft(lobby)) {
                closeRoom(lobbyId, 'Все игроки вышли из комнаты.');
                if (callback) callback({ success: true });
                return;
            }

            // Если идет раунд и таймер был запущен -> ставим на паузу
            if (lobby.mode !== 'opinion' && lobby.state === 'round_start' && lobby.timerRunning) {
                clearLobbyTimer(lobby);
                lobby.pausedDueToDisconnect = true;
                lobby.disconnectedPlayerName = player.nickname;
                lobby.disconnectedPlayerId = player.id;
                io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: false });
            }

            // Если вышел хост, даем 30 секунд на возврат перед передачей хоста
            if (lobby.host === socket.data.playerId) {
                scheduleHostTransfer(lobby, lobbyId);
            }

            emitLobbyUpdate(lobbyId, lobby);
            if (callback) callback({ success: true });
        }
    });

    // Закрытие / роспуск лобби хостом (во время матча или в комнате ожидания)
    socket.on('close_lobby', ({ lobbyId }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.host !== socket.data.playerId) return;

        closeRoom(lobbyId, 'Хост закрыл комнату.');
        if (callback) callback({ success: true });
    });

    // Исключение игрока хостом / продолжение игры без него
    socket.on('kick_player', ({ lobbyId, playerId }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.host !== socket.data.playerId) return;

        const index = lobby.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            if (playerId === lobby.host) return callback({ success: false, message: 'Сначала передайте права ведущего' });
            const removed = lobby.players.splice(index, 1)[0];
            modes.disconnected(lobby,removed,true);
            const kicked = io.sockets.sockets.get(removed.socketId);
            kicked?.emit('kicked', { message: 'Ведущий исключил вас из комнаты' });
            kicked?.leave(lobbyId);
            if (kicked) kicked.data.lobbyId = null;

            // Удаляем оценки исключенного игрока
            if (lobby.ratings[playerId] && !(lobby.mode === 'opinion' && lobby.criticId === playerId)) {
                delete lobby.ratings[playerId];
            }

            // Если игра стояла на паузе из-за этого игрока, снимаем паузу
            if (lobby.disconnectedPlayerId === playerId || lobby.disconnectedPlayerName === removed.nickname) {
                lobby.pausedDueToDisconnect = false;
                lobby.disconnectedPlayerName = null;
                lobby.disconnectedPlayerId = null;
            }

            emitLobbyUpdate(lobbyId, lobby);
            if (callback) callback({ success: true });
        }
    });

    // Ручная передача статуса хоста другому игроку (в лобби или во время матча)
    socket.on('transfer_host', ({ lobbyId, targetPlayerId }, callback) => {
        try {
            const lobby = lobbies.get(lobbyId);
            if (!lobby) {
                if (callback) callback({ success: false, message: 'Лобби не найдено' });
                return;
            }
            if (lobby.host !== socket.data.playerId) {
                if (callback) callback({ success: false, message: 'Только текущий хост может передать права' });
                return;
            }

            const targetPlayer = lobby.players.find(p => p.id === targetPlayerId && p.connected);
            if (!targetPlayer) {
                if (callback) callback({ success: false, message: 'Игрок не найден или отключен' });
                return;
            }

            lobby.host = targetPlayer.id;
            if (lobby.hostGraceTimer) {
                clearTimeout(lobby.hostGraceTimer);
                lobby.hostGraceTimer = null;
            }

            console.log(`[HOST TRANSFER] Хост лобби ${lobbyId} передан игроку ${targetPlayer.nickname} (${targetPlayer.id})`);
            emitLobbyUpdate(lobbyId, lobby);
            io.to(lobbyId).emit('host_transferred', {
                newHostId: targetPlayer.id,
                newHostName: targetPlayer.nickname
            });
            if (callback) callback({ success: true, newHostId: targetPlayer.id });
        } catch (err) {
            console.error('Error in transfer_host:', err);
            if (callback) callback({ success: false, message: 'Ошибка сервера' });
        }
    });

    // Хост решает продолжить раунд без отключившегося игрока
    socket.on('dismiss_disconnect_pause', ({ lobbyId }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.host !== socket.data.playerId) return;
        lobby.pausedDueToDisconnect = false;
        lobby.disconnectedPlayerName = null;
        lobby.disconnectedPlayerId = null;
        emitLobbyUpdate(lobbyId, lobby);
    });

    // Отключение
    socket.on('disconnect', () => {
        for (let [lobbyId, lobby] of lobbies.entries()) {
            const player = lobby.players.find(p => p.id === socket.data.playerId);
            if (player && player.socketId === transportId) {
                player.connected = false;
            modes.disconnected(lobby,player,false);
                io.to(lobbyId).emit('player_connection_notice', {message: lobby.hiddenMode ? 'Один из игроков потерял соединение' : `Игрок «${player.nickname}» потерял соединение`});
                player.previousSocketId = socket.data.playerId;

                // Если идет раунд и таймер тикал -> ставим на паузу!
                if (lobby.mode !== 'opinion' && lobby.state === 'round_start' && lobby.timerRunning) {
                    clearLobbyTimer(lobby);
                    lobby.pausedDueToDisconnect = true;
                    lobby.disconnectedPlayerName = player.nickname;
                    lobby.disconnectedPlayerId = player.id;
                    io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: false });
                }

                // Если отключился хост, запускаем 30-секундный таймер передачи хоста
                if (lobby.host === socket.data.playerId) {
                    scheduleHostTransfer(lobby, lobbyId);
                }

                // Если все отключились, чистим таймер
                if (lobby.players.every(p => !p.connected)) {
                    clearLobbyTimer(lobby);
                }

                emitLobbyUpdate(lobbyId, lobby);
            }
        }
    });
});

// A dropped connection alone does not close a room: players can reconnect within the idle window.
setInterval(() => {
    const now = Date.now();
    for (const [lobbyId, lobby] of lobbies.entries()) {
        if (lifecycle.isExpired(lobby, now)) closeRoom(lobbyId, 'Комната закрыта после 15 минут без действий.');
    }
}, 10000);

require('./http-service')({ app, server, movies: ALL_MOVIES });
function shutdown() {
    for (const lobby of lobbies.values()) clearLobbyTimer(lobby);
    try { roomStore.save(); } catch (e) { console.error('[STATE SAVE]', e.message); }
    io.emit('server_restarting');
    io.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
