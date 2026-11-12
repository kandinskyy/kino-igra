import * as THREE from 'three';
import {createScreenVortex} from './screen-vortex.js';

const DEFAULT_ART = {width:1536,height:1024};
const DEFAULT_DOOR = {width:68,height:104,x:5,y:-213};

/** Only the central door is geometry; the approved facade stays photographic. */
export function createDoorScene(canvas,{textureUrl,interiorUrl,vortexTextureUrl,onReady,onError,viewportArtHeight,art=DEFAULT_ART,door=DEFAULT_DOOR,frontTint=0xe8e8e8}){
  const ART=art,DOOR=door,unit=DOOR.width/68,thickness=2.6*unit,recess=43*unit;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,stencil:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NoToneMapping;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1.5,1,4000);
  const distance=ART.height/(2*Math.tan(THREE.MathUtils.degToRad(35)/2));
  camera.position.z=distance;
  const resources=new Set(),textures=[];
  let disposed=false,loaded=false,pose={zoom:1,pan:0,angle:0,angleRight:0},lastWidth=0,lastHeight=0;
  const keep=value=>{resources.add(value);return value;};
  const material=options=>keep(new THREE.MeshBasicMaterial(options));
  const geometry=(w,h,d)=>keep(new THREE.BoxGeometry(w,h,d));
  const wood=material({color:0x684321}),innerWood=material({color:0x48301c});
  const group=new THREE.Group();group.position.set(DOOR.x,DOOR.y,0);scene.add(group);

  // An illuminated ticket vestibule beyond the entrance, hidden by opaque leaves.
  const aperture=new THREE.Mesh(keep(new THREE.PlaneGeometry(DOOR.width,DOOR.height)),material({colorWrite:false,depthWrite:false,depthTest:false,stencilWrite:true,stencilRef:1,stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp}));
  aperture.position.z=.1;aperture.renderOrder=-2;group.add(aperture);
  const portalMaterial=material({color:0xffffff,stencilWrite:true,stencilRef:1,stencilFunc:THREE.EqualStencilFunc});
  // Overscan fills the aperture even from close range; the stencil keeps it behind the facade.
  const portal=new THREE.Mesh(keep(new THREE.PlaneGeometry(DOOR.width*1.32,DOOR.height*1.32)),portalMaterial);
  portal.position.z=-recess;portal.renderOrder=-1;group.add(portal);
  const vortexMaterial=keep(createScreenVortex());
  const vortex=new THREE.Mesh(keep(new THREE.PlaneGeometry(DOOR.width*1.32*.265,DOOR.height*1.32*.086)),vortexMaterial);
  vortex.position.set(0,(.646-.5)*DOOR.height*1.32,-recess+.4);vortex.renderOrder=0;vortex.visible=false;group.add(vortex);
  for(const side of [-1,1]){
    const jamb=new THREE.Mesh(geometry(1.4*unit,DOOR.height,recess),innerWood);
    jamb.position.set(side*(DOOR.width/2-.7*unit),0,-recess/2);group.add(jamb);
  }
  const threshold=new THREE.Mesh(geometry(DOOR.width,1.2*unit,3*unit),wood);
  threshold.position.set(0,-DOOR.height/2+.6*unit,-1.5*unit);group.add(threshold);
  const leaves=[];
  for(let i=0;i<2;i++){
    const pivot=new THREE.Group();pivot.position.set((i?1:-1)*DOOR.width/2,0,-thickness/2);group.add(pivot);
    const front=material({color:frontTint});
    const leaf=new THREE.Mesh(geometry(DOOR.width/2-.08*unit,DOOR.height,thickness),[wood,wood,wood,wood,front,innerWood]);
    leaf.position.set((i?-1:1)*DOOR.width/4,0,0);pivot.add(leaf);
    leaves.push({pivot,front});
  }
  function render(){
    if(disposed||!loaded||!lastWidth||!lastHeight)return;
    const {zoom,pan,angle,angleRight}=pose;
    // Dolly toward the door: same facade-plane projection, real depth foreshortening.
    camera.position.z=distance/zoom;
    camera.position.x=DOOR.x*(1-1/zoom)+DOOR.x*pan/zoom;
    camera.position.y=DOOR.y*(1-1/zoom)+DOOR.y*pan/zoom;
    if(pose.screenTravel!=null){
      const p=THREE.MathUtils.clamp(pose.screenTravel,0,1);
      const aim=THREE.MathUtils.smoothstep(p,.65,1);
      camera.position.set(DOOR.x*p,DOOR.y*p+(.646-.5)*DOOR.height*1.32*aim,distance+(-recess+12-distance)*p);
    }
    const inside=pose.screenTravel!=null&&camera.position.z<140;
    portalMaterial.stencilFunc=inside?THREE.AlwaysStencilFunc:THREE.EqualStencilFunc;
    vortexMaterial.stencilFunc=portalMaterial.stencilFunc;
    vortex.visible=(pose.portalOpening??0)>0;
    vortexMaterial.uniforms.opening.value=pose.portalOpening??0;
    vortexMaterial.uniforms.time.value=pose.portalTime??0;
    camera.updateProjectionMatrix();
    if(portalMaterial.map){
      // The hall and screen stay fixed. Only the perspective camera travels.
      portalMaterial.map.repeat.set(1,1);
      portalMaterial.map.offset.set(0,0);
      portalMaterial.color.setScalar(pose.interiorLight??1);
    }
    leaves[0].pivot.rotation.y=angle;
    leaves[1].pivot.rotation.y=-angleRight;
    renderer.render(scene,camera);
    canvas.dataset.doorAngle=THREE.MathUtils.radToDeg(angle).toFixed(1);
    canvas.dataset.doorAngleRight=THREE.MathUtils.radToDeg(angleRight).toFixed(1);
    canvas.dataset.doorZoom=zoom.toFixed(3);
    canvas.dataset.cameraZ=camera.position.z.toFixed(1);
    canvas.dataset.interiorScale='1';
    canvas.dataset.portalOpening=(pose.portalOpening??0).toFixed(2);
  }
  function resize(){
    const width=canvas.clientWidth,height=canvas.clientHeight;
    if(!width||!height)return;
    lastWidth=width;lastHeight=height;
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.setSize(width,height,false);camera.aspect=width/height;
    const referenceHeight=viewportArtHeight?.()||height;
    camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(35)/2)*height/referenceHeight));
    render();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const loadTexture=url=>new Promise((resolve,reject)=>new THREE.TextureLoader().load(url,texture=>{
    if(disposed){texture.dispose();resolve(null);return;}
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
    textures.push(texture);resolve(texture);
  },undefined,reject));
  Promise.all([loadTexture(textureUrl),loadTexture(interiorUrl),vortexTextureUrl?loadTexture(vortexTextureUrl):Promise.resolve(null)]).then(([source,interior,vortexTexture])=>{
    if(disposed)return;
    portalMaterial.map=interior;portalMaterial.needsUpdate=true;
    if(vortexTexture){vortexMaterial.uniforms.pattern.value=vortexTexture;vortexMaterial.uniforms.usePattern.value=1;}
    leaves.forEach(({front},i)=>{
      const texture=source.clone();texture.repeat.set(.5,1);texture.offset.x=i*.5;texture.needsUpdate=true;
      textures.push(texture);front.map=texture;front.needsUpdate=true;
    });
    loaded=true;canvas.dataset.doorRenderer='webgl';canvas.dataset.doorInterior=door===DEFAULT_DOOR?'ticket-office':'auditorium';resize();onReady?.();
  }).catch(error=>{if(!disposed)onError?.(error);});
  const lost=e=>{e.preventDefault();if(!disposed)onError?.(new Error('WebGL context lost'));};
  canvas.addEventListener('webglcontextlost',lost);
  return {
    setPose(next){pose={...pose,...next};render();return{zoom:distance/Math.max(1,camera.position.z),x:camera.position.x,y:camera.position.y,inside:pose.screenTravel!=null&&camera.position.z<140};},
    dispose(){
      disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);
      textures.forEach(t=>t.dispose());resources.forEach(r=>r.dispose());renderer.dispose();
    },
  };
}
