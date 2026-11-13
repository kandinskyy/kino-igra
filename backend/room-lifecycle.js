const IDLE_LIMIT_MS = 15 * 60 * 1000;

function isExpired(room, now = Date.now()) {
  // Kinonames coop deliberately has no thinking timer; connected players may
  // discuss a clue for as long as they need. Offline retention stays unchanged.
  if (room.mode === 'kinonames' && room.state === 'kinonames' && room.players?.some(player => player.connected)) return false;
  return now - (room.lastActivityAt ?? room.updatedAt ?? now) >= IDLE_LIMIT_MS;
}

function everyoneLeft(room) {
  return room.players.length > 0 && room.players.every(player => !player.connected && player.voluntarilyLeft);
}

module.exports = { IDLE_LIMIT_MS, isExpired, everyoneLeft };
