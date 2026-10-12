process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingInterval: 10000,
  pingTimeout: 20000
});

// Хранилище лобби в памяти (для MVP)
const lobbies = new Map();

// Загрузка фильмов
let ALL_MOVIES = [];
try {
    const moviesPath = path.join(__dirname, 'movies.json');
    const data = fs.readFileSync(moviesPath, 'utf8');
    const parsed = JSON.parse(data);
    ALL_MOVIES = parsed.map((m, index) => ({
        id: m.id || (m.url ? m.url.split('/')[2] : `m-${index}`),
        title: m.title || m.name,
        posterUrl: m.posterUrl || m.image
    })).filter(m => m.posterUrl);
    console.log(`Loaded ${ALL_MOVIES.length} movies.`);
} catch (e) {
    console.error('Failed to load movies:', e.message);
}

// Генерация случайного кода из 6 символов
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// 16 контрастных цветов с уникальными и красивыми эмодзи
const COLORS = [
    { hex: '#B57EDC', emoji: '☂️', name: 'Лавандовый' },
    { hex: '#1CA0E5', emoji: '💧', name: 'Неоновый голубой' },
    { hex: '#00E676', emoji: '🍀', name: 'Изумрудный' },
    { hex: '#FF007F', emoji: '🌸', name: 'Фуксия' },
    { hex: '#FFB300', emoji: '⚡', name: 'Янтарный' },
    { hex: '#8A2BE2', emoji: '🔮', name: 'Фиолетовый' },
    { hex: '#FF3864', emoji: '🪸', name: 'Коралловый' },
    { hex: '#00F5D4', emoji: '🫧', name: 'Мятный' },
    { hex: '#FF6D00', emoji: '🦊', name: 'Оранжевый' },
    { hex: '#AEEA00', emoji: '🍏', name: 'Лайм' },
    { hex: '#0091EA', emoji: '🌊', name: 'Лазурный' },
    { hex: '#FF1493', emoji: '🦩', name: 'Hot Pink' },
    { hex: '#FFD600', emoji: '☀️', name: 'Золотой' },
    { hex: '#00B4D8', emoji: '💎', name: 'Аквамарин' },
    { hex: '#7B2CBF', emoji: '🪐', name: 'Ультрафиолет' },
    { hex: '#D8B4FE', emoji: '🌙', name: 'Сиреневый' }
];

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
                io.to(lobbyId).emit('lobby_update', lobby);
                io.to(lobbyId).emit('host_transferred', {
                    newHostId: nextOnline.id,
                    newHostName: nextOnline.nickname
                });
            }
        }
    }, 30000);
}

function clearLobbyTimer(lobby) {
    if (lobby.timerInterval) {
        clearInterval(lobby.timerInterval);
        lobby.timerInterval = null;
    }
    lobby.timerRunning = false;
}

