const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createDemo} = require('./kinonames-demo.cjs');

const lobby = snapshot => snapshot.lobby;
const game = snapshot => snapshot.lobby?.kinonames.game;

test('demo walks to cooperative-free competitive blue victory with private leader view',()=>{
 const demo=createDemo({now:100000});
 let s=demo.snapshot('leader');
 assert.equal(s.lobby,null);
 assert.equal(s.controls.label,'Главное меню · дождливый кинотеатр');
 s=demo.command('leader',{command:'create'});
 assert.equal(lobby(s).state,'lobby');
 assert.equal(lobby(s).mode,'kinonames');
 assert.equal(lobby(s).kinonames.settings.variant,'competitive');
 assert.equal(lobby(s).kinonames.settings.competitive.traitors,false);
 s=demo.command('leader',{command:'start'});
 assert.equal(lobby(s).state,'kinonames');
 assert.equal(game(s).board.length,25);
 assert.equal(game(s).assignments['blue-leader'].leader,true);
 assert.equal(game(demo.snapshot('player')).board.some(c=>c.color!==undefined),false,'ordinary player starts without the key');
 const initialIds=game(s).board.map(c=>c.id);
 let count=0;
 while(lobby(s).state!=='game_over'&&count<120){s=demo.command('player',{command:'next'});count++;}
 assert.ok(count<120,'script should finish rather than looping forever');
 assert.equal(lobby(s).state,'game_over');
 assert.equal(game(s).phase,'finished');
 assert.equal(game(s).result.winner,'blue');
 assert.deepEqual(game(s).board.map(c=>c.id),initialIds);
 assert.equal(game(s).remaining.blue,0,'blue wins when all eight blue cards are revealed');
 assert.ok(s.controls.label.includes('Победа синей'));
 const player=demo.snapshot('player'), leader=demo.snapshot('leader');
 assert.equal(game(player).board.every(c=>c.color!==undefined),true,'the completed match publishes the resolved board');
 assert.equal(game(leader).board.every(c=>c.color!==undefined),true,'leader sees the full key');
 assert.equal(game(player).ownRole.traitor,false);
 assert.equal(Object.values(game(player).assignments).some(r=>Object.hasOwn(r,'traitor')),false);
});

test('manual seek/back restore deterministic board and game state; play/pause and virtual advance are controllable',()=>{
 let real=Date.now();
 const demo=createDemo({now:200000});
 demo.command('leader',{command:'create'});
 let s=demo.command('leader',{command:'start'});
 assert.equal(game(s).phase,'clue');
 const ids=game(s).board.map(c=>c.id),gameId=game(s).gameId,deadline=game(s).deadline;
 // Step the leader clue. The scripted collaborators then take one visible vote each.
 s=demo.command('leader',{command:'action',event:'kinonames_action',data:{action:{type:'clue',word:'Герои',count:3,gameId,turnId:game(s).turnId}}});
 assert.equal(game(s).phase,'guess');
 const clueStep=demo.snapshot('leader').controls.cursor;
 const pausedClock=demo.snapshot('leader').serverNow;
 demo.pulse(real+=1000);
 assert.equal(demo.snapshot('leader').serverNow,pausedClock,'paused virtual clock does not advance');
 s=demo.command('player',{command:'next'});
 assert.deepEqual(game(s).board.map(c=>c.id),ids);
 assert.equal(Object.keys(game(s).votes).length,1,'one bot voter step is visible');
 const voted=demo.snapshot('leader');
 s=demo.command('leader',{command:'back'});
 assert.equal(demo.snapshot('leader').controls.paused,true);
 s=demo.command('leader',{command:'seek',index:clueStep});
 assert.equal(game(s).phase,'guess');
 assert.deepEqual(game(s).board.map(c=>c.id),ids);
 assert.equal(game(s).gameId,gameId);
 // Reproduce a playable frame and test playback's real-time input independently.
 s=demo.command('leader',{command:'seek',index:voted.controls.cursor});
 const beforePlay=s.serverNow;
 s=demo.command('leader',{command:'play'});
 demo.pulse(real+=1000);
 assert.equal(demo.snapshot('leader').serverNow,beforePlay+1000);
 demo.command('leader',{command:'pause'});
 const frozen=demo.snapshot('leader').serverNow;
 demo.pulse(real+=1000);
 assert.equal(demo.snapshot('leader').serverNow,frozen);
 // Manual time movement is bounded and can trigger the real match deadline.
 const timerDemo=createDemo({now:400000});
 timerDemo.command('leader',{command:'start'});
 const timerStart=timerDemo.command('leader',{command:'start'});
 const timerDeadline=game(timerStart).deadline,timerIds=game(timerStart).board.map(c=>c.id);
 s=timerDemo.command('leader',{command:'seek',index:2});
 assert.equal(game(s).phase,'clue');
 s=timerDemo.command('leader',{command:'advance',ms:60000});
 assert.equal(game(s).activeTeam,'red','advancing past clue deadline lets clocked turn expire');
 assert.notEqual(game(s).deadline,timerDeadline);
 assert.deepEqual(game(s).board.map(c=>c.id),timerIds);
 assert.throws(()=>timerDemo.command('leader',{command:'advance',ms:60001}),/60000/);
 assert.throws(()=>timerDemo.command('leader',{command:'seek',index:1.2}),/номер шага/);
});

