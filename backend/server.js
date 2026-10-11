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
  }
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

// Хайповые цвета
const COLORS = [
    '#FF0055', '#00FF66', '#00CCFF', '#FF9900', '#CC00FF', 
    '#FFFF00', '#FF00CC', '#00FFFF', '#99FF00', '#FF3300'
];

function clearLobbyTimer(lobby) {
    if (lobby.timerInterval) {
        clearInterval(lobby.timerInterval);
        lobby.timerInterval = null;
    }
    lobby.timerRunning = false;
}

function endRound(lobbyId) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby || lobby.state !== 'round_start') return;
    
    clearLobbyTimer(lobby);

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

    lobby.roundPoints = roundPoints;
    lobby.roundDetails = roundDetails;

    // Проверяем победителя
    const reachedTarget = lobby.players.filter(p => p.vp >= lobby.targetVP);
    if (reachedTarget.length > 0) {
        reachedTarget.sort((a, b) => b.vp - a.vp);
        lobby.winner = reachedTarget[0];
        lobby.state = 'game_over';
    } else {
        lobby.state = 'reveal';
    }

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
            targetVP: targetVP || 30,
            state: 'lobby', // lobby, round_start, reveal, game_over
            availableColors: [...COLORS],
            movies: [],
            ratings: {}, // { playerId: { movieId: 'S', ... } }
            timeLeft: 60,
            timerRunning: false,
            timerInterval: null,
            roundPoints: {},
            roundDetails: {},
            winner: null
        });
        socket.join(lobbyId);
        callback({ success: true, lobbyId });
        console.log(`Lobby ${lobbyId} created by ${socket.id}`);
    });

    // Подключение к лобби
    socket.on('join_lobby', ({ lobbyId, nickname, sessionToken }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return callback({ success: false, message: 'Лобби не найдено' });
        
        // Логика переподключения (если игрок обновил вкладку)
        const existingPlayer = lobby.players.find(p => p.sessionToken === sessionToken);
        if (existingPlayer) {
            existingPlayer.id = socket.id;
            existingPlayer.connected = true;
            socket.join(lobbyId);
            
            if (lobby.host === existingPlayer.previousSocketId) {
                lobby.host = socket.id;
            }

            io.to(lobbyId).emit('lobby_update', lobby);
            return callback({ success: true, player: existingPlayer, lobby });
        }

        if (lobby.state !== 'lobby') return callback({ success: false, message: 'Игра уже началась' });
        if (lobby.players.length >= 10) return callback({ success: false, message: 'Лобби заполнено (макс. 10)' });

        const color = lobby.availableColors.pop() || '#1ca0e5';
        const newToken = Math.random().toString(36).substring(2, 15);
        const newPlayer = {
            id: socket.id,
            nickname,
            color,
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

    // Выставление / изменение оценки (с защитой от миссклика)
    socket.on('submit_rating', ({ lobbyId, movieId, rating }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.state !== 'round_start') return;
        if (!lobby.ratings[socket.id]) lobby.ratings[socket.id] = {};
        
        const userRatings = lobby.ratings[socket.id];
        // Если кликнули на ту же оценку того же фильма -> снимаем оценку (сброс миссклика)
        if (userRatings[movieId] === rating) {
            delete userRatings[movieId];
        } else {
            // Если эта буква уже была у другого фильма -> снимаем с того фильма
            for (const [mId, r] of Object.entries(userRatings)) {
                if (r === rating) delete userRatings[mId];
            }
            userRatings[movieId] = rating;
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
            
            const shuffled = [...ALL_MOVIES].sort(() => 0.5 - Math.random());
            lobby.movies = shuffled.slice(0, 5);
            
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
            lobby.roundPoints = {};
            lobby.roundDetails = {};
            lobby.players.forEach(p => p.vp = 0);
            
            io.to(lobbyId).emit('lobby_update', lobby);
        }
    });

    // Отключение
    socket.on('disconnect', () => {
        for (let [lobbyId, lobby] of lobbies.entries()) {
            const player = lobby.players.find(p => p.id === socket.id);
            if (player) {
                player.connected = false;
                player.previousSocketId = socket.id;
                
                // Если все отключились, чистим таймер
                if (lobby.players.every(p => !p.connected)) {
                    clearLobbyTimer(lobby);
                }
                
                io.to(lobbyId).emit('lobby_update', lobby);
            }
        }
    });
});

// Проксирование постеров TMDB
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

app.get('/api/poster/:file', async (req, res) => {
    try {
        const file = req.params.file;
        const tmdbUrl = `https://image.tmdb.org/t/p/w500/${file}`;
        const response = await axios.get(tmdbUrl, {
            responseType: 'stream',
            timeout: 10000,
            httpsAgent: tmdbAgent,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        response.data.pipe(res);
    } catch (e) {
        res.redirect(`https://image.tmdb.org/t/p/w500/${req.params.file}`);
    }
});

// Раздача статики собранного фронтенда
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
