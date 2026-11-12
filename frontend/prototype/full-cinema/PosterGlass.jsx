import {useEffect,useRef} from 'react';
import './poster-glass.css';

/** Water is on the pane, in front of the print; every bead refracts the print. */
export default function PosterGlass({seed=1}){
 const ref=useRef(null);
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas.getContext('2d'),image=canvas.closest('.entrance-catalog-poster')?.querySelector('img');
  if(!ctx)return;
  const w=100,h=174,dpr=2;canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
  let rng=seed*8731,frame=0,last=0,time=0,disposed=false;
  const random=()=>{rng=(rng*1664525+1013904223)>>>0;return rng/4294967296;};
  const beads=Array.from({length:42},(_,i)=>({x:3+random()*94,y:random()*h,r:.65+random()*1.45,speed:i<7?4+random()*7:0,stretch:i<7?1.7:1.05,phase:random()*6.28}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:760px), (max-width:1024px) and (pointer:coarse)');
  let paintedStill=false;
  const render=stamp=>{
   if(disposed)return;
   frame=requestAnimationFrame(render);
   if(stamp-last<33||document.hidden||mobile.matches||(reduced.matches&&paintedStill&&image?.complete))return;
   const dt=Math.min(.07,(stamp-last)/1000||0);last=stamp;if(!reduced.matches)time+=dt;
   ctx.clearRect(0,0,w,h);
   for(const bead of beads){
    const y=(bead.y+time*bead.speed)%(h+12)-6,x=bead.x+Math.sin(time*.8+bead.phase)*.35,r=bead.r,ry=r*bead.stretch;
    if(bead.speed){
     const trail=ctx.createLinearGradient(x,y-22,x,y);trail.addColorStop(0,'#bfdcff00');trail.addColorStop(1,'#c0dfff33');ctx.strokeStyle=trail;ctx.lineWidth=r*.65;
     ctx.beginPath();ctx.moveTo(x-.4,y-22);ctx.bezierCurveTo(x+1,y-15,x-.5,y-6,x,y);ctx.stroke();
    }
    ctx.save();ctx.beginPath();ctx.ellipse(x,y,r,ry,0,0,Math.PI*2);ctx.clip();
    if(image?.complete&&image.naturalWidth){
     const fit=Math.min(w/image.naturalWidth,h/image.naturalHeight),iw=image.naturalWidth*fit,ih=image.naturalHeight*fit;
     // A shifted image sampled through the water gives a small lens distortion.
     ctx.drawImage(image,(w-iw)/2-1.8,(h-ih)/2+1,iw,ih);
    }
    const lens=ctx.createLinearGradient(x-r,y-ry,x+r,y+ry);lens.addColorStop(0,'#d2eaff55');lens.addColorStop(.45,'#8dabc508');lens.addColorStop(1,'#07121f88');ctx.fillStyle=lens;ctx.fillRect(x-r,y-ry,r*2,ry*2);ctx.restore();
    ctx.strokeStyle='#e2f0ff88';ctx.lineWidth=.45;ctx.beginPath();ctx.ellipse(x-.2,y-.3,r*.78,ry*.8,0,Math.PI,Math.PI*1.7);ctx.stroke();
    ctx.fillStyle='#ecf5ffbb';ctx.beginPath();ctx.ellipse(x-r*.25,y-ry*.47,.3,.65,0,0,Math.PI*2);ctx.fill();
   }
   canvas.dataset.waterFrame=String(Math.floor(time*30));
   paintedStill=!!image?.complete;
  };
  frame=requestAnimationFrame(render);return()=>{disposed=true;cancelAnimationFrame(frame);};
 },[seed]);
 return <span className="poster-glass"><span className="poster-glass-reflection"/><canvas ref={ref} className="poster-glass-water" aria-hidden="true"/></span>;
}
