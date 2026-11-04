const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  { spawn } = require("node:child_process");
const { io } = require("../frontend/node_modules/socket.io-client");
test(
  "socket opinion round protects identities and locked votes, runs a full minute and awards eight",
  { timeout: 75000 },
  async () => {
    const child = spawn(process.execPath, ["backend/server.js"], {
      env: { ...process.env, PORT: "3096", ROOM_STATE_FILE: "" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const sockets = [];
    const connect = () =>
      new Promise((resolve, reject) => {
        const s = io("http://localhost:3096", { reconnection: false });
        sockets.push(s);
        s.once("connect", () => resolve(s));
        s.once("connect_error", reject);
      });
    const call = (s, e, d) => s.timeout(2000).emitWithAck(e, d);
    try {
      await new Promise((resolve, reject) => {
        child.stdout.on("data", (b) => {
          if (b.toString().includes("Backend server running")) resolve();
        });
        child.once("exit", () => reject(Error("server exited")));
      });
      const a = await connect(),
        b = await connect();
      const { lobbyId } = await call(a, "create_lobby", { targetVP: 30 });
      const aa = await call(a, "join_lobby", { lobbyId, nickname: "A" }),
        bb = await call(b, "join_lobby", { lobbyId, nickname: "B" });
      assert.equal(
        (
          await call(a, "update_target_vp", {
            lobbyId,
            targetVP: 30,
            mode: "opinion",
            circles: 1,
            hiddenMode: true,
            repeatRatings: true,
          })
        ).success,
        true,
      );
      await call(a, "launch_game", lobbyId);
      const state = async (s, token) =>
        (await call(s, "join_lobby", { lobbyId, sessionToken: token })).lobby;
      let av = await state(a, aa.player.sessionToken),
        bv = await state(b, bb.player.sessionToken);
      assert.equal(av.criticId, null);
      assert.equal(bv.criticId, null);
      assert.notEqual(av.isCritic, bv.isCritic);
      const critic = av.isCritic ? a : b,
        guesser = av.isCritic ? b : a,
        token = av.isCritic ? bb.player.sessionToken : aa.player.sessionToken;
      assert.equal(
        (
          await call(guesser, "submit_rating", {
            lobbyId,
            movieId: av.movies[0].id,
            rating: "S",
          })
        ).success,
        false,
      );
      for (const m of av.movies)
        await call(critic, "submit_rating", {
          lobbyId,
          movieId: m.id,
          rating: "S",
        });
      assert.equal(
        (await call(critic, "save_critic_ratings", { lobbyId })).success,
        true,
      );
      assert.equal(
        (
          await call(critic, "submit_rating", {
            lobbyId,
            movieId: av.movies[0].id,
            rating: "A",
          })
        ).success,
        false,
      );
      assert.equal((await call(a, "end_round_early", lobbyId)).success, false);
      assert.equal((await call(a, "pause_timer", lobbyId)).success, false);
      for (const m of av.movies)
        await call(guesser, "submit_rating", {
          lobbyId,
          movieId: m.id,
          rating: "S",
        });
      const privateState = await state(guesser, token);
      assert.deepEqual(privateState.criticRatings, {});
      assert.deepEqual(privateState.history, []);
      const reveal = await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(Error("no reveal")), 65000);
        guesser.on("lobby_update", function onUpdate(l) {
          if (l.state === "reveal") {
            clearTimeout(t);
            guesser.off("lobby_update", onUpdate);
            resolve(l);
          }
        });
      });
      assert.equal(reveal.myRoundPoints, 8);
      assert.equal(reveal.myPerfect, true);
      assert.equal(reveal.criticId, null);
      assert.equal(reveal.isFinalRound, false);
      assert.equal(Object.keys(reveal.ratings).length, 1);
      assert.deepEqual(reveal.history, []);
      await call(a, "next_round", lobbyId);
      av = await state(a, aa.player.sessionToken);
      assert.notEqual(av.isCritic, critic === a);
    } finally {
      sockets.forEach((s) => s.close());
      child.kill();
    }
  },
);
