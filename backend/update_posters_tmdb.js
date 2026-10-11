const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'ef6c0648c4c1712e817628a9979d7299';
const TMDB_IP = '99.84.152.32';

// 7 новых фильмов, запрошенных пользователем
const NEW_MOVIES = [
    'Волчьи дети Амэ и Юки (2012)',
    'Король Англии (2019)',
    'Тачки (2006)',
    'На краю Оук-стрит (2026)',
    'Мэйдэй (2026)',
    'Последний богатырь. Колобок (2026)',
    'Обещание на рассвете (2017)',
    'Человек-паук: Новый день (2026)'
];

const moviesPath = path.join(__dirname, 'movies.json');
let movies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

// Добавляем новые фильмы, если их ещё нет в списке
NEW_MOVIES.forEach((title, i) => {
    const exists = movies.some(m => m.title.trim().toLowerCase() === title.trim().toLowerCase());
    if (!exists) {
        movies.push({
            id: `m_new_${Date.now()}_${i}`,
            title: title,
            posterUrl: ''
        });
        console.log(`+ Добавлен новый фильм: ${title}`);
    }
});

function searchTMDB(titleWithYear) {
    return new Promise((resolve) => {
        let match = titleWithYear.match(/^(.*?)(?:\s*\((\d{4})\))?$/);
        let title = match ? match[1].trim() : titleWithYear.trim();
        let year = match ? match[2] : null;

        // Очищаем название от лишних кавычек (« » " ')
        const cleanTitle = title.replace(/[«»"']/g, '').trim();

        const makeReq = (queryParam, yearParam) => {
            return new Promise((resReq) => {
                let q = `/3/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(queryParam)}` + (yearParam ? `&year=${yearParam}` : '');
                const options = {
                    hostname: 'api.themoviedb.org',
                    path: q,
                    headers: { 'Host': 'api.themoviedb.org', 'User-Agent': 'Mozilla/5.0' },
                    lookup: (h, opt, cb) => {
                        if (typeof opt === 'function') opt(null, TMDB_IP, 4);
                        else if (opt.all) cb(null, [{ address: TMDB_IP, family: 4 }]);
                        else cb(null, TMDB_IP, 4);
                    }
                };

                const req = https.get(options, (res) => {
                    let data = '';
                    res.on('data', c => data += c);
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            const best = json.results?.find(r => r.poster_path) || json.results?.[0];
                            resReq(best?.poster_path || null);
                        } catch (e) {
                            resReq(null);
                        }
                    });
                });
                req.on('error', () => resReq(null));
                req.setTimeout(6000, () => {
                    req.destroy();
                    resReq(null);
                });
            });
        };

        // 1. Поиск по названию + год
        makeReq(cleanTitle, year).then(async (poster) => {
            if (poster) return resolve(poster);
            // 2. Поиск только по названию (если год не совпал)
            const fallbackPoster = await makeReq(cleanTitle, null);
            if (fallbackPoster) return resolve(fallbackPoster);
            // 3. Поиск по оригинальному названию без года
            const fallbackOriginal = await makeReq(title, null);
            resolve(fallbackOriginal || null);
        });
    });
}

// Запуск пакетами по 10 параллельных запросов
async function processAll() {
    console.log(`Всего фильмов для обработки: ${movies.length}`);
    let updatedCount = 0;
    let fallbackCount = 0;

    const BATCH_SIZE = 8;
    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (movie) => {
            // Если уже есть нормальный постер с tmdb, пропускаем
            if (movie.posterUrl && movie.posterUrl.startsWith('/api/poster/')) {
                return;
            }

            const posterPath = await searchTMDB(movie.title);
            if (posterPath) {
                movie.posterUrl = `/api/poster${posterPath}`;
                updatedCount++;
            } else {
                fallbackCount++;
                // Если не нашли на TMDB, оставляем старый или заглушку
                if (!movie.posterUrl) {
                    movie.posterUrl = `https://placehold.co/400x600/0b0f19/FF0055?text=${encodeURIComponent(movie.title)}`;
                }
            }
        }));

        if ((i + BATCH_SIZE) % 40 === 0 || i + BATCH_SIZE >= movies.length) {
            console.log(`Обработано: ${Math.min(i + BATCH_SIZE, movies.length)} / ${movies.length} (Найдено постеров: ${updatedCount}, Без постера: ${fallbackCount})`);
        }

        // Небольшая пауза между батчами для бережного отношения к лимитам TMDB
        await new Promise(r => setTimeout(r, 120));
    }

    fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2), 'utf8');
    console.log(`\nГотово! База сохранена. Всего постеров с TMDB: ${updatedCount}`);
}

processAll();
