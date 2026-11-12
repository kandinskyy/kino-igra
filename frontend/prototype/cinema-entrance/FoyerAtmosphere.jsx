import {useEffect, useId, useRef} from 'react';
import './foyer-atmosphere.css';
import {usePagePosters} from './page-posters.js';

const POSTER_FALLBACK='/poster-placeholder.svg';
const NATIVE={width:1672,height:941};
const WINDOW_PANES=[
  {left:1588,top:176,right:1611,bottom:590},
  {left:1618,top:119,right:1647,bottom:603},
  {left:1656,top:48,right:1671,bottom:613},
];
const WINDOW_GLASS=[[[1588,176],[1611,132],[1611,594],[1588,590]],
  [[1618,119],[1647,65],[1647,605],[1618,599]],
  [[1656,48],[1671,26],[1671,613],[1656,609]]];
const WINDOW_CLIP=WINDOW_GLASS.map(points=>'M '+points.map(([x,y])=>`${x/NATIVE.width} ${y/NATIVE.height}`).join(' L ')+' Z').join(' ');

function PosterFrame({side,movie}){
  return <div className={`foyer-poster foyer-poster-${side}`} data-poster-id={movie?.id} data-poster-title={movie?.title}>
    <img className="foyer-poster-image is-visible" src={movie?.posterUrl||POSTER_FALLBACK} alt={movie?`Постер: ${movie.title}`:'Кинопостер'} draggable="false" onError={e=>{if(!e.currentTarget.src.endsWith(POSTER_FALLBACK))e.currentTarget.src=POSTER_FALLBACK;}}/>
  </div>;
}

