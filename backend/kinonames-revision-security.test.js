const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {io} = require('../frontend/node_modules/socket.io-client');
const K = require('./kinonames');

test('traitors are chosen from final ready teams, never from provisional rematch seats', () => {
  const players = Array.from({length:8}, (_,i) => ({id:`p${i}`,connected:true}));
  const settings = K.normalizeSettings({variant:'competitive',competitive:{traitors:true}});
  const state = K.startGame({players,settings,assignments:K.defaultAssignments(players,settings),
    catalog:Array.from({length:50},(_,i)=>({id:`c${i}`,name:`Hero ${i}`})),now:1000,rng:()=>.42,ready:true});
  assert.ok(Object.values(state.roles).every(role=>!role.traitor),'roles must stay provisional while teams can change');
  // Cross-team exchanges between parties must not move a previously selected traitor.
  K.changeRole(state,'p2','red',false,players,1100);
  K.changeRole(state,'p3','blue',false,players,1150);
  for (const player of players) K.act(state,player.id,{gameId:state.gameId,turnId:state.turnId,type:'ready'},players,1200);
  assert.equal(state.phase,'clue');
  for (const team of ['blue','red']) {
    const members = Object.values(state.roles).filter(role=>role.team===team);
    assert.equal(members.length,4);
    assert.equal(members.filter(role=>role.traitor).length,1);
    assert.ok(members.every(role=>!role.traitor||!role.leader));
  }
});

