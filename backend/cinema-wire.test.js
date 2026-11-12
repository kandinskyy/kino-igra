const {test} = require('node:test');
const assert = require('node:assert/strict');
const install = require('./match-modes');
const crypto = require('node:crypto');

test('cinema readiness and perfect highlights respect saved answers and hidden wire privacy', () => {
  const room = {
    id:'LOCAL',mode:'opinion',circles:2,state:'round_start',ratings:{},
    movies:Array.from({length:5},(_,i)=>({id:String(i)})),
    players:['a','b','c'].map(id=>({id,nickname:id,connected:true,vp:0})),
  };
  const modes = install({lobbies:new Map(),emit(){},clearTimer(){},endRound(){},schedule:()=>({unref(){}})});
  modes.start(room);
  modes.guessing(room);
  assert.equal(room.savedRatings[room.criticId],true);
  const guesser = room.players.find(p=>p.id!==room.criticId).id;
  const base = () => ({players:room.players.map(p=>({...p})),progress:{a:5,b:5,c:5},ratings:room.ratings});
  assert.equal(modes.publicView(room,guesser,base()).savedRatings[room.criticId],true);
  room.perfect={a:true,b:false,c:true};
  assert.deepEqual(modes.publicView(room,guesser,base()).isPerfect,{});
  room.state='reveal';room.currentCircle=2;
  const reveal = modes.publicView(room,guesser,base());
  assert.deepEqual(reveal.isPerfect,room.perfect);
  assert.equal(reveal.currentCircle,2);
  room.hiddenMode=true;
  const hidden = modes.publicView(room,guesser,base());
  assert.deepEqual(hidden.isPerfect,{[guesser]:room.perfect[guesser]});
  assert.deepEqual(hidden.savedRatings,{[guesser]:false});
  assert.equal(hidden.criticId,null);
  room.state='game_over';
  assert.deepEqual(modes.publicView(room,guesser,base()).isPerfect,room.perfect);
});

test('reconnecting a player after their critic turn preserves the next-circle position', () => {
  const room={id:'LOCAL',mode:'opinion',circles:2,state:'round_start',ratings:{},
    movies:Array.from({length:5},(_,i)=>({id:String(i)})),
    players:['a','b','c'].map(id=>({id,nickname:id,connected:true,vp:0}))};
  const modes=install({lobbies:new Map(),emit(){},clearTimer(){},endRound(){},schedule:()=>({unref(){}})});
  modes.start(room);
  const first=room.players.find(p=>p.id===room.criticId);
  const queue=[...room.criticQueue],cycles=[...room.criticQueueCycles];
  first.connected=false; first.connected=true;
  const randomInt=crypto.randomInt;
  try {
    // This used to put their circle-2 slot at the front of circle 1.
    crypto.randomInt=()=>0;
    modes.reconnect(room,first,true);
  } finally {crypto.randomInt=randomInt;}
  assert.deepEqual(room.criticQueue,queue);
  assert.deepEqual(room.criticQueueCycles,cycles);
  const firstCircle=[first.id],secondCircle=[];
  for(let round=1;round<6;round++) {
    modes.start(room);
    (room.currentCircle===1?firstCircle:secondCircle).push(room.criticId);
  }
  assert.equal(new Set(firstCircle).size,3);
  assert.equal(new Set(secondCircle).size,3);
});