function fillRemainingRatingsRandomly(lobby) {
    const allRatings = ['S', 'A', 'B', 'C', 'D'];
    lobby.players.forEach(p => {
        if (!lobby.ratings[p.id]) {
            lobby.ratings[p.id] = {};
        }
        const userRatings = lobby.ratings[p.id];
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
    lobby.state = 'reveal';

    io.to(lobbyId).emit('lobby_update', lobby);
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Создание лобби
    socket.on('create_lobby', ({ targetVP }, callback) => {
        const lobbyId = generateCode();
        lobbies.set(lobbyId, {
            id: lobbyId,
            host: socket.id,
            players: [],
            targetVP: Math.min(Math.max(Number(targetVP) || 30, 5), 999),
            state: 'lobby', // lobby, round_start, reveal, game_over
            allColors: [...COLORS],
            movies: [],
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
        console.log(`Lobby ${lobbyId} created by ${socket.id}`);
    });

    // Подключение к лобби (с защитой по IP, уникальностью ников и запретом входа новых во время матча)
    socket.on('join_lobby', ({ lobbyId, nickname, sessionToken }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return callback({ success: false, message: 'Лобби не найдено' });

        const trimmedNick = (nickname || '').trim();
        if (!trimmedNick) return callback({ success: false, message: 'Введите никнейм' });

        // Определение IP адреса клиента
        const clientIp = socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim() || socket.handshake.address;

        // Поиск существующего игрока (по сессии или по никнейму)
        const existingByToken = sessionToken ? lobby.players.find(p => p.sessionToken === sessionToken) : null;
        const existingByNick = lobby.players.find(p => p.nickname.toLowerCase() === trimmedNick.toLowerCase());

        const existingPlayer = existingByToken || existingByNick;

        if (existingPlayer) {
            // Если игрок с таким ником уже ОНЛАЙН, но пытается зайти с другого браузера/устройства
            if (existingPlayer.connected && existingPlayer.sessionToken !== sessionToken && existingPlayer.ip !== clientIp) {
                return callback({ success: false, message: 'Игрок с таким ником уже в игре! Выберите другой никнейм.' });
            }

            // Если игрок оффлайн, но кто-то пытается занять его ник с другого IP и без правильного токена
            if (!existingPlayer.connected && existingPlayer.sessionToken && sessionToken && existingPlayer.sessionToken !== sessionToken && existingPlayer.ip && existingPlayer.ip !== clientIp) {
                return callback({ success: false, message: 'Этот никнейм уже занят другим игроком в этом лобби.' });
            }

            // Это владелец переподключается!
            const oldSocketId = existingPlayer.id;
            existingPlayer.previousSocketId = oldSocketId;
            existingPlayer.id = socket.id;
            existingPlayer.connected = true;
            existingPlayer.ip = clientIp; // обновляем IP
            socket.join(lobbyId);

            // Переносим текущие оценки раунда со старого socket.id на новый
            if (oldSocketId && lobby.ratings[oldSocketId]) {
                lobby.ratings[socket.id] = lobby.ratings[oldSocketId];
                delete lobby.ratings[oldSocketId];
            }

            // Если хост переподключился (отменяем 30-секундный таймер передачи хоста)
            if (lobby.host === oldSocketId || lobby.host === existingPlayer.previousSocketId || lobby.host === existingPlayer.id) {
                if (lobby.hostGraceTimer) {
                    clearTimeout(lobby.hostGraceTimer);
                    lobby.hostGraceTimer = null;
                }
                lobby.host = socket.id;
            }

            // Если игра стояла на паузе из-за этого игрока, снимаем статус паузы
            if (lobby.disconnectedPlayerId === oldSocketId || lobby.disconnectedPlayerId === existingPlayer.previousSocketId || lobby.disconnectedPlayerName === existingPlayer.nickname) {
                lobby.pausedDueToDisconnect = false;
                lobby.disconnectedPlayerName = null;
                lobby.disconnectedPlayerId = null;
            }

            io.to(lobbyId).emit('lobby_update', lobby);
            return callback({ success: true, player: existingPlayer, lobby });
        }

        // Если это НОВЫЙ игрок, но игра уже началась -> вход закрыт!
        if (lobby.state !== 'lobby') {
            return callback({ success: false, message: 'Игра уже началась! Вход новых участников закрыт.' });
        }

        if (lobby.players.length >= 16) return callback({ success: false, message: 'Лобби заполнено (макс. 16 игроков)' });

        // Выбираем первый свободный цвет и его эмодзи из 16 вариантов
        const colorObj = COLORS.find(c => !lobby.players.some(p => p.color.toLowerCase() === c.hex.toLowerCase())) || COLORS[0];
        const newToken = Math.random().toString(36).substring(2, 15);
        const newPlayer = {
            id: socket.id,
            nickname: trimmedNick,
            color: colorObj.hex,
            emoji: colorObj.emoji,
            ip: clientIp,
            vp: 0,
            connected: true,
            sessionToken: newToken
        };
        
        lobby.players.push(newPlayer);
        socket.join(lobbyId);
        
        io.to(lobbyId).emit('lobby_update', lobby);
        callback({ success: true, player: newPlayer, lobby });
    });

    // Хост запускает игру
    socket.on('launch_game', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.id) {
            if (lobby.players.length < 2) {
                return socket.emit('error_message', 'Для старта игры нужно минимум 2 игрока');
            }
            clearLobbyTimer(lobby);
            lobby.state = 'round_start';
            lobby.ratings = {};
            lobby.timeLeft = 60;
            lobby.timerRunning = false;
            lobby.roundPoints = {};
            lobby.roundDetails = {};
            lobby.winner = null;
            
            // Выбираем 5 случайных фильмов
            const shuffled = [...ALL_MOVIES].sort(() => 0.5 - Math.random());
            lobby.movies = shuffled.slice(0, 5);
            
            // Сбрасываем счетчики выбора фильмов
            const resetProgress = {};
            lobby.players.forEach(p => { resetProgress[p.id] = 0; });
            io.to(lobbyId).emit('ratings_progress', resetProgress);

            io.to(lobbyId).emit('lobby_update', lobby);
        }
    });

    // Запуск таймера хостом
    socket.on('start_timer', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.id && lobby.state === 'round_start') {
            if (lobby.timerRunning) return;
            lobby.timerRunning = true;
            io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: true });
            io.to(lobbyId).emit('lobby_update', lobby);

            lobby.timerInterval = setInterval(() => {
                lobby.timeLeft--;
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
        if (lobby && lobby.host === socket.id && lobby.state === 'round_start') {
            clearLobbyTimer(lobby);
            io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: false });
            io.to(lobbyId).emit('lobby_update', lobby);
        }
    });

    // Возобновление таймера хостом
    socket.on('resume_timer', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.id && lobby.state === 'round_start') {
            if (lobby.timerRunning || lobby.timeLeft <= 0) return;
            lobby.timerRunning = true;
            io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: true });
            io.to(lobbyId).emit('lobby_update', lobby);

            lobby.timerInterval = setInterval(() => {
                lobby.timeLeft--;
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
        if (lobby && lobby.host === socket.id && lobby.state === 'round_start') {
            endRound(lobbyId);
        }
    });

    // Выставление / изменение оценки (со свапом оценок и авто-заполнением 5-го фильма)
    socket.on('submit_rating', ({ lobbyId, movieId, rating }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.state !== 'round_start') return;
        if (!lobby.ratings[socket.id]) lobby.ratings[socket.id] = {};
        
        const userRatings = lobby.ratings[socket.id];
        const movieWithRating = Object.keys(userRatings).find(mId => userRatings[mId] === rating);
        const oldRatingOfCurrentMovie = userRatings[movieId];

        if (movieWithRating && movieWithRating !== movieId) {
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
        if (ratedKeys.length === 4 && lobby.movies.length === 5) {
            const unratedMovie = lobby.movies.find(m => !userRatings[m.id]);
            const used = Object.values(userRatings);
            const remaining = ['S', 'A', 'B', 'C', 'D'].find(r => !used.includes(r));
            if (unratedMovie && remaining) {
                userRatings[unratedMovie.id] = remaining;
            }
        }

        // Отправляем прогресс готовности игроков (сколько фильмов оценено) без раскрытия букв
        const progress = {};
        lobby.players.forEach(p => {
            progress[p.id] = Object.keys(lobby.ratings[p.id] || {}).length;
        });
        io.to(lobbyId).emit('ratings_progress', progress);

        if (callback) callback({ success: true, myRatings: userRatings });
    });

    // Следующий раунд
    socket.on('next_round', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.id) {
            clearLobbyTimer(lobby);
            lobby.state = 'round_start';
            lobby.ratings = {};
            lobby.timeLeft = 60;
            lobby.timerRunning = false;
            lobby.roundPoints = {};
            lobby.roundDetails = {};
            lobby.roundAverages = {};
            lobby.isFinalRound = false;
            lobby.winner = null;
            
            const shuffled = [...ALL_MOVIES].sort(() => 0.5 - Math.random());
            lobby.movies = shuffled.slice(0, 5);
            
            // Сбрасываем счетчики выбора фильмов при старте нового раунда
            const resetProgress = {};
            lobby.players.forEach(p => { resetProgress[p.id] = 0; });
            io.to(lobbyId).emit('ratings_progress', resetProgress);

            io.to(lobbyId).emit('lobby_update', lobby);
        }
    });

    // Хост нажимает "Итоги игры" после финального раунда для открытия финальной таблицы
    socket.on('finish_game', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.id && lobby.winner) {
            lobby.state = 'game_over';
            io.to(lobbyId).emit('lobby_update', lobby);
        }
    });

    // Перезапуск игры с нуля
    socket.on('restart_game', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.id) {
            clearLobbyTimer(lobby);
            lobby.state = 'lobby';
            lobby.ratings = {};
            lobby.timeLeft = 60;
            lobby.timerRunning = false;
            lobby.winner = null;
            lobby.isFinalRound = false;
            lobby.roundPoints = {};
            lobby.roundDetails = {};
            lobby.roundAverages = {};
            lobby.players.forEach(p => p.vp = 0);
            
            io.to(lobbyId).emit('lobby_update', lobby);
        }
    });

    // Смена цвета игроком в лобби (выбор из 16 контрастных цветов)
    socket.on('change_color', ({ lobbyId, color }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.state !== 'lobby') return;
        
        // Проверяем, не занят ли цвет другим игроком
        const isTaken = lobby.players.some(p => p.id !== socket.id && p.color.toLowerCase() === color.toLowerCase());
        if (isTaken) {
            if (callback) callback({ success: false, message: 'Этот цвет уже занят' });
            return;
        }

        const colorObj = COLORS.find(c => c.hex.toLowerCase() === color.toLowerCase()) || { hex: color, emoji: '🌧️' };
        const player = lobby.players.find(p => p.id === socket.id);
        if (player) {
            player.color = colorObj.hex;
            player.emoji = colorObj.emoji;
            io.to(lobbyId).emit('lobby_update', lobby);
            if (callback) callback({ success: true, color: colorObj.hex, emoji: colorObj.emoji });
        }
    });

    // Добровольный выход игрока в главное меню (с сохранением его прогресса на случай возвращения)
    socket.on('leave_lobby', ({ lobbyId }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return;

        const player = lobby.players.find(p => p.id === socket.id);
        if (player) {
            player.connected = false;
            socket.leave(lobbyId);

            // Если идет раунд и таймер был запущен -> ставим на паузу
            if (lobby.state === 'round_start' && lobby.timerRunning) {
                clearLobbyTimer(lobby);
                lobby.pausedDueToDisconnect = true;
                lobby.disconnectedPlayerName = player.nickname;
                lobby.disconnectedPlayerId = player.id;
                io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: false });
            }

            // Если вышел хост, даем 30 секунд на возврат перед передачей хоста
            if (lobby.host === socket.id) {
                scheduleHostTransfer(lobby, lobbyId);
            }

            io.to(lobbyId).emit('lobby_update', lobby);
            if (callback) callback({ success: true });
        }
    });

    // Закрытие / роспуск лобби хостом (во время матча или в комнате ожидания)
    socket.on('close_lobby', ({ lobbyId }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.host !== socket.id) return;

        clearLobbyTimer(lobby);
        if (lobby.hostGraceTimer) {
            clearTimeout(lobby.hostGraceTimer);
            lobby.hostGraceTimer = null;
        }

        io.to(lobbyId).emit('lobby_closed', { message: 'Хост закрыл комнату.' });
        lobbies.delete(lobbyId);
        if (callback) callback({ success: true });
    });

    // Исключение игрока хостом / продолжение игры без него
    socket.on('kick_player', ({ lobbyId, playerId }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.host !== socket.id) return;

        const index = lobby.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            const removed = lobby.players.splice(index, 1)[0];
            
            // Удаляем оценки исключенного игрока
            if (lobby.ratings[playerId]) {
                delete lobby.ratings[playerId];
            }

            // Если игра стояла на паузе из-за этого игрока, снимаем паузу
            if (lobby.disconnectedPlayerId === playerId || lobby.disconnectedPlayerName === removed.nickname) {
                lobby.pausedDueToDisconnect = false;
                lobby.disconnectedPlayerName = null;
                lobby.disconnectedPlayerId = null;
            }

            io.to(lobbyId).emit('lobby_update', lobby);
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
            if (lobby.host !== socket.id) {
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
            io.to(lobbyId).emit('lobby_update', lobby);
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
        if (!lobby || lobby.host !== socket.id) return;
        lobby.pausedDueToDisconnect = false;
        lobby.disconnectedPlayerName = null;
        lobby.disconnectedPlayerId = null;
        io.to(lobbyId).emit('lobby_update', lobby);
    });

    // Отключение
    socket.on('disconnect', () => {
        for (let [lobbyId, lobby] of lobbies.entries()) {
            const player = lobby.players.find(p => p.id === socket.id);
            if (player) {
                player.connected = false;
                player.previousSocketId = socket.id;

                // Если идет раунд и таймер тикал -> ставим на паузу!
                if (lobby.state === 'round_start' && lobby.timerRunning) {
                    clearLobbyTimer(lobby);
                    lobby.pausedDueToDisconnect = true;
                    lobby.disconnectedPlayerName = player.nickname;
                    lobby.disconnectedPlayerId = player.id;
                    io.to(lobbyId).emit('timer_tick', { timeLeft: lobby.timeLeft, isRunning: false });
                }

                // Если отключился хост, запускаем 30-секундный таймер передачи хоста
                if (lobby.host === socket.id) {
                    scheduleHostTransfer(lobby, lobbyId);
                }
                
                // Если все отключились, чистим таймер
                if (lobby.players.every(p => !p.connected)) {
                    clearLobbyTimer(lobby);
                }
                
                io.to(lobbyId).emit('lobby_update', lobby);
            }
        }
    });
});

