import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {CloudRain} from 'lucide-react';
import SupportDevelopment from '../../src/components/SupportDevelopment.jsx';
import FoyerDoor from '../cinema-entrance/FoyerDoor.jsx';
import FoyerAtmosphere from '../cinema-entrance/FoyerAtmosphere.jsx';
import EntrancePosters from '../cinema-entrance/EntrancePosters.jsx';
import {createEntranceWeather} from '../cinema-entrance/entrance-weather.js';
import './return-passage.css';
import {foyerScale} from '../../src/cinema/sceneSizing.js';

const FOYER='/prototype/night-club/assets/cinema-foyer.png';
const PLATE='/prototype/cinema-entrance/assets/cinema-clean.png';
const ROOT='/prototype/cinema-entrance/assets/';
const MOBILE='(max-width: 760px), (max-width: 1024px) and (pointer: coarse)';
const SMOOTH=t=>t*t*t*(t*(t*6-15)+10);
const CLAMP=t=>Math.max(0,Math.min(1,t));
const FOCUS={x:(739+68/2)/1536*100,y:(673+104/2)/1024*100};

/** The same hall camera path, sampled backwards. No room state is changed here. */
function HallReturn({onFinished}){
  const root=useRef(null),photo=useRef(null),door=useRef(null),frame=useRef(0);
  const done=useRef(onFinished);useLayoutEffect(()=>{done.current=onFinished;},[onFinished]);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    if(ready)return;
    const timeout=setTimeout(()=>done.current?.(),2500);
    return()=>clearTimeout(timeout);
  },[ready]);
  useLayoutEffect(()=>{
    const node=root.current;
    const resize=()=>{const scale=foyerScale(node.clientWidth,node.clientHeight);node.style.setProperty('--foyer-width',`${1672*scale}px`);node.style.setProperty('--foyer-height',`${941*scale}px`);node.style.setProperty('--return-extra',`${Math.max(0,(node.clientHeight-941*scale)/2)}px`);};
    const observer=new ResizeObserver(resize);observer.observe(node);resize();return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!ready)return;
    let start=null,canceled=false;
    const duration=3050;
    const sample=now=>{
      if(canceled)return;
      if(start===null)start=now;
      const progress=.5-.5*Math.cos(Math.PI*CLAMP((now-start)/duration)),t=1-progress;
      const opening=SMOOTH(CLAMP(t/.24));
      const entry=SMOOTH(CLAMP((t-.18)/.42));
      const pull=CLAMP((t-.73)/.27);
      const push=.9*entry+.1*pull*pull;
      const projection=door.current?.setPose({zoom:1,pan:0,screenTravel:push,angle:opening*87*Math.PI/180,angleRight:opening*86*Math.PI/180,portalOpening:SMOOTH(CLAMP((t-.6)/.15)),portalTime:t*3.6,interiorLight:1-.7*SMOOTH(CLAMP((t-.92)/.08))});
      if(projection){
        photo.current.style.transform=`translate(${-projection.x*projection.zoom/1672*100}%,${projection.y*projection.zoom/941*100}%) scale(${projection.zoom})`;
        photo.current.style.visibility=projection.inside?'hidden':'visible';
      }
      root.current.dataset.returnProgress=progress.toFixed(3);
      root.current.dataset.visualReady='true';
      if(progress<1)frame.current=requestAnimationFrame(sample);else done.current?.();
    };
    frame.current=requestAnimationFrame(sample);
    return()=>{canceled=true;cancelAnimationFrame(frame.current);};
  },[ready]);
  return <div ref={root} className="return-hall" data-return-part="hall" aria-hidden="true">
    <div className="foyer-backdrop" style={{backgroundImage:`url(${FOYER})`}}/>
    <div className="foyer-art">
      <div className="foyer-photograph" ref={photo}><img className="lobby-arrival-image" src={FOYER} alt=""/><FoyerAtmosphere/></div>
      <FoyerDoor ref={door} onReady={setReady} extendViewport vortexTextureUrl="/prototype/full-cinema/assets/spiral-portal.png"/>
    </div>
  </div>;
}

