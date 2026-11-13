const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isExpired, everyoneLeft, IDLE_LIMIT_MS } = require('./room-lifecycle');

test('idle deadline is based on player activity, not connected status or snapshot writes', () => {
  const room = { lastActivityAt: 1000, updatedAt: 900000, players: [{ connected: true }] };
  assert.equal(isExpired(room, 1000 + IDLE_LIMIT_MS - 1), false);
  assert.equal(isExpired(room, 1000 + IDLE_LIMIT_MS), true);
  room.lastActivityAt = 5000;
  assert.equal(isExpired(room, 1000 + IDLE_LIMIT_MS), false);
  assert.equal(isExpired({ updatedAt: 1000 }, 1000 + IDLE_LIMIT_MS), true);
});

test('explicit departures close a room, temporary disconnects remain reconnectable', () => {
  const room = { players: [{ connected: false, voluntarilyLeft: true }, { connected: true }] };
  assert.equal(everyoneLeft(room), false);
  room.players[1].connected = false;
  assert.equal(everyoneLeft(room), false);
  room.players[1].voluntarilyLeft = true;
  assert.equal(everyoneLeft(room), true);
});

test('connected Kinonames has no idle thinking timeout; offline retention and legacy games stay bounded', () => {
  const room = {mode:'kinonames',state:'kinonames',lastActivityAt:1000,players:[{connected:true}]};
  assert.equal(isExpired(room,1000+IDLE_LIMIT_MS*2),false);
  room.players[0].connected=false;
  assert.equal(isExpired(room,1000+IDLE_LIMIT_MS*2),true);
  room.players[0].connected=true;room.state='lobby';
  assert.equal(isExpired(room,1000+IDLE_LIMIT_MS*2),true);
});
