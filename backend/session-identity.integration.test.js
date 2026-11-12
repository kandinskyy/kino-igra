const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {io} = require('../frontend/node_modules/socket.io-client');

test('replacement and fresh membership cannot reuse another player identity or host rights', {timeout:15000}, async () => {
  const child = spawn(process.execPath, ['backend/server.js'], {
    env:{...process.env,PORT:'3093',ROOM_STATE_FILE:''}, stdio:['ignore','pipe','pipe'],
  });
  const clients = [];
  const connect = () => new Promise((resolve,reject) => {
    const socket = io('http://localhost:3093',{reconnection:false});
    clients.push(socket);
    socket.once('connect',()=>resolve(socket)); socket.once('connect_error',reject);
  });
  const call = (socket,event,data) => socket.timeout(2000).emitWithAck(event,data);
  try {
    await new Promise((resolve,reject) => {
      child.stdout.on('data',chunk=>{if(chunk.toString().includes('Backend server running')) resolve();});
      child.once('exit',()=>reject(Error('local server exited before startup')));
    });
    const first = await connect(), replacement = await connect();
    const {lobbyId} = await call(first,'create_lobby',{targetVP:10});
    const original = await call(first,'join_lobby',{lobbyId,nickname:'Host'});
    assert.equal(original.lobby.host,original.player.id,'creator remains host after fresh ID allocation');
    const moved = await call(replacement,'join_lobby',{lobbyId,sessionToken:original.player.sessionToken});
    assert.equal(moved.player.id,original.player.id);
    assert.equal((await call(first,'update_target_vp',{lobbyId,targetVP:88})).success,false);

    const fresh = await call(first,'join_lobby',{lobbyId,nickname:'Fresh'});
    assert.equal(fresh.success,true);
    assert.notEqual(fresh.player.id,original.player.id);
    assert.equal(new Set(fresh.lobby.players.map(p=>p.id)).size,fresh.lobby.players.length);
    assert.equal((await call(first,'update_target_vp',{lobbyId,targetVP:88})).success,false);
    assert.equal((await call(first,'transfer_host',{lobbyId,targetPlayerId:fresh.player.id})).success,false);
    assert.equal((await call(replacement,'update_target_vp',{lobbyId,targetVP:25})).success,true);
    const hostColor = original.player.color;
    const otherColor = fresh.lobby.allColors.find(c=>!fresh.lobby.players.some(p=>p.color===c.hex)).hex;
    assert.equal((await call(first,'change_color',{lobbyId,color:otherColor})).success,true);
    let view = (await call(replacement,'join_lobby',{lobbyId,sessionToken:original.player.sessionToken})).lobby;
    assert.equal(view.players.find(p=>p.id===original.player.id).color,hostColor);

    assert.equal((await call(first,'leave_lobby',{lobbyId})).success,true);
    const newest = await call(first,'join_lobby',{lobbyId,nickname:'Newest'});
    assert.notEqual(newest.player.id,fresh.player.id);
    assert.equal(new Set(newest.lobby.players.map(p=>p.id)).size,newest.lobby.players.length);
    assert.equal((await call(first,'update_target_vp',{lobbyId,targetVP:88})).success,false);
    view = (await call(replacement,'join_lobby',{lobbyId,sessionToken:original.player.sessionToken})).lobby;
    assert.equal(view.players.find(p=>p.id===fresh.player.id).connected,false);
    assert.equal(view.players.find(p=>p.id===original.player.id).connected,true);
    assert.equal(view.targetVP,25);
    assert.equal(view.players.every(p=>p.sessionToken===undefined),true);

    // The displaced transport may start a different room without inheriting old host rights.
    await call(first,'leave_lobby',{lobbyId});
    const another = await call(first,'create_lobby',{});
    const creator = await call(first,'join_lobby',{lobbyId:another.lobbyId,nickname:'Creator'});
    assert.equal(creator.lobby.host,creator.player.id);
    assert.notEqual(creator.player.id,original.player.id);
    await call(first,'close_lobby',{lobbyId:another.lobbyId});
  } finally {
    clients.forEach(socket=>socket.close()); child.kill();
  }
});
