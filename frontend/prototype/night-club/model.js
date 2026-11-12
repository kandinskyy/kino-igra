// Local prototype rules. No sockets, persistence or production room access.
export const TIERS = ['S','A','B','C','D'];
export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i=a.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
export function ballot(repeat=false) {return repeat?TIERS.map(()=>TIERS[Math.floor(Math.random()*5)]):shuffle(TIERS);}
export function assignRank(current, index, tier, repeat=false) {
  const next=[...current];
  if(next[index]===tier&&next.filter(Boolean).length<5){next[index]=null;return next;}
  if(repeat){next[index]=tier;return next;}
  const occupied=next.indexOf(tier), old=next[index];
  next[index]=tier;
  if(occupied>=0&&occupied!==index)next[occupied]=old;
  const empty=next.map((v,i)=>v?null:i).filter(v=>v!==null);
  if(empty.length===1)next[empty[0]]=TIERS.find(t=>!next.includes(t));
  return next;
}
export function scoreOriginal(players, votes) {
  return Object.fromEntries(players.map(p=>[p.id,(votes[p.id]||[]).reduce((sum,tier,i)=>sum+(tier?players.filter(other=>other.id!==p.id&&votes[other.id]?.[i]===tier).length:0),0)]));
}
export function scoreOpinion(players,votes,criticId) {
  const points={};let perfect=0;
  const guessers=players.filter(p=>p.id!==criticId);
  for(const p of guessers){const n=(votes[p.id]||[]).filter((t,i)=>t&&t===votes[criticId]?.[i]).length;points[p.id]=n+(n===5?1:0);if(n===5)perfect++;}
  points[criticId]=perfect===guessers.length?0:perfect;
  return points;
}
