import test from 'node:test';
import assert from 'node:assert/strict';
import {addBots,createRoom,defaultBotConfig,dispatch,publicView,resetToLobby,sendBotVotes,startRound,tickTimer,validateBotConfig} from './full-model.js';

const tiers=['S','A','B','C','D'];
function roomWithBots(count=3){const room=createRoom('Хост','TEST42');addBots(room,count);return room;}
function hostVotes(room,ranks=tiers){room.ratings.me=Object.fromEntries(room.movies.map((m,i)=>[m.id,ranks[i]]));}
function finishOpinionRound(room){
  for(const p of room.players)room.ratings[p.id]=Object.fromEntries(room.movies.map((m,i)=>[m.id,tiers[i]]));
  dispatch(room,'save_critic_ratings',{roundId:room.roundId},room.criticId);
  for(const p of room.players.filter(p=>p.id!==room.criticId))dispatch(room,'save_guesser_ratings',{roundId:room.roundId},p.id);
}

test('each opinion circle assigns every player exactly once through natural save/next lifecycle',()=>{
  const room=roomWithBots();dispatch(room,'update_target_vp',{mode:'opinion',circles:3});dispatch(room,'launch_game');
  const expected=room.players.map(p=>p.id).sort();
  for(let circle=1;circle<=3;circle++){
    const actual=[];
    for(let i=0;i<room.players.length;i++){
      actual.push(room.criticId);assert.equal(room.currentCircle,circle);finishOpinionRound(room);
      if(circle!==3||i!==room.players.length-1){assert.equal(room.isFinalRound,false);dispatch(room,'next_round');}
    }
    assert.deepEqual(actual.sort(),expected);
  }
  assert.equal(room.isFinalRound,true);
});

test('opinion readiness follows save/edit and exposes revealed perfect results',()=>{
  const room=roomWithBots(2);dispatch(room,'update_target_vp',{mode:'opinion'});dispatch(room,'launch_game');
  const critic=room.criticId,guessers=room.players.filter(p=>p.id!==critic);
  for(const p of room.players)room.ratings[p.id]=Object.fromEntries(room.movies.map((m,i)=>[m.id,tiers[i]]));
  assert.equal(publicView(room,critic).savedRatings[critic],undefined);
  dispatch(room,'save_critic_ratings',{},critic);
  assert.equal(publicView(room,critic).savedRatings[critic],true);
  const first=guessers[0].id;
  assert.equal(publicView(room,first).mySaved,false);
  dispatch(room,'save_guesser_ratings',{},first);assert.equal(publicView(room,first).mySaved,true);
  dispatch(room,'edit_guesser_ratings',{},first);assert.equal(publicView(room,first).mySaved,false);assert.equal(publicView(room,first).progress[first],5);
  dispatch(room,'save_guesser_ratings',{},first);dispatch(room,'save_guesser_ratings',{},guessers[1].id);
  const view=publicView(room,first);assert.equal(view.criticName,room.players.find(p=>p.id===critic).nickname);
  assert.equal(view.isPerfect[first],true);assert.equal(view.isPerfect[critic],false);
  room.hiddenMode=true;
  const hidden=publicView(room,first);assert.deepEqual(hidden.isPerfect,{[first]:true});assert.equal(hidden.criticName,null);
  room.state='game_over';assert.equal(publicView(room,first).isPerfect[guessers[1].id],true);
});

test('critic queue excludes removed bots and is rebuilt after lobby reset',()=>{
  const room=roomWithBots();dispatch(room,'update_target_vp',{mode:'opinion',circles:2});dispatch(room,'launch_game');
  const removed=room.players.find(p=>p.bot&&p.id!==room.criticId).id;
  dispatch(room,'kick_player',{targetPlayerId:removed});assert.ok(!room.criticQueue.includes(removed));
  assert.equal(room.criticQueue.length,room.criticQueueCycles.length);
  resetToLobby(room);addBots(room,1);dispatch(room,'launch_game');
  const expected=room.players.map(p=>p.id).sort(),actual=[];
  for(let i=0;i<expected.length;i++){
    actual.push(room.criticId);finishOpinionRound(room);if(i<expected.length-1)dispatch(room,'next_round');
  }
  assert.deepEqual(actual.sort(),expected);assert.equal(new Set(actual).size,expected.length);
});

