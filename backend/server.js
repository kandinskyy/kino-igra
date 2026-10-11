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
            state: 'lobby', // lobby, round_start, rating, reveal, results
            availableColors: [...COLORS],
            movies: [],
            ratings: {}, // { playerId: { movieId: 'S', ... } }
            revealedMovieIndex: -1,
            timerEnd: null
        });
        socket.join(lobbyId);
        callback({ success: true, lobbyId });
        console.log(`Lobby ${lobbyId} created by ${socket.id}`);
    });

    // Подключение к лобби
    socket.on('join_lobby', ({ lobbyId, nickname, sessionToken }, callback) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return callback({ success: false, message: 'Лобби не найдено' });
        
        // Логика переподключения (если игрок закрыл вкладку)
        const existingPlayer = lobby.players.find(p => p.sessionToken === sessionToken);
        if (existingPlayer) {
            existingPlayer.id = socket.id; // обновляем сокет
            existingPlayer.connected = true;
            socket.join(lobbyId);
            
            // Если хост переподключился
            if (lobby.host === existingPlayer.previousSocketId) {
                lobby.host = socket.id;
            }

            io.to(lobbyId).emit('lobby_update', lobby);
            return callback({ success: true, player: existingPlayer, lobby });
        }

        if (lobby.state !== 'lobby') return callback({ success: false, message: 'Игра уже началась' });
        if (lobby.players.length >= 10) return callback({ success: false, message: 'Лобби заполнено' });

        const color = lobby.availableColors.pop(); // выдаем цвет
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

    // Хост запускает лобби (переход в пустое поле перед фильмами)
    socket.on('launch_game', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.host === socket.id) {
            if (lobby.players.length < 2) {
                return socket.emit('error_message', 'Для старта игры нужно минимум 2 игрока');
            }
            lobby.state = 'round_start';
            lobby.ratings = {};
            lobby.revealedMovieIndex = -1;
            
            // Выбираем 5 случайных фильмов
            const shuffled = [...ALL_MOVIES].sort(() => 0.5 - Math.random());
            lobby.movies = shuffled.slice(0, 5);
            
            io.to(lobbyId).emit('lobby_update', lobby);
        }
    });

    // Отключение
    socket.on('disconnect', () => {
        for (let [lobbyId, lobby] of lobbies.entries()) {
            const player = lobby.players.find(p => p.id === socket.id);
            if (player) {
                player.connected = false;
                player.previousSocketId = socket.id; // чтобы хост мог вернуть права
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
