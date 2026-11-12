// In-memory transport model for the original UI. Never opens a network connection.
import { TIERS, shuffle, assignRank } from '../night-club/model.js';
import identities from '../../../shared/player-identities.json' with { type: 'json' };
import categories from '../../../shared/catalog-categories.json' with { type: 'json' };
import catalog from '../../../backend/movies.json' with { type: 'json' };

const CATALOG = catalog;
const normalizeTitle = title => title.toLowerCase().replace(/ё/g,'е').replace(/[.,:;!?"'«»()]/g,'').replace(/\s+/g,' ').trim();
const copy = value => structuredClone(value);
const assert = (condition, message) => { if (!condition) throw Error(message); };
let lastRevealAt=0;
export const sceneFor = room => !room ? 'home' : room.state === 'lobby' ? 'lobby' : 'game';

export function createRoom(nickname, code) {
  assert(typeof nickname === 'string' && nickname.trim().length > 0 && nickname.trim().length <= 24, 'Имя должно содержать от 1 до 24 символов');
  const player = { id: 'me', nickname: nickname.trim(), color: identities[0].hex, vp: 0, connected: true, bot: false };
  return {
    id: code || Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0'), host: player.id,
    players: [player], targetVP: 10, categories: ['films'], mode: 'original', circles: 1,
    hiddenMode: false, repeatRatings: false, state: 'lobby', roundId: 0,
    movies: [], ratings: {}, autoRatings: {}, savedRatings: {}, roundPoints: {}, roundDetails: {},
    roundAverages: {}, matchPoints: {}, perfect: {}, history: [], chat: [], usedMovieIds: [],
    timeLeft: 60, timerRunning: false, allVoted: false, isFinalRound: false, criticId: null, phase: null,currentCircle:1,criticQueueCycles:null,usedMovieTitles:[],
    revealedAt: null, rerolledSlots: [], criticQueue: null, criticPlayer: null,
  };
}

function draw(room, count, protectedMovies = []) {
  const chosen = [];
  while (chosen.length < count) {
    const cards=[...protectedMovies,...chosen],excluded=cards.map(m=>m.id),titles=cards.map(m=>normalizeTitle(m.title));
    const candidates = CATALOG.filter(m => room.categories.includes(m.category) && !excluded.includes(m.id)&&!titles.includes(normalizeTitle(m.title)));
    let available = candidates.filter(m => !room.usedMovieIds.includes(m.id)&&!room.usedMovieTitles.includes(normalizeTitle(m.title)));
    if (!available.length) { room.usedMovieIds = [...excluded];room.usedMovieTitles=[...titles]; available = candidates; }
    assert(available.length, 'В выбранных категориях недостаточно разных произведений');
    const movie = shuffle(available)[0]; chosen.push(movie); room.usedMovieIds.push(movie.id);room.usedMovieTitles.push(normalizeTitle(movie.title));
  }
  return chosen;
}

export function startRound(room, first = false) {
  assert(room.players.filter(p => p.connected).length >= 2, 'Нужны минимум два игрока');
  if (first) { room.roundId = 0; room.history = []; room.players.forEach(p => { p.vp = 0; }); room.criticQueue = null;room.criticQueueCycles=null;room.currentCircle=1; }
  Object.assign(room, {
    state: 'round_start', roundId: room.roundId + 1, movies: draw(room, 5),
    ratings: {}, autoRatings: {}, savedRatings: {}, roundPoints: {}, roundDetails: {}, roundAverages: {},
    matchPoints: {}, perfect: {}, isFinalRound: false, winner: null, allVoted: false,
    timeLeft: 60, timerRunning: false, revealedAt: null, rerolledSlots: [],
  });
  if (room.mode === 'opinion') {
    if (!room.criticQueue) {
      const order = shuffle(room.players.filter(p => p.connected).map(p => p.id));
      room.criticQueue = Array.from({ length: room.circles }, () => [...order]).flat();
      room.criticQueueCycles=Array.from({length:room.circles},(_,i)=>order.map(()=>i+1)).flat();
    }
    const index=room.criticQueue.findIndex(id=>room.players.some(p=>p.id===id&&p.connected));
    assert(index>=0,'Нет доступного критика');
    room.criticId = room.criticQueue.splice(index,1)[0];room.currentCircle=room.criticQueueCycles.splice(index,1)[0]; room.phase = 'critic';
    room.criticPlayer = copy(room.players.find(p => p.id === room.criticId));
  } else { room.criticId = null; room.criticPlayer = null; room.phase = null; }
}

export function fillVotes(room, playerId) {
  const votes = room.ratings[playerId] ||= {}, auto = room.autoRatings[playerId] ||= {};
  const remaining = shuffle(TIERS.filter(r => !Object.values(votes).includes(r)));
  for (const m of room.movies) if (!votes[m.id]) {
    votes[m.id] = room.repeatRatings ? shuffle(TIERS)[0] : remaining.pop(); auto[m.id] = true;
  }
}

export function submitRating(room, playerId, movieId, rating, roundId = room.roundId) {
  assert(room.state === 'round_start' && room.roundId === roundId && room.movies.some(m => m.id === movieId) && TIERS.includes(rating), 'Оценка не принята: проверьте текущий раунд');
  assert(room.players.some(p => p.id === playerId && p.connected), 'Игрок недоступен');
  assert(room.players.filter(p => p.connected).length >= 2, 'Ожидаем второго участника');
  assert(!room.savedRatings[playerId], 'Нажмите «Изменить оценки»');
  assert(room.mode !== 'opinion' || ((room.phase === 'critic') === (room.criticId === playerId)), 'Сейчас вы не выставляете оценки');
  const current = room.ratings[playerId] ||= {};
  const next = assignRank(room.movies.map(m => current[m.id] || null), room.movies.findIndex(m => m.id === movieId), rating, room.repeatRatings);
  room.ratings[playerId] = Object.fromEntries(room.movies.flatMap((m, i) => next[i] ? [[m.id, next[i]]] : []));
  if (room.autoRatings[playerId]) delete room.autoRatings[playerId][movieId];
}

export function guessing(room) {
  fillVotes(room, room.criticId); room.savedRatings[room.criticId]=true;room.phase = 'guess'; room.timeLeft = 60; room.timerRunning = true;
}

export function allSaved(room) {
  const guessers = room.players.filter(p => p.connected && p.id !== room.criticId);
  return room.mode === 'opinion' && room.phase === 'guess' && guessers.length > 0 && guessers.every(p => room.savedRatings[p.id]);
}

export function revealRound(room, now = Date.now()) {
  assert(room.state === 'round_start', 'Раунд уже завершён');
  now=Math.max(now,lastRevealAt+1);lastRevealAt=now;
  room.players.forEach(p => fillVotes(room, p.id));
  const details = {}, averages = {}, points = {}, matches = {}, perfect = {};
  for (const m of room.movies) {
    details[m.id] = Object.fromEntries(TIERS.map(r => [r, room.players.filter(p => room.ratings[p.id]?.[m.id] === r).map(p => p.id)]));
    averages[m.id] = (room.players.reduce((n, p) => n + 5 - TIERS.indexOf(room.ratings[p.id][m.id]), 0) / room.players.length).toFixed(1);
  }
  for (const p of room.players) {
    matches[p.id] = Object.fromEntries(room.movies.map(m => [m.id, room.mode === 'opinion' ? Number(p.id !== room.criticId && room.ratings[p.id][m.id] === room.ratings[room.criticId][m.id]) : Math.max(0, details[m.id][room.ratings[p.id][m.id]].length - 1)]));
    const n = Object.values(matches[p.id]).reduce((a, b) => a + b, 0);
    perfect[p.id] = n === 5;
    points[p.id] = n + (room.mode === 'opinion' && n === 5 ? 1 : 0);
  }
  if (room.mode === 'opinion') {
    const guessers = room.players.filter(p => p.id !== room.criticId), count = guessers.filter(p => perfect[p.id]).length;
    points[room.criticId] = count === guessers.length ? 0 : count;
  }
  room.players.forEach(p => { p.vp += points[p.id]; });
  Object.assign(room, { state: 'reveal', timerRunning: false, revealedAt: now, roundPoints: points, roundDetails: details, roundAverages: averages, matchPoints: matches, perfect, allVoted: false });
  room.isFinalRound = room.mode === 'opinion' ? !room.criticQueue.some(id => room.players.some(p => p.id === id && p.connected)) : room.players.some(p => p.vp >= room.targetVP);
  room.winner = room.isFinalRound ? [...room.players].sort((a, b) => b.vp - a.vp)[0] : null;
  const members = [...room.players];
  if (room.criticPlayer && !members.some(p => p.id === room.criticId)) members.push(room.criticPlayer);
  room.history.push(copy({ roundId: room.roundId, criticId: room.criticId, players: members, movies: room.movies, ratings: room.ratings, autoRatings: room.autoRatings, roundPoints: points }));
}

export function tickTimer(room) {
  if (!room || room.state !== 'round_start' || !room.timerRunning || room.mode === 'opinion' && room.players.filter(p => p.connected).length < 2) return false;
  room.timeLeft = Math.max(0, room.timeLeft - 1);
  if (room.timeLeft === 0) revealRound(room);
  return true;
}

export function publicView(room, playerId = 'me') {
  if (!room) return null;
  const view = copy(room), revealed = ['reveal', 'game_over'].includes(room.state), secret = room.hiddenMode && room.state !== 'game_over';
  const opinion = room.mode === 'opinion';
  view.allColors = identities;
  view.progress = Object.fromEntries(room.players.map(p => [p.id, Object.keys(room.ratings[p.id] || {}).length]));
  view.allVoted = room.state === 'round_start' && (opinion ? allSaved(room) : room.players.filter(p => p.connected).every(p => view.progress[p.id] === 5));
  view.isCritic = opinion && room.criticId === playerId;
  view.criticName = opinion && !secret ? (room.players.find(p => p.id === room.criticId) || room.criticPlayer)?.nickname : null;
  view.criticRatings = opinion && revealed ? copy(room.ratings[room.criticId] || {}) : {};
  view.criticAuto = opinion && revealed ? copy(room.autoRatings[room.criticId] || {}) : {};
  view.autoRatings = secret || !revealed ? { [playerId]: copy(room.autoRatings[playerId] || {}) } : copy(room.autoRatings);
  view.ratings = !revealed || secret ? { [playerId]: copy(room.ratings[playerId] || {}) } : copy(room.ratings);
  view.mySaved = !!room.savedRatings[playerId]; view.myPerfect = !!room.perfect[playerId];
  view.isPerfect = opinion && revealed ? (secret ? {[playerId]:!!room.perfect[playerId]} : copy(room.perfect)) : {};
  view.matchPoints = revealed ? copy(room.matchPoints[playerId] || {}) : {};
  view.myPoints = room.players.find(p => p.id === playerId)?.vp || 0; view.myRoundPoints = room.roundPoints[playerId] || 0;
  view.waitingForPlayers = opinion && room.players.filter(p => p.connected).length < 2; view.criticWait = null;
  view.history = room.state === 'game_over' ? copy(room.history) : [];
  if (secret) {
    view.players.forEach(p => { if (p.id !== playerId) p.vp = null; });
    view.criticId = null; view.roundPoints = { [playerId]: room.roundPoints[playerId] || 0 };
    view.roundDetails = {}; view.roundAverages = {}; view.winner = null; view.progress = { [playerId]: view.progress[playerId] || 0 };
    view.allVoted = false; view.savedRatings = { [playerId]: !!room.savedRatings[playerId] };
  }
  delete view.criticQueue;delete view.criticQueueCycles; delete view.usedMovieIds;delete view.usedMovieTitles; delete view.criticPlayer; delete view.perfect;
  return view;
}

export function addBots(room, count = 3) {
  assert(room?.state === 'lobby', 'Ботов можно добавить после создания лобби');
  assert(Number.isInteger(count) && count >= 1 && count <= 15, 'Выберите от 1 до 15 ботов');
  assert(room.players.length + count <= 16, 'В комнате может быть максимум 16 игроков');
  const free = identities.filter(c => !room.players.some(p => p.color === c.hex));
  assert(free.length >= count, 'Нет свободных персонажей');
  const offset = room.players.filter(p => p.bot).length;
  for (let i = 0; i < count; i++) room.players.push({ id: `bot-${crypto.randomUUID()}`, nickname: `Бот ${offset + i + 1}`, color: free[i].hex, vp: 0, connected: true, bot: true });
}

export function dispatch(room, event, data = {}, playerId = 'me') {
  assert(room, 'Сначала создайте комнату');
  assert(room.players.some(p => p.id === playerId && p.connected), 'Игрок недоступен');
  data = data && typeof data === 'object' ? data : {};
  const host = () => assert(room.host === playerId, 'Действие доступно ведущему');
  const round = () => assert(data.roundId === undefined || data.roundId === room.roundId, 'Раунд уже изменился');
  switch (event) {
    case 'update_target_vp': {
      host(); assert(room.state === 'lobby', 'Настройки доступны в лобби');
      const target = data.targetVP ?? room.targetVP, circles = data.circles ?? room.circles;
      assert(Number.isInteger(target) && target >= 1 && target <= 999 && Number.isInteger(circles) && circles >= 1 && circles <= 999, 'Введите целое число от 1 до 999');
      assert(data.mode === undefined || ['original', 'opinion'].includes(data.mode), 'Неизвестный режим');
      assert(data.categories === undefined || Array.isArray(data.categories) && data.categories.length > 0 && data.categories.every(id => categories.some(c => c.id === id)), 'Выберите категории');
      for (const key of ['hiddenMode', 'repeatRatings']) assert(data[key] === undefined || typeof data[key] === 'boolean', 'Некорректный переключатель');
      for (const key of ['targetVP', 'categories', 'mode', 'circles', 'hiddenMode', 'repeatRatings']) if (data[key] !== undefined) room[key] = copy(data[key]);
      break;
    }
    case 'launch_game': host(); assert(room.state === 'lobby', 'Игра уже началась'); startRound(room, true); break;
    case 'submit_rating': submitRating(room, playerId, data.movieId, data.rating, data.roundId); break;
    case 'save_critic_ratings':
      assert(room.players.filter(p => p.connected).length >= 2, 'Ожидаем второго участника');
      round(); assert(room.state === 'round_start' && room.mode === 'opinion' && room.phase === 'critic' && room.criticId === playerId && Object.keys(room.ratings[playerId] || {}).length === 5, 'Сначала выставьте все пять оценок'); guessing(room); break;
    case 'save_guesser_ratings': case 'edit_guesser_ratings':
      assert(room.players.filter(p => p.connected).length >= 2, 'Ожидаем второго участника');
      round(); assert(room.state === 'round_start' && room.mode === 'opinion' && room.phase === 'guess' && room.criticId !== playerId, 'Сейчас нельзя сохранить ответ');
      assert(event === 'edit_guesser_ratings' || room.movies.every(m => room.ratings[playerId]?.[m.id]), 'Сначала выставьте все пять оценок');
      room.savedRatings[playerId] = event === 'save_guesser_ratings'; if (allSaved(room)) revealRound(room); break;
    case 'pause_timer': host(); assert(room.mode === 'original' && room.state === 'round_start', 'Таймер недоступен'); room.timerRunning = false; break;
    case 'resume_timer': host(); assert(room.mode === 'original' && room.state === 'round_start', 'Таймер недоступен'); room.timerRunning = true; break;
    case 'dismiss_disconnect_pause': host(); room.pausedDueToDisconnect = false; break;
    case 'end_round_early': host(); assert(room.mode === 'original', 'В этом режиме ответы сохраняют игроки'); revealRound(room); break;
    case 'next_round': host(); assert(room.state === 'reveal' && !room.isFinalRound, 'Следующий раунд недоступен'); startRound(room); break;
    case 'finish_game': host(); assert(room.state === 'reveal' && room.isFinalRound, 'Игра ещё не завершена'); room.state = 'game_over'; break;
    case 'restart_game': {
      host(); assert(room.state === 'game_over', 'Игра ещё не завершена');
      const fresh = createRoom(room.players[0].nickname, room.id);
      Object.assign(room, fresh, Object.fromEntries(['players', 'host', 'categories', 'targetVP', 'mode', 'circles', 'hiddenMode', 'repeatRatings', 'usedMovieIds', 'usedMovieTitles', 'chat'].map(key => [key, room[key]])));
      room.players.forEach(p => { p.vp = 0; }); break;
    }
    case 'reroll_movie': {
      assert(room.players.filter(p => p.connected).length >= 2, 'Ожидаем второго участника');
      round(); assert(room.state === 'round_start' && (room.mode === 'opinion' ? room.criticId === playerId && room.phase === 'critic' : room.host === playerId), 'Вы не можете заменить эту карточку');
      const index = room.movies.findIndex(m => m.id === data.movieId);
      assert(index >= 0 && !room.rerolledSlots.includes(index), 'Эта карточка уже заменена');
      const [movie] = draw(room, 1, room.movies); room.movies[index] = movie; room.rerolledSlots.push(index);
      Object.values(room.ratings).forEach(v => { delete v[data.movieId]; }); Object.values(room.autoRatings).forEach(v => { delete v[data.movieId]; }); room.savedRatings = {}; break;
    }
    case 'change_color': {
      assert(room.state === 'lobby' && identities.some(c => c.hex === data.color) && !room.players.some(p => p.id !== playerId && p.color === data.color), 'Персонаж уже занят');
      room.players.find(p => p.id === playerId).color = data.color; break;
    }
    case 'transfer_host': {
      host(); const p = room.players.find(p => p.id === (data.targetPlayerId || data.playerId));
      assert(p?.connected && !p.bot, 'Бот не может быть ведущим'); room.host = p.id; break;
    }
    case 'kick_player': {
      host(); const id = data.targetPlayerId || data.playerId; assert(id !== room.host, 'Нельзя исключить ведущего');
      assert(room.players.some(p => p.id === id), 'Игрок не найден');
      room.players = room.players.filter(p => p.id !== id);
      if (room.criticQueue) {
        const keep=room.criticQueue.map((p,i)=>p!==id?i:-1).filter(i=>i>=0);
        room.criticQueue=keep.map(i=>room.criticQueue[i]);room.criticQueueCycles=keep.map(i=>room.criticQueueCycles[i]);
      }
      if (room.state === 'round_start' && room.mode === 'opinion' && room.criticId === id) guessing(room);
      if (room.state === 'round_start' && allSaved(room)) revealRound(room); break;
    }
    case 'send_chat_message': {
      assert(typeof data.text === 'string' && data.text.trim().length > 0 && data.text.trim().length <= 500, 'Сообщение должно содержать от 1 до 500 символов');
      const p = room.players.find(p => p.id === playerId);
      room.chat.push({ id: crypto.randomUUID(), playerId, nickname: p.nickname, color: p.color, at: Date.now(), text: data.text.trim() }); room.chat = room.chat.slice(-100); break;
    }
    case 'delete_chat_message': host(); room.chat = room.chat.filter(m => m.id !== data.messageId); break;
    default: throw Error('Неизвестное локальное действие');
  }
  return { success: true };
}

export const defaultBotConfig = () => ({policy:'random',auto:true,delayMs:1500,manualRanks:[...TIERS]});

export function validateBotConfig(previous, patch) {
  assert(patch && typeof patch === 'object', 'Некорректные настройки бота');
  const next={...previous};
  if (patch.policy !== undefined) { assert(['random','copy-host','reverse-host','manual'].includes(patch.policy),'Неизвестная стратегия');next.policy=patch.policy; }
  if (patch.auto !== undefined) { assert(typeof patch.auto==='boolean','Некорректная автоотправка');next.auto=patch.auto; }
  if (patch.delayMs !== undefined) { assert(Number.isInteger(patch.delayMs)&&patch.delayMs>=0&&patch.delayMs<=60000,'Задержка — от 0 до 60000 мс');next.delayMs=patch.delayMs; }
  if (patch.manualRanks !== undefined) {
    assert(Array.isArray(patch.manualRanks)&&patch.manualRanks.length===5&&patch.manualRanks.every(r=>r===null||TIERS.includes(r)),'Нужно пять допустимых оценок');
    next.manualRanks=[...patch.manualRanks];
  }
  return next;
}

export function botSnapshot(room, bot, config) {
  const ratings=room.movies.map(m=>room.ratings[bot.id]?.[m.id]||null);
  let status='Ожидает начала раунда';
  let canVote=room.state==='round_start'&&room.players.filter(p=>p.connected).length>=2;
  if (canVote && room.mode==='opinion' && ((room.phase==='critic')!==(room.criticId===bot.id))) {canVote=false;status='Ожидает своей фазы';}
  if (room.savedRatings[bot.id]) {canVote=false;status='Ответ сохранён';}
  if (canVote) {
    status=ratings.every(Boolean)?'Оценки выставлены':'Готов выставить оценки';
    if (config.policy==='manual' && (config.manualRanks.some(r=>!TIERS.includes(r))||!room.repeatRatings&&new Set(config.manualRanks).size!==5)) status='Укажите пять допустимых оценок';
    if (['copy-host','reverse-host'].includes(config.policy) && !room.movies.every(m=>room.ratings[room.host]?.[m.id])) status=room.mode==='opinion'&&room.phase==='critic'?'Критик не может копировать ведущего: выберите другую стратегию':'Ожидает пять оценок ведущего';
  }
  return {...bot,...config,manualRanks:[...config.manualRanks],ratings,progress:ratings.filter(Boolean).length,saved:!!room.savedRatings[bot.id],canVote,status};
}

// A complete ballot is applied atomically. This avoids the UI's rank-toggle and
// automatic fifth-rank assignment changing a programmed bot ballot halfway.
export function sendBotVotes(room, id, config) {
  const bot=room?.players.find(p=>p.id===id&&p.bot);
  assert(bot,'Бот не найден');
  const snapshot=botSnapshot(room,bot,config);
  assert(snapshot.canVote,snapshot.status);
  let ranks;
  if (config.policy==='manual') ranks=[...config.manualRanks];
  else if (config.policy==='random') ranks=room.repeatRatings?room.movies.map(()=>shuffle(TIERS)[0]):shuffle(TIERS);
  else {
    assert(room.movies.every(m=>TIERS.includes(room.ratings[room.host]?.[m.id])),snapshot.status);
    ranks=room.movies.map(m=>room.ratings[room.host][m.id]);
    if (config.policy==='reverse-host') ranks=ranks.map(r=>TIERS[4-TIERS.indexOf(r)]);
  }
  assert(ranks.length===5&&ranks.every(r=>TIERS.includes(r))&&(room.repeatRatings||new Set(ranks).size===5),'Нужно пять разных оценок S, A, B, C, D (или включите «Любая оценка»)');
  room.ratings[id]=Object.fromEntries(room.movies.map((m,i)=>[m.id,ranks[i]]));room.autoRatings[id]={};
  if (room.mode==='opinion') dispatch(room,room.phase==='critic'?'save_critic_ratings':'save_guesser_ratings',{roundId:room.roundId},id);
  return {success:true};
}

export function resetToLobby(room) {
  assert(room,'Сначала создайте комнату');
  const preserved=Object.fromEntries(['players','host','categories','targetVP','mode','circles','hiddenMode','repeatRatings','usedMovieIds','usedMovieTitles','chat'].map(key=>[key,room[key]]));
  Object.assign(room,createRoom(room.players.find(p=>p.id===room.host)?.nickname||'Ведущий',room.id),preserved);
  room.players.forEach(p=>{p.vp=0;});
  return {success:true};
}
