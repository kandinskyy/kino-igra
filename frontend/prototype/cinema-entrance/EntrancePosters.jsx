import {usePagePosters} from './page-posters.js';
import PosterGlass from '../full-cinema/PosterGlass.jsx';
export default function EntrancePosters({wetGlass=false}){
  const posters=usePagePosters('home');
  return <div className="entrance-catalog-posters" aria-hidden="true">{posters.map((movie,index)=><div className={`entrance-catalog-poster entrance-catalog-poster-${index}`} data-poster-id={movie.id} key={movie.id}>
    <img src={movie.posterUrl} alt="" draggable="false" onError={e=>{e.currentTarget.src='/poster-placeholder.svg';}}/>
    {wetGlass&&<PosterGlass seed={index+1}/>}
  </div>)}</div>;
}
