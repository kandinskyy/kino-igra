const test = require('node:test');
const assert = require('node:assert/strict');
const K = require('./kinonames');
const catalog = Array.from({ length: 60 }, (_, i) => ({ id: `c${i}`, name: `Герой ${i}`, image: `/heroes/${i}.webp` }));
const players = n => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, connected: true }));
function setup(variant = 'coop', count = variant === 'coop' ? 3 : 4, overrides = {}) {
  const ps = players(count), settings = K.normalizeSettings({ variant, ...overrides });
  const assignments = Object.fromEntries(ps.map((p, i) => [p.id, { team: variant === 'coop' || i < Math.floor(count / 2) ? 'blue' : 'red', leader: i === 0 || variant !== 'coop' && i === Math.floor(count / 2) }]));
  const state = K.startGame({ players: ps, settings, assignments, catalog, now: 1000, rng: () => .42 });
  return { ps, state, assignments, settings };
}
const act = (s, id, a, ps, now = 1100) => K.act(s, id, { ...a, gameId: s.gameId, turnId: s.turnId }, ps, now);
const leader = s => Object.keys(s.roles).find(id => s.roles[id].team === s.activeTeam && s.roles[id].leader);
const guessers = s => Object.keys(s.roles).filter(id => s.roles[id].team === s.activeTeam && !s.roles[id].leader);
function clue(s, ps, now = 1100) { act(s, leader(s), { type: 'clue', word: 'Космос', count: 3 }, ps, now); }
function select(s, ps, card, now = 1200) { guessers(s).forEach(id => act(s, id, { type: 'vote', cardId: card.id }, ps, now)); }
function open(s, ps, card, now = 1200) { select(s, ps, card, now); K.tick(s, ps, now + 3000); }
test('settings validate safe whole numbers and logical limits without arbitrary clue/life caps', () => {
  assert.equal(K.normalizeSettings({ coop: { clues: 10000, lives: 10000, blue: 25, black: 0 } }).coop.clues, 10000);
  for (const coop of [{ blue: 0 }, { black: -1 }, { lives: 0 }, { clues: 1.5 }, { blue: 24, black: 2 }, { clues: '2' }, { lives: Infinity }]) assert.throws(() => K.normalizeSettings({ coop }));
  assert.throws(() => K.normalizeSettings({ competitive: { traitors: 'true' } }));
  assert.throws(() => K.normalizeSettings({ competitive: { clueSeconds: Math.floor(Number.MAX_SAFE_INTEGER / 1000) } }), /время подсказки/);
});
test('start requires leader and guesser, supports uneven competitive teams, traitor minimum', () => {
  const x = setup();
  assert.throws(() => K.validateStart(x.ps.slice(0, 1), x.settings, x.assignments));
  assert.throws(() => K.validateStart(x.ps, x.settings, { ...x.assignments, p1: { team: 'blue', leader: true } }));
  assert.equal(setup('competitive', 5).state.board.length, 25);
  assert.throws(() => setup('competitive', 6, { competitive: { traitors: true } }), /8 игроков/);
  const y = setup('competitive', 8, { competitive: { traitors: true } });
  y.assignments.p3.team = 'red';
  assert.throws(() => K.validateStart(y.ps, y.settings, y.assignments), /четыре/);
});
test('server creates 25 unique persistent JSON cards, correct distributions and fresh party', () => {
  for (const variant of ['coop', 'competitive']) {
    const { state } = setup(variant);
    assert.equal(new Set(state.board.map(c => c.id)).size, 25);
    const counts = Object.fromEntries(['blue', 'red', 'black', 'neutral'].map(k => [k, state.board.filter(c => c.color === k).length]));
    assert.deepEqual(counts, variant === 'coop' ? { blue: 9, red: 0, black: 3, neutral: 13 } : { blue: 8, red: 8, black: 1, neutral: 8 });
    assert.deepEqual(JSON.parse(JSON.stringify(state)).board, state.board);
  }
  assert.notEqual(setup().state.gameId, setup().state.gameId);
});
test('leader clue consumes one, exhaustion does not end game and prevents further request', () => {
  const { state: s, ps } = setup('coop', 2, { coop: { clues: 1 } });
  assert.throws(() => act(s, 'p1', { type: 'clue', word: 'Космос', count: 3 }, ps));
  assert.throws(() => act(s, 'p0', { type: 'clue', word: 'Два слова', count: 3 }, ps));
  clue(s, ps);
  assert.equal(s.remainingClues, 0); assert.equal(s.phase, 'guess');
  assert.throws(() => act(s, 'p1', { type: 'request_clue' }, ps), /закончились/);
  open(s, ps, s.board.find(c => c.color === 'neutral'));
  assert.equal(s.phase, 'guess'); assert.equal(s.lives, 2);
});
test('request new clue resets pending votes, retains history, consumes only on publication', () => {
  const { state: s, ps } = setup(); clue(s, ps); select(s, ps, s.board[0]);
  act(s, 'p1', { type: 'request_clue' }, ps, 1300);
  assert.equal(s.phase, 'clue'); assert.equal(s.confirmation, null); assert.equal(s.remainingClues, 8);
  clue(s, ps, 1400); assert.equal(s.remainingClues, 7); assert.equal(s.history.length, 2);
});
test('coop black loses lives but keeps guessing; all blue wins and zero lives loses', () => {
  const { state: s, ps } = setup(); clue(s, ps);
  const black = s.board.filter(c => c.color === 'black');
  open(s, ps, black[0]); assert.equal(s.lives, 1); assert.equal(s.phase, 'guess');
  open(s, ps, black[1], 5000); assert.equal(s.result.reason, 'lives_exhausted'); assert.equal(s.result.winner, null);
  const y = setup('coop', 2, { coop: { blue: 1 } }); clue(y.state, y.ps);
  open(y.state, y.ps, y.state.board.find(c => c.color === 'blue'));
  assert.deepEqual(y.state.result, { winner: 'blue', reason: 'all_cards' });
});
test('unanimity cancellation and roster changes reset full confirmation, cannot open twice', () => {
  const { state: s, ps } = setup(); clue(s, ps);
  const card = s.board.find(c => c.color === 'neutral');
  act(s, 'p1', { type: 'vote', cardId: card.id }, ps, 1200); assert.equal(s.confirmation, null);
  act(s, 'p2', { type: 'vote', cardId: card.id }, ps, 1200); assert.equal(s.confirmation.deadline, 4200);
  act(s, 'p2', { type: 'vote', cardId: null }, ps, 4000); assert.equal(s.confirmation, null);
  K.tick(s, ps, 4500); assert.equal(card.revealed, false);
  ps[2].connected = false; K.tick(s, ps, 4600); assert.equal(s.confirmation.deadline, 7600);
  ps[2].connected = true; K.tick(s, ps, 4700); assert.equal(s.confirmation, null);
  act(s, 'p2', { type: 'vote', cardId: card.id }, ps, 4800); K.tick(s, ps, 7800);
  assert.equal(card.revealed, true); assert.equal(s.confirmation, null);
  assert.throws(() => act(s, 'p1', { type: 'vote', cardId: card.id }, ps, 7900));
});
test('no connected voters cannot open a card; unknown entrant cannot vote', () => {
  const { state: s, ps } = setup('coop', 2); clue(s, ps); select(s, ps, s.board[0]);
  ps[1].connected = false; K.tick(s, ps, 8000);
  assert.equal(s.board[0].revealed, false); assert.equal(s.confirmation, null);
  ps.push({ id: 'new', connected: true });
  assert.throws(() => act(s, 'new', { type: 'vote', cardId: s.board[0].id }, ps, 8100));
});
test('competitive clue and guess expire to opponent; expired old-turn acts rejected', () => {
  const { state: s, ps } = setup('competitive'); const first = s.activeTeam;
  const old = { type: 'clue', word: 'Космос', count: 2, gameId: s.gameId, turnId: s.turnId };
  assert.throws(() => K.act(s, leader(s), old, ps, 61000), /изменился/);
  assert.notEqual(s.activeTeam, first); assert.equal(s.turnId, 2);
  clue(s, ps, 62000); K.tick(s, ps, 182000);
  assert.equal(s.activeTeam, first); assert.equal(s.phase, 'clue');
});
test('correct competitive card gets +15 exactly once and keeps turn, neutral/opponent end turn', () => {
  const { state: s, ps } = setup('competitive'); clue(s, ps);
  const ownCard = s.board.find(c => c.color === s.activeTeam), initial = s.deadline;
  open(s, ps, ownCard); assert.equal(s.deadline, initial + 15000); assert.equal(s.phase, 'guess');
  K.tick(s, ps, 4300); assert.equal(s.deadline, initial + 15000);
  const active = s.activeTeam; open(s, ps, s.board.find(c => c.color === 'neutral'), 5000);
  assert.notEqual(s.activeTeam, active); assert.equal(s.phase, 'clue');
  clue(s, ps, 9000); const opponent = s.board.find(c => !c.revealed && c.color !== s.activeTeam && ['blue', 'red'].includes(c.color));
  const before = s.activeTeam; open(s, ps, opponent, 9100);
  assert.equal(opponent.revealed, true); assert.notEqual(s.activeTeam, before);
});
test('<=5 seconds unanimous opens instantly; turn expiry wins exact deadline tie', () => {
  const { state: s, ps } = setup('competitive'); clue(s, ps);
  const card = s.board.find(c => c.color === s.activeTeam);
  select(s, ps, card, s.deadline - 5000); assert.equal(card.revealed, true); assert.equal(s.confirmation, null);
  const y = setup('competitive'); clue(y.state, y.ps);
  const target = y.state.board.find(c => c.color === y.state.activeTeam);
  select(y.state, y.ps, target, y.state.deadline - 6000);
  K.tick(y.state, y.ps, y.state.deadline); assert.equal(target.revealed, false); assert.equal(y.state.phase, 'clue');
});
test('black ends competitive; opponent opening final target credits other winner', () => {
  const x = setup('competitive'); clue(x.state, x.ps);
  const active = x.state.activeTeam; open(x.state, x.ps, x.state.board.find(c => c.color === 'black'));
  assert.notEqual(x.state.result.winner, active); assert.equal(x.state.result.reason, 'black_card');
  const y = setup('competitive'); clue(y.state, y.ps);
  const opposing = y.state.activeTeam === 'blue' ? 'red' : 'blue';
  const targets = y.state.board.filter(c => c.color === opposing); targets.slice(1).forEach(c => { c.revealed = true; });
  open(y.state, y.ps, targets[0]); assert.equal(y.state.result.winner, opposing);
});
test('leaders and inactive teams cannot vote; stale game and malformed cards rejected', () => {
  const { state: s, ps } = setup('competitive'); clue(s, ps);
  const c = s.board[0].id;
  assert.throws(() => act(s, leader(s), { type: 'vote', cardId: c }, ps));
  const other = Object.keys(s.roles).find(id => s.roles[id].team !== s.activeTeam && !s.roles[id].leader);
  assert.throws(() => act(s, other, { type: 'vote', cardId: c }, ps));
  assert.throws(() => K.act(s, guessers(s)[0], { type: 'vote', cardId: c, gameId: 'stale', turnId: s.turnId }, ps));
  assert.throws(() => act(s, guessers(s)[0], { type: 'vote', cardId: '__proto__' }, ps));
});
test('leader color privacy, traitors only opponent/black, no leaked roles; public view isolated', () => {
  const { state: s, ps } = setup('competitive', 8, { competitive: { traitors: true } });
  for (const team of ['blue', 'red']) {
    const traitors = Object.keys(s.roles).filter(id => s.roles[id].team === team && s.roles[id].traitor);
    assert.equal(traitors.length, 1); const id = traitors[0]; assert.equal(s.roles[id].leader, false);
    const v = K.publicView(s, id, ps); assert.equal(v.ownRole.traitor, true);
    assert.ok(Object.values(v.assignments).every(a => !own(a, 'traitor')));
    for (const card of v.board) assert.equal(own(card, 'color'), ['black', team === 'blue' ? 'red' : 'blue'].includes(s.board.find(c => c.id === card.id).color));
  }
  const normal = Object.keys(s.roles).find(id => !s.roles[id].leader && !s.roles[id].traitor);
  assert.ok(K.publicView(s, normal, ps).board.every(c => !own(c, 'color')));
  assert.ok(K.publicView(s, leader(s), ps).board.every(c => own(c, 'color')));
  assert.equal(K.publicView(s, '__proto__', ps).ownRole, null);
  const v = K.publicView(s, normal, ps); v.settings.coop.lives = 99; v.board[0].name = 'changed'; assert.notEqual(s.settings.coop.lives, 99); assert.notEqual(s.board[0].name, 'changed');
});
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
test('existing three-second confirmation is not shortened on crossing five-second threshold', () => {
  const { state: s, ps } = setup('competitive'); clue(s, ps);
  const card = s.board.find(c => c.color === s.activeTeam), deadline = s.deadline;
  select(s, ps, card, deadline - 6000);
  K.tick(s, ps, deadline - 5000); assert.equal(card.revealed, false);
  K.tick(s, ps, deadline - 3000); assert.equal(card.revealed, true);
});
test('traitor alone after disconnect cannot open; clue number is not a guess cap', () => {
  const { state: s, ps } = setup('competitive', 8, { competitive: { traitors: true } }); clue(s, ps);
  const traitor = Object.keys(s.roles).find(id => s.roles[id].team === s.activeTeam && s.roles[id].traitor);
  for (const p of ps) if (s.roles[p.id].team === s.activeTeam && !s.roles[p.id].leader && p.id !== traitor) p.connected = false;
  act(s, traitor, { type: 'vote', cardId: s.board[0].id }, ps, 1200);
  K.tick(s, ps, 9000); assert.equal(s.board[0].revealed, false);
  const y = setup('coop', 2); act(y.state, 'p0', { type: 'clue', word: 'Космос', count: 1 }, y.ps);
  const cards = y.state.board.filter(c => c.color === 'neutral'); open(y.state, y.ps, cards[0]); open(y.state, y.ps, cards[1], 5000);
  assert.equal(cards.filter(c => c.revealed).length, 2); assert.equal(y.state.phase, 'guess');
});
test('JSON restoration preserves board, deadlines and private roles while reconnect resets stale consensus', () => {
  const { state: original, ps } = setup('competitive', 8, { competitive: { traitors: true } });
  clue(original, ps);
  const card = original.board.find(c => c.color === original.activeTeam);
  select(original, ps, card);
  const restored = JSON.parse(JSON.stringify(original));
  const before = JSON.stringify(restored.board);
  const disconnected = ps.map(p => ({ ...p, connected: false }));
  K.tick(restored, disconnected, 1500);
  assert.equal(restored.confirmation, null);
  assert.equal(restored.deadline, original.deadline);
  assert.equal(JSON.stringify(restored.board), before);
  K.tick(restored, ps, 2000);
  assert.equal(restored.confirmation, null);
  assert.deepEqual(Object.entries(restored.roles), Object.entries(original.roles));
  select(restored, ps, card, 2100);
  K.tick(restored, ps, 5100);
  assert.equal(restored.board.find(c => c.id === card.id).revealed, true);
  assert.equal(restored.deadline, original.deadline + 15000);
});
