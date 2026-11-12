import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';

const ROOT='/prototype/cinema-entrance/assets/';
const FoyerDoor=forwardRef(function FoyerDoor({onReady,vortexTextureUrl,extendViewport=false},ref){
  const canvas=useRef(null),scene=useRef(null);
  const [ready,setReady]=useState(false);
  useImperativeHandle(ref,()=>({setPose:pose=>scene.current?.setPose(pose)}),[]);
  useEffect(()=>{onReady?.(ready);},[ready,onReady]);
  useEffect(()=>{
    let disposed=false,instance;
    import('./door-scene.js').then(({createDoorScene})=>{
      if(disposed)return;
      try{
        instance=createDoorScene(canvas.current,{
          textureUrl:`${ROOT}lobby-door-restored.png`,interiorUrl:`${ROOT}lobby-auditorium-seats-v2.png`,
          vortexTextureUrl,
          viewportArtHeight:extendViewport?()=>canvas.current?.parentElement?.clientHeight:undefined,
          art:{width:1672,height:941},door:{x:-.5,y:-51,width:293,height:441},frontTint:0xffffff,
          onReady:()=>{if(!disposed)setReady(true);},
          onError:()=>{if(!disposed)setReady(false);},
        });scene.current=instance;
      }catch{ /* The original photographed door remains visible if WebGL is unavailable. */ }
    });
    return()=>{disposed=true;instance?.dispose();scene.current=null;};
  },[vortexTextureUrl,extendViewport]);
  return <>
    <canvas className="foyer-door-canvas" ref={canvas} data-ready={ready||undefined} aria-hidden="true"/>
  </>;
});
export default FoyerDoor;
