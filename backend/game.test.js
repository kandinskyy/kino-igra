const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { io } = require('../frontend/node_modules/socket.io-client');

test('private ratings and session credentials never reach another player', { timeout: 15000 }, async () => {
  const child = spawn(process.execPath, ['backend/server.js'], { env: { ...process.env, PORT: '3099', ROOM_STATE_FILE: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const clients = [];
  const connect = () => new Promise((resolve, reject) => {
    const s = io('http://localhost:3099', { reconnection: false }); clients.push(s);
    s.once('connect', () => resolve(s)); s.once('connect_error', reject);
  });
  const call = (s, event, data) => s.timeout(2000).emitWithAck(event, data);
  try {
    await new Promise((resolve, reject) => { child.stdout.on('data', b => { if (b.toString().includes('Backend server running')) resolve(); }); child.once('exit', () => reject(new Error('server exited'))); });
    const a = await connect(), b = await connect();
    const blocked = io('http://localhost:3099', { transports: ['websocket'], reconnection: false, extraHeaders: { Origin: 'https://untrusted.example' } });
    clients.push(blocked);
    await new Promise((resolve, reject) => { blocked.once('connect_error', resolve); blocked.once('connect', () => reject(Error('untrusted origin connected'))); });
    const { lobbyId } = await call(a, 'create_lobby', { targetVP: 30 });
    const alice = await call(a, 'join_lobby', { lobbyId, nickname: 'Alice' });
    const bob = await call(b, 'join_lobby', { lobbyId, nickname: 'Bob' });
    assert.equal(bob.lobby.players[0].sessionToken, undefined);
    assert.equal(bob.lobby.players[0].ip, undefined);
    assert.equal((await call(a, 'join_lobby', { lobbyId, nickname: 'Duplicate' })).success, false);
    const attacker = await connect();
    assert.equal((await call(attacker, 'join_lobby', { lobbyId, nickname: 'Alice' })).success, false);
    await call(a, 'launch_game', lobbyId);
    const current = await call(a, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    const movieId = current.lobby.movies[0].id;
    const update = new Promise(resolve => b.once('lobby_update', resolve));
    await call(a, 'submit_rating', { lobbyId, movieId, rating: 'S', roundId: current.lobby.roundId });
    assert.equal((await update).ratings[alice.player.id], undefined);
    assert.equal((await call(attacker, 'submit_rating', { lobbyId, movieId, rating: 'S' })).success, false);
    assert.equal((await call(b, 'submit_rating', { lobbyId, movieId: 'fake', rating: 'Z' })).success, false);
    a.disconnect();
    assert.equal((await call(attacker, 'join_lobby', { lobbyId, nickname: 'Alice', sessionToken: 'wrong' })).success, false);
    const restored = await connect();
    const session = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal(session.player.id, alice.player.id);
    assert.equal(session.lobby.ratings[alice.player.id][movieId], 'S');
    assert.equal((await call(a.connect(), 'join_lobby', { lobbyId, nickname: 'Alice', sessionToken: 'wrong' })).success, false);
    const ranks = ['S', 'A', 'B', 'C', 'D'];
    for (let i = 0; i < 4; i++) {
      if (i > 0) await call(restored, 'submit_rating', { lobbyId, movieId: session.lobby.movies[i].id, rating: ranks[i] });
      await call(b, 'submit_rating', { lobbyId, movieId: session.lobby.movies[i].id, rating: ranks[i] });
    }
    await call(restored, 'end_round_early', lobbyId);
    const reveal = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal(reveal.lobby.state, 'reveal');
    assert.equal(reveal.lobby.roundPoints[alice.player.id], 5);
    assert.equal(reveal.lobby.roundPoints[bob.player.id], 5);
    await call(restored, 'next_round', lobbyId);
    const next = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal((await call(restored, 'submit_rating', { lobbyId, movieId: next.lobby.movies[0].id, rating: 'S', roundId: current.lobby.roundId })).success, false);
    assert.equal((await call(restored, 'next_round', lobbyId)).success, false);
    assert.equal((await call(b, 'start_timer', lobbyId)).success, false);
    await call(restored, 'start_timer', lobbyId);
    await call(restored, 'pause_timer', lobbyId);
    await call(restored, 'kick_player', { lobbyId, playerId: bob.player.id });
    let leaked = false;
    b.on('lobby_update', () => { leaked = true; });
    assert.equal((await call(b, 'submit_rating', { lobbyId, movieId, rating: 'A' })).success, false);
    assert.equal((await call(restored, 'change_color', { lobbyId, color: null })).success, false);
    assert.equal((await call(attacker, 'join_lobby', null)).success, false);
    await call(restored, 'close_lobby', { lobbyId });
    assert.equal(leaked, false);
  } finally { clients.forEach(s => s.close()); child.kill(); }
});

test('rooms restore paused after process restart only when a state file is configured', { timeout: 15000 }, async () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'overrated-test-'));
  const file = path.join(dir, 'rooms.json');
  const clients = [];
  let child;
  const start = () => new Promise((resolve, reject) => {
    child = spawn(process.execPath, ['backend/server.js'], { env: { ...process.env, PORT: '3098', ROOM_STATE_FILE: file }, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', b => { if (b.toString().includes('Backend server running')) resolve(); });
    child.once('exit', () => reject(Error('server exited before readiness')));
  });
  const stop = () => new Promise(resolve => { child.once('exit', resolve); child.kill(); });
  const connect = () => new Promise((resolve, reject) => {
    const s = io('http://localhost:3098', { reconnection: false }); clients.push(s);
    s.once('connect', () => resolve(s)); s.once('connect_error', reject);
  });
  const call = (s, event, data) => s.timeout(2000).emitWithAck(event, data);
  try {
    await start();
    const a = await connect(), b = await connect();
    const { lobbyId } = await call(a, 'create_lobby', { targetVP: 1 });
    const alice = await call(a, 'join_lobby', { lobbyId, nickname: 'Alice' });
    const bob = await call(b, 'join_lobby', { lobbyId, nickname: 'Bob' });
    await call(a, 'launch_game', lobbyId);
    const { lobby } = await call(a, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    await call(a, 'submit_rating', { lobbyId, movieId: lobby.movies[0].id, rating: 'S' });
    await call(a, 'start_timer', lobbyId);
    await new Promise(r => setTimeout(r, 1200));
    await call(a, 'pause_timer', lobbyId);
    await new Promise(r => setTimeout(r, 250));
    assert.ok(fs.existsSync(file));
    await stop();
    await start();
    const restored = await connect();
    const response = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal(response.success, true);
    assert.equal(response.player.id, alice.player.id);
    assert.equal(response.lobby.timerRunning, false);
    assert.ok(response.lobby.timeLeft < 60);
    assert.equal(response.lobby.ratings[alice.player.id][lobby.movies[0].id], 'S');
    assert.equal(response.lobby.players.find(p => p.id === bob.player.id).connected, false);
    await call(restored, 'close_lobby', { lobbyId });
    await new Promise(r => setTimeout(r, 200));
    assert.equal(JSON.parse(fs.readFileSync(file)).rooms.length, 0);
  } finally {
    clients.forEach(s => s.close());
    if (child && child.exitCode === null) await stop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
