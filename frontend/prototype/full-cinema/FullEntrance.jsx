// Integrated local entrance; shared game context is supplied by FullProvider.
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {flushSync} from 'react-dom';
import {CloudRain, Play} from 'lucide-react';
import {useGame} from '../../src/GameContext.jsx';
import SupportDevelopment from '../../src/components/SupportDevelopment.jsx';
import ModalDialog from '../../src/components/ModalDialog.jsx';
import {storage} from '../../src/utils/storage.js';

import ScreenPassage from '../round-studies/ScreenPassage.jsx';
import CinemaLobby from '../night-club/CinemaLobby.jsx';
import CinemaChat from '../night-club/CinemaChat.jsx';
import EntrancePosters from '../cinema-entrance/EntrancePosters.jsx';
import {createEntranceWeather} from '../cinema-entrance/entrance-weather.js';



const PLATE='/prototype/cinema-entrance/assets/cinema-clean.png';
const DOOR_TEXTURE='/prototype/cinema-entrance/assets/entrance-door-restored-v3.png';
const DOOR_INTERIOR='/prototype/cinema-entrance/assets/cinema-ticket-vestibule.png';
// Door geometry belongs to the 1536 × 1024 illustration, independent of viewport.
const DOOR={x:739,y:673,w:68,h:104};
const MOBILE_QUERY='(max-width: 760px), (max-width: 1024px) and (pointer: coarse)';