/** Film artwork and weather live inside the photograph's existing glass and frames. */
export default function FoyerAtmosphere({mobile=false}){
  const root=useRef(null),canvasRef=useRef(null),animation=useRef(0),reduced=useRef(false);
  const clipId=`foyer-window-${useId().replaceAll(':','')}`;
  const posters=usePagePosters(mobile?null:"foyer");

  useEffect(()=>{
    if(mobile)return;
    const canvas=canvasRef.current,element=root.current,context=canvas?.getContext('2d',{alpha:true});
    if(!canvas||!context||!element)return;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current=preference.matches;
    const trails=Array.from({length:84},()=>{
      const pane=WINDOW_PANES[Math.floor(Math.random()*WINDOW_PANES.length)];
      return{x:pane.left+Math.random()*(pane.right-pane.left),y:pane.top+Math.random()*(pane.bottom-pane.top),
        length:5+Math.random()*28,speed:160+Math.random()*180,alpha:.08+Math.random()*.15,width:.45+Math.random()*.75,
        min:pane.top,max:pane.bottom,minX:pane.left,maxX:pane.right};
    });
    const droplets=Array.from({length:20},()=>{
      const pane=WINDOW_PANES[Math.floor(Math.random()*WINDOW_PANES.length)];
      return{x:pane.left+Math.random()*(pane.right-pane.left),y:pane.top+Math.random()*(pane.bottom-pane.top),
        radius:.7+Math.random()*1.45,length:12+Math.random()*45,speed:5+Math.random()*17,
        drift:(Math.random()-.5)*2.2,alpha:.2+Math.random()*.25,min:pane.top,max:pane.bottom,minX:pane.left,maxX:pane.right};
    });
    let width=0,height=0,lastPaint=0,frameCount=0;
    const size=()=>{
      const rect=element.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.5);
      if(!rect.width||!rect.height)return;
      width=rect.width;height=rect.height;
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
      canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
      context.setTransform(ratio*width/NATIVE.width,0,0,ratio*height/NATIVE.height,0,0);
      paint(0,true);
    };
    const paint=(dt,staticFrame=false)=>{
      context.clearRect(0,0,NATIVE.width,NATIVE.height);
      context.lineCap='round';
      for(const trail of trails){
        if(!staticFrame)trail.y+=trail.speed*dt;
        if(trail.y-trail.length>trail.max){trail.y=trail.min;trail.x=trail.minX+Math.random()*(trail.maxX-trail.minX);}
        const gradient=context.createLinearGradient(trail.x,trail.y-trail.length,trail.x,trail.y);
        gradient.addColorStop(0,'rgba(167,211,247,0)');gradient.addColorStop(1,`rgba(189,221,250,${trail.alpha})`);
        context.strokeStyle=gradient;context.lineWidth=trail.width;context.beginPath();
        context.moveTo(trail.x,trail.y-trail.length);context.lineTo(trail.x,trail.y);context.stroke();
      }
      for(const drop of droplets){
        if(!staticFrame){drop.y+=drop.speed*dt;drop.x+=drop.drift*dt;}
        if(drop.x<drop.minX||drop.x>drop.maxX)drop.x=Math.max(drop.minX,Math.min(drop.x,drop.maxX));
        if(drop.y-drop.length>drop.max){drop.y=drop.min;drop.x=drop.minX+Math.random()*(drop.maxX-drop.minX);}
        context.strokeStyle=`rgba(198,228,252,${drop.alpha*.6})`;context.lineWidth=.8;context.beginPath();
        context.moveTo(drop.x,drop.y-drop.length);context.quadraticCurveTo(drop.x+drop.drift*2,drop.y-drop.length*.45,drop.x,drop.y);context.stroke();
        context.fillStyle=`rgba(208,235,255,${drop.alpha})`;context.beginPath();
        context.ellipse(drop.x,drop.y,drop.radius*.72,drop.radius*1.15,0,0,Math.PI*2);context.fill();
        context.fillStyle=`rgba(248,252,255,${drop.alpha*.75})`;context.beginPath();
        context.ellipse(drop.x-drop.radius*.24,drop.y-drop.radius*.28,drop.radius*.21,drop.radius*.34,-.25,0,Math.PI*2);context.fill();
      }
      // The window's perspective mullions remain dry and opaque.
      context.save();context.globalCompositeOperation='destination-out';context.strokeStyle='#000';context.lineWidth=9;
      for(const [left,right] of [[207,163],[313,279],[417,397],[520,509]]){
        context.beginPath();context.moveTo(1580,left);context.lineTo(1672,right);context.stroke();
      }
      context.restore();
      element.dataset.rainDrops=String(droplets.length);
      element.dataset.rainFrame=String(++frameCount);
    };
    const draw=now=>{
      animation.current=0;
      if(document.visibilityState==='hidden'||reduced.current||!width)return;
      if(now-lastPaint>=1000/30){const dt=Math.min((now-lastPaint)/1000,.05);paint(dt);lastPaint=now;}
      animation.current=requestAnimationFrame(draw);
    };
    const start=()=>{if(reduced.current){paint(0,true);return;}if(!animation.current){lastPaint=performance.now();animation.current=requestAnimationFrame(draw);}};
    const stop=()=>{cancelAnimationFrame(animation.current);animation.current=0;};
    const visibility=()=>document.visibilityState==='hidden'?stop():start();
    const motion=()=>{reduced.current=preference.matches;stop();paint(0,true);if(!reduced.current&&document.visibilityState==='visible')start();};
    const observer=new ResizeObserver(size);observer.observe(element);size();
    document.addEventListener('visibilitychange',visibility);preference.addEventListener('change',motion);
    if(document.visibilityState==='visible'&&!reduced.current)start();
    return()=>{stop();observer.disconnect();document.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',motion);};
  },[mobile,clipId]);

  if(mobile)return null;
  return <div className="foyer-atmosphere" ref={root}
    data-poster-selection="page-load"
    data-rain-frame="loading">
    {posters.length>0&&<PosterFrame side="left" movie={posters[0]}/>}
    {posters.length>1&&<PosterFrame side="right" movie={posters[1]}/>}
    <svg className="foyer-atmosphere-defs" aria-hidden="true" focusable="false">
      <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox">
        <path d={WINDOW_CLIP}/>
      </clipPath></defs>
    </svg>
    <canvas className="foyer-window-rain" ref={canvasRef} style={{clipPath:`url(#${clipId})`}} aria-hidden="true"/>
  </div>;
}
