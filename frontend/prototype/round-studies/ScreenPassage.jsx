import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import CinemaLobby from '../night-club/CinemaLobby.jsx';
import CinemaChat from '../night-club/CinemaChat.jsx';
import FoyerDoor from '../cinema-entrance/FoyerDoor.jsx';
import FoyerAtmosphere from '../cinema-entrance/FoyerAtmosphere.jsx';
import {foyerScale} from '../../src/cinema/sceneSizing.js';

const FOYER='/prototype/night-club/assets/cinema-foyer.png';
const WIDTH=1672,HEIGHT=941;

/** One proportional art coordinate system for the architecture, controls and live layers. */
export default function ScreenPassage({mobile=false,onReady,onEntered,onRequestStart,autoStart=false,startDisabled=false,vortexTextureUrl}){
  const root=useRef(null),image=useRef(null),notified=useRef(false),callback=useRef(onReady);
  const photo=useRef(null),art=useRef(null),door=useRef(null),motion=useRef(0),moves=useRef([]),run=useRef(0);
  const [doorReady,setDoorReady]=useState(false),[phase,setPhase]=useState('idle');
  const autoStarted=useRef(false);
  const cancelMotion=useCallback(()=>{run.current++;cancelAnimationFrame(motion.current);moves.current.forEach(a=>a.cancel());moves.current=[];},[]);
  const resetPassage=useCallback(()=>{
    cancelMotion();
    if(photo.current)photo.current.style.transform='none';
    if(photo.current)photo.current.style.visibility='visible';
    door.current?.setPose({zoom:1,pan:0,angle:0,angleRight:0,screenTravel:null,interiorLight:1,portalOpening:0,portalTime:0});setPhase('idle');
  },[cancelMotion]);
  useEffect(()=>{
    const escape=e=>{if(e.key==='Escape'){resetPassage();if(autoStart)onEntered?.();}};window.addEventListener('keydown',escape);
    return()=>{cancelMotion();window.removeEventListener('keydown',escape);};
  },[resetPassage,cancelMotion,autoStart,onEntered]);
  useEffect(()=>{const frame=requestAnimationFrame(resetPassage);return()=>cancelAnimationFrame(frame);},[mobile,resetPassage]);
  const enterAuditorium=useCallback(async()=>{
    if(startDisabled||!doorReady||phase!=='idle')return;
    const ticket=++run.current,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase('travel');
    const animate=(node,frames,options)=>{const a=node.animate(frames,{fill:'both',...options});moves.current.push(a);return a;};
    try{
      const duration=reduced?220:3600;
      const flight=animate(photo.current,[{opacity:1},{opacity:1}],{duration});
      const smooth=t=>t*t*t*(t*(t*6-15)+10);
      const sample=()=>{
        if(ticket!==run.current)return;
        const t=Math.min(1,Number(flight.currentTime||0)/duration);
        const opening=smooth(Math.min(1,t/.24));
        const entry=smooth(Math.max(0,Math.min(1,(t-.18)/.42)));
        const pull=Math.max(0,Math.min(1,(t-.73)/.27));
        const push=.9*entry+.1*pull*pull;
        const portalOpening=reduced?0:smooth(Math.max(0,Math.min(1,(t-.6)/.15)));
        const projection=door.current?.setPose({zoom:1,pan:0,screenTravel:push,angle:opening*87*Math.PI/180,angleRight:opening*86*Math.PI/180,portalOpening,portalTime:t*duration/1000,interiorLight:1-.7*smooth(Math.max(0,(t-.92)/.08))});
        if(projection){
          photo.current.style.transformOrigin='50% 50%';
          photo.current.style.transform=`translate(${-projection.x*projection.zoom/WIDTH*100}%,${projection.y*projection.zoom/HEIGHT*100}%) scale(${projection.zoom})`;
          photo.current.style.visibility=projection.inside?'hidden':'visible';
        }
        if(t<1)motion.current=requestAnimationFrame(sample);
      };sample();
      await flight.finished;
      if(ticket===run.current)onEntered?.();
    }catch{ /* Escape/replay cancels the continuous camera push. */ }
  },[doorReady,phase,onEntered,startDisabled]);
  useEffect(()=>{
    if(!autoStart||!doorReady||startDisabled||phase!=='idle'||autoStarted.current)return;
    const tick=requestAnimationFrame(()=>{autoStarted.current=true;enterAuditorium();});
    return()=>cancelAnimationFrame(tick);
  },[autoStart,doorReady,startDisabled,phase,enterAuditorium]);
  useLayoutEffect(()=>{callback.current=onReady;},[onReady]);
  const markReady=useCallback(()=>{
    if(root.current)root.current.dataset.imageReady='true';
    if(!notified.current){notified.current=true;callback.current?.();}
  },[]);
  useLayoutEffect(()=>{
    if(mobile)return;
    const element=root.current;
    const update=()=>{
      const scale=foyerScale(element.clientWidth,element.clientHeight);
      element.style.setProperty('--foyer-scale',String(scale));
      element.style.setProperty('--foyer-width',`${WIDTH*scale}px`);
      element.style.setProperty('--foyer-height',`${HEIGHT*scale}px`);
      element.dataset.sceneScale=scale.toFixed(4);
    };
    const observer=new ResizeObserver(update);observer.observe(element);update();
    return()=>observer.disconnect();
  },[mobile]);
  useLayoutEffect(()=>{if(mobile||(image.current?.complete&&image.current.naturalWidth))markReady();},[mobile,markReady]);
  return <div className={`lobby-arrival${mobile?' is-mobile':''}`} ref={root} data-layout={mobile?'mobile':'desktop'} data-passage={phase}>
    {mobile?<CinemaLobby/>:<>
      <div className="foyer-backdrop" style={{backgroundImage:`url(${FOYER})`}} aria-hidden="true"/>
      <div className="foyer-art" ref={art}>
        <div className="foyer-photograph" ref={photo}>
        <img className="lobby-arrival-image" ref={image} src={FOYER} alt="" aria-hidden="true" draggable="false" onLoad={markReady}/>
        <FoyerAtmosphere/>
        </div>
        <FoyerDoor ref={door} onReady={setDoorReady} vortexTextureUrl={vortexTextureUrl}/>
        <div className="foyer-interface" inert={phase!=='idle'||undefined}><CinemaLobby onStart={onRequestStart||enterAuditorium} startDisabled={startDisabled||!doorReady||phase!=='idle'||autoStart}/></div>
      </div>
    </>}
    <CinemaChat/>
  </div>;
}