export default function FullEntrance(){
  const {gameState,isConnected=true,prepareRoom,commitRoom,cancelRoom,enterGame,beginRestoredEntry,entranceRequested=false,gameTransitionPending=false,completeGameTransition}=useGame();
  const inLobby=gameState?.state==='lobby';
  const frame=useRef(null),world=useRef(null),camera=useRef(null),exterior=useRef(null),weatherCanvas=useRef(null),mobileCanvas=useRef(null),surroundCanvas=useRef(null),doorCanvas=useRef(null),doorScene=useRef(null),motionFrame=useRef(null),animations=useRef([]),alive=useRef(true),busy=useRef(false),phaseTimer=useRef(null);
  const [mobile,setMobile]=useState(()=>matchMedia(MOBILE_QUERY).matches);
  const [ready,setReady]=useState(false),[loadedError,setLoadedError]=useState(false),[traveling,setTraveling]=useState(false),[joining,setJoining]=useState(()=>new URLSearchParams(location.search).has('room')),[code,setCode]=useState(()=>new URLSearchParams(location.search).get('room')?.trim().toUpperCase()||''),[name,setName]=useState(()=>storage.getItem('kino_lastNickname')||''),[error,setError]=useState('');
  const [doorReady,setDoorReady]=useState(false);
  const foyerReady=useRef(null);
  const reset=useCallback(()=>{clearTimeout(phaseTimer.current);cancelAnimationFrame(motionFrame.current);animations.current.forEach(a=>a.cancel());animations.current=[];doorScene.current?.setPose({zoom:1,pan:0,angle:0,angleRight:0});busy.current=false;cancelRoom();if(alive.current){setTraveling(false);frame.current.dataset.phase=frame.current.dataset.scene==='lobby'?'lobby':'idle';}},[cancelRoom]);
  useEffect(()=>{
    if(mobile||inLobby)return;
    let canceled=false,scene;
    const failed=()=>{if(!canceled){setDoorReady(false);setError('Не удалось открыть 3D-дверь. Обновите страницу или проверьте поддержку WebGL.');}};
    import('../cinema-entrance/door-scene.js').then(({createDoorScene})=>{
      if(canceled)return;
      setDoorReady(false);
      try{scene=createDoorScene(doorCanvas.current,{textureUrl:DOOR_TEXTURE,interiorUrl:DOOR_INTERIOR,onReady:()=>{if(!canceled)setDoorReady(true);},onError:failed});doorScene.current=scene;}catch{failed();}
    }).catch(failed);
    return()=>{canceled=true;cancelAnimationFrame(motionFrame.current);scene?.dispose();if(doorScene.current===scene)doorScene.current=null;};
  },[mobile,inLobby]);
  useEffect(()=>{const image=new Image();image.src='/prototype/night-club/assets/cinema-foyer.png';foyerReady.current=image.decode().catch(()=>{});},[]);
  useLayoutEffect(()=>{const update=()=>{const w=camera.current.clientWidth;world.current.style.transform=`scale(${w/1536})`;const r=frame.current.getBoundingClientRect(),root=frame.current.parentElement;for(const[k,v]of Object.entries({left:r.left,top:r.top,right:r.right,bottom:r.bottom,fadeX:r.width*.075,fadeY:r.height*.035}))root.style.setProperty(`--art-${k}`,`${v}px`);};const resize=new ResizeObserver(update);resize.observe(camera.current);resize.observe(document.documentElement);update();return()=>resize.disconnect();},[]);
  useEffect(()=>{const query=matchMedia(MOBILE_QUERY);const update=()=>{reset();setMobile(query.matches);};query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[reset]);
  useEffect(()=>{if(inLobby&&!mobile)return;const weather=createEntranceWeather(mobile?mobileCanvas.current:weatherCanvas.current,{intensity:mobile?1:1.25,mobile});return()=>weather.dispose();},[mobile,inLobby]);
  useEffect(()=>{if(mobile||inLobby)return;const weather=createEntranceWeather(surroundCanvas.current,{mobile:true,intensity:.6});return()=>weather.dispose();},[mobile,inLobby]);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;clearTimeout(phaseTimer.current);cancelAnimationFrame(motionFrame.current);animations.current.forEach(a=>a.cancel());};},[]);
  function animate(node,frames,options){const a=node.animate(frames,{fill:'both',...options});animations.current.push(a);return a;}
  useEffect(()=>{const cancel=e=>{if(e.key==='Escape'&&busy.current)reset();};window.addEventListener('keydown',cancel);return()=>window.removeEventListener('keydown',cancel);},[reset]);
  async function enter(join=false,restored=false){
    if(busy.current||!isConnected||((!ready||!doorReady||!doorScene.current)&&!mobile))return;
    if(join&&!/^[A-Z0-9]{6}$/.test(code.trim())){setError('Введите код из 6 букв или цифр');return;}
    busy.current=true;
    const result=restored?(beginRestoredEntry?.()||{success:true}):await prepareRoom(name,join?code.trim():'');
    if(!alive.current)return;
    if(!result.success){busy.current=false;setError(result.message);return;}
    setError('');setTraveling(true);frame.current.dataset.phase='approaching';
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||mobile;
    const duration=reduced?450:3200;
    phaseTimer.current=setTimeout(()=>{if(alive.current&&busy.current)frame.current.dataset.phase='opening';},duration*.24);
    const focusX=(DOOR.x+DOOR.w/2)/1536*100,focusY=(DOOR.y+DOOR.h/2)/1024*100;
    camera.current.style.transformOrigin=`${focusX}% ${focusY}%`;
    // Translate the chosen door to the centre as the camera approaches its aperture.
    const centre=`translate(${50-focusX}%,${50-focusY}%)`;
    const move=animate(camera.current,reduced?[{transform:'none'},{transform:'none'}]:[
      {transform:'translate(0,0) scale(1)',offset:0},
      {transform:`${centre} scale(11)`,offset:1},
    ],{duration,easing:'cubic-bezier(.45,0,.25,1)'});
    if(!reduced){
      const sample=()=>{
        if(!busy.current||!alive.current)return;
        const progress=move.effect.getComputedTiming().progress??0;
        const time=Math.min(1,Number(move.currentTime||0)/duration);
        const swing=(delay,degrees)=>{
          const t=Math.max(0,Math.min(1,(time-delay)/.58));
          const eased=t*t*t*(t*(t*6-15)+10);
          return eased*Math.PI*degrees/180;
        };
        doorScene.current?.setPose({zoom:1+10*progress,pan:progress,angle:swing(.22,58),angleRight:swing(.237,56)});
        if(time<1)motionFrame.current=requestAnimationFrame(sample);
      };sample();
      animate(weatherCanvas.current,[{opacity:1},{opacity:1,offset:.36},{opacity:0,offset:.72},{opacity:0}],{duration,easing:'ease-in-out'});
    }
    // Fade the composited scene; independent fades reveal the baked closed door underneath.
    animate(exterior.current,[{opacity:1},{opacity:1,offset:reduced?0:.82},{opacity:0}],{duration,easing:'ease-in-out'});
    try{await move.finished;if(!alive.current)return;frame.current.dataset.phase='threshold';
      // Cross the threshold into the foyer. Light belongs only to the door aperture.
      if(!mobile)await foyerReady.current;
      if(!alive.current||!busy.current)return;
      animations.current.forEach(a=>a.cancel());
      camera.current.style.transformOrigin='50% 50%';
      let committed=false;
      flushSync(()=>{committed=commitRoom();});
      if(!committed){reset();setError('Комната закрыта или вы больше не её участник. Попробуйте войти снова.');return;}
      frame.current.dataset.phase='arriving';
      const arrival=frame.current.querySelector('.lobby-arrival');
      if(!arrival){reset();setError('Не удалось открыть комнату. Попробуйте войти снова.');return;}
      if(!reduced)animate(arrival.querySelector('.foyer-art'),[{transform:'translate(-50%,-50%) scale(1.045)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.65,.3,1)'});
      const fade=animate(arrival,[{opacity:0},{opacity:1}],{duration:reduced?250:650,easing:'cubic-bezier(.2,.65,.3,1)'});
      await fade.finished;reset();
    }catch{ /* Escape or unmount cancels the visual preview. */ }
  }
  useEffect(()=>{if(entranceRequested&&!busy.current&&(mobile||(ready&&doorReady)))void enter(false,true);});
  useEffect(()=>{if(mobile&&gameTransitionPending)completeGameTransition?.();},[mobile,gameTransitionPending,completeGameTransition]);
  return <div className="entrance-prototype" data-layout={mobile?'mobile':'desktop'} data-scene={inLobby?'lobby':'home'} data-traveling={traveling||undefined}>
    <canvas className="entrance-surround-weather" ref={surroundCanvas} aria-hidden="true"/>
    <section className={`entrance-frame${inLobby?' is-lobby':''}`} ref={frame} data-phase={inLobby?'lobby':'idle'} data-scene={inLobby?'lobby':'home'} data-layout={mobile?'mobile':'desktop'} aria-label={inLobby?'Лобби OverratedKino':'Главное меню OverratedKino'}>
      <canvas className="entrance-mobile-weather" ref={mobileCanvas} aria-hidden="true"/>
      <div className="entrance-exterior" ref={exterior} aria-hidden="true">
      <div className="entrance-camera" ref={camera}><div className="entrance-world" ref={world}>
        <img className="entrance-plate" src={mobile?undefined:PLATE} alt="" draggable="false" onLoad={()=>setReady(true)} onError={()=>setLoadedError(true)}/>
        {!mobile&&<EntrancePosters wetGlass/>}
        <canvas className="entrance-weather" ref={weatherCanvas}/>
      </div></div>
      <canvas className="entrance-door-3d" ref={doorCanvas} data-ready={doorReady||undefined} aria-hidden="true"/>
      </div>
      <form className={`entrance-form${traveling?' is-traveling':''}`} aria-hidden={traveling||undefined} inert={traveling||undefined} onSubmit={e=>{e.preventDefault();enter(joining);}}>
        <input aria-label="Ваше имя" placeholder="Ваше имя" autoComplete="nickname" maxLength="15" value={name} onChange={e=>setName(e.target.value)}/>
        <button className="entrance-create" type="button" disabled={!isConnected||((!ready||!doorReady)&&!mobile)} onClick={()=>enter(false)}>Создать комнату</button>
        <div className={`entrance-join${joining?' is-open':''}`}>
          {joining?<div className="entrance-code"><input aria-label="Код комнаты" placeholder="Код комнаты" autoFocus maxLength="6" value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setError('');}}/><button aria-label="Войти в кинотеатр по коду" type="submit" disabled={!isConnected||((!ready||!doorReady)&&!mobile)}><Play fill="currentColor"/></button></div>:<button type="button" onClick={()=>setJoining(true)}>Войти по коду</button>}
        </div>
        <span className="entrance-player-count">2–16 игроков</span>{error&&<p className="entrance-error" role="alert">{error}</p>}
      </form>
      {loadedError&&<p className="entrance-load-error" role="alert">Не удалось загрузить фон. Обновите страницу.</p>}
      {inLobby&&(mobile?<div className="lobby-arrival is-mobile"><CinemaLobby onStart={enterGame} startDisabled={!isConnected||gameState.players.filter(p=>p.connected).length<2}/><CinemaChat/></div>:<ScreenPassage onRequestStart={completeGameTransition?enterGame:undefined} autoStart={gameTransitionPending} onEntered={completeGameTransition||enterGame} startDisabled={!isConnected||gameState.players.filter(p=>p.connected).length<2} vortexTextureUrl="/prototype/full-cinema/assets/spiral-portal.png"/>)}
    </section>
    <div className="entrance-header-frame"><header className="entrance-masthead"><div className="entrance-brand"><CloudRain aria-hidden="true"/><span>OVERRATEDKINO</span></div><SupportDevelopment/></header></div>
    <ModalDialog/>
  </div>;
}

