const crypto = require('node:crypto');
const normalize = title => (title || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').replace(/[.,:;!?"'«»()]/g, '').trim();
const remember = (l, m) => {
  (l.usedMovieIds ||= []).push(m.id);
  (l.usedMovieTitles ||= []).push(normalize(m.title));
};
function candidates(l, catalog, excluded = []) {
  const ids = new Set(excluded.map(m => m.id)), titles = new Set(excluded.map(m => normalize(m.title)));
  return catalog.filter(m => (l.categories || ['films']).includes(m.category) && !ids.has(m.id) && !titles.has(normalize(m.title)));
}
// Finish the remaining cycle first; after exhaustion protect all cards already selected.
function draw(l, catalog, count, protectedCards = []) {
  const selected = [];
  while (selected.length < count) {
    const pool = candidates(l, catalog, [...protectedCards, ...selected]);
    let available = pool.filter(m => !(l.usedMovieIds || []).includes(m.id) && !(l.usedMovieTitles || []).includes(normalize(m.title)));
    if (!available.length) {
      l.usedMovieIds = []; l.usedMovieTitles = [];
      [...protectedCards, ...selected].forEach(m => remember(l, m));
      available = pool;
    }
    if (!available.length) throw Error('В выбранных категориях недостаточно разных произведений');
    const movie = available[crypto.randomInt(available.length)];
    selected.push(movie); remember(l, movie);
  }
  return selected;
}
function reroll(l, playerId, movieId, roundId, catalog) {
  if (l.state !== 'round_start' || roundId !== l.roundId) throw Error('Раунд уже изменился');
  if (l.mode === 'opinion' ? l.criticId !== playerId || l.phase !== 'critic' : l.host !== playerId) throw Error('Вы не можете заменить эту карточку');
  if (l.players.filter(p => p.connected).length < 2) throw Error('Ожидаем второго участника');
  const slot = l.movies.findIndex(m => m.id === movieId);
  if (slot < 0 || (l.rerolledSlots || []).includes(slot)) throw Error('Эта карточка уже заменена');
  const [replacement] = draw(l, catalog, 1, l.movies);
  l.movies[slot] = replacement;
  (l.rerolledSlots ||= []).push(slot);
  for (const votes of Object.values(l.ratings)) delete votes[movieId];
  for (const auto of Object.values(l.autoRatings || {})) delete auto[movieId];
  l.savedRatings = {}; l.allVoted = false;
  return replacement;
}
function saveVotes(l, playerId, roundId, edit = false) {
  if (l.state !== 'round_start' || l.mode !== 'opinion' || l.phase !== 'guess' || l.criticId === playerId || l.roundId !== roundId) throw Error('Сейчас нельзя сохранить ответ');
  if (l.players.filter(p => p.connected).length < 2) throw Error('Ожидаем второго участника');
  if (!edit && !l.movies.every(m => l.ratings[playerId]?.[m.id])) throw Error('Сначала выставьте все пять оценок');
  (l.savedRatings ||= {})[playerId] = !edit;
}
function allSaved(l) {
  const guessers = l.players.filter(p => p.connected && p.id !== l.criticId);
  return l.state === 'round_start' && l.mode === 'opinion' && l.phase === 'guess' && l.players.filter(p => p.connected).length >= 2 && guessers.length > 0 && guessers.every(p => l.savedRatings?.[p.id]);
}
function sendChat(l, p, text, now = Date.now()) {
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 500) throw Error('Сообщение должно содержать от 1 до 500 символов');
  if (now - (p.lastChatAt || 0) < 800) throw Error('Подождите немного перед следующим сообщением');
  p.lastChatAt = now;
  const message = { id: crypto.randomUUID(), playerId: p.id, nickname: p.nickname, color: p.color, text: text.trim(), at: now };
  (l.chat ||= []).push(message);
  l.chat = l.chat.slice(-100);
  return message;
}
function deleteChat(l, playerId, messageId) {
  if (l.host !== playerId) throw Error('Удалять сообщения может только ведущий');
  l.chat = (l.chat || []).filter(m => m.id !== messageId);
}
module.exports = { draw, reroll, saveVotes, allSaved, sendChat, deleteChat };
