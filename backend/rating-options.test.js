const {test}=require('node:test');const assert=require('node:assert/strict');const {spawn}=require('node:child_process');const {io}=require('../frontend/node_modules/socket.io-client');
test('saved repeat option permits equal grades in both modes; forced fifth grade has no Auto marker', {timeout:15000},async()=>{
 const processServer=spawn(process.execPath,['backend/server.js'],{env:{...process.env,PORT:'3095',ROOM_STATE_FILE:''},stdio:['ignore','pipe','pipe']});const clients=[];
 const connect=()=>new Promise((resolve,reject)=>{const s=io('http://localhost:3095',{reconnection:false});clients.push(s);s.once('connect',()=>resolve(s));s.once('connect_error',reject);});
 const call=(s,e,d)=>s.timeout(2000).emitWithAck(e,d);
 try {await new Promise((resolve,reject)=>{processServer.stdout.on('data',b=>{if(b.toString().includes('Backend server running'))resolve();});processServer.once('exit',()=>reject(Error('server exited')));});
  for(const mode of ['original','opinion']) for(const repeatRatings of [true,false]){
   const host=await connect(),guest=await connect();const {lobbyId}=await call(host,'create_lobby',{targetVP:30});const a=await call(host,'join_lobby',{lobbyId,nickname:'A'}),b=await call(guest,'join_lobby',{lobbyId,nickname:'B'});
   assert.equal((await call(host,'update_target_vp',{lobbyId,targetVP:30,mode,circles:1,repeatRatings,hiddenMode:false})).success,true);
   await call(host,'launch_game',lobbyId);let view=(await call(host,'join_lobby',{lobbyId,sessionToken:a.player.sessionToken})).lobby;assert.equal(view.repeatRatings,repeatRatings);
   const actor=mode==='opinion'&&!view.isCritic?guest:host;const token=actor===host?a.player.sessionToken:b.player.sessionToken;
   for(let i=0;i<2;i++) await call(actor,'submit_rating',{lobbyId,movieId:view.movies[i].id,rating:'S'});
   let current=(await call(actor,'join_lobby',{lobbyId,sessionToken:token})).lobby;
   const votes=Object.values(current.ratings[actor===host?a.player.id:b.player.id]);assert.equal(votes.filter(r=>r==='S').length,repeatRatings?2:1);
   if(!repeatRatings){for(let i=0;i<4;i++)await call(actor,'submit_rating',{lobbyId,movieId:view.movies[i].id,rating:['S','A','B','C'][i]});current=(await call(actor,'join_lobby',{lobbyId,sessionToken:token})).lobby;const id=actor===host?a.player.id:b.player.id;assert.equal(Object.keys(current.ratings[id]).length,5);assert.deepEqual(current.autoRatings[id]||{},{});}
   await call(host,'close_lobby',{lobbyId});host.close();guest.close();
  }
 }finally{clients.forEach(s=>s.close());processServer.kill();}
});
