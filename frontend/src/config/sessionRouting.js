// An explicit invitation always takes priority over the previous room.
export function reconnectSession(search, storage) {
  const params = new URLSearchParams(search);
  const activeRoom = storage.getItem('kino_lobbyId');
  const room = params.has('room')
    ? params.get('room').trim().toUpperCase()
    : activeRoom;
  if (!room || !/^[A-Z0-9]{6}$/.test(room)) return null;
  const token = storage.getItem('kino_token_' + room)
    || (room === activeRoom ? storage.getItem('kino_sessionToken') : null);
  return token ? { lobbyId: room, sessionToken: token,
    nickname: storage.getItem('kino_lastNickname') || '' } : null;
}

export function rememberSession(storage, lobbyId, player) {
  for (const [key, value] of Object.entries({
    kino_lobbyId: lobbyId,
    kino_sessionToken: player.sessionToken,
    ['kino_token_' + lobbyId]: player.sessionToken,
    kino_lastLobbyId: lobbyId,
    kino_lastNickname: player.nickname,
  })) storage.setItem(key, value);
}

export function roomAddress(href, room) {
  const url = new URL(href);
  if (room) url.searchParams.set('room', room);
  else url.searchParams.delete('room');
  return url.href;
}
