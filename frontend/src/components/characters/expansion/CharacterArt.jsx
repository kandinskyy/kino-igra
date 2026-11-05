import React from 'react';
import {BackHair,Hair,Headwear,FaceDetails} from './ReferenceHeads';
import {BackCostume,Wardrobe,Legs,SleeveDetail,HeldProp,Chainsaw} from './ReferenceCostumes';

const poses={walter:'hat',jesse:'fist',saul:'point',homelander:'hero',gihun:'wave',naruto:'fist',sasuke:'still',kakashi:'salute',light:'book',l:'think',luffy:'hat',zoro:'sword',gojo:'peace',levi:'salute',saitama:'fist',denji:'roar',makima:'calm',dipper:'book',mabel:'wave',rick:'portal',morty:'wave'};
const stern=new Set(['walter','homelander','sasuke','kakashi','light','levi','zoro']);
const handPositions={hat:[151,78],fist:[151,151],point:[153,153],salute:[149,113],think:[141,140],peace:[154,142],wave:[155,146],portal:[150,162],calm:[145,178]};
function Eyes({c,winning}){
  const id=c.id,serious=stern.has(id)&&!winning;
  const iris=id==='gojo'?'#73c6e3':['naruto','jesse'].includes(id)?'#73aaca':id==='makima'?'#d9ae59':null;
  const brows=id==='gihun'?'M71 91q10-5 21 0m16 0q11-5 21 0':id==='jesse'?'M72 90l19 4m18 0 19-4':serious?'M73 89l17 3m20 0 17-3':id==='morty'?'M73 92q7-8 17-5m20 0q10-4 17 5':'M73 89q8-3 17 0m20 0q9-3 17 0';
  return <g className="new-expression">
    {!['rick','saitama'].includes(id)&&<path d={brows} stroke={c.hair} strokeWidth={id==='homelander'?1.8:1.4}/>}
    <g transform={id==='gihun'?'translate(0 106) scale(1 .68) translate(0 -106)':serious||id==='jesse'?'translate(0 106) scale(1 .88) translate(0 -106)':undefined}>
      {id==='l'&&<g fill="#a29498" opacity=".35"><ellipse cx="83" cy="111" rx="16" ry="16"/><ellipse cx="117" cy="111" rx="16" ry="16"/></g>}
      <ellipse cx="84" cy="106" rx="15" ry="17" fill="#fffaf0" transform="rotate(22 84 106)"/>
      {id!=='zoro'&&<ellipse cx="116" cy="106" rx="15" ry="17" fill="#fffaf0" transform="rotate(-22 116 106)"/>}
      {[93,109].filter((_,i)=>id!=='zoro'||i===0).map((x,i)=><g key={x}>
        {iris&&<circle cx={x} cy="107" r={id==='gojo'?4.8:4} fill={iris}/>}
        {id==='makima'&&<><circle cx={x} cy="107" r="3.9" stroke="#98633c" strokeWidth=".6"/><circle cx={x} cy="107" r="2.6" stroke="#98633c" strokeWidth=".7"/></>}
        <circle cx={x} cy="107" r={['saitama','makima'].includes(id)?1.3:1.8} fill="#302c28"/>
        {iris&&id!=='makima'&&<circle cx={x-1.6} cy="105.3" r="1.1" fill="#fffaf0"/>}
        {id==='gojo'&&<path d={i===0?'M70 100q12-10 25 0':'M105 100q12-10 25 0'} stroke="#c3c8cf" strokeWidth="1.2"/>}
      </g>)}
      {id==='zoro'&&<path d="m106 108 20-3" stroke="#66513e" strokeWidth="1.7"/>}
      {['rick','saitama'].includes(id)&&<><path d="M68 99q16-8 30 0v-12H68Zm34 0q15-8 30 0v-12h-30Z" fill={c.skin}/><path d="M71 100q13-4 25 0m8 0q13-4 25 0" stroke="#9d876e" strokeWidth="1.3"/></>}
    </g>
      {id==='makima'&&<path d="m70 101-2-3m62 3 2-3" stroke="#956950" strokeWidth=".9"/>}
    {!['walter','jesse','rick','mabel','kakashi','gojo','gihun'].includes(id)&&<path d={id==='makima'?'M93 143q7 3 14-1':id==='morty'&&!winning?'M94 145q7-4 14 0':winning&&!stern.has(id)&&!['l','saitama'].includes(id)?'M90 140q10 14 20 0Z':stern.has(id)||id==='l'||id==='saitama'?'M93 143h14':'M94 143q6 3 12 0'} stroke="#6b4d3b" strokeWidth="1.2" fill={winning&&!stern.has(id)&&!['l','saitama','makima'].includes(id)?'#996450':'none'}/>}
  </g>;
}