test('manual settings change Kinonames variety and preserve host authority; leave returns home and reset starts fresh field',()=>{
 const demo=createDemo({now:300000});
 demo.command('leader',{command:'create'});
 assert.throws(()=>demo.command('player',{command:'action',event:'kinonames_settings',data:{settings:{variant:'coop'}}}),/создатель/);
 assert.equal(lobby(demo.command('leader',{command:'action',event:'kinonames_settings',data:{settings:{variant:'coop'}}})).kinonames.settings.variant,'coop');
 assert.equal(lobby(demo.command('leader',{command:'action',event:'kinonames_settings',data:{settings:{variant:'competitive',competitive:{traitors:true}}}})).players.length,8);
 const updated=demo.command('leader',{command:'action',event:'kinonames_settings',data:{settings:{variant:'competitive',competitive:{traitors:false,clueSeconds:45,guessSeconds:90}}}});
 assert.equal(lobby(updated).kinonames.settings.competitive.clueSeconds,45);
 const before=demo.command('leader',{command:'start'});
 const oldId=game(before).gameId,oldCards=game(before).board.map(c=>c.id);
 const home=demo.command('leader',{command:'action',event:'leave_lobby'});
 assert.equal(lobby(home),null);
  demo.command('leader',{command:'create'});
 const next=demo.command('leader',{command:'start'});
 assert.notEqual(game(next).gameId,oldId);
 assert.notDeepEqual(game(next).board.map(c=>c.id),oldCards);
});

for(const mode of ['coop','competitive','traitors'])test(`updated demo ${mode}: complete game, hidden rematch, ready consent and private colors`,()=>{
 const demo=createDemo({now:500000,mode});
 let s=demo.command('leader',{command:'start'});
 assert.equal(game(s).phase,'clue');
 assert.equal(game(s).board.length,25);
 const initialId=game(s).gameId;
 assert.equal(game(s).settings.variant,mode==='coop'?'coop':'competitive');
 assert.equal(lobby(s).players.length,mode==='coop'?3:mode==='traitors'?8:6);
 assert.equal(game(s).settings.competitive.traitors,mode==='traitors');
 for(let i=0;i<200&&game(s).phase!=='finished';i++)s=demo.command('player',{command:'next'});
 assert.equal(game(s).phase,'finished');
 assert.equal(game(s).board.every(c=>c.color&&c.revealed),true);
 assert.equal(game(s).result.winner,'blue');
 assert.throws(()=>demo.command('player',{command:'action',event:'restart_game'}),/хост/);
 s=demo.command('player',{command:'new_party'});
 assert.equal(game(s).phase,'ready');
 assert.notEqual(game(s).gameId,initialId);
 assert.equal(game(s).board.every(c=>!c.name&&!c.color&&!c.revealed),true);
 assert.equal(game(demo.snapshot('leader')).board.every(c=>!c.name&&!c.color&&!c.revealed),true);
 assert.deepEqual(game(s).readyIds,[]);
 const readyGame=game(s);
 s=demo.command('player',{command:'action',event:'kinonames_action',data:{action:{gameId:readyGame.gameId,turnId:readyGame.turnId,type:'ready'}}});
 assert.ok(game(s).readyIds.includes('blue-1'));
 for(let i=0;i<10&&game(s).phase==='ready';i++)s=demo.command('leader',{command:'next'});
 assert.equal(game(s).phase,'clue');
 assert.equal(game(s).assignments['blue-leader'].team==='blue'||game(s).assignments['blue-leader'].team==='red',true);
 assert.equal(Object.values(game(s).assignments).some(r=>Object.hasOwn(r,'traitor')),false);
 if(mode==='coop')assert.equal(game(s).deadline,null);
});

test('demo mode switch is explicit and leaves no previous-party state; role slots can vacate and reclaim leadership',()=>{
 const demo=createDemo({now:800000});
 demo.command('leader',{command:'create'});
 let s=demo.command('leader',{command:'action',event:'kinonames_assign',data:{team:'blue',leader:false}});
 assert.equal(lobby(s).kinonames.assignments['blue-leader'].leader,false);
 s=demo.command('player',{command:'action',event:'kinonames_assign',data:{team:'blue',leader:true}});
 assert.equal(lobby(s).kinonames.assignments['blue-1'].leader,true);
 assert.throws(()=>demo.command('leader',{command:'action',event:'kinonames_assign',data:{team:'blue',leader:true}}),/ведущий/);
 s=demo.command('leader',{command:'mode',mode:'coop'});
 assert.equal(s.lobby,null);assert.equal(s.controls.mode,'coop');assert.equal(s.controls.cursor,0);
 s=demo.command('leader',{command:'start'});assert.equal(game(s).settings.variant,'coop');
 assert.throws(()=>demo.command('leader',{command:'mode',mode:'wrong'}),/режим/);
});
