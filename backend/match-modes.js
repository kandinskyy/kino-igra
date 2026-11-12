const crypto = require("node:crypto");
const ranks = ["S", "A", "B", "C", "D"];
const { allSaved } = require('./room-actions');
const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
function fill(l, pid) {
  const votes = (l.ratings[pid] ||= {}),
    auto = ((l.autoRatings ||= {})[pid] ||= {});
  const available = shuffle(
    ranks.filter((r) => !Object.values(votes).includes(r)),
  );
  for (const m of l.movies)
    if (!votes[m.id]) {
      votes[m.id] = l.repeatRatings
        ? ranks[crypto.randomInt(5)]
        : available.pop();
      auto[m.id] = true;
    }
}
function publicView(l, id, view) {
  const opinion = l.mode === "opinion",
    finished = l.state === "game_over",
    revealed = ["reveal", "game_over"].includes(l.state);
  const secret = l.hiddenMode && !finished;
  const critic = l.players.find((p) => p.id === l.criticId) || l.criticPlayer;
  Object.assign(view, {
    mode: l.mode || "original",
    circles: l.circles || 1,
    currentCircle: l.currentCircle || 1,
    hiddenMode: !!l.hiddenMode,
    repeatRatings: !!l.repeatRatings,
    phase: l.phase,
    isCritic: opinion && l.criticId === id,
    criticName: opinion && !secret ? critic?.nickname : null,
    criticId: opinion && !secret ? l.criticId : null,
    criticRatings: opinion && revealed ? l.ratings[l.criticId] || {} : {},
    criticAuto: opinion && revealed ? l.autoRatings?.[l.criticId] || {} : {},
    autoRatings: secret
      ? { [id]: l.autoRatings?.[id] || {} }
      : revealed
        ? l.autoRatings || {}
        : { [id]: l.autoRatings?.[id] || {} },
    history: finished ? l.history || [] : [],
    waitingForPlayers:
      opinion && l.players.filter((p) => p.connected).length < 2,
    criticWait:
      l.phase === "critic" && critic && !critic.connected
        ? Math.ceil(l.criticGraceRemaining ?? 60)
        : null,
    revealedAt: l.revealedAt,
    myPoints: l.players.find((p) => p.id === id)?.vp || 0,
    myRoundPoints: l.roundPoints?.[id] || 0,
    myPerfect: !!l.perfect?.[id],
    isPerfect: opinion && revealed
      ? secret ? { [id]: !!l.perfect?.[id] } : { ...l.perfect }
      : {},
    matchPoints: revealed ? l.matchPoints?.[id] || {} : {},
    rerolledSlots: l.rerolledSlots || [],
    mySaved: !!l.savedRatings?.[id],
    savedRatings: secret ? { [id]: !!l.savedRatings?.[id] } : l.savedRatings || {},
    chat: l.chat || [],
  });
  if (opinion && l.state === "round_start") {
    view.allVoted = l.phase === 'guess' && l.players.filter(p => p.connected && p.id !== l.criticId).every(p => l.savedRatings?.[p.id]);
  }
  if (secret) {
    view.players = view.players.map((p) => ({
      ...p,
      vp: p.id === id ? p.vp : null,
    }));
    view.roundPoints = { [id]: l.roundPoints?.[id] || 0 };
    view.roundDetails = {};
    view.roundAverages = {};
    view.winner = null;
    view.progress = { [id]: view.progress[id] || 0 };
    view.allVoted = false;
    view.ratings = { [id]: l.ratings[id] || {} };
    view.disconnectedPlayerName = null;
    view.disconnectedPlayerId = null;
  }
  return view;
}
module.exports = function install({
  lobbies,
  emit,
  clearTimer,
  endRound,
  clock = Date.now,
  schedule = setInterval,
}) {
  function guessing(l) {
    fill(l, l.criticId);
    (l.savedRatings ||= {})[l.criticId] = true;
    l.phase = "guess";
    l.timeLeft = 60;
    l.opinionRemaining = 60;
    l.timerRunning = true;
    l.modeTickAt = Date.now();
    emit(l.id, l);
  }
  function start(l) {
    l.rerolledSlots = [];
    l.savedRatings = {};
    if (l.mode !== "opinion") {
      l.autoRatings = {};
      return;
    }
    if (!l.criticQueue) {
      const order = shuffle(
        l.players.filter((p) => p.connected).map((p) => p.id),
      );
      l.criticQueue = Array.from({ length: l.circles || 1 }, () => [
        ...order,
      ]).flat();
      l.criticQueueCycles = Array.from({ length: l.circles || 1 }, (_, i) => order.map(() => i + 1)).flat();
      l.currentCircle = 1;
    }
    const index = l.criticQueue.findIndex((id) =>
      l.players.some((p) => p.id === id && p.connected),
    );
    l.criticId = l.criticQueue.splice(index, 1)[0];
    l.currentCircle = Math.max(l.currentCircle || 1, l.criticQueueCycles?.splice(index, 1)[0] || 1);
    l.criticPlayer = JSON.parse(
      JSON.stringify(l.players.find((p) => p.id === l.criticId)),
    );
    l.phase = "critic";
    l.timerRunning = false;
    l.timeLeft = 60;
    l.criticGraceRemaining = 60;
    l.modeTickAt = Date.now();
    l.autoRatings = {};
    l.perfect = {};
    l.roundParticipants = l.players.filter((p) => p.connected).map((p) => p.id);
  }
  function score(l, points) {
    l.matchPoints = {};
    l.perfect = {};
    for (const p of l.players) {
      const matches = {};
      for (const m of l.movies)
        matches[m.id] =
          l.mode === "opinion"
            ? p.id !== l.criticId &&
              l.ratings[p.id]?.[m.id] === l.ratings[l.criticId]?.[m.id]
              ? 1
              : 0
            : Math.max(
                0,
                (l.roundDetails?.[m.id]?.[l.ratings[p.id]?.[m.id]]?.length ||
                  0) - 1,
              );
      l.matchPoints[p.id] = matches;
      if (l.mode === "opinion") {
        const n = Object.values(matches).reduce((a, b) => a + b, 0);
        l.perfect[p.id] = n === 5;
        points[p.id] = n + (n === 5 ? 1 : 0);
      }
    }
    if (l.mode === 'opinion') {
      const guessers = (l.roundParticipants || l.players.map(p => p.id)).filter(id => id !== l.criticId);
      const perfectCount = guessers.filter(id => l.perfect[id]).length;
      points[l.criticId] = guessers.length && perfectCount === guessers.length ? 0 : perfectCount;
    }
  }
  function complete(l) {
    l.revealedAt = Date.now();
    if (l.mode === "opinion") {
      l.isFinalRound = !l.criticQueue.some((id) =>
        l.players.some((p) => p.id === id && p.connected),
      );
      l.winner = l.isFinalRound
        ? [...l.players].sort((a, b) => b.vp - a.vp)[0]
        : null;
    }
    const members = [...l.players];
    if (l.criticPlayer && !members.some((p) => p.id === l.criticId))
      members.push(l.criticPlayer);
    (l.history ||= []).push(
      JSON.parse(
        JSON.stringify({
          roundId: l.roundId,
          criticId: l.criticId,
          players: members.map(({ id, nickname, color, vp }) => ({
            id,
            nickname,
            color,
            vp,
          })),
          movies: l.movies,
          ratings: l.ratings,
          autoRatings: l.autoRatings || {},
          roundPoints: l.roundPoints,
        }),
      ),
    );
  }
  function reconnect(l, p, wasDisconnected = true) {
    const wasAway = wasDisconnected;
    p.departed = false;
    if (
      l.mode === "opinion" &&
      l.state !== "game_over" &&
      wasAway &&
      l.criticQueue
    ) {
      const positions = l.criticQueue
        .map((id, i) => (id === p.id ? i : -1))
        .filter((i) => i >= 0);
      if (positions.length) {
        const cycle = l.criticQueueCycles?.[positions[0]] || l.currentCircle || 1;
        // A completed turn must not pull this player's next-circle turn forward.
        // Only a missed turn in the current/earlier circle needs rescheduling.
        if (cycle <= (l.currentCircle || 1)) {
          l.criticQueue.splice(positions[0], 1);
          l.criticQueueCycles?.splice(positions[0], 1);
          const slots = (l.criticQueueCycles || []).map((c, i) => c <= (l.currentCircle || 1) ? i : -1).filter(i => i >= 0);
          const insertAt = slots.length ? slots[crypto.randomInt(slots.length + 1)] ?? slots.at(-1) + 1 : 0;
          l.criticQueue.splice(insertAt, 0, p.id);
          l.criticQueueCycles?.splice(insertAt, 0, cycle);
        }
        l.isFinalRound = false;
        l.winner = null;
      }
    }
  }
  function disconnected(l, p, explicit) {
    p.departed = !!explicit || !!p.departed;
    if (
      explicit &&
      l.mode === "opinion" &&
      l.phase === "critic" &&
      l.criticId === p.id
    )
      guessing(l);
  }
  const interval = schedule(() => {
    for (const l of lobbies.values()) {
      if (l.mode !== "opinion" || l.state !== "round_start") continue;
      const now = clock(),
        elapsed = Math.min(1, (now - (l.modeTickAt || now)) / 1000);
      l.modeTickAt = now;
      if (l.players.filter((p) => p.connected).length < 2) {
        if (!l.waitingForPlayers) {
          l.waitingForPlayers = true;
          emit(l.id, l);
        }
        continue;
      }
      if (l.waitingForPlayers) {
        l.waitingForPlayers = false;
        emit(l.id, l);
      }
      if (l.phase === "critic") {
        const critic = l.players.find((p) => p.id === l.criticId);
        if (!critic?.connected) {
          const before = Math.ceil(l.criticGraceRemaining);
          l.criticGraceRemaining = Math.max(
            0,
            (l.criticGraceRemaining ?? 60) - elapsed,
          );
          if (l.criticGraceRemaining <= 0) guessing(l);
          else if (before !== Math.ceil(l.criticGraceRemaining)) emit(l.id, l);
        }
      } else if (l.phase === "guess") {
        if (allSaved(l)) { endRound(l.id); continue; }
        l.opinionRemaining = (l.opinionRemaining ?? l.timeLeft) - elapsed;
        const next = Math.max(0, Math.ceil(l.opinionRemaining));
        if (next !== l.timeLeft) {
          l.timeLeft = next;
          emit(l.id, l);
        }
        if (next === 0) {
          l.opinionRemaining = undefined;
          endRound(l.id);
        }
      }
    }
  }, 250);
  interval.unref();
  return {
    start,
    score,
    complete,
    reconnect,
    disconnected,
    guessing,
    fill,
    publicView,
  };
};