// Периодическая очистка зомби-комнат (когда все вышли более 30 минут назад), предотвращает утечку памяти
setInterval(() => {
    const now = Date.now();
    for (const [lobbyId, lobby] of lobbies.entries()) {
        const allOffline = lobby.players.length === 0 || lobby.players.every(p => !p.connected);
        if (allOffline) {
            if (!lobby.allOfflineSince) {
                lobby.allOfflineSince = now;
            } else if (now - lobby.allOfflineSince > 30 * 60 * 1000) {
                clearLobbyTimer(lobby);
                if (lobby.hostGraceTimer) clearTimeout(lobby.hostGraceTimer);
                lobbies.delete(lobbyId);
                console.log(`[CLEANUP] Успешно удалена неактивная комната ${lobbyId}`);
            }
        } else {
            lobby.allOfflineSince = null;
        }
    }
}, 60000);

// Высокопроизводительное кэширование и безопасное проксирование постеров TMDB
const https = require('https');
const tmdbAgent = new https.Agent({
    lookup: (hostname, opts, cb) => {
        if (hostname.includes('tmdb.org')) {
            const ip = '99.84.152.32';
            if (typeof opts === 'function') opts(null, ip, 4);
            else if (opts.all) cb(null, [{ address: ip, family: 4 }]);
            else cb(null, ip, 4);
        } else {
            require('dns').lookup(hostname, opts, cb);
        }
    }
});

