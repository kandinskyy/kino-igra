import {useEffect,useState} from 'react';

// Module lifetime = page lifetime. Remounts, room creation and resize reuse the selection.
let pageSelection;
function selection(){
  return pageSelection??=(import('../../../backend/movies.json').then(({default:catalog})=>{
    const pool=catalog.filter(movie=>movie.posterUrl?.startsWith('/api/poster/'));
    const selected=[];
    while(selected.length<6&&pool.length){
      selected.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    }
    return {home:selected.slice(0,4),foyer:selected.slice(4,6)};
  }));
}
export function usePagePosters(group){
  const [posters,setPosters]=useState([]);
  useEffect(()=>{
    if(!group)return;
    let active=true;
    selection().then(groups=>{if(active)setPosters(groups[group]);}).catch(()=>{});
    return()=>{active=false;};
  },[group]);
  return posters;
}
