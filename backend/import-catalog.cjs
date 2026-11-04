// Offline, cached import. Never run on application startup. No credentials enter output files.
const fs = require('node:fs');
const path = require('node:path');
require('./node_modules/dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const root = path.join(__dirname, '.state');
const cachePath = path.join(root, 'tmdb-cache.json');
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath)) : {};
const source = JSON.parse(fs.readFileSync(path.join(root, 'workbook-titles.json')));
const old = JSON.parse(fs.readFileSync(path.join(__dirname, 'movies.json')));
const overrides = require('./catalog-overrides.json');
const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]/gu, '');
const aliases = {
  'Большой куш (One Piece) Netflix': ['ONE PIECE', 111110], 'САО': ['Мастера меча онлайн', 45782],
  'Твин пикс': ['Твин Пикс', 1920], 'Мстители величайшие герои Земли': ['Мстители: Величайшие герои Земли', 33623],
  'Невероятное приключение ДжоДжо: Каменный океан': ['Невероятные приключения ДжоДжо', 45790],
  'Волчица и пряности': ['Волчица и пряности', 26707],
  'Госпожа Кагуя: в любви как на войне': ['Госпожа Кагуя: В любви как на войне', 83121],
};
let requests = 0;
async function api(endpoint, params = {}) {
  const key = endpoint + '?' + new URLSearchParams({ language: 'ru-RU', ...params });
  if (cache[key]) return cache[key];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('https://api.themoviedb.org/3/' + key + '&api_key=' + process.env.TMDB_API_KEY, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw Error('TMDB HTTP ' + res.status);
      const data = await res.json(); cache[key] = data;
      if (++requests % 30 === 0) fs.writeFileSync(cachePath, JSON.stringify(cache));
      return data;
    } catch { if (attempt === 2) throw Error('TMDB request failed: ' + endpoint); }
  }
}
function clean(raw, tv) {
  let s = raw.trim();
  if (tv) s = s.replace(/\([^)]*(?:сезон|сери[яий]|овы|аниме)[^)]*\)/gi, '').replace(/\(?\d+(?:\s*[-и]\s*\d+)?\s*сезон[а-я]*\)?/gi, '').replace(/\(\d+\s*-\s*\d+\)/g, '');
  return s.replace(/\s*\(\d{4}(?:\s*[-–]\s*(?:\d{4}|\.\.\.))?\)/g, '').replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim();
}
const pending = [], catalog = new Map();
async function record(type, id, previous, fromStream = false) {
  const key = `${type}:${id}`;
  if (catalog.has(key)) { if (fromStream) catalog.get(key).fromStream = true; return; }
  const d = await api(`${type}/${id}`, { append_to_response: 'images', include_image_language: 'ru,en,null' });
  if (d.adult || !d.poster_path || /(?:https?:|\.com|\.net|片网)/i.test(d.name || d.title || '')) { pending.push({ title: previous?.title || d.name || d.title, reason: 'Нет постера / adult / повреждённые метаданные' }); return; }
  const isTv = type === 'tv', animated = d.genres.some(g => g.id === 16);
  const category = !isTv ? 'films' : animated ? ((d.origin_country || []).includes('JP') || d.original_language === 'ja' ? 'anime' : 'cartoons') : 'series';
  const start = (d.release_date || d.first_air_date || '').slice(0, 4);
  if (!start) { pending.push({ title: d.title || d.name, reason: 'Нет даты' }); return; }
  const end = d.in_production || ['Returning Series', 'In Production', 'Planned'].includes(d.status) ? '...' : (d.last_air_date || d.first_air_date || "").slice(0, 4);
  const posters = d.images?.posters || [];
  const ru = posters.filter(p => p.iso_639_1 === 'ru' && p.aspect_ratio > 0.55 && p.aspect_ratio < 0.8);
  ru.sort((a,b) => (b.file_path === d.poster_path) - (a.file_path === d.poster_path) || b.vote_count - a.vote_count || b.vote_average - a.vote_average || b.width - a.width);
  const poster = ru[0]?.file_path || d.poster_path;
  const localizedNames = {84958:'Локи',235930:'Дьявол может плакать',105248:'Киберпанк: Бегущие по краю',50461:'Игра лжецов: Последний раунд',41852:'Клубника на пирожном',
    297189:'Персона 3. Фильм 2: Сон рыцаря в летнюю ночь',332169:'Персона 3. Фильм 3: Падение',372761:'Персона 3. Фильм 4: Зима возрождения'};
  catalog.set(key, { id: previous?.id || `tmdb-${type}-${id}`, title: `${localizedNames[id] || d.title || d.name} (${isTv ? start + ' - ' + end : start})`,
    category, tmdbId: id, mediaType: type, posterUrl: '/api/poster' + poster,
    posterLanguage: ru.length ? 'ru' : (posters.find(p => p.file_path === poster)?.iso_639_1 || null),
    rating: d.vote_average, voteCount: d.vote_count, originCountries: d.origin_country || [],
    fromStream, sourceUrl: `https://www.themoviedb.org/${type}/${id}` });
}
async function resolve(raw, type, previous, fromStream) {
  const override = overrides[raw] || overrides[clean(raw, type === 'tv')];
  if (override) {
    if (override.ids) { for (const id of override.ids) await record(override.type || type, id, undefined, fromStream); return; }
    if (override.id) return record(override.type || type, override.id, previous, fromStream);
    type = override.type || type;
    raw = override.query + (override.year ? ` (${override.year})` : '');
  }
  const tv = type === 'tv', title = clean(raw, tv), year = raw.match(/\((\d{4})\)/)?.[1];
  if (aliases[title]) return record(type, aliases[title][1], previous, fromStream);
  let results = (await api(`search/${type}`, { query: title, include_adult: 'false' })).results || [];
  if (/[a-z]/i.test(title)) {
    const english = (await api(`search/${type}`, { query: title, include_adult:'false', language:'en-US' })).results || [];
    results = [...results,...english];
  }
  let matches = results.filter(r => [r.title, r.name, r.original_title, r.original_name].filter(Boolean).some(t => norm(t) === norm(title)));
  if (year) {
    const exact = matches.filter(r => (r.release_date || r.first_air_date || '').slice(0,4) === year);
    const near = !tv ? matches.filter(r => Math.abs(Number((r.release_date || '').slice(0,4))-Number(year)) <= 1) : [];
    matches = exact.length ? exact : near.length === 1 ? near : [];
  }
  matches = [...new Map(matches.map(r=>[r.id,r])).values()];
  matches.sort((a,b) => b.vote_count - a.vote_count);
  if (matches.length && (matches.length === 1 || matches[0].vote_count > matches[1].vote_count * 5)) return record(type, matches[0].id, previous, fromStream);
  pending.push({ title: raw, type, previousId: previous?.id, reason: 'Требуется сверка', candidates: results.slice(0,4).map(r => ({ id:r.id, title:r.title||r.name, date:r.release_date||r.first_air_date })) });
  if (previous) catalog.set('legacy:' + previous.id, { ...previous, category:'films', metadataVerified:false });
}
async function parallel(items, fn) {
  let i = 0, done = 0;
  await Promise.all(Array.from({length:6}, async () => { while(i < items.length) { const item = items[i++]; await fn(item); if (++done % 100 === 0) console.log('Processed',done,'/',items.length); } }));
}
async function main() {
  if (!process.env.TMDB_API_KEY) throw Error('TMDB_API_KEY required');
  await parallel(old, m => resolve(m.title, m.mediaType || 'movie', m, m.fromStream || false));
  const filmTitles = new Set(Object.entries(source).filter(([k])=> k.startsWith('Фильмы') || k === 'Утерянные записи').flatMap(([,v])=>v));
  const television = [...new Set([...(source['Сериалы'] || []), ...(source['Мультсериалы и аниме'] || []), 'Южный парк'])];
  // Animation worksheet contains feature films too: first identify known film titles.
  for (const raw of source['Мультсериалы и аниме'] || []) if (old.some(m=> norm(clean(m.title,false)) === norm(clean(raw,false)))) filmTitles.add(raw);
  await parallel([...filmTitles], raw => resolve(raw, 'movie', undefined, true));
  await parallel(television.filter(raw => !filmTitles.has(raw)), raw => resolve(raw, 'tv', undefined, true));
  // Established high-rated shows; country restrictions apply to additions, never stream entries.
  const discovery = [];
  for (const mode of ['live', 'anime', 'cartoons']) for (let page=1;page<=3;page++) {
    const filters = mode === 'live' ? {without_genres:'16,10763,10764,10767'} : mode === 'anime' ? {with_genres:'16',with_origin_country:'JP'} : {with_genres:'16',without_original_language:'ja'};
    const d = await api('discover/tv', { ...filters, page:String(page), sort_by:'popularity.desc', 'vote_average.gte':'7', 'vote_count.gte':'500', include_adult:'false' });
    discovery.push(...d.results.filter(r => !r.origin_country?.some(c=>['TR','IN'].includes(c))));
  }
  await parallel(discovery, r => record('tv',r.id));
  fs.writeFileSync(cachePath,JSON.stringify(cache));
  const entries = [...catalog.values()];
  fs.writeFileSync(path.join(root,'catalog-candidate.json'),JSON.stringify(entries,null,2));
  fs.writeFileSync(path.join(root,'catalog-pending.json'),JSON.stringify(pending,null,2));
  console.log(JSON.stringify({total:entries.length,categories:entries.reduce((a,m)=>(a[m.category]=(a[m.category]||0)+1,a),{}),pending:pending.length,ruPosters:entries.filter(m=>m.posterLanguage==='ru').length}));
}
main().catch(e=>{fs.writeFileSync(cachePath,JSON.stringify(cache)); console.error(e.message);process.exitCode=1;});