test('socket role handoff, waiting privacy, token reconnect and rematch readiness remain server-authoritative', {timeout:18000}, async () => {
  const port = 3217;
  const child = spawn(process.execPath,['backend/server.js'],{
    env:{...process.env,PORT:String(port),ROOM_STATE_FILE:''},stdio:['ignore','pipe','pipe'],
  });
  const sockets=[];
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const call=(socket,event,payload)=>socket.timeout(2500).emitWithAck(event,payload);
  const connect=()=>new Promise((resolve,reject)=>{
    const socket=io(`http://127.0.0.1:${port}`,{reconnection:false});sockets.push(socket);
    socket.once('connect',()=>resolve(socket));socket.once('connect_error',reject);
  });
  const refresh=async member=>{
    const result=await call(member.socket,'join_lobby',{lobbyId,sessionToken:member.player.sessionToken});
    assert.equal(result.success,true,result.message);member.view=result.lobby;return result.lobby;
  };
  const add=async nickname=>{
    const socket=await connect(),joined=await call(socket,'join_lobby',{lobbyId,nickname});
    assert.equal(joined.success,true,joined.message);
    const member={socket,player:joined.player,view:joined.lobby};
    socket.on('lobby_update',view=>member.view=view);return member;
  };
  let lobbyId;
  try {
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error('local test server did not start')),5000);
      child.stdout.on('data',data=>{if(String(data).includes('Backend server running')){clearTimeout(timer);resolve();}});
      child.once('exit',()=>{clearTimeout(timer);reject(Error('local test server exited before startup'));});
    });
    const hostSocket=await connect();
    ({lobbyId}=await call(hostSocket,'create_lobby',{}));
    const hostJoin=await call(hostSocket,'join_lobby',{lobbyId,nickname:'SecurityHost'});
    assert.equal(hostJoin.success,true,hostJoin.message);
    const host={socket:hostSocket,player:hostJoin.player,view:hostJoin.lobby};
    hostSocket.on('lobby_update',view=>host.view=view);
    const members=[host];for(let i=1;i<4;i++)members.push(await add(`Security${i}`));
    assert.equal((await call(host.socket,'update_target_vp',{lobbyId,mode:'kinonames'})).success,true);
    assert.equal((await call(host.socket,'kinonames_settings',{lobbyId,settings:{variant:'competitive',competitive:{traitors:false,clueSeconds:60,guessSeconds:5}}})).success,true);
    assert.equal((await call(host.socket,'launch_game',lobbyId)).success,true);
    const initial=await refresh(host),gameId=initial.kinonames.game.gameId;
    const assignments=initial.kinonames.game.assignments;
    assert.deepEqual(members.map(m=>assignments[m.player.id]),[
      {team:'blue',leader:true},{team:'red',leader:true},{team:'blue',leader:false},{team:'red',leader:false},
    ]);
    const waiter=await add('SecurityWaiter');
    assert.equal(waiter.view.state,'waiting');assert.equal(waiter.view.waitingRoom,true);
    for(const field of ['kinonames','movies','ratings','roundDetails','deadline','criticId'])assert.equal(Object.hasOwn(waiter.view,field),false,field);
    await refresh(host);
    assert.equal(host.view.players.length,4);assert.equal(host.view.waitingPlayers.length,1);
    assert.equal(Object.hasOwn(host.view.kinonames.game.assignments,waiter.player.id),false);
    for(const event of ['kinonames_assign','kinonames_settings','kinonames_action','update_target_vp','change_color']) {
      const response=await call(waiter.socket,event,{lobbyId,team:'blue',leader:true,settings:{},action:{gameId,type:'ready'}});
      assert.equal(response.success,false,`waiting member cannot mutate ${event}`);
    }
    // Existing membership is restored as an active participant, never as a late entrant.
    const reconnecting=members[2];reconnecting.socket.close();await pause(80);
    reconnecting.socket=await connect();reconnecting.socket.on('lobby_update',view=>reconnecting.view=view);
    const restored=await refresh(reconnecting);
    assert.equal(restored.state,'kinonames');assert.equal(restored.waitingRoom,undefined);
    assert.equal(Object.hasOwn(restored.kinonames.game.assignments,reconnecting.player.id),true);
    // A waiter's own reconnect must preserve waiting status and the same private identity.
    waiter.socket.close();await pause(80);waiter.socket=await connect();
    waiter.socket.on('lobby_update',view=>waiter.view=view);
    assert.equal((await refresh(waiter)).state,'waiting');
    await refresh(host);
    const activeTeam=host.view.kinonames.game.activeTeam;
    const oldLeader=members.find(m=>assignments[m.player.id].team===activeTeam&&assignments[m.player.id].leader);
    const newLeader=members.find(m=>assignments[m.player.id].team===activeTeam&&!assignments[m.player.id].leader);
    assert.equal((await call(newLeader.socket,'kinonames_assign',{lobbyId,team:activeTeam==='blue'?'red':'blue',leader:false})).success,false);
    assert.equal((await call(newLeader.socket,'kinonames_assign',{lobbyId,team:activeTeam,leader:true})).success,false,'duplicate connected leader is denied');
    assert.equal((await call(oldLeader.socket,'kinonames_assign',{lobbyId,team:activeTeam,leader:false})).success,true);
    assert.equal((await call(newLeader.socket,'kinonames_assign',{lobbyId,team:activeTeam,leader:true})).success,true);
    await refresh(oldLeader);await refresh(newLeader);
    assert.equal(oldLeader.view.kinonames.game.board.filter(card=>card.color).length,0);
    assert.equal(newLeader.view.kinonames.game.board.filter(card=>card.color).length,25);
    const game=newLeader.view.kinonames.game,black=game.board.find(card=>card.color==='black');
    assert.equal((await call(newLeader.socket,'kinonames_action',{lobbyId,action:{gameId,turnId:game.turnId,type:'clue',word:'Тьма',count:1}})).success,true);
    assert.equal((await call(oldLeader.socket,'kinonames_action',{lobbyId,action:{gameId,turnId:game.turnId,type:'vote',cardId:black.id}})).success,true);
    await refresh(host);assert.equal(host.view.state,'game_over');
    for(const member of members){await refresh(member);assert.ok(member.view.kinonames.game.board.every(card=>card.color&&card.revealed));}
    assert.equal((await refresh(waiter)).state,'waiting','result is not disclosed to waiting entrants');
    assert.equal((await call(host.socket,'restart_game',lobbyId)).success,true);
    for(const member of [...members,waiter]){
      await refresh(member);
      const next=member.view.kinonames.game;
      assert.equal(member.view.state,'kinonames');assert.equal(member.view.players.length,5);
      assert.equal(next.phase,'ready');assert.notEqual(next.gameId,gameId);
      assert.ok(next.board.every(card=>!card.color&&!card.name&&!card.revealed));
      assert.deepEqual(next.readyIds,[]);assert.deepEqual(next.votes,{});assert.equal(next.confirmation,null);
    }
    const next=host.view.kinonames.game;
    for(const member of members)assert.equal((await call(member.socket,'kinonames_action',{lobbyId,action:{gameId:next.gameId,turnId:next.turnId,type:'ready'}})).success,true);
    await refresh(host);assert.equal(host.view.kinonames.game.phase,'ready','waiter admitted to next party must also be ready');
    assert.equal((await call(waiter.socket,'kinonames_action',{lobbyId,action:{gameId:next.gameId,turnId:next.turnId,type:'ready'}})).success,true);
    await refresh(host);assert.equal(host.view.kinonames.game.phase,'clue');
  } finally {
    sockets.forEach(socket=>socket.close());child.kill();
    await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(resolve,1000).unref();});
  }
});
