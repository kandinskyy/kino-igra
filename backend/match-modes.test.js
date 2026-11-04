const { test } = require("node:test");
const assert = require("node:assert/strict");
const install = require("./match-modes");
function harness() {
  let tick,
    now = Date.now(),
    ended = 0;
  const l = {
    id: "ROOM",
    mode: "opinion",
    circles: 2,
    state: "round_start",
    ratings: {},
    movies: Array.from({ length: 5 }, (_, i) => ({ id: String(i) })),
    players: ["a", "b", "c"].map((id) => ({
      id,
      nickname: id,
      connected: true,
      vp: 0,
    })),
  };
  const m = install({
    lobbies: new Map([[l.id, l]]),
    emit() {},
    clearTimer() {},
    endRound() {
      ended++;
      l.state = "reveal";
    },
    clock: () => now,
    schedule: (fn) => {
      tick = fn;
      return { unref() {} };
    },
  });
  return {
    l,
    m,
    advance(n) {
      for (let i = 0; i < n; i++) {
        now += 1000;
        tick();
      }
    },
    get ended() {
      return ended;
    },
  };
}
test("opinion queue is repeated, critic is untimed, guesses last a full minute and missing ratings auto-fill", () => {
  const h = harness(),
    { l, m } = h;
  m.start(l);
  const first = l.criticId;
  assert.equal(l.criticQueue.filter((x) => x === first).length, 1);
  h.advance(120);
  assert.equal(h.ended, 0);
  assert.equal(l.phase, "critic");
  m.fill(l, l.criticId);
  assert.equal(new Set(Object.values(l.ratings[l.criticId])).size, 5);
  m.guessing(l);
  h.advance(59);
  assert.equal(h.ended, 0);
  h.advance(1);
  assert.equal(h.ended, 1);
  l.repeatRatings = true;
  l.ratings.a = { 0: "S", 1: "S" };
  m.fill(l, "a");
  assert.equal(l.ratings.a["0"], "S");
  assert.equal(Object.keys(l.ratings.a).length, 5);
  assert.ok(l.autoRatings.a["2"]);
});
test("critic grace pauses with one player, is consumed once, explicit exit auto-saves", () => {
  const h = harness(),
    { l, m } = h;
  m.start(l);
  const critic = l.players.find((p) => p.id === l.criticId);
  critic.connected = false;
  h.advance(20);
  const remaining = l.criticGraceRemaining;
  assert.ok(remaining <= 41);
  l.players.find((p) => p.connected).connected = false;
  h.advance(90);
  assert.equal(l.criticGraceRemaining, remaining);
  l.players
    .filter((p) => p.id !== critic.id)
    .forEach((p) => (p.connected = true));
  critic.connected = true;
  h.advance(5);
  critic.connected = false;
  h.advance(41);
  assert.equal(l.phase, "guess");
  const other = harness();
  other.m.start(other.l);
  other.m.disconnected(
    other.l,
    other.l.players.find((p) => p.id === other.l.criticId),
    true,
  );
  assert.equal(other.l.phase, "guess");
});
test("secret wire view does not expose critic identity, other ratings, scores, progress or history", () => {
  const { l, m } = harness();
  m.start(l);
  const id = l.players.find((p) => p.id !== l.criticId).id;
  l.hiddenMode = true;
  l.ratings[l.criticId] = { 0: "S" };
  l.history = [{ criticId: l.criticId }];
  l.roundPoints = { a: 8, b: 1, c: 0 };
  const base = () => ({
    players: l.players.map((p) => ({ ...p })),
    ratings: l.ratings,
    progress: { a: 5, b: 2, c: 1 },
  });
  const v = m.publicView(l, id, base());
  assert.equal(v.criticId, null);
  assert.equal(v.criticName, null);
  assert.deepEqual(v.history, []);
  assert.deepEqual(Object.keys(v.ratings), [id]);
  assert.ok(v.players.filter((p) => p.id !== id).every((p) => p.vp === null));
  assert.deepEqual(Object.keys(v.progress), [id]);
  l.state = "reveal";
  const reveal = m.publicView(l, id, base());
  assert.deepEqual(reveal.criticRatings, { 0: "S" });
  assert.equal(reveal.criticId, null);
  l.state = "game_over";
  assert.equal(m.publicView(l, id, base()).history.length, 1);
});
test("perfect predictions earn eight even with repeated letters; critic earns zero", () => {
  const { l, m } = harness();
  m.start(l);
  l.repeatRatings = true;
  for (const p of l.players) {
    l.ratings[p.id] = Object.fromEntries(l.movies.map((x) => [x.id, "S"]));
  }
  const points = {};
  m.score(l, points);
  assert.equal(points[l.criticId], 0);
  assert.ok(
    l.players
      .filter((p) => p.id !== l.criticId)
      .every((p) => points[p.id] === 8),
  );
});
test("each available player gets exactly one critic turn per circle and history is withheld until final", () => {
  const { l, m } = harness();
  const turns = { a: 0, b: 0, c: 0 };
  for (let round = 0; round < 6; round++) {
    l.state = "round_start";
    m.start(l);
    turns[l.criticId]++;
    for (const p of l.players) m.fill(l, p.id);
    l.roundPoints = {};
    m.score(l, l.roundPoints);
    l.players.forEach((p) => (p.vp += l.roundPoints[p.id]));
    l.state = "reveal";
    m.complete(l);
    assert.equal(l.isFinalRound, round === 5);
  }
  assert.deepEqual(turns, { a: 2, b: 2, c: 2 });
  assert.equal(l.history.length, 6);
  const before = JSON.stringify(l.criticQueue);
  l.state = "game_over";
  m.reconnect(l, l.players[0]);
  assert.equal(JSON.stringify(l.criticQueue), before);
});
test("return before finish restores a skipped pending turn and never repeats a completed one", () => {
  const { l, m } = harness();
  m.start(l);
  const p = l.players.find((p) => p.id !== l.criticId);
  p.connected = false;
  p.departed = true;
  l.isFinalRound = true;
  l.winner = l.players[0];
  const n = l.criticQueue.filter((id) => id === p.id).length;
  p.connected = true;
  m.reconnect(l, p, true);
  assert.equal(l.isFinalRound, false);
  assert.equal(l.winner, null);
  assert.equal(l.criticQueue.filter((id) => id === p.id).length, n);
});
