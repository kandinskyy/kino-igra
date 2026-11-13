const engine = require('./kinonames');
const crypto = require('node:crypto');

// Adapter to existing rooms, membership and Socket.IO; it owns no second room store.
module.exports = function kinonamesRooms({ lobbies, emit, clearTimer, catalog }) {
  function ensure(room) {
    room.creatorId ||= room.host; // Adopt a stable owner for pre-feature snapshots.
    room.kinonames ||= { settings: engine.normalizeSettings(), assignments: {}, game: null };
    room.kinonames.assignments=engine.defaultAssignments(room.players,room.kinonames.settings,room.kinonames.assignments);
    const game=room.kinonames.game;
    if(game?.phase==='ready')for(const player of room.players)if(!game.roles[player.id]){
      game.roles[player.id]={...room.kinonames.assignments[player.id],traitor:false};game.readyIds=[];game.revision++;
    }
    return room.kinonames;
  }
  function publicView(room, viewerId) {
    const data = ensure(room);
    return {
      creatorId: room.creatorId || room.host,
      settings: data.settings,
      assignments: data.game?Object.fromEntries(Object.entries(data.game.roles).map(([id,r])=>[id,{team:r.team,leader:r.leader}])):engine.normalizeAssignments(room.players, data.settings, data.assignments),
      game: data.game ? { ...engine.publicView(data.game, viewerId, room.players), serverNow: Date.now() } : null,
    };
  }
  function synchronize(room, now = Date.now()) {
    const game = room.kinonames?.game;
    if (room.mode !== 'kinonames' || !game || room.state === 'lobby') return false;
    const changed = engine.tick(game, room.players, now);
    if (game.phase === 'finished') room.state = 'game_over';
    return changed;
  }
  function start(room, ready=false) {
    const data = ensure(room);
    const assignments=ready?engine.defaultAssignments(room.players,data.settings,{},()=>crypto.randomInt(0x100000000)/0x100000000):data.assignments;
    const game = engine.startGame({ players: room.players, settings: data.settings, assignments, catalog,ready });
    clearTimer(room);
    data.game = game;
    data.assignments=assignments;
    room.roundId = (room.roundId || 0) + 1;
    room.state = 'kinonames';
    room.winner = null;
    room.movies = []; room.ratings = {}; room.roundDetails = {}; room.roundPoints = {};
  }
  function register(socket) {
    socket.on('kinonames_settings', ({ lobbyId, settings }, ack) => {
      const room = lobbies.get(lobbyId);
      if (room.mode !== 'kinonames' || room.state !== 'lobby') throw Error('Настройки доступны до начала Kinonames');
      if (socket.data.playerId !== (room.creatorId || room.host)) throw Error('Настройки меняет только создатель комнаты');
      const data = ensure(room), next = engine.normalizeSettings(settings);
      data.assignments = engine.defaultAssignments(room.players, next, next.variant === data.settings.variant ? data.assignments : {});
      data.settings = next;
      emit(lobbyId, room); ack({ success: true });
    });
    socket.on('kinonames_assign', ({ lobbyId, team, leader }, ack) => {
      const room = lobbies.get(lobbyId);
      if (room.mode !== 'kinonames') throw Error('Выберите Kinonames');
      const data = ensure(room), id = socket.data.playerId;
      if (!['blue', 'red'].includes(team) || typeof leader !== 'boolean' || (data.settings.variant === 'coop' && team !== 'blue')) throw Error('Выберите допустимую команду и роль');
      if(data.game&&room.state!=='lobby'){
        engine.changeRole(data.game,id,team,leader,room.players);
        data.assignments=Object.fromEntries(Object.entries(data.game.roles).map(([pid,r])=>[pid,{team:r.team,leader:r.leader}]));
        emit(lobbyId,room);ack({success:true});return;
      }
      const assignments = engine.normalizeAssignments(room.players, data.settings, data.assignments);
      for (const p of room.players) if (!p.connected) assignments[p.id].leader = false;
      if (leader && Object.entries(assignments).some(([pid, role]) => pid !== id && role.team === team && role.leader)) throw Error('В этой команде уже есть ведущий');
      assignments[id] = { team, leader };
      data.assignments = assignments;
      emit(lobbyId, room); ack({ success: true });
    });
    socket.on('kinonames_action', ({ lobbyId, action }, ack) => {
      const room = lobbies.get(lobbyId);
      if (room.mode !== 'kinonames' || room.state !== 'kinonames' || !room.kinonames?.game) throw Error('Партия уже завершена или ещё не началась');
      const now = Date.now();
      // Publish an expired phase even if the packet itself is rejected as stale.
      if (synchronize(room, now)) emit(lobbyId, room);
      engine.act(room.kinonames.game, socket.data.playerId, action, room.players, now);
      synchronize(room, now);
      emit(lobbyId, room); ack({ success: true });
    });
  }
  const timer = setInterval(() => {
    for (const room of lobbies.values()) if (synchronize(room)) emit(room.id, room);
  }, 100);
  timer.unref();
  return { ensure, publicView, start, synchronize, register };
};
