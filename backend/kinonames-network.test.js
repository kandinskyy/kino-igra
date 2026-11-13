const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {io} = require('../frontend/node_modules/socket.io-client');

test('Kinonames competitive sockets protect traitor knowledge, preserve creator authority, and lock pregame roles', {timeout:15000}, async()=>{
 const child=spawn(process.execPath,['backend/server.js'],{env:{...process.env,PORT:'3199',ROOM_STATE_FILE:''},stdio:['ignore','pipe','pipe']});
 const sockets=[]; const call=(s,e,d)=>s.timeout(2000).emitWithAck(e,d); const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const connect=()=>new Promise((resolve,reject)=>{const s=io('http://localhost:3199',{reconnection:false});sockets.push(s);s.once('connect',()=>resolve(s));s.once('connect_error',reject);});
 try {
  await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{if(String(b).includes('Backend server running'))resolve();});child.once('exit',()=>reject(Error('server stopped before startup')));});
  const players=[];
  for(let i=0;i<8;i++){const socket=await connect();players.push({socket,nickname:`Игрок${i}`,player:null,view:null});}
  const creator=players[0], {lobbyId}=await call(creator.socket,'create_lobby',{});
  for(const p of players){const joined=await call(p.socket,'join_lobby',{lobbyId,nickname:p.nickname});assert.equal(joined.success,true,joined.message);p.player=joined.player;p.view=joined.lobby;p.socket.on('lobby_update',v=>p.view=v);}
  assert.equal((await call(creator.socket,'update_target_vp',{lobbyId,mode:'kinonames'})).success,true);
  assert.equal((await call(creator.socket,'kinonames_settings',{lobbyId,settings:{variant:'competitive',competitive:{traitors:true,clueSeconds:30,guessSeconds:30}}})).success,true);
  const team=['blue','blue','blue','blue','red','red','red','red'];
  for(let i=0;i<players.length;i++)assert.equal((await call(players[i].socket,'kinonames_assign',{lobbyId,team:team[i],leader:i===0||i===4})).success,true);
  const newHost=players[1];
  assert.equal((await call(creator.socket,'transfer_host',{lobbyId,targetPlayerId:newHost.player.id})).success,true);
  assert.equal((await call(newHost.socket,'kinonames_settings',{lobbyId,settings:{competitive:{traitors:false}}})).success,false,'room host is not the original creator');
  const creatorSettings=await call(creator.socket,'kinonames_settings',{lobbyId,settings:{variant:'competitive',competitive:{traitors:true,clueSeconds:30,guessSeconds:30}}});
  assert.equal(creatorSettings.success,true,creatorSettings.message);
  const rolesBeforeMode=(await call(creator.socket,'join_lobby',{lobbyId,sessionToken:creator.player.sessionToken})).lobby;
  assert.equal(rolesBeforeMode.kinonames.settings.variant,'competitive');
  assert.deepEqual(Object.values(rolesBeforeMode.kinonames.assignments).map(a=>a.team).sort(),['blue','blue','blue','blue','red','red','red','red']);
  const modeUpdate=await call(newHost.socket,'update_target_vp',{lobbyId,mode:'original',categories:['superheroes']});
  assert.equal(modeUpdate.success,true,modeUpdate.message||'the room host can leave Kinonames without breaking its locked category');
  assert.equal((await call(newHost.socket,'update_target_vp',{lobbyId,mode:'kinonames'})).success,true);
  assert.equal((await call(creator.socket,'kinonames_settings',{lobbyId,settings:{variant:'competitive',competitive:{traitors:true,clueSeconds:30,guessSeconds:30}}})).success,true,'the creator still owns Kinonames settings');
  const start=await call(newHost.socket,'launch_game',lobbyId);
  const debugLobby=(await call(creator.socket,'join_lobby',{lobbyId,sessionToken:creator.player.sessionToken})).lobby;
  assert.equal(debugLobby.kinonames.settings.variant,'competitive');
  assert.deepEqual(Object.values(debugLobby.kinonames.assignments).map(a=>a.team).sort(),['blue','blue','blue','blue','red','red','red','red']);
  assert.equal(start.success,true,start.message||'transferred room host can launch');
  await wait(80);
  for(const p of players){assert.equal(p.view.state,'kinonames');assert.equal(p.view.players.length,8);}
  const game=players.map(p=>p.view.kinonames.game);
  assert.equal(game[0].assignments[players[0].player.id].leader,true);
  assert.equal(game[0].assignments[players[4].player.id].leader,true);
  for(const g of game)for(const role of Object.values(g.assignments))assert.equal(Object.hasOwn(role,'traitor'),false);
  const traitors=players.filter(p=>p.view.kinonames.game.ownRole?.traitor);
  assert.equal(traitors.length,2,'one private traitor per team');
  assert.notEqual(traitors[0].view.kinonames.game.ownRole.team,traitors[1].view.kinonames.game.ownRole.team);
  for(const p of players){
   const g=p.view.kinonames.game, colored=g.board.filter(c=>c.color);
   if(g.ownRole.leader)assert.equal(colored.length,25);
   else if(g.ownRole.traitor){assert.equal(colored.length,9);assert.equal(colored.filter(c=>c.color==='black').length,1);assert.equal(colored.some(c=>c.color===g.ownRole.team),false);assert.equal(colored.some(c=>c.color===(g.ownRole.team==='blue'?'red':'blue')),true);}
   else assert.equal(colored.length,0);
  }
  assert.equal((await call(players[2].socket,'kinonames_assign',{lobbyId,team:'red',leader:false})).success,false,'team cannot change after start');
  assert.equal((await call(players[2].socket,'kinonames_settings',{lobbyId,settings:{competitive:{traitors:false}}})).success,false,'settings freeze after start');
  const active=players.find(p=>p.view.kinonames.game.activeTeam===p.view.kinonames.game.assignments[p.player.id]?.team&&p.view.kinonames.game.assignments[p.player.id]?.leader);
  const cluePacket={lobbyId,action:{gameId:active.view.kinonames.game.gameId,turnId:active.view.kinonames.game.turnId,type:'clue',word:'Герой',count:2}};
  assert.equal((await call(active.socket,'kinonames_action',cluePacket)).success,true);
  assert.equal((await call(active.socket,'kinonames_action',cluePacket)).success,false,'duplicate old-phase clue is rejected');
 } finally {sockets.forEach(s=>s.close());child.kill();}
});

