import CartoonCharacter from './CartoonCharacter';
import {BackHair, FrontHair, FaceUnderlay, FaceDetails} from './CastHead';
import FacialHair from './CastFacialHair';
import {CostumeBack, CostumeBody, HandProp} from './CastWardrobe';
import {characterPose} from './acting';
import {BodyFinish,SleeveFinish,ShoeFinish} from './CostumeFinish';

const portraits = {loki:'28 0 144 165',batman:'30 13 140 153',chaplin:'30 17 140 151',pirate:'27 16 146 154',vader:'25 22 150 145',sherlock:'29 17 142 151',thor:'27 22 146 146',thanos:'26 16 148 154',forrest:'31 23 138 146',captain:'31 25 138 143'};
const stern = new Set(['matrix','terminator','bill','batman','wick','toretto','jason','vader','thanos','hulk']);
const playful = new Set(['fight','pirate','joker','loki','wolf','bateman']);

function Palm({x,y,color}) {
  return <g transform={`translate(${x} ${y})`} fill={color} stroke={color} strokeLinecap="round">
    <ellipse rx="7.5" ry="8.5" stroke="none"/>
    <path d="M-5-4v-10M0-6v-11M5-4v-10M-6 2-12-3" strokeWidth="4"/>
  </g>;
}

export default function FilmCharacter({character,portrait=false,mood='character',motion=false}) {
  const c=character, id=c.id, winning=mood==='victory';
  if(id==='wizard'||id==='dune') return <CartoonCharacter type={id} portrait={portrait} emotion={mood} motion={motion}/>;
  const pose=characterPose(id,winning);
  const frontLeft=winning&&pose.action==='applause';
  const frontRight=winning&&['salute','headphone','inspect','chest','applause'].includes(pose.action);
  const gloved=['captain','iron','widow','jason','spider','batman','vader','jedi'].includes(id);
  const hands=gloved?(id==='iron'?'#b24a3d':id==='spider'?'#b64750':id==='captain'?'#9d4446':'#343b40'):c.skin;
  const sleeve=['toretto','thanos'].includes(id)?c.skin:c.cloth;
  const strong=id==='hulk'||id==='thanos', armWidth=strong?22:18, handRadius=strong?11:9.5;
  const severe=stern.has(id), sly=playful.has(id), masked=['vader','jason','iron','captain','bateman','thanos'].includes(id);
  let brows=severe?'M73 87l17 5m20 0 17-5':sly?'M73 87q8-6 17-3m20 5 17-1':'M73 87q8-3 17-1m20 0q9-3 17 0';
  if(id==='toretto') brows='M73 89q7-2 16 1m22 0q9-3 16-1';
  if(id==='thanos') brows='M71 88q12-5 23 4m12 0q11-9 23-4';
  if(id==='hulk') brows='M70 87l22 6m16 0 22-6';
  let mouth=id==='joker'?'M83 140q17 13 34-1':winning?(severe?'M93 143q8 3 15-1':'M91 140q9 12 18 0Z'):sly?'M92 143q10 4 18-3':severe?'M93 143h14':'M94 143q6 3 12 0';
  if(id==='thor') mouth=winning?'M93 141q7 4 14-1':'M94 141q6 2 12 0';
  if(id==='wick') mouth=winning?'M94 141q6 2 12-1':'M94 141h12';
  if(id==='pirate') mouth=winning?'M92 144q10 4 17-2':'M93 144q8 2 14-1';
  if(id==='toretto') mouth=winning?'M91 142q10 5 18-1':'M93 143q8 1 14-1';
  if(id==='thanos') mouth=winning?'M91 140q9 3 18-2':'M92 141h16';
  if(id==='hulk'&&winning) mouth='M86 135q14 17 28 0Z';
  const drawnSmile=winning&&!severe&&!sly&&id!=='thor';
  const armControl=(side)=>{
    const left=side==='left', [,y]=left?pose.left:pose.right, raised=y<180;
    if(id==='spider') return left?[54,164]:winning?[151,182]:[146,164];
    return [left?(raised?42:54):(raised?158:146),raised?179:164];
  };
  const armPath=(side)=>{
    const [x,y]=side==='left'?pose.left:pose.right, [ex,ey]=armControl(side);
    return `M${side==='left'?66:134} 154Q${ex} ${ey} ${x} ${y}`;
  };
  const arm=(side)=><path d={armPath(side)} stroke={sleeve} strokeWidth={armWidth}/>;
  const hand=(side)=>{
    const [x,y]=side==='left'?pose.left:pose.right;
    const handColor=id==='jedi'&&side==='left'?c.skin:hands;
    const propInFront=['captain','forrest','thanos','bateman','fight','brother','pirate'].includes(id);
    const control=armControl(side),wristAngle=Math.atan2(y-control[1],x-control[0])*180/Math.PI+90;
    const prop=<HandProp id={id} side={side} x={x} y={y} winning={winning} handColor={handColor} wristAngle={wristAngle}/>;
    const palm=winning&&((id==='matrix'&&side==='right')||(id==='vader'&&side==='left')||(id==='iron'&&side==='right'));
    const frontForearm=side==='left'?frontLeft:frontRight;
    return <g className={`cast-arm-${side}`}>
      {frontForearm&&<path d={armPath(side)} stroke={sleeve} strokeWidth={armWidth}/>}
      {!propInFront&&prop}
      {frontForearm&&<SleeveFinish id={id} x={x} y={y} control={armControl(side)} side={side}/>}
      {palm?<Palm x={x} y={y} color={handColor}/>:<ellipse cx={x} cy={y} rx={handRadius} ry={strong?9.5:8.5} fill={handColor}/>}
      {id==='hulk'&&<path d={`M${x-5} ${y-2}q5-3 10 0`} stroke="#6e974e" strokeWidth="1.2"/>}
      {winning&&id==='terminator'&&side==='right'&&<path d={`M${x-3} ${y-3}q-2-13 3-14 4 0 3 13`} fill={hands}/>}
      {winning&&id==='spider'&&side==='right'&&<path d={`M${x-7} ${y-3}l-2-10m16 10 2-10`} stroke={hands} strokeWidth="5"/>}
      {propInFront&&prop}
      {id==='iron'&&side==='right'&&winning&&<circle cx={x} cy={y} r="4.2" fill="#d2f4ee" stroke="#e5be76" strokeWidth="1.2"/>}
    </g>;
  };
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={portrait?(portraits[id]||'36 27 128 143'):'0 0 200 240'} className={`film-character ${portrait?'film-portrait':'film-full'} ${motion?'film-animated':'film-static'}`} data-character={id} data-gesture={c.gesture} data-action={pose.action} data-mood={mood} role="img" aria-label={`${c.name} — ${winning?'Победа':'Характер'}`} fill="none" style={{'--motion-period':`${5.6+(id.length%5)*.65}s`}}>
    <g transform={pose.body?`rotate(${pose.body} 100 211)`:undefined}>
    <g className="cast-rig" strokeLinecap="round" strokeLinejoin="round">
      {!portrait&&<>
        <g className="cast-cape"><CostumeBack id={id}/></g>
        <path d="M59 192h82v17H59Z" fill={id==='hulk'?'#67547e':id==='iron'?'#78352f':id==='batman'?'#2c3842':id==='thanos'?'#303b50':id==='chaplin'?'#565154':id==='marty'?'#658698':id==='bill'?'#dfbd44':id==='forrest'?'#afa895':id==='spider'?'#3d5777':id==='sherlock'?'#5c574d':id==='toretto'?'#343638':'#3b4145'}/>
        <path d="M98 199v10" stroke="#24292b" strokeWidth="1"/>
        <path d={id==='chaplin'?'M55 207q21-7 43 0v5H44q-1-3 11-5Zm47 0q22-7 43 0 12 2 11 5h-54Z':'M57 207q22-6 41 0v4H53q-1-2 4-4Zm45 0q19-6 41 0 5 2 4 4h-45Z'} fill={['marty','forrest'].includes(id)?'#dddace':id==='hulk'?c.skin:id==='bill'?'#e2c14b':['captain','spider','iron'].includes(id)?'#994745':'#202526'}/>
        <ShoeFinish id={id}/>
        {id==='marty'&&<path d="M59 207h31m20 0h31" stroke="#b75948" strokeWidth="2"/>}
        {!frontLeft&&<g className="cast-arm-left">{arm('left')}<SleeveFinish id={id} x={pose.left[0]} y={pose.left[1]} control={armControl('left')} side="left"/></g>}
        {!frontRight&&<g className="cast-arm-right">{arm('right')}<SleeveFinish id={id} x={pose.right[0]} y={pose.right[1]} control={armControl('right')} side="right"/></g>}
        {id==='bill'&&<><g className="cast-arm-left"><path d={armPath('left')} transform="translate(-4 0)" stroke="#303735" strokeWidth="2"/></g><g className="cast-arm-right"><path d={armPath('right')} transform="translate(4 0)" stroke="#303735" strokeWidth="2"/></g></>}
      </>}
      {!['iron','batman','thanos'].includes(id)&&<path data-part="base-torso" d="M64 147Q100 138 136 147Q148 159 154 195Q100 203 46 195Q52 159 64 147Z" fill={id==='toretto'?c.skin:c.cloth}/>}
      <CostumeBody id={id} cloth={c.cloth}/>
      <BodyFinish id={id}/>
      <g transform={pose.head?`rotate(${pose.head} 100 158)`:undefined}>
      <g className="cast-head">
        <BackHair id={id} hair={c.hair}/>
        {['iron','captain'].includes(id)?null:id==='bateman'?<path d="M42 99C42 67 68 46 100 46s58 21 58 53l-5 27q-5 15-23 27l-15 7q-15 6-30 0l-15-7q-18-12-23-27Z" fill={c.skin}/>:id==='thanos'?<path d="M42 98q0-53 58-53t58 53l-5 31q-7 30-36 34H83q-29-4-36-34Z" fill={c.skin}/>:<circle cx="100" cy="104" r="58" fill={id==='vader'?'#2b3037':id==='jason'?'#d7ceb1':c.skin}/>}
        <FrontHair id={id} hair={c.hair}/>
        <FaceUnderlay id={id}/>
        <FacialHair id={id}/>
        {!masked&&<g className="cast-expression">
          <path d={brows} stroke={id==='joker'?'#555644':id==='thanos'?'#756187':c.hair} strokeWidth={id==='thanos'?3:severe||id==='hulk'?2:1.4}/>
          <g transform={`translate(0 106) scale(1 ${severe?.86:1}) translate(0 -106)`}>
            <g fill="#fffaf0"><ellipse cx="84" cy="106" rx={id==='joker'?12.5:15} ry={id==='joker'?13.5:17} transform="rotate(22 84 106)"/><ellipse cx="116" cy="106" rx={id==='joker'?12.5:15} ry={id==='joker'?13.5:17} transform="rotate(-22 116 106)"/></g>
            {id==='pirate'&&<g stroke="#534030" strokeWidth="1.65"><path d="M70 112C74 126 94 126 98 112" transform="rotate(22 84 106)"/><path d="M102 112C106 126 126 126 130 112" transform="rotate(-22 116 106)"/></g>}
            <circle cx={sly?95:93} cy="107" r="1.9" fill="#272420"/><circle cx={sly?111:109} cy="107" r="1.9" fill="#272420"/>
          </g>
          {id!=='joker'&&<path d={mouth} stroke="#47342d" strokeWidth="1.2" fill={drawnSmile||(id==='hulk'&&winning)?'#88604c':'none'}/>}
          {drawnSmile&&<path d="M95 141h10" stroke="#fff3df" strokeWidth="1.5"/>}
          {id==='hulk'&&winning&&<path d="M90 137h20" stroke="#eef1ce" strokeWidth="3"/>}
        </g>}
        <FaceDetails id={id} skin={c.skin} winning={winning}/>
      </g>
      </g>
      {!portrait&&<>{hand('left')}{hand('right')}</>}
    </g>
    </g>
  </svg>;
}