export default function ExpansionArt({character:c,portrait=false,celebrate=false}){
  const id=c.id,winning=celebrate,action=winning?poses[id]:'idle';
  const right=winning?(handPositions[action]||[147,184]):[147,184];
  const left=winning&&['fist','roar'].includes(action)?[47,153]:[53,184];
  const sleeve=['dipper'].includes(id)?c.skin:id==='naruto'?'#343b40':id==='sasuke'?'#a7a8b1':c.cloth;
  const hands=id==='homelander'||id==='saitama'?'#a64d47':id==='kakashi'?'#343f48':c.skin;
  function arm(side,front=false){
    const [x,y]=side==='left'?left:right,shoulder=side==='left'?66:134;
    return <g className={`new-arm new-arm-${side}`}>
      {!front&&<path d={`M${shoulder} 154Q${side==='left'?48:153} 165 ${x} ${y}`} stroke={sleeve} strokeWidth="18" strokeLinecap="round"/>}
      {front&&<>
        <HeldProp id={id} side={side} x={x} y={y}/>
        <ellipse cx={x} cy={y} rx="9.5" ry="8.5" fill={hands}/>
        <SleeveDetail id={id} side={side} x={x} y={y}/>
        {winning&&action==='peace'&&side==='right'&&<path d={`m${x-4} ${y-5}-3-12m10 12 4-12`} stroke={hands} strokeWidth="5"/>}
        {winning&&action==='point'&&side==='right'&&<path d={`m${x+1} ${y-4} 0-14`} stroke={hands} strokeWidth="5"/>}
        {id==='denji'&&<Chainsaw arm side={side} x={x} y={y}/>}
      </>}
    </g>;
  }
  const view=portrait?(id==='rick'?'22 17 156 153':id==='denji'?'25 23 173 147':id==='gojo'?'25 17 150 155':'30 20 140 150'):'0 0 200 240';
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={view} className={`expansion-art ${portrait?'new-portrait':'new-full'} ${winning?'new-victory':''}`} data-character={id} data-action={action} role="img" aria-label={c.name} fill="none">
    <g className="new-rig" strokeLinecap="round" strokeLinejoin="round">
      {!portrait&&<><BackCostume id={id}/><Legs id={id} skin={c.skin}/>{arm('left')}{arm('right')}</>}
      <BackHair c={c}/>
      <path d="M64 147Q100 138 136 147Q148 159 154 195Q100 203 46 195Q52 159 64 147Z" fill={c.cloth}/>
      <Wardrobe c={c}/>
      <g className="new-head">
        {id!=='denji'&&<circle cx="100" cy="104" r="58" fill={c.skin}/>}
        {id!=='denji'&&<Eyes c={c} winning={winning}/>}
        <Hair c={c}/>
        <FaceDetails c={c} winning={winning}/>
        <Headwear c={c}/>
        {id==='denji'&&<Chainsaw/>}
      </g>
      {!portrait&&<>{arm('left',true)}{arm('right',true)}</>}
    </g>
  </svg>;
}
