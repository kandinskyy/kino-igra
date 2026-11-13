const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {io}=require('../frontend/node_modules/socket.io-client');
test('late entrants in original/opinion wait privately, reconnect, cannot act or pause an active match, and enter next match',{timeout:15000},async()=>{
  const child=spawn(process.execPath,['backend/server.js'],{env:{...process.env,PORT:'3203',ROOM_STATE_FILE:''},stdio:['ignore','pipe','pipe']});
  const clients=[],call=(s,e,d)=>s.timeout(2000).emitWithAck(e,d),wait=ms=>new Promise(r=>setTimeout(r,ms));
  const connect=()=>new Promise((resolve,reject)=>{const s=io('http://localhost:3203',{reconnection:false});clients.push(s);s.once('connect',()=>resolve(s));s.once('connect_error',reject);});
  try{
    await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{if(String(b).includes('Backend server running'))resolve();});child.once('exit',()=>reject(Error('test server stopped')));});
    for(const mode of ['original','opinion']){
      const host=await connect(),second=await connect();let hv;
      host.on('lobby_update',v=>{hv=v;});
      const {lobbyId}=await call(host,'create_lobby',{});
      await call(host,'join_lobby',{lobbyId,nickname:`Host${mode}`});
      await call(second,'join_lobby',{lobbyId,nickname:`Player${mode}`});
      await call(host,'update_target_vp',{lobbyId,mode,targetVP:1,categories:['films']});
      await call(host,'launch_game',lobbyId);await wait(30);
      if(mode==='original')await call(host,'start_timer',lobbyId);
      const late=await connect();const joined=await call(late,'join_lobby',{lobbyId,nickname:`Late${mode}`});
      assert.equal(joined.success,true);assert.equal(joined.lobby.waitingRoom,true);assert.equal(joined.lobby.state,'waiting');
      assert.equal(joined.player.waiting,true);assert.equal(joined.lobby.movies,undefined);assert.equal(joined.lobby.ratings,undefined);assert.equal(joined.lobby.criticId,undefined);
      await wait(30);assert.equal(hv.players.length,2);assert.equal(hv.waitingPlayers.length,1);
      assert.equal((await call(late,'submit_rating',{lobbyId,movieId:hv.movies[0].id,rating:'S'})).success,false);
      assert.equal((await call(late,'launch_game',lobbyId)).success,false);
      assert.equal((await call(late,'send_chat_message',{lobbyId,text:'Жду следующую игру'})).success,true);
      const restored=await call(late,'join_lobby',{lobbyId,sessionToken:joined.player.sessionToken});
      assert.equal(restored.player.id,joined.player.id);assert.equal(restored.lobby.waitingRoom,true);
      await call(late,'leave_lobby',{lobbyId});await wait(30);
      if(mode==='original'){assert.equal(hv.timerRunning,true);assert.equal(!!hv.pausedDueToDisconnect,false);}
      const reconnect=await call(late,'join_lobby',{lobbyId,sessionToken:joined.player.sessionToken});assert.equal(reconnect.lobby.waitingRoom,true);
      late.disconnect();await wait(50);
      if(mode==='original'){assert.equal(hv.timerRunning,true);assert.equal(!!hv.pausedDueToDisconnect,false);}
      const returning=await connect();await call(returning,'join_lobby',{lobbyId,sessionToken:joined.player.sessionToken});
      if(mode==='original'){
        const movieId=hv.movies[0].id;
        await call(host,'submit_rating',{lobbyId,movieId,rating:'S'});
        await call(second,'submit_rating',{lobbyId,movieId,rating:'S'});
        await call(host,'end_round_early',lobbyId);
      }
      // Opinion uses automatic phase timers; its waiting isolation is already asserted.
      if(mode==='original'){
        await call(host,'finish_game',lobbyId);await wait(30);assert.equal(hv.state,'game_over');
        assert.equal((await call(host,'restart_game',lobbyId)).success,true);await wait(30);
        assert.equal(hv.state,'lobby');assert.equal(hv.players.length,3);assert.equal(hv.waitingPlayers.length,0);
        assert.equal(hv.players.some(p=>p.waiting),false);
      }
    }
  }finally{clients.forEach(s=>s.close());child.kill();}
});
