import { test } from "node:test";
import assert from "node:assert/strict";
import { playersByRating } from "./roundBallots.js";

test("revealed ballots group S through D, keep ties stable and missing votes last", () => {
  const players = ["me", "s1", "d", "s2", "a", "none", "b"].map(id => ({ id }));
  const ratings = { me: { film: "C" }, s1: { film: "S" }, d: { film: "D" },
    s2: { film: "S" }, a: { film: "A" }, b: { film: "B" } };
  assert.deepEqual(playersByRating(players, ratings, "film").map(p => p.id),
    ["s1", "s2", "a", "b", "me", "d", "none"]);
  assert.equal(players[0].id, "me");
  assert.deepEqual(playersByRating(players, {}, "other"), players);
});
