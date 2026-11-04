const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { io } = require('../frontend/node_modules/socket.io-client');

test('private ratings and session credentials never reach another player', { timeout: 15000 }, async () => {
  const child = spawn(process.execPath, ['backend/server.js'], { env: { ...process.env, PORT: '3099', ROOM_STATE_FILE: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const clients = [];
  const connect = () => new Promise((resolve, reject) => {
    const s = io('http://localhost:3099', { reconnection: false }); clients.push(s);
    s.once('connect', () => resolve(s)); s.once('connect_error', reject);
  });
  const call = (s, event, data) => s.timeout(2000).emitWithAck(event, data);
  try {
    await new Promise((resolve, reject) => { child.stdout.on('data', b => { if (b.toString().includes('Backend server running')) resolve(); }); child.once('exit', () => reject(new Error('server exited'))); });
    const a = await connect(), b = await connect();
    const preview = await fetch('http://localhost:3099/api/preview-movies').then(r => r.json());
    assert.equal(preview.length, 5);
    assert.equal(new Set(preview.map(m => m.id)).size, 5);
    assert.ok(preview.every(m => m.posterUrl.startsWith('/api/poster/')));
    const blocked = io('http://localhost:3099', { transports: ['websocket'], reconnection: false, extraHeaders: { Origin: 'https://untrusted.example' } });
    clients.push(blocked);
    await new Promise((resolve, reject) => { blocked.once('connect_error', resolve); blocked.once('connect', () => reject(Error('untrusted origin connected'))); });
    const proxyProbe = io('http://localhost:3099', { transports: ['websocket'], reconnection: false, extraHeaders: { Origin: 'https://serene.alwaysdata.net' } });
    clients.push(proxyProbe);
    await new Promise((resolve, reject) => { proxyProbe.once('connect', resolve); proxyProbe.once('connect_error', reject); });
    proxyProbe.disconnect();
    const proxyPolling = await fetch('http://localhost:3099/socket.io/?EIO=4&transport=polling', { headers: { Origin: 'https://serene.alwaysdata.net' } });
    assert.equal(proxyPolling.status, 200);
    assert.equal(proxyPolling.headers.get('access-control-allow-origin'), 'https://serene.alwaysdata.net');
    const { lobbyId } = await call(a, 'create_lobby', { targetVP: 30 });
    const alice = await call(a, 'join_lobby', { lobbyId, nickname: 'Alice' });
    const bob = await call(b, 'join_lobby', { lobbyId, nickname: 'Bob' });
    assert.deepEqual(bob.lobby.categories, ['films']);
    assert.equal((await call(b, 'update_target_vp', { lobbyId, targetVP: 50, categories: ['anime'] })).success, false);
    for (const categories of [[], ['unknown'], 'films']) {
      assert.equal((await call(a, 'update_target_vp', { lobbyId, targetVP: 99, categories })).success, false);
    }
    const unchanged = await call(a, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal(unchanged.lobby.targetVP, 30);
    assert.deepEqual(unchanged.lobby.categories, ['films']);
    const settingsUpdate = new Promise(resolve => {
      const onUpdate = lobby => {
        if (lobby.categories.includes('anime')) { b.off('lobby_update', onUpdate); resolve(lobby); }
      };
      b.on('lobby_update', onUpdate);
    });
    assert.equal((await call(a, 'update_target_vp', { lobbyId, targetVP: 30, categories: ['anime', 'series'] })).success, true);
    assert.deepEqual((await settingsUpdate).categories, ['anime', 'series']);
    await call(a, 'update_target_vp', { lobbyId, targetVP: 30, categories: ['films'] });
    const identities = require('../shared/player-identities.json');
    assert.deepEqual(alice.lobby.allColors.map(c => c.hex), identities.map(c => c.hex));
    assert.equal(alice.lobby.allColors.length, 30);
    assert.equal(new Set(alice.lobby.allColors.map(c => c.hex.toLowerCase())).size, 30);
    for (const identity of identities.slice(24)) {
      assert.equal((await call(a, 'change_color', { lobbyId, color: identity.hex })).success, true);
    }
    const extraColor = identities.at(-1).hex;
    assert.equal((await call(a, 'change_color', { lobbyId, color: extraColor })).success, true);
    assert.equal((await call(b, 'change_color', { lobbyId, color: extraColor })).success, false);
    assert.equal(bob.lobby.players[0].sessionToken, undefined);
    assert.equal(bob.lobby.players[0].ip, undefined);
    assert.equal((await call(a, 'join_lobby', { lobbyId, nickname: 'Duplicate' })).success, false);
    const attacker = await connect();
    assert.equal((await call(attacker, 'join_lobby', { lobbyId, nickname: 'Alice' })).success, false);
    await call(a, 'launch_game', lobbyId);
    const current = await call(a, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    const movieId = current.lobby.movies[0].id;
    const update = new Promise(resolve => b.once('lobby_update', resolve));
    await call(a, 'submit_rating', { lobbyId, movieId, rating: 'S', roundId: current.lobby.roundId });
    assert.equal((await update).ratings[alice.player.id], undefined);
    assert.equal((await call(attacker, 'submit_rating', { lobbyId, movieId, rating: 'S' })).success, false);
    assert.equal((await call(b, 'submit_rating', { lobbyId, movieId: 'fake', rating: 'Z' })).success, false);
    a.disconnect();
    assert.equal((await call(attacker, 'join_lobby', { lobbyId, nickname: 'Alice', sessionToken: 'wrong' })).success, false);
    const restored = await connect();
    const session = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal(session.player.id, alice.player.id);
    assert.equal(session.player.color, extraColor);
    assert.equal(session.lobby.ratings[alice.player.id][movieId], 'S');
    assert.equal((await call(a.connect(), 'join_lobby', { lobbyId, nickname: 'Alice', sessionToken: 'wrong' })).success, false);
    const ranks = ['S', 'A', 'B', 'C', 'D'];
    for (let i = 0; i < 4; i++) {
      if (i > 0) await call(restored, 'submit_rating', { lobbyId, movieId: session.lobby.movies[i].id, rating: ranks[i] });
      await call(b, 'submit_rating', { lobbyId, movieId: session.lobby.movies[i].id, rating: ranks[i] });
    }
    await call(restored, 'end_round_early', lobbyId);
    const reveal = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal(reveal.lobby.state, 'reveal');
    assert.equal(reveal.lobby.roundPoints[alice.player.id], 5);
    assert.equal(reveal.lobby.roundPoints[bob.player.id], 5);
    await call(restored, 'next_round', lobbyId);
    const next = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal((await call(restored, 'submit_rating', { lobbyId, movieId: next.lobby.movies[0].id, rating: 'S', roundId: current.lobby.roundId })).success, false);
    assert.equal((await call(restored, 'next_round', lobbyId)).success, false);
    assert.equal((await call(b, 'start_timer', lobbyId)).success, false);
    await call(restored, 'start_timer', lobbyId);
    await call(restored, 'pause_timer', lobbyId);
    await call(restored, 'kick_player', { lobbyId, playerId: bob.player.id });
    let leaked = false;
    b.on('lobby_update', () => { leaked = true; });
    assert.equal((await call(b, 'submit_rating', { lobbyId, movieId, rating: 'A' })).success, false);
    assert.equal((await call(restored, 'change_color', { lobbyId, color: null })).success, false);
    assert.equal((await call(attacker, 'join_lobby', null)).success, false);
    await call(restored, 'close_lobby', { lobbyId });
    assert.equal(leaked, false);
    // A winning round must remain in reveal until the host explicitly opens the ceremony.
    const finalRoom = await call(restored, 'create_lobby', { targetVP: 1 });
    const finalId = finalRoom.lobbyId;
    const finalAlice = await call(restored, 'join_lobby', { lobbyId: finalId, nickname: 'Alice' });
    await call(b, 'join_lobby', { lobbyId: finalId, nickname: 'Bob' });
    await call(restored, 'update_target_vp', { lobbyId: finalId, targetVP: 7 });
    await call(restored, 'update_target_vp', { lobbyId: finalId, targetVP: 1 });
    await call(restored, 'launch_game', finalId);
    const finalRound = await call(restored, 'join_lobby', { lobbyId: finalId, sessionToken: finalAlice.player.sessionToken });
    for (let i = 0; i < 4; i++) for (const client of [restored, b]) await call(client, 'submit_rating', { lobbyId: finalId, movieId: finalRound.lobby.movies[i].id, rating: ranks[i] });
    const readyRound = await call(restored, 'join_lobby', { lobbyId: finalId, sessionToken: finalAlice.player.sessionToken });
    assert.equal(readyRound.lobby.allVoted, true);
    assert.ok(Object.values(readyRound.lobby.progress).every(count => count === 5));
    await call(restored, 'end_round_early', finalId);
    const finalReveal = await call(restored, 'join_lobby', { lobbyId: finalId, sessionToken: finalAlice.player.sessionToken });
    assert.equal(finalReveal.lobby.state, 'reveal');
    assert.equal(finalReveal.lobby.isFinalRound, true);
    assert.deepEqual(finalReveal.lobby.history, []);
    assert.ok(finalReveal.lobby.roundDetails[finalRound.lobby.movies[0].id].S.includes(finalAlice.player.id));
    assert.equal((await call(restored, 'next_round', finalId)).success, false);
    await call(restored, 'finish_game', finalId);
    const finished = await call(restored, 'join_lobby', { lobbyId: finalId, sessionToken: finalAlice.player.sessionToken });
    assert.equal(finished.lobby.state, 'game_over');
    assert.equal(finished.lobby.history.length, 1);
    assert.deepEqual(finished.lobby.history[0].movies, finalRound.lobby.movies);
    assert.equal(finished.lobby.history[0].ratings[finalAlice.player.id][finalRound.lobby.movies[0].id], 'S');
    assert.equal(finished.lobby.history[0].roundPoints[finalAlice.player.id], 5);
    await call(restored, 'restart_game', finalId);
    const restarted = await call(restored, 'join_lobby', { lobbyId: finalId, sessionToken: finalAlice.player.sessionToken });
    assert.equal(restarted.lobby.state, 'lobby');
    assert.deepEqual(restarted.lobby.history, []);
    assert.ok(restarted.lobby.players.every(p => p.vp === 0));
    await call(restored, 'close_lobby', { lobbyId: finalId });
  } finally { clients.forEach(s => s.close()); child.kill(); }
});

test('rooms restore paused after process restart only when a state file is configured', { timeout: 15000 }, async () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'overrated-test-'));
  const file = path.join(dir, 'rooms.json');
  const clients = [];
  let child;
  const start = () => new Promise((resolve, reject) => {
    child = spawn(process.execPath, ['backend/server.js'], { env: { ...process.env, PORT: '3098', ROOM_STATE_FILE: file }, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', b => { if (b.toString().includes('Backend server running')) resolve(); });
    child.once('exit', () => reject(Error('server exited before readiness')));
  });
  const stop = () => new Promise(resolve => { child.once('exit', resolve); child.kill(); });
  const connect = () => new Promise((resolve, reject) => {
    const s = io('http://localhost:3098', { reconnection: false }); clients.push(s);
    s.once('connect', () => resolve(s)); s.once('connect_error', reject);
  });
  const call = (s, event, data) => s.timeout(2000).emitWithAck(event, data);
  try {
    await start();
    const a = await connect(), b = await connect();
    const { lobbyId } = await call(a, 'create_lobby', { targetVP: 1 });
    const alice = await call(a, 'join_lobby', { lobbyId, nickname: 'Alice' });
    const bob = await call(b, 'join_lobby', { lobbyId, nickname: 'Bob' });
    await call(a, 'update_target_vp', { lobbyId, targetVP: 1, categories: ['anime', 'cartoons'] });
    await call(a, 'launch_game', lobbyId);
    const { lobby } = await call(a, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    await call(a, 'submit_rating', { lobbyId, movieId: lobby.movies[0].id, rating: 'S' });
    await call(a, 'start_timer', lobbyId);
    await new Promise(r => setTimeout(r, 1200));
    await call(a, 'pause_timer', lobbyId);
    await new Promise(r => setTimeout(r, 250));
    assert.ok(fs.existsSync(file));
    await stop();
    await start();
    const restored = await connect();
    const response = await call(restored, 'join_lobby', { lobbyId, sessionToken: alice.player.sessionToken });
    assert.equal(response.success, true);
    assert.deepEqual(response.lobby.categories, ['anime', 'cartoons']);
    assert.equal(response.player.id, alice.player.id);
    assert.equal(response.lobby.timerRunning, false);
    assert.ok(response.lobby.timeLeft < 60);
    assert.equal(response.lobby.ratings[alice.player.id][lobby.movies[0].id], 'S');
    assert.equal(response.lobby.players.find(p => p.id === bob.player.id).connected, false);
    await call(restored, 'close_lobby', { lobbyId });
    await new Promise(r => setTimeout(r, 200));
    assert.equal(JSON.parse(fs.readFileSync(file)).rooms.length, 0);
  } finally {
    clients.forEach(s => s.close());
    if (child && child.exitCode === null) await stop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('selected categories constrain every round, including history reset', { timeout: 20000 }, async () => {
  const child = spawn(process.execPath, ['backend/server.js'], { env: { ...process.env, PORT: '3097', ROOM_STATE_FILE: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const clients = [];
  const connect = () => new Promise((resolve, reject) => {
    const s = io('http://localhost:3097', { reconnection: false }); clients.push(s);
    s.once('connect', () => resolve(s)); s.once('connect_error', reject);
  });
  const call = (s,e,d) => s.timeout(2000).emitWithAck(e,d);
  try {
    await new Promise((resolve,reject) => { child.stdout.on('data', b => { if (b.toString().includes('Backend server running')) resolve(); }); child.once('exit',()=>reject(Error('server exited'))); });
    for (const categories of [['films'], ['anime'], ['series'], ['cartoons'], ['anime', 'series', 'cartoons']]) {
      const a = await connect(), b = await connect();
      const {lobbyId} = await call(a,'create_lobby',{targetVP:999});
      const alice = await call(a,'join_lobby',{lobbyId,nickname:'Alice'});
      await call(b,'join_lobby',{lobbyId,nickname:'Bob'});
      assert.equal((await call(a,'update_target_vp',{lobbyId,targetVP:999,categories})).success,true);
      await call(a,'launch_game',lobbyId);
      const count = require('./movies.json').filter(m=>categories.includes(m.category)).length;
      // Exhaust the smallest selected pool to exercise the category-safe history reset.
      const rounds = categories.length === 1 && categories[0] === 'cartoons' ? Math.ceil(count/5)+1 : 2;
      for (let round=0; round<rounds;round++) {
        if (round === 5) await new Promise(resolve => setTimeout(resolve, 10020));
        const {lobby} = await call(a,'join_lobby',{lobbyId,sessionToken:alice.player.sessionToken});
        assert.equal(lobby.movies.length,5);
        assert.equal(new Set(lobby.movies.map(m=>m.id)).size,5);
        assert.ok(lobby.movies.every(m=>categories.includes(m.category)));
        for (const [i,m] of lobby.movies.entries()) for (const s of [a,b]) await call(s,'submit_rating',{lobbyId,movieId:m.id,rating:['S','A','B','C','D'][i]});
        await call(a,'end_round_early',lobbyId);
        await call(a,'next_round',lobbyId);
      }
      await call(a,'close_lobby',{lobbyId});
      a.disconnect(); b.disconnect();
    }
  } finally { clients.forEach(s=>s.close()); child.kill(); }
});
