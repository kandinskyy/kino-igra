const fs = require('node:fs');
const path = require('node:path');
const { isExpired } = require('./room-lifecycle');

// Set ROOM_STATE_FILE only to a persistent, private filesystem location.
module.exports = function roomStore(rooms) {
  const file = process.env.ROOM_STATE_FILE;
  if (!file) return { save() {} };
  if (fs.existsSync(file)) {
    const snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (snapshot.version !== 1) throw Error('Unsupported room snapshot');
    for (const room of snapshot.rooms) {
      if (isExpired(room)) continue;
      [...room.players,...(room.waitingPlayers||[])].forEach(p => { p.connected = false; p.socketId = null; });
      if (room.timerRunning && room.deadline) room.timeLeft = Math.max(0, Math.ceil((room.deadline - room.updatedAt) / 1000));
      room.timerRunning = false; room.timerInterval = null; room.hostGraceTimer = null;
      room.allOfflineSince = Date.now(); rooms.set(room.id, room);
    }
  }
  return { save() {
    const values = [...rooms.values()].map(room => {
      const { timerInterval, hostGraceTimer, ...data } = room;
      return { ...data, updatedAt: Date.now() };
    });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file + '.tmp', JSON.stringify({ version: 1, rooms: values }), { mode: 0o600 });
    fs.renameSync(file + '.tmp', file);
  } };
};
