// Run as root on the new VPS before opening it to players. Creates disposable rooms.
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const requireApp = createRequire('/opt/overrated/app/frontend/package.json');
const { io } = requireApp('socket.io-client');
const base = process.argv[2] || 'http://127.0.0.1';
const clients = [];
const call = (s, event, payload) => s.timeout(5000).emitWithAck(event, payload);
async function connected(s) {
  if (s.connected) return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('connection timeout')), 12000);
    s.once('connect', () => { clearTimeout(timer); resolve(); });
    s.once('connect_error', error => { clearTimeout(timer); reject(error); });
    s.connect();
  });
}
async function make(transports) {
  const s = io(base, { transports, autoConnect: false, reconnection: false,
    extraHeaders: { Origin: 'https://overratedkino.ru' } });
  clients.push(s); await connected(s); return s;
}
async function state(s, lobbyId, token) {
  const response = await call(s, 'join_lobby', { lobbyId, sessionToken: token });
  assert.equal(response.success, true); return response.lobby;
}
(async () => {
  const health = await fetch(base + '/api/health').then(r => r.json());
  assert.equal(health.status, 'ok');
  assert.equal((await fetch(base + '/')).status, 200);
  const movies = await fetch(base + '/api/preview-movies').then(r => r.json());
  assert.equal(movies.length, 5);
  const poster = await fetch(base + movies[0].posterUrl + '?w=185', {signal: AbortSignal.timeout(15000)});
  assert.equal(poster.status, 200, 'TMDB poster reachable from VPS');
  assert.match(poster.headers.get('content-type'), /^image\//);
  await poster.arrayBuffer(); console.log('HTTP, static page, preview and poster: PASS');
  const a = await make(['websocket']), b = await make(['polling']), c = await make(['websocket']);
  console.log('nginx WebSocket and polling: PASS');
  let { lobbyId } = await call(a, 'create_lobby', { targetVP: 1 });
  const aa = await call(a, 'join_lobby', {lobbyId, nickname: 'VPS-test-A'});
  const bb = await call(b, 'join_lobby', {lobbyId, nickname: 'VPS-test-B'});
  await call(c, 'join_lobby', {lobbyId, nickname: 'VPS-test-C'});
  await call(a, 'launch_game', lobbyId);
  let room = await state(a, lobbyId, aa.player.sessionToken);
  for (let i = 0; i < 4; i++) for (const s of [a,b,c]) {
    assert.equal((await call(s, 'submit_rating', {lobbyId, movieId: room.movies[i].id, rating: ['S','A','B','C'][i]})).success, true);
  }
  room = await state(a, lobbyId, aa.player.sessionToken); assert.equal(room.allVoted, true);
  await call(a, 'end_round_early', lobbyId);
  room = await state(a, lobbyId, aa.player.sessionToken);
  assert.equal(room.state, 'reveal'); assert.equal(room.roundPoints[aa.player.id], 5);
  await call(a, 'finish_game', lobbyId);
  room = await state(a, lobbyId, aa.player.sessionToken);
  assert.equal(room.state, 'game_over'); assert.equal(room.history.length, 1);
  await call(a, 'close_lobby', {lobbyId});
  console.log('Three-player full original round and history: PASS');
  ({lobbyId} = await call(a, 'create_lobby', {targetVP: 30}));
  const first = await call(a, 'join_lobby', {lobbyId, nickname: 'VPS-restore-A'});
  const second = await call(b, 'join_lobby', {lobbyId, nickname: 'VPS-restore-B'});
  await call(a, 'launch_game', lobbyId);
  room = await state(a, lobbyId, first.player.sessionToken);
  const movieId = room.movies[0].id;
  await call(a, 'submit_rating', {lobbyId, movieId, rating: 'S'});
  execFileSync('systemctl', ['restart', 'overrated']);
  for (const s of clients) s.disconnect();
  await connected(a); await connected(b);
  room = await state(a, lobbyId, first.player.sessionToken);
  assert.equal(room.ratings[first.player.id][movieId], 'S');
  assert.equal(room.timerRunning, false);
  assert.equal((fs.statSync('/var/lib/overrated/rooms.json').mode & 0o777), 0o600);
  assert.equal((await call(b, 'join_lobby', {lobbyId, sessionToken: second.player.sessionToken})).player.id, second.player.id);
  await call(a, 'close_lobby', {lobbyId});
  console.log('Actual systemd restart, private snapshot and token reconnect: PASS');
  console.log('FIRSTBYTE_SMOKE_PASS');
})().catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => clients.forEach(s => s.close()));
