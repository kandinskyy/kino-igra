const {test}=require('node:test');
const assert=require('node:assert/strict');
const K=require('./kinonames');
const catalog=Array.from({length:60},(_,i)=>({id:`hero${i}`,name:`Герой ${i}`}));
function setup(count=6,ready=false){
  const ps=Array.from({length:count},(_,i)=>({id:`p${i}`,connected:true}));
  const settings=K.normalizeSettings({variant:'competitive'});
  const assignments=K.defaultAssignments(ps,settings);
  const s=K.startGame({players:ps,settings,assignments,catalog,now:1000,rng:()=>.42,ready});
  return {s,ps,settings,assignments};
}
const act=(s,id,a,ps,now=1200)=>K.act(s,id,{gameId:s.gameId,turnId:s.turnId,...a},ps,now);
const leader=s=>Object.keys(s.roles).find(id=>s.roles[id].leader&&s.roles[id].team===s.activeTeam);
test('automatic initial seating alternates teams and keeps first member as each leader; manual vacancy persists',()=>{
  const {ps,settings,assignments}=setup();
  assert.deepEqual(ps.map(p=>assignments[p.id]),[
    {team:'blue',leader:true},{team:'red',leader:true},{team:'blue',leader:false},
    {team:'red',leader:false},{team:'blue',leader:false},{team:'red',leader:false},
  ]);
  assignments.p0.leader=false;
  assert.equal(K.defaultAssignments(ps,settings,assignments).p0.leader,false);
});
test('own-team leader seat can change during match, blocks cross-team movement and duplicate leader; new view is role-filtered',()=>{
  const {s,ps}=setup();const old=leader(s),team=s.roles[old].team;
  const next=ps.find(p=>s.roles[p.id].team===team&&!s.roles[p.id].leader).id;
  assert.throws(()=>K.changeRole(s,next,team,true,ps,1500),/уже есть/);
  assert.throws(()=>K.changeRole(s,next,team==='blue'?'red':'blue',false,ps,1500),/между партиями/);
  K.changeRole(s,old,team,false,ps,1500);
  assert.ok(s.leaderGrace);assert.equal(s.deadline,null);
  K.changeRole(s,next,team,true,ps,1600);
  assert.equal(s.leaderGrace,null);assert.equal(s.deadline,61600);
  assert.equal(K.publicView(s,next,ps).board.filter(c=>c.color).length,25);
  assert.equal(K.publicView(s,old,ps).board.filter(c=>c.color).length,0);
  assert.equal(Object.values(s.roles).filter(r=>r.team===team&&r.leader).length,1);
});
test('clue leader disconnect pauses remaining time for20s and reconnect resumes remaining time',()=>{
  const {s,ps}=setup();const id=leader(s),p=ps.find(p=>p.id===id);
  p.connected=false;assert.equal(K.tick(s,ps,5000),true);
  assert.deepEqual(s.leaderGrace,{playerId:id,deadline:25000,remainingMs:56000});
  assert.equal(s.deadline,null);K.tick(s,ps,24000);assert.equal(s.phase,'clue');
  p.connected=true;K.tick(s,ps,24500);
  assert.equal(s.deadline,80500);assert.equal(s.leaderGrace,null);
});
test('expired grace replaces leader only from connected teammates and gives full clue clock',()=>{
  const {s,ps}=setup();const id=leader(s),team=s.activeTeam;
  ps.find(p=>p.id===id).connected=false;K.tick(s,ps,5000);K.tick(s,ps,25000);
  const newId=leader(s);assert.notEqual(newId,id);assert.equal(s.roles[newId].team,team);
  assert.equal(ps.find(p=>p.id===newId).connected,true);
  assert.equal(s.roles[id].leader,false);assert.equal(s.phase,'clue');assert.equal(s.deadline,85000);
});
test('reconnect exactly at grace expiry cannot restore the expired remaining clue time',()=>{
  const {s,ps}=setup();const id=leader(s);
  ps.find(p=>p.id===id).connected=false;K.tick(s,ps,5000);
  ps.find(p=>p.id===id).connected=true;K.tick(s,ps,25000);
  assert.notEqual(leader(s),id);assert.equal(s.deadline,85000);assert.equal(s.leaderGrace,null);
});
test('single remaining guesser starts guessing without a fabricated clue after20s',()=>{
  const {s,ps}=setup(4);const id=leader(s);
  ps.find(p=>p.id===id).connected=false;K.tick(s,ps,5000);K.tick(s,ps,25000);
  assert.equal(s.phase,'guess');assert.equal(s.clue,null);assert.equal(s.history.length,0);
  assert.equal(s.deadline,145000);assert.equal(K.publicView(s,ps.find(p=>p.connected&&s.roles[p.id].team===s.activeTeam).id,ps).voterIds.length,1);
});
test('inactive leader loss pauses only upon their next clue turn',()=>{
  const {s,ps}=setup();const absent=ps.find(p=>s.roles[p.id].team!==s.activeTeam&&s.roles[p.id].leader);
  absent.connected=false;K.tick(s,ps,5000);assert.equal(s.leaderGrace,null);assert.equal(s.deadline,61000);
  K.tick(s,ps,61000);K.tick(s,ps,61001);assert.equal(s.leaderGrace.playerId,absent.id);assert.equal(s.deadline,null);
});
test('guesser loss leaves turn clock running, changes voter roster, reconnect cancels incomplete unanimity',()=>{
  const {s,ps}=setup();act(s,leader(s),{type:'clue',word:'Сила',count:1},ps);
  const voters=ps.filter(p=>s.roles[p.id].team===s.activeTeam&&!s.roles[p.id].leader),card=s.board.find(c=>c.color===s.activeTeam);
  act(s,voters[0].id,{type:'vote',cardId:card.id},ps,1500);
  const deadline=s.deadline;voters[1].connected=false;K.tick(s,ps,1600);
  assert.equal(s.deadline,deadline);assert.equal(s.confirmation.deadline,4600);
  voters[1].connected=true;K.tick(s,ps,2000);assert.equal(s.confirmation,null);
  assert.equal(s.board.find(c=>c.id===card.id).revealed,false);
  voters[1].connected=false;K.tick(s,ps,2100);K.tick(s,ps,5100);
  assert.equal(card.revealed,true);assert.equal(s.deadline,deadline+15000);
});
test('rematch readiness hides all cards from both leaders and players; role changes reset readiness; all ready starts once',()=>{
  const {s,ps}=setup(6,true);
  for(const p of ps){const v=K.publicView(s,p.id,ps);assert.equal(v.board.length,25);assert.ok(v.board.every(c=>!c.color&&!c.name&&!c.revealed));}
  act(s,ps[0].id,{type:'ready'},ps);assert.equal(s.phase,'ready');
  const p=ps.find(p=>!s.roles[p.id].leader);
  K.changeRole(s,p.id,s.roles[p.id].team,false,ps,1300);assert.deepEqual(s.readyIds,[]);
  for(const p of ps)act(s,p.id,{type:'ready'},ps,1500);
  assert.equal(s.phase,'clue');assert.equal(s.deadline,61500);
  assert.equal(K.publicView(s,leader(s),ps).board.filter(c=>c.color).length,25);
  assert.throws(()=>act(s,ps[0].id,{type:'ready'},ps,1600),/перед новой/);
});
test('finished view exposes every card face with names and colors; ready does not leak traitor key',()=>{
  const {s,ps}=setup();s.phase='finished';s.result={winner:'blue',reason:'all_cards'};
  const v=K.publicView(s,ps[2].id,ps);assert.ok(v.board.every(c=>c.revealed&&c.color&&c.name));
  s.phase='ready';s.roles.p2.traitor=true;
  assert.equal(K.publicView(s,'p2',ps).board.filter(c=>c.color).length,0);
  assert.throws(()=>K.changeRole(s,'p2',s.roles.p2.team,true,ps),/Предатель/);
});
