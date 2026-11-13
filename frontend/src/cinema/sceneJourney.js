export function reverseJourney(from,to,{enteringGame=false}={}) {
  if(enteringGame)return false;
  return (from==='game'&&['home','lobby'].includes(to))||(from==='lobby'&&to==='home');
}
