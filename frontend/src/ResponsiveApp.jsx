import {lazy,Suspense,useEffect,useState} from 'react';
import App from './App.jsx';
const Desktop=lazy(()=>Promise.all([import('./cinema/CinemaApp.jsx'),import('./cinema/NetworkCinemaProvider.jsx')]).then(([{default:CinemaApp},{default:Provider}])=>({default:()=> <Provider><CinemaApp/></Provider>})));
const mobileQuery='(max-width: 760px), (max-width: 1024px) and (pointer: coarse)';
export default function ResponsiveApp(){
 const [mobile,setMobile]=useState(()=>matchMedia(mobileQuery).matches);
 useEffect(()=>{const query=matchMedia(mobileQuery);const update=()=>setMobile(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 return mobile?<App/>:<Suspense fallback={<div className="connection-banner" role="status">Загружаем кинотеатр…</div>}><Desktop/></Suspense>;
}