// Кэш постеров в оперативной памяти (хранит до 300 последних картинок)
const posterCache = new Map();
const MAX_POSTER_CACHE = 300;

app.get('/api/poster/:file', async (req, res) => {
    const file = req.params.file;
    if (!file || !/^[\w\-\.]+$/.test(file)) {
        return res.status(400).end();
    }

    if (posterCache.has(file)) {
        const cached = posterCache.get(file);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Content-Type', cached.contentType);
        return res.send(cached.buffer);
    }

    try {
        const tmdbUrl = `https://image.tmdb.org/t/p/w500/${file}`;
        const response = await axios.get(tmdbUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
            httpsAgent: tmdbAgent,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const contentType = response.headers['content-type'] || 'image/jpeg';
        const buffer = Buffer.from(response.data);

        if (posterCache.size >= MAX_POSTER_CACHE) {
            const oldestKey = posterCache.keys().next().value;
            posterCache.delete(oldestKey);
        }
        posterCache.set(file, { buffer, contentType });

        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Content-Type', contentType);
        res.send(buffer);
    } catch (e) {
        if (!res.headersSent) {
            res.redirect(`https://image.tmdb.org/t/p/w500/${file}`);
        }
    }
});

// Проверка жизнеспособности сервиса для Render и Nginx
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

// Раздача статики собранного фронтенда
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT} (0.0.0.0)`);
});
