import { test } from "node:test";
import assert from "node:assert/strict";
import { denseRank } from "./places.js";
test("ties share a place and the next distinct score takes the next podium tier", () => {
  const players = [20, 20, 19, 19, 19, 18, 15].map((vp) => ({ vp }));
  assert.deepEqual(
    players.map((p) => denseRank(players, p.vp)),
    [1, 1, 2, 2, 2, 3, 4],
  );
  assert.equal(players.filter((p) => denseRank(players, p.vp) <= 3).length, 6);
});
