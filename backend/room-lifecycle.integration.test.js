const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { io } = require('../frontend/node_modules/socket.io-client');

test('disconnected players can reconnect; the last explicit departure closes the room', { timeout: 12000 }, async () => {
  const child = spawn(process.execPath, ['backend/server.js'], { env: { ...process.env, PORT: '3108', ROOM_STATE_FILE: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const clients = [];
  const connect = () => new Promise((resolve, reject) => {
    const socket = io('http://localhost:3108', { reconnection: false });
    clients.push(socket); socket.once('connect', () => resolve(socket)); socket.once('connect_error', reject);
  });
  const call = (socket, event, payload) => socket.timeout(2000).emitWithAck(event, payload);
  try {
    await new Promise((resolve, reject) => { child.stdout.on('data', data => { if (data.toString().includes('Backend server running')) resolve(); }); child.once('exit', () => reject(Error('server exited'))); });
    const host = await connect();
    const { lobbyId } = await call(host, 'create_lobby', {});
    const joined = await call(host, 'join_lobby', { lobbyId, nickname: 'Host' });
    const guest = await connect();
    const guestSession = await call(guest, 'join_lobby', { lobbyId, nickname: 'Guest' });
    guest.disconnect();
    const restored = await connect();
    assert.equal((await call(restored, 'join_lobby', { lobbyId, sessionToken: guestSession.player.sessionToken })).success, true);
    assert.equal((await call(restored, 'leave_lobby', { lobbyId })).success, true);
    assert.equal((await call(host, 'leave_lobby', { lobbyId })).success, true);
    assert.equal((await call(host, 'join_lobby', { lobbyId, sessionToken: joined.player.sessionToken })).success, false);
  } finally { clients.forEach(socket => socket.disconnect()); child.kill(); }
});
