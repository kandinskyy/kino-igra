const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { io } = require('../frontend/node_modules/socket.io-client');
const ids = new Set(require('../shared/superhero-catalog.json').works.map(work => work.id));

test('real rating rooms enforce exclusive superhero selection and keep both modes inside the collection', { timeout: 18000 }, async () => {
  const server = spawn(process.execPath, ['backend/server.js'], { env: { ...process.env, PORT: '3108', ROOM_STATE_FILE: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const clients = [];
  const call = (socket, event, payload) => socket.timeout(2500).emitWithAck(event, payload);
  const connect = () => new Promise((resolve, reject) => {
    const socket = io('http://localhost:3108', { reconnection: false });
    clients.push(socket); socket.once('connect', () => resolve(socket)); socket.once('connect_error', reject);
  });
  try {
    await new Promise((resolve, reject) => {
      server.stdout.on('data', data => { if (String(data).includes('Backend server running')) resolve(); });
      server.once('exit', () => reject(Error('Test server exited')));
    });
    for (const mode of ['original', 'opinion']) {
      const host = await connect(), guest = await connect();
      const { lobbyId } = await call(host, 'create_lobby', { targetVP: 30 });
      const session = await call(host, 'join_lobby', { lobbyId, nickname: `Host ${mode}` });
      await call(guest, 'join_lobby', { lobbyId, nickname: `Guest ${mode}` });
      assert.equal((await call(guest, 'update_target_vp', { lobbyId, categories: ['superheroes'] })).success, false);
      for (const categories of [['superheroes', 'films'], ['cartoons', 'superheroes']]) {
        assert.equal((await call(host, 'update_target_vp', { lobbyId, mode, targetVP: 99, categories })).success, false);
      }
      const snapshot = await call(host, 'join_lobby', { lobbyId, sessionToken: session.player.sessionToken });
      assert.deepEqual(snapshot.lobby.categories, ['films']);
      assert.equal(snapshot.lobby.targetVP, 30);
      assert.equal((await call(host, 'update_target_vp', { lobbyId, mode, categories: ['superheroes', 'superheroes'] })).success, true);
      await call(host, 'launch_game', lobbyId);
      const started = await call(host, 'join_lobby', { lobbyId, sessionToken: session.player.sessionToken });
      assert.deepEqual(started.lobby.categories, ['superheroes']);
      assert.equal(started.lobby.mode, mode);
      assert.equal(started.lobby.movies.length, 5);
      assert.equal(new Set(started.lobby.movies.map(movie => movie.id)).size, 5);
      assert.ok(started.lobby.movies.every(movie => ids.has(movie.id)));
      host.disconnect(); guest.disconnect();
    }
  } finally {
    clients.forEach(socket => socket.disconnect()); server.kill();
    await new Promise(resolve => server.exitCode !== null ? resolve() : server.once('exit', resolve));
  }
});
