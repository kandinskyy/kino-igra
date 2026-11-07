import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconnectSession, rememberSession, roomAddress } from './sessionRouting.js';

function saved(values) {
  const data = new Map(Object.entries(values));
  return { getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value) };
}
const oldSession = { kino_lobbyId: 'AAAAAA', kino_sessionToken: 'old-secret',
  kino_lastNickname: 'Игрок' };

test('new invitation never restores the previous room or reuses its token', () => {
  const storage = saved(oldSession);
  assert.equal(reconnectSession('?room=BBBBBB', storage), null);
  for (const search of ['?room=', '?room=bad', '?room=invalid!'])
    assert.equal(reconnectSession(search, storage), null);
});
test('returning invitation restores only its own saved identity', () => {
  const storage = saved({ ...oldSession, kino_token_BBBBBB: 'new-secret' });
  assert.deepEqual(reconnectSession('?room=bbbbbb', storage), {
    lobbyId: 'BBBBBB', sessionToken: 'new-secret', nickname: 'Игрок',
  });
  assert.equal(reconnectSession('', storage).sessionToken, 'old-secret');
});
test('successful entry keeps reconnect credentials and address on the same room', () => {
  const storage = saved(oldSession);
  rememberSession(storage, 'BBBBBB', { nickname: 'Игрок', sessionToken: 'new-secret' });
  const address = roomAddress('https://overratedkino.ru/?room=AAAAAA&test=1#part', 'BBBBBB');
  assert.equal(reconnectSession(new URL(address).search, storage).lobbyId, 'BBBBBB');
  assert.equal(storage.getItem('kino_sessionToken'), 'new-secret');
  assert.equal(new URL(address).searchParams.get('test'), '1');
  assert.equal(new URL(roomAddress(address, null)).searchParams.has('room'), false);
});