/** Reverse of FullEntrance: withdraw from the ticket vestibule, then close the leaves. */
function ExteriorReturn({onFinished}){
  const root=useRef(null),camera=useRef(null),world=useRef(null),exterior=useRef(null),weather=useRef(null),canvas=useRef(null),scene=useRef(null),frame=useRef(0);
  const done=useRef(onFinished);useLayoutEffect(()=>{done.current=onFinished;},[onFinished]);
  const [ready,setReady]=useState(false);
  useLayoutEffect(()=>{
    const node=camera.current;
    const resize=()=>{world.current.style.transform=`scale(${node.clientWidth/1536})`;};
    const observer=new ResizeObserver(resize);observer.observe(node);resize();return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const rainfall=createEntranceWeather(weather.current,{intensity:1.25,mobile:false});
    return()=>rainfall.dispose();
  },[]);
  useEffect(()=>{
    let disposed=false,instance;
    const fail=()=>{if(!disposed)done.current?.();};
    import('../cinema-entrance/door-scene.js').then(({createDoorScene})=>{
      if(disposed)return;
      try{instance=createDoorScene(canvas.current,{textureUrl:`${ROOT}entrance-door-restored-v3.png`,interiorUrl:`${ROOT}cinema-ticket-vestibule.png`,viewportArtHeight:()=>canvas.current?.parentElement?.clientHeight,onReady:()=>{if(!disposed)setReady(true);},onError:fail});scene.current=instance;}catch{fail();}
    }).catch(fail);
    return()=>{disposed=true;cancelAnimationFrame(frame.current);instance?.dispose();scene.current=null;};
  },[]);
  useEffect(()=>{
    if(!ready)return;
    let canceled=false;
    const duration=2900,centre=`translate(${50-FOCUS.x}%,${50-FOCUS.y}%)`;
    camera.current.style.transformOrigin=`${FOCUS.x}% ${FOCUS.y}%`;
    // Gentle acceleration and braking keep the return continuous at both ends.
    const motion=camera.current.animate([{transform:`${centre} scale(11)`},{transform:'translate(0,0) scale(1)'}],{duration,easing:'cubic-bezier(.65,0,.4,1)',fill:'both'});
    const sample=()=>{
      if(canceled)return;
      const progress=CLAMP(Number(motion.currentTime||0)/duration),originalTime=1-progress;
      const originalCamera=1-(motion.effect.getComputedTiming().progress??0);
      const swing=(delay,degrees)=>SMOOTH(CLAMP((originalTime-delay)/.58))*Math.PI*degrees/180;
      scene.current?.setPose({zoom:1+10*originalCamera,pan:originalCamera,angle:swing(.22,58),angleRight:swing(.237,56)});
      weather.current.style.opacity=String(1-SMOOTH(CLAMP((originalTime-.36)/.36)));
      // The vestibule is introduced locally; no fullscreen flash of white light.
      exterior.current.style.opacity=String(SMOOTH(CLAMP(progress/.16)));
      root.current.dataset.returnProgress=progress.toFixed(3);
      root.current.dataset.visualReady='true';
      if(progress<1)frame.current=requestAnimationFrame(sample);
    };sample();
    motion.finished.then(()=>{if(!canceled)done.current?.();}).catch(()=>{});
    return()=>{canceled=true;cancelAnimationFrame(frame.current);motion.cancel();};
  },[ready]);
  return <div ref={root} className="return-exterior" data-return-part="exterior" aria-hidden="true">
    <div className="return-exterior-frame">
      <div className="entrance-exterior" ref={exterior}>
        <div className="entrance-camera" ref={camera}><div className="entrance-world" ref={world}>
          <img className="entrance-plate" src={PLATE} alt=""/><EntrancePosters wetGlass/><canvas className="entrance-weather" ref={weather}/>
        </div></div>
        <canvas className="entrance-door-3d" ref={canvas} data-ready={ready||undefined}/>
      </div>
    </div>
  </div>;
}

/** Covers the destination while the real entrance paths are played in reverse. */
export default function ReturnPassage({from,to,onComplete}){
  const done=useRef(onComplete);useLayoutEffect(()=>{done.current=onComplete;},[onComplete]);
  const [simple]=useState(()=>matchMedia(MOBILE).matches||matchMedia('(prefers-reduced-motion: reduce)').matches);
  const part=to==='home'?'exterior':from==='game'?'hall':'exterior';
  const finish=useCallback(()=>done.current?.(),[]);
  useEffect(()=>{
    const escape=event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();finish();}};
    window.addEventListener('keydown',escape,true);
    const fallback=setTimeout(finish,12000);
    const reduced=simple?setTimeout(finish,240):null;
    return()=>{window.removeEventListener('keydown',escape,true);clearTimeout(fallback);clearTimeout(reduced);};
  },[simple,finish]);
  return <div className={`return-passage${simple?' is-simple':''}`} data-from={from} data-to={to} role="status" aria-label={to==='home'?'Возвращаемся к кинотеатру':'Возвращаемся в фойе'}>
    {!simple&&(part==='hall'?<HallReturn onFinished={finish}/>:<ExteriorReturn onFinished={finish}/>)}
    <header className="return-masthead"><div className="return-brand"><CloudRain/><span>OVERRATED</span></div><SupportDevelopment/></header>
    <span className="sr-only">{to==='home'?'Выходим из кинотеатра':'Выходим из кинозала'}. Escape — пропустить переход.</span>
  </div>;
}

