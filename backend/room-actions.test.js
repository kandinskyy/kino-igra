const { test } = require('node:test');
const assert = require('node:assert/strict');
const { draw, reroll, saveVotes, allSaved, sendChat, deleteChat } = require('./room-actions');
const catalog = Array.from({length:12}, (_, i) => ({id:String(i), title:`Кино ${i}`, category:'films'}));
function room() {
  const l = {roundId:1, state:'round_start', host:'a', players:['a','b','c'].map(id => ({id, nickname:id, color:'#fff', connected:true})), ratings:{}, autoRatings:{}};
  l.movies = draw(l, catalog, 5);
  return l;
}
test('draw consumes remaining titles before cycling and never duplicates a round', () => {
  const l=room();
  l.usedMovieIds=catalog.slice(0,11).map(m=>m.id);l.usedMovieTitles=catalog.slice(0,11).map(m=>m.title.toLowerCase());
  const picked=draw(l,catalog,5);
  assert.equal(picked[0].id,'11');
  assert.equal(new Set(picked.map(m=>m.id)).size,5);
});
test('rerolls protect current five on exhaustion, preserve other ratings and limit each slot', () => {
  const l=room();
  l.usedMovieIds=catalog.map(m=>m.id);l.usedMovieTitles=catalog.map(m=>m.title.toLowerCase());
  const initial=l.movies.slice();
  for(const p of l.players) {l.ratings[p.id]=Object.fromEntries(initial.map((m,i)=>[m.id,['S','A','B','C','D'][i]]));l.autoRatings[p.id]={[initial[0].id]:true};}
  const replacement=reroll(l,'a',initial[0].id,1,catalog);
  assert.ok(!initial.some(m=>m.id===replacement.id));
  assert.ok(initial.every(m=>l.usedMovieIds.includes(m.id)));
  assert.equal(new Set(l.movies.map(m=>m.id)).size,5);
  for(const p of l.players){assert.equal(l.ratings[p.id][initial[0].id],undefined);assert.equal(Object.keys(l.ratings[p.id]).length,4);assert.deepEqual(l.autoRatings[p.id],{});}
  assert.throws(()=>reroll(l,'a',replacement.id,1,catalog));
  assert.throws(()=>reroll(l,'b',initial[1].id,1,catalog));
  assert.throws(()=>reroll(l,'a',initial[1].id,0,catalog));
  l.mode='opinion';l.criticId='b';l.phase='critic';
  assert.throws(()=>reroll(l,'a',initial[1].id,1,catalog));
  reroll(l,'b',initial[1].id,1,catalog);
  l.phase='guess';assert.throws(()=>reroll(l,'b',initial[2].id,1,catalog));
});
test('saved guesses require complete current answers, can unlock and only finish when all active guessers save', () => {
  const l=room();Object.assign(l,{mode:'opinion',phase:'guess',criticId:'a'});
  assert.throws(()=>saveVotes(l,'b',1));
  for(const p of l.players) l.ratings[p.id]=Object.fromEntries(l.movies.map(m=>[m.id,'S']));
  assert.throws(()=>saveVotes(l,'a',1));assert.throws(()=>saveVotes(l,'b',0));
  saveVotes(l,'b',1);assert.equal(allSaved(l),false);
  saveVotes(l,'b',1,true);assert.equal(l.savedRatings.b,false);
  saveVotes(l,'c',1);assert.equal(allSaved(l),false);
  saveVotes(l,'b',1);assert.equal(allSaved(l),true);
  l.players[1].connected=false;l.players[2].connected=false;assert.equal(allSaved(l),false);
});
test('chat bounds messages, does not expose private player fields, throttles, and only host can delete', () => {
  const l=room(),p={...l.players[1], sessionToken:'secret', socketId:'private'};
  assert.throws(()=>sendChat(l,p,' '.repeat(2)));
  assert.throws(()=>sendChat(l,p,'x'.repeat(501)));
  const m=sendChat(l,p,' <script>plain text</script> ',10000);
  assert.equal(m.text,'<script>plain text</script>');assert.equal(m.sessionToken,undefined);assert.equal(m.socketId,undefined);
  assert.throws(()=>sendChat(l,p,'spam',10001));
  for(let i=1;i<=101;i++) sendChat(l,p,String(i),10000+i*1000);
  assert.equal(l.chat.length,100);
  const last=l.chat.at(-1);assert.throws(()=>deleteChat(l,'b',last.id));
  deleteChat(l,'a',last.id);assert.equal(l.chat.length,99);
});
