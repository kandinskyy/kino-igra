const crypto = require('node:crypto');

const DEFAULT_SETTINGS = Object.freeze({
  variant: 'coop',
  coop: Object.freeze({ clues: 9, blue: 9, black: 3, lives: 2 }),
  competitive: Object.freeze({ clueSeconds: 60, guessSeconds: 120, traitors: false }),
});
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function integer(value, label, min = 1, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw Error(`Некорректное значение: ${label}`);
  return value;
}
function normalizeSettings(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Некорректные настройки Kinonames');
  const variant = input.variant ?? DEFAULT_SETTINGS.variant;
  if (!['coop', 'competitive'].includes(variant)) throw Error('Неизвестная разновидность Kinonames');
  const coop = { ...DEFAULT_SETTINGS.coop, ...input.coop };
  const competitive = { ...DEFAULT_SETTINGS.competitive, ...input.competitive };
  const result = { variant, coop: {
    clues: integer(coop.clues, 'подсказки'), blue: integer(coop.blue, 'синие карточки', 1, 25),
    black: integer(coop.black, 'чёрные карточки', 0, 24), lives: integer(coop.lives, 'жизни'),
  }, competitive: {
    clueSeconds: integer(competitive.clueSeconds, 'время подсказки', 1, Math.floor((Number.MAX_SAFE_INTEGER - Date.now() - 120000) / 1000)),
    guessSeconds: integer(competitive.guessSeconds, 'время угадывания', 1, Math.floor((Number.MAX_SAFE_INTEGER - Date.now() - 120000) / 1000)),
    traitors: competitive.traitors,
  } };
  if (result.coop.blue + result.coop.black > 25) throw Error('Сумма синих и чёрных карточек не может превышать 25');
  if (typeof result.competitive.traitors !== 'boolean') throw Error('Некорректная настройка предателей');
  return result;
}
function normalizeAssignments(players, settings, input = {}) {
  const output = Object.create(null);
  for (const p of players) {
    const a = own(input, p.id) ? input[p.id] : {};
    output[p.id] = { team: settings.variant === 'coop' ? 'blue' : ['blue', 'red'].includes(a?.team) ? a.team : null, leader: a?.leader === true };
  }
  return output;
}
function defaultAssignments(players, settings, input = {}, rng = null) {
  const output = normalizeAssignments(players, settings, input);
  const order = rng ? shuffled(players.filter(p => p.connected !== false), rng) : players;
  if (rng) for (const id of Object.keys(output)) output[id] = {team:null,leader:false};
  for (const [index,p] of order.entries()) {
    if (!rng && own(input,p.id) && output[p.id].team) continue;
    const team=settings.variant==='coop'?'blue':index%2===0?'blue':'red';
    output[p.id]={team,leader:!Object.values(output).some(a=>a.team===team&&a.leader)};
  }
  return output;
}
function validateStart(players, settings, assignments) {
  settings = normalizeSettings(settings);
  const present = players.filter(p => p.connected !== false);
  if (new Set(present.map(p => p.id)).size !== present.length) throw Error('Повторный участник');
  const traitors = settings.variant === 'competitive' && settings.competitive.traitors;
  if (traitors && present.length < 8) throw Error('Режим с предателем доступен от 8 игроков в лобби');
  const teams = settings.variant === 'coop' ? ['blue'] : ['blue', 'red'];
  for (const team of teams) {
    const members = present.filter(p => assignments[p.id]?.team === team);
    if (members.length < (traitors ? 4 : 2)) throw Error(`В ${team === 'blue' ? 'синей' : 'красной'} команде нужны ${traitors ? 'минимум четыре участника' : 'ведущий и хотя бы один угадывающий'}`);
    if (members.filter(p => assignments[p.id]?.leader).length !== 1) throw Error('В каждой команде должен быть ровно один ведущий');
  }
  if (present.some(p => !teams.includes(assignments[p.id]?.team))) throw Error('Все участники должны выбрать команду');
  return true;
}
function shuffled(values, rng) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const value = rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw Error('Некорректный источник случайности');
    const j = Math.floor(value * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const random = () => crypto.randomInt(0x100000000) / 0x100000000;
function startGame({ players, settings, assignments = {}, catalog, now = Date.now(), rng = random, ready = false }) {
  settings = normalizeSettings(settings);
  assignments = normalizeAssignments(players, settings, assignments);
  validateStart(players, settings, assignments);
  const unique = new Map();
  for (const item of catalog || []) {
    if (item && typeof item.id === 'string' && typeof item.name === 'string' && !unique.has(item.id)) unique.set(item.id, item);
  }
  if (unique.size < 25) throw Error('В каталоге недостаточно уникальных персонажей');
  const coop = settings.variant === 'coop';
  const colors = coop
    ? [...Array(settings.coop.blue).fill('blue'), ...Array(settings.coop.black).fill('black'), ...Array(25 - settings.coop.blue - settings.coop.black).fill('neutral')]
    : [...Array(8).fill('blue'), ...Array(8).fill('red'), ...Array(8).fill('neutral'), 'black'];
  const distribution = shuffled(colors, rng);
  const members = players.filter(p => p.connected !== false);
  const roles = Object.create(null);
  for (const p of members) roles[p.id] = { ...assignments[p.id], traitor: false };
  if (!ready && !coop && settings.competitive.traitors) {
    for (const team of ['blue', 'red']) {
      const candidates = members.filter(p => roles[p.id].team === team && !roles[p.id].leader);
      roles[shuffled(candidates, rng)[0].id].traitor = true;
    }
  }
  const firstTeam = coop ? 'blue' : shuffled(['blue', 'red'], rng)[0];
  return {
    gameId: crypto.randomUUID(), settings, roles, phase: ready?'ready':'clue', activeTeam: firstTeam, turnId: 1,
    board: shuffled([...unique.values()], rng).slice(0, 25).map((c, i) => ({ id: c.id, name: c.name, image: c.image || null, color: distribution[i], revealed: false })),
    clue: null, history: [], votes: Object.create(null), confirmation: null,
    deadline: ready||coop ? null : now + settings.competitive.clueSeconds * 1000,
    remainingClues: coop ? settings.coop.clues : null, lives: coop ? settings.coop.lives : null,
    result: null, revision: 0, readyIds:[], leaderGrace:null,
  };
}
function voters(state, players) {
  return players.filter(p => p.connected !== false && own(state.roles, p.id) && state.roles[p.id].team === state.activeTeam && !state.roles[p.id].leader).map(p => p.id);
}
function finish(state, winner, reason) {
  state.phase = 'finished'; state.result = { winner, reason }; state.deadline = null;
  state.votes = Object.create(null); state.confirmation = null; state.leaderGrace=null; state.revision++;
}
function nextTurn(state, now) {
  state.activeTeam = state.activeTeam === 'blue' ? 'red' : 'blue';
  state.phase = 'clue'; state.turnId++; state.clue = null;
  state.votes = Object.create(null); state.confirmation = null; state.leaderGrace=null;
  state.deadline = now + state.settings.competitive.clueSeconds * 1000;
  state.revision++;
}
function changeRole(state, actorId, team, leader, players, now=Date.now()) {
  const role=state.roles[actorId], player=players.find(p=>p.id===actorId&&p.connected!==false);
  if(!role||!player)throw Error('Участник не подключён к партии');
  const teams=state.settings.variant==='coop'?['blue']:['blue','red'];
  if(!teams.includes(team)||typeof leader!=='boolean')throw Error('Выберите допустимую команду и роль');
  if(!['ready','finished'].includes(state.phase)&&team!==role.team)throw Error('Сменить команду можно между партиями');
  if(role.traitor&&leader)throw Error('Предатель не может стать ведущим');
  if(leader){
    for(const [id,r] of Object.entries(state.roles))if(id!==actorId&&r.team===team&&r.leader){
      if(players.some(p=>p.id===id&&p.connected!==false))throw Error('В этой команде уже есть ведущий');
      r.leader=false;
    }
  }
  state.roles[actorId]={...role,team,leader};
  state.votes=Object.create(null);state.confirmation=null;state.readyIds=[];state.revision++;
  tick(state,players,now);
  return true;
}
function leaderConnection(state,players,now){
  if(state.phase!=='clue')return false;
  const connected=players.filter(p=>p.connected!==false&&state.roles[p.id]?.team===state.activeTeam);
  const leader=connected.find(p=>state.roles[p.id].leader);
  if(leader&&(!state.leaderGrace||now<state.leaderGrace.deadline)){
    if(!state.leaderGrace)return false;
    const same=leader.id===state.leaderGrace.playerId;
    state.deadline=state.settings.variant==='coop'?null:now+(same?state.leaderGrace.remainingMs:state.settings.competitive.clueSeconds*1000);
    state.leaderGrace=null;state.revision++;return true;
  }
  if(!state.leaderGrace){
    const absent=Object.entries(state.roles).find(([,r])=>r.team===state.activeTeam&&r.leader)?.[0]||null;
    state.leaderGrace={playerId:absent,deadline:now+20000,remainingMs:state.deadline==null?null:Math.max(0,state.deadline-now)};
    state.deadline=null;state.revision++;return true;
  }
  if(now<state.leaderGrace.deadline)return false;
  for(const r of Object.values(state.roles))if(r.team===state.activeTeam)r.leader=false;
  if(connected.length>=2){
    const candidates=connected.filter(p=>!state.roles[p.id].traitor&&p.id!==state.leaderGrace.playerId);
    if(candidates.length){state.roles[shuffled(candidates,random)[0].id].leader=true;state.leaderGrace=null;state.deadline=state.settings.variant==='coop'?null:now+state.settings.competitive.clueSeconds*1000;state.revision++;return true;}
  }
  // With one remaining guesser, continue without inventing a replacement clue.
  state.phase='guess';state.leaderGrace=null;state.votes=Object.create(null);state.confirmation=null;
  state.deadline=state.settings.variant==='coop'?null:now+state.settings.competitive.guessSeconds*1000;
  state.revision++;return true;
}
function openCard(state, cardId, now) {
  const card = state.board.find(c => c.id === cardId);
  if (!card || card.revealed || state.phase !== 'guess') return false;
  card.revealed = true; state.votes = Object.create(null); state.confirmation = null; state.revision++;
  const coop = state.settings.variant === 'coop';
  if (card.color === 'black') {
    if (coop) {
      state.lives--;
      if (!state.lives) finish(state, null, 'lives_exhausted');
    } else finish(state, state.activeTeam === 'blue' ? 'red' : 'blue', 'black_card');
    return true;
  }
  for (const team of coop ? ['blue'] : ['blue', 'red']) {
    if (state.board.filter(c => c.color === team).every(c => c.revealed)) {
      finish(state, team, 'all_cards'); return true;
    }
  }
  if (!coop) {
    if (card.color === state.activeTeam) state.deadline += 15000;
    else nextTurn(state, now);
  }
  return true;
}
function reconcileVotes(state, players, now) {
  const eligible = voters(state, players);
  let changed = false;
  for (const id of Object.keys(state.votes)) {
    if (!eligible.includes(id)) { delete state.votes[id]; changed = true; }
  }
  // A lone remaining traitor must not be able to open a card without a teammate.
  const enough = eligible.length > 0 && !(eligible.length === 1 && state.roles[eligible[0]].traitor);
  const cardId = enough && state.votes[eligible[0]];
  const unanimous = cardId && eligible.every(id => state.votes[id] === cardId);
  const roster = eligible.slice().sort().join('|');
  if (!unanimous) {
    if (state.confirmation) { state.confirmation = null; changed = true; }
  } else if (state.confirmation && state.confirmation.cardId === cardId && state.confirmation.roster === roster) {
    if (now >= state.confirmation.deadline) return openCard(state, cardId, now) || changed;
  } else if (state.settings.variant === 'competitive' && state.deadline - now <= 5000) {
    return openCard(state, cardId, now) || changed;
  } else {
    state.confirmation = { cardId, deadline: now + 3000, roster }; changed = true;
  }
  if (changed) state.revision++;
  return changed;
}
function tick(state, players, now = Date.now()) {
  if (state.phase === 'finished') return false;
  if(state.phase==='ready'){
    const present=players.filter(p=>p.connected!==false&&own(state.roles,p.id));
    const ids=present.map(p=>p.id);const previous=(state.readyIds||[]).join('|');
    state.readyIds=(state.readyIds||[]).filter(id=>ids.includes(id));
    if(present.length&&present.every(p=>state.readyIds.includes(p.id))){
      try{validateStart(present,state.settings,state.roles);}catch{return previous!==state.readyIds.join('|');}
      if(state.settings.variant==='competitive'&&state.settings.competitive.traitors){
        for(const r of Object.values(state.roles))r.traitor=false;
        for(const team of ['blue','red']){
          const candidates=present.filter(p=>state.roles[p.id].team===team&&!state.roles[p.id].leader);
          state.roles[shuffled(candidates,random)[0].id].traitor=true;
        }
      }
      state.phase='clue';state.deadline=state.settings.variant==='coop'?null:now+state.settings.competitive.clueSeconds*1000;state.revision++;return true;
    }
    return previous!==state.readyIds.join('|');
  }
  const leaderChanged=leaderConnection(state,players,now);
  if(state.leaderGrace)return leaderChanged;
  // The turn deadline wins ties with confirmation: no late openings or bonuses.
  if (state.settings.variant === 'competitive' && state.deadline!=null && now >= state.deadline) {
    nextTurn(state, now); return true;
  }
  if (state.phase === 'guess') return reconcileVotes(state, players, now);
  return leaderChanged;
}
function act(state, actorId, action, players, now = Date.now()) {
  if (!action || typeof action !== 'object') throw Error('Некорректное действие');
  tick(state, players, now);
  if (action.gameId !== state.gameId || action.turnId !== state.turnId) throw Error('Ход уже изменился');
  if (state.phase === 'finished') throw Error('Партия завершена');
  const role = own(state.roles, actorId) ? state.roles[actorId] : null;
  if (!role || !players.some(p => p.id === actorId && p.connected !== false)) throw Error('Участник не подключён к партии');
  if(action.type==='ready'){
    if(state.phase!=='ready')throw Error('Готовность отмечается перед новой партией');
    if(!state.readyIds.includes(actorId))state.readyIds.push(actorId);
    tick(state,players,now);state.revision++;return true;
  }
  if (role.team !== state.activeTeam) throw Error('Сейчас ход другой команды');
  if (action.type === 'clue') {
    if (!role.leader || state.phase !== 'clue' || state.leaderGrace) throw Error('Подсказку сейчас даёт ведущий активной команды');
    if (typeof action.word !== 'string' || !/^[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*$/u.test(action.word.trim()) || action.word.trim().length > 80) throw Error('Подсказка должна состоять из одного слова');
    integer(action.count, 'число в подсказке', 0);
    if (state.settings.variant === 'coop' && state.remainingClues <= 0) throw Error('Подсказки закончились');
    const clue = { word: action.word.trim(), count: action.count, team: role.team, turnId: state.turnId };
    state.clue = clue; state.history.push(clue); state.phase = 'guess';
    if (state.settings.variant === 'coop') state.remainingClues--;
    else state.deadline = now + state.settings.competitive.guessSeconds * 1000;
  } else if (action.type === 'request_clue') {
    if (state.settings.variant !== 'coop' || state.phase !== 'guess' || role.leader) throw Error('Сейчас нельзя запросить подсказку');
    if (state.remainingClues <= 0) throw Error('Подсказки закончились. Продолжайте угадывать по предыдущим подсказкам');
    state.phase = 'clue'; state.turnId++; state.votes = Object.create(null); state.confirmation = null;
  } else if (action.type === 'vote') {
    if (role.leader || state.phase !== 'guess') throw Error('Сейчас вы не можете голосовать');
    if (action.cardId !== null && !state.board.some(c => c.id === action.cardId && !c.revealed)) throw Error('Выберите закрытую карточку');
    if (action.cardId === null) delete state.votes[actorId];
    else state.votes[actorId] = action.cardId;
    reconcileVotes(state, players, now);
  } else throw Error('Неизвестное действие Kinonames');
  state.revision++;
  return true;
}
function publicView(state, viewerId, players = []) {
  const role = own(state.roles, viewerId) ? state.roles[viewerId] : null;
  const secret = !!role?.leader&&state.phase!=='ready';
  const visibleToTraitor = color => role?.traitor && (color === 'black' || color === (role.team === 'blue' ? 'red' : 'blue'));
  const assignments = Object.create(null);
  for (const [id, r] of Object.entries(state.roles)) assignments[id] = { team: r.team, leader: r.leader };
  return {
    gameId: state.gameId, settings: structuredClone(state.settings), phase: state.phase, activeTeam: state.activeTeam,
    turnId: state.turnId, revision: state.revision,
    board: state.board.map(c => state.phase==='ready'?{id:c.id,name:'',image:null,revealed:false}:{ id: c.id, name: c.name, image: c.image, revealed: c.revealed||state.phase==='finished', ...(c.revealed || secret || visibleToTraitor(c.color) || state.phase === 'finished' ? { color: c.color } : {}) }),
    assignments, ownRole: role ? { ...role } : null,
    clue: state.clue ? { ...state.clue } : null, history: state.history.map(c => ({ ...c })),
    votes: { ...state.votes }, voterIds: state.phase === 'guess' ? voters(state, players) : [],
    confirmation: state.confirmation ? { cardId: state.confirmation.cardId, deadline: state.confirmation.deadline } : null,
    deadline: state.deadline, leaderGrace:state.leaderGrace?{...state.leaderGrace}:null,readyIds:[...(state.readyIds||[])],remainingClues: state.remainingClues, lives: state.lives,
    remaining: Object.fromEntries(['blue', 'red'].map(team => [team, state.board.filter(c => c.color === team && !c.revealed).length])),
    result: state.result ? { ...state.result } : null,
  };
}
module.exports = { DEFAULT_SETTINGS, normalizeSettings, normalizeAssignments, defaultAssignments, validateStart, startGame, changeRole, act, tick, publicView };

