const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { io } = require('../frontend/node_modules/socket.io-client');

test('socket rerolls, saved answers, private chat, reconnect history and complete opinion game', {timeout:20000}, async () => {
  const child=spawn(process.execPath,['backend/server.js'],{env:{...process.env,PORT:'3094',ROOM_STATE_FILE:''},stdio:['ignore','pipe','pipe']});
  const sockets=[];
  const connect=()=>new Promise((resolve,reject)=>{const s=io('http://localhost:3094',{reconnection:false});sockets.push(s);s.once('connect',()=>resolve(s));s.once('connect_error',reject);});
  const call=(s,e,d)=>s.timeout(2000).emitWithAck(e,d);
  try {
    await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{if(b.toString().includes('Backend server running'))resolve();});child.once('exit',()=>reject(Error('server exited')));});
    const a=await connect(),b=await connect(),c=await connect(),outsider=await connect();
    const {lobbyId}=await call(a,'create_lobby',{});
    const entries=await Promise.all([a,b,c].map((s,i)=>call(s,'join_lobby',{lobbyId,nickname:`Игрок ${i}`})));
    const peers=[a,b,c].map((socket,i)=>({socket,player:entries[i].player}));
    const state=async p=>(await call(p.socket,'join_lobby',{lobbyId,sessionToken:p.player.sessionToken})).lobby;
    assert.equal((await call(outsider,'send_chat_message',{lobbyId,text:'outside'})).success,false);
    assert.equal((await call(b,'send_chat_message',{lobbyId,text:'Привет <b>текст</b>'})).success,true);
    let v=await state(peers[0]);const messageId=v.chat[0].id;
    assert.equal(v.chat[0].text,'Привет <b>текст</b>');assert.equal(v.chat[0].sessionToken,undefined);
    assert.equal((await call(c,'delete_chat_message',{lobbyId,messageId})).success,false);
    await call(a,'launch_game',lobbyId);v=await state(peers[0]);
    const initial=v.movies;
    for(let i=0;i<4;i++) await call(a,'submit_rating',{lobbyId,roundId:v.roundId,movieId:initial[i].id,rating:['S','A','B','C'][i]});
    assert.equal((await call(b,'reroll_movie',{lobbyId,roundId:v.roundId,movieId:initial[0].id})).success,false);
    assert.equal((await call(a,'reroll_movie',{lobbyId,roundId:v.roundId-1,movieId:initial[0].id})).success,false);
    assert.equal((await call(a,'reroll_movie',{lobbyId,roundId:v.roundId,movieId:initial[0].id})).success,true);
    let next=await state(peers[0]);assert.equal(next.progress[peers[0].player.id],4);
    assert.equal(next.ratings[peers[0].player.id][initial[1].id],'A');
    const replacement=next.movies[0];assert.ok(!initial.some(m=>m.id===replacement.id));
    assert.equal((await call(a,'reroll_movie',{lobbyId,roundId:v.roundId,movieId:replacement.id})).success,false);
    await call(a,'submit_rating',{lobbyId,roundId:v.roundId,movieId:replacement.id,rating:'A'});
    next=await state(peers[0]);assert.equal(new Set(Object.values(next.ratings[peers[0].player.id])).size,5);
    assert.deepEqual(next.autoRatings[peers[0].player.id],{});
    await call(a,'end_round_early',lobbyId);
    // Reach results/restart without reaching a high target over many random rounds.
    // A separate room below exercises the complete finite opinion schedule.
    await Promise.all(peers.map(p=>call(p.socket,'leave_lobby',{lobbyId})));
    const created=await call(a,'create_lobby',{}),opinionId=created.lobbyId;
    const joined=await Promise.all(peers.map((p,i)=>call(p.socket,'join_lobby',{lobbyId:opinionId,nickname:`Тест ${i}`})));
    peers.forEach((p,i)=>p.player=joined[i].player);
    const current=async p=>(await call(p.socket,'join_lobby',{lobbyId:opinionId,sessionToken:p.player.sessionToken})).lobby;
    await call(a,'update_target_vp',{lobbyId:opinionId,mode:'opinion',circles:1,hiddenMode:true,repeatRatings:true});
    await call(b,'send_chat_message',{lobbyId:opinionId,text:'До начала игры'});
    await call(a,'launch_game',opinionId);
    const turns=[];
    for(let round=0;round<3;round++) {
      let views=await Promise.all(peers.map(current));
      const ci=views.findIndex(v=>v.isCritic),critic=peers[ci],guessers=peers.filter((_,i)=>i!==ci),view=views[ci];turns.push(critic.player.id);
      assert.equal((await call(critic.socket,'reroll_movie',{lobbyId:opinionId,roundId:view.roundId,movieId:view.movies[0].id})).success,true);
      const updated=await current(critic);
      for(const m of updated.movies) await call(critic.socket,'submit_rating',{lobbyId:opinionId,roundId:view.roundId,movieId:m.id,rating:'S'});
      await call(critic.socket,'save_critic_ratings',{lobbyId:opinionId,roundId:view.roundId});
      assert.equal((await call(critic.socket,'reroll_movie',{lobbyId:opinionId,roundId:view.roundId,movieId:updated.movies[1].id})).success,false);
      for(const p of guessers) for(const m of updated.movies) await call(p.socket,'submit_rating',{lobbyId:opinionId,roundId:view.roundId,movieId:m.id,rating:'S'});
      const first=guessers[0];
      await call(first.socket,'save_guesser_ratings',{lobbyId:opinionId,roundId:view.roundId});
      const saved=await current(first);assert.equal(saved.mySaved,true);assert.deepEqual(Object.keys(saved.savedRatings),[first.player.id]);assert.equal(Object.keys(saved.progress).length,1);
      assert.equal((await call(first.socket,'submit_rating',{lobbyId:opinionId,roundId:view.roundId,movieId:updated.movies[0].id,rating:'A'})).success,false);
      await call(first.socket,'edit_guesser_ratings',{lobbyId:opinionId,roundId:view.roundId});assert.equal((await current(first)).mySaved,false);
      await call(first.socket,'save_guesser_ratings',{lobbyId:opinionId,roundId:view.roundId});
      await call(guessers[1].socket,'save_guesser_ratings',{lobbyId:opinionId,roundId:view.roundId});
      const result=await current(first);assert.equal(result.state,'reveal');assert.equal(result.myRoundPoints,6);assert.equal(result.criticId,null);
      assert.equal((await current(critic)).myRoundPoints,0);
      if(round<2) await call(a,'next_round',opinionId);
    }
    assert.equal(new Set(turns).size,3);
    await call(a,'finish_game',opinionId);let final=await current(peers[0]);assert.equal(final.state,'game_over');assert.equal(final.history.length,3);
    assert.equal(final.chat.length,1);
    // Resume on a replacement transport; chat survives game restart but is gone with room closure.
    const rejoined=await connect();await call(rejoined,'join_lobby',{lobbyId:opinionId,sessionToken:peers[1].player.sessionToken});
    assert.equal((await call(rejoined,'join_lobby',{lobbyId:opinionId,sessionToken:peers[1].player.sessionToken})).lobby.chat.length,1);
    await call(a,'restart_game',opinionId);final=await current(peers[0]);assert.equal(final.chat.length,1);assert.equal(final.history.length,0);
    await call(a,'delete_chat_message',{lobbyId:opinionId,messageId:final.chat[0].id});assert.equal((await current(peers[0])).chat.length,0);
    await call(a,'close_lobby',{lobbyId:opinionId});assert.equal((await call(c,'join_lobby',{lobbyId:opinionId,nickname:'Тест 2'})).success,false);
  } finally {sockets.forEach(s=>s.close());child.kill();}
});