test('original scores, target and podium/restart preserve players/settings',()=>{
  const room=roomWithBots();dispatch(room,'update_target_vp',{targetVP:10,categories:['anime','series']});startRound(room,true);
  assert.equal(new Set(room.movies.map(m=>m.id)).size,5);assert.ok(room.movies.every(m=>['anime','series'].includes(m.category)));
  hostVotes(room);for(const p of room.players.filter(p=>p.bot))sendBotVotes(room,p.id,{...defaultBotConfig(),policy:'copy-host'});
  assert.equal(publicView(room).allVoted,true);assert.equal(room.state,'round_start');
  dispatch(room,'end_round_early');assert.deepEqual(Object.values(room.roundPoints),[15,15,15,15]);assert.equal(room.isFinalRound,true);
  dispatch(room,'finish_game');assert.equal(room.state,'game_over');assert.equal(publicView(room).history.length,1);
  dispatch(room,'restart_game');assert.equal(room.state,'lobby');assert.equal(room.players.length,4);assert.equal(room.targetVP,10);assert.deepEqual(room.categories,['anime','series']);assert.ok(room.players.every(p=>p.vp===0));
});
test('opinion critic phases, perfect bonus and queue/circle lifecycle',()=>{
  const room=roomWithBots(1);dispatch(room,'update_target_vp',{mode:'opinion',circles:2});startRound(room,true);
  room.criticQueue=['me',room.players[1].id,'me'];room.criticQueueCycles=[1,2,2];room.criticId=room.players[1].id;
  sendBotVotes(room,room.criticId,{...defaultBotConfig(),policy:'manual',manualRanks:tiers});assert.equal(room.phase,'guess');
  hostVotes(room);dispatch(room,'save_guesser_ratings',{roundId:room.roundId});assert.equal(room.state,'reveal');assert.equal(room.roundPoints.me,6);assert.equal(room.roundPoints[room.criticId],0);
  dispatch(room,'next_round');assert.equal(room.criticId,'me');assert.equal(room.currentCircle,1);
  hostVotes(room);dispatch(room,'save_critic_ratings',{roundId:room.roundId});
  sendBotVotes(room,room.players[1].id,{...defaultBotConfig(),policy:'reverse-host'});assert.equal(room.state,'reveal');assert.equal(room.roundPoints[room.players[1].id],1);
});
test('invalid manual ballots and live settings cannot mutate game',()=>{
  const room=roomWithBots(1);startRound(room,true);const id=room.players[1].id;
  assert.throws(()=>dispatch(room,'update_target_vp',{mode:'opinion'}));assert.equal(room.mode,'original');
  assert.throws(()=>sendBotVotes(room,id,{...defaultBotConfig(),policy:'manual',manualRanks:['S','S','S','S','S']}));assert.equal(room.ratings[id],undefined);
  assert.throws(()=>validateBotConfig(defaultBotConfig(),{delayMs:-1}));assert.throws(()=>validateBotConfig(defaultBotConfig(),{policy:'bad'}));
  room.repeatRatings=true;sendBotVotes(room,id,{...defaultBotConfig(),policy:'manual',manualRanks:['S','S','S','S','S']});assert.equal(Object.values(room.ratings[id]).filter(r=>r==='S').length,5);
});
test('hidden public view, timer, rerolls and return-to-lobby',()=>{
  const room=roomWithBots(1);room.hiddenMode=true;startRound(room,true);hostVotes(room);sendBotVotes(room,room.players[1].id,defaultBotConfig());
  const old=room.movies[0].id;dispatch(room,'reroll_movie',{movieId:old,roundId:room.roundId});assert.notEqual(room.movies[0].id,old);assert.equal(Object.keys(room.ratings.me).length,4);
  assert.throws(()=>dispatch(room,'reroll_movie',{movieId:room.movies[0].id}));
  dispatch(room,'resume_timer');room.timeLeft=1;assert.equal(tickTimer(room),true);assert.equal(room.state,'reveal');
  const view=publicView(room);assert.equal(view.players[1].vp,null);assert.deepEqual(view.roundDetails,{});assert.deepEqual(Object.keys(view.ratings),['me']);
  resetToLobby(room);assert.equal(room.state,'lobby');assert.equal(room.players.length,2);assert.equal(room.hiddenMode,true);assert.equal(room.history.length,0);
});
test('room and bot inputs are bounded and no bots are implicit',()=>{
  const room=createRoom('Я');assert.equal(room.players.length,1);assert.throws(()=>startRound(room,true));assert.throws(()=>addBots(room,16));assert.throws(()=>addBots(room,-1));
  addBots(room,15);assert.equal(room.players.length,16);assert.equal(new Set(room.players.map(p=>p.color)).size,16);assert.throws(()=>addBots(room,1));
  assert.throws(()=>createRoom(' '));assert.throws(()=>dispatch(room,'update_target_vp',{categories:'films'}));assert.throws(()=>dispatch(room,'update_target_vp',{hiddenMode:'yes'}));
});
