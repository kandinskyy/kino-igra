const IDLE_LIMIT_MS = 15 * 60 * 1000;

function isExpired(room, now = Date.now()) {
  return now - (room.lastActivityAt ?? room.updatedAt ?? now) >= IDLE_LIMIT_MS;
}

function everyoneLeft(room) {
  return room.players.length > 0 && room.players.every(player => !player.connected && player.voluntarilyLeft);
}

module.exports = { IDLE_LIMIT_MS, isExpired, everyoneLeft };
