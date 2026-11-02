import {expressions} from './emotions';
import {BodyFinish,ShoeFinish} from './CostumeFinish';
// LOCAL STUDY 04. Reference coordinates mapped by (-12,-110).
// Reference: head (112,214), radius 58; eyes y216; hands y294; feet y321.
export default function CartoonCharacter({type='wizard',portrait=false,celebrate=false,emotion='character',motion=true}) {
 const harry=type==='wizard',skin=harry?'#f1cba7':'#edc6a5',ink='#302823',cloth=harry?'#34323a':'#8f8166';
 const mood=celebrate?'victory':emotion;
 const face=expressions[type]?.[mood]||expressions.wizard.character;
 const winning=mood==='victory';
 const leftRaised=winning&&harry,rightRaised=winning;
 const lx=leftRaised?37:54,ly=leftRaised?158:184;
 const rx=rightRaised?(harry?163:146):146,ry=rightRaised?(harry?158:174):184;
 const pupilX=face.look[0],pupilY=face.look[1];
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox={portrait?'36 27 128 143':'0 0 200 240'} className={`cartoon-character motion-${harry?'harry':'paul'} ${portrait?'motion-portrait':'motion-full'} ${motion?'motion-running':'motion-paused'}`} data-pose={winning?'victory':'character'} role="img" aria-label={`${harry?'Гарри Поттер':'Пол Атрейдес'} — ${face.title}`} fill="none">
 <g key={`${type}-${winning}`} className="motion-rig" strokeLinecap="round" strokeLinejoin="round">
 {!portrait&&<>
  <path d="M59 192h82v17H59Z" fill={harry?'#4e4d57':'#3d4941'}/>
  <path d="M98 199v10" stroke="#272928" strokeWidth="1"/>
  <path d="M57 207q22-6 41 0v4H53q-1-2 4-4Zm45 0q19-6 41 0 5 2 4 4h-45Z" fill="#171919"/>
  <ShoeFinish id={type}/>
  <g className="motion-arm-left"><path d={leftRaised?'M66 154Q49 175 37 157':'M66 154Q54 164 54 184'} stroke={cloth} strokeWidth="18"/></g>
  <g className="motion-arm-right"><path d={rightRaised?`M134 154Q151 175 ${rx} ${ry}`:'M134 154Q146 164 146 184'} stroke={cloth} strokeWidth="18"/></g>
 </>}
 <path d="M64 147Q100 138 136 147Q148 159 154 195Q100 203 46 195Q52 159 64 147Z" fill={cloth}/>
 <g transform="translate(15 73) scale(.85 .62)">
 {harry?<>
  <path d="M77 142h46l7 57H70Z" fill="#89858b"/>
  <path d="m81 141 19 10 19-10-6 15-13-5-13 5Z" fill="#eee8df"/>
  <path d="m97 152 6 0 4 27-7 5-7-5Z" fill="#843941"/>
  <path d="m95 161 9 4m-9 4 10 5" stroke="#d1ac54" strokeWidth="3"/>
  <path d="M57 140 77 139 72 169 63 205H43Zm86 0-20-1 5 30 9 36h20Z" fill="#33323a"/>
  <path d="m75 145-10 12 8 5-13 28m65-45 10 12-8 5 13 28" stroke="#56515b" strokeWidth="1.3"/>
  <path d="m65 164 10 1-1 11-5 4-5-4Z" fill="#c6a55a" stroke="#776746" strokeWidth=".8"/>
  <path d="m67 167 6 1-1 6-3 3-3-3Z" fill="#963f40"/>
  <path d="m68 169 3 1-1 3 2 1-3 1-1-3Z" fill="#dfbc67"/>
  <path d="m77 193 45 0m-43 4h41" stroke="#65636e" strokeWidth="1"/>
  <path d="M70 137Q100 146 130 137v13q-30 12-60 0Z" fill="#8c3543"/>
  <path d="m79 140-1 13m13-11v13m14-12 1 12m12-14 2 12" stroke="#d8b358" strokeWidth="6"/>
  <path d="M111 151h15v42l-4-3-4 3-3-3-4 3Z" fill="#8c3543"/>
  <path d="M111 160h15m-15 12h15m-15 12h15" stroke="#d8b358" strokeWidth="5"/>
  <path d="m114 190v6m4-4v5m4-6v5" stroke="#8c3543" strokeWidth="1.5"/>
  <circle cx="132" cy="171" r="1.8" fill="#a6a0a0"/><circle cx="135" cy="185" r="1.8" fill="#a6a0a0"/>
 </>:<>
  <path d="M69 140h62l8 62H61Z" fill="#3d4d47"/>
  <path d="M89 143h22v43H89Z" fill="#293a39"/>
  <path d="m75 148 12 4-1 8-12-4Zm50 0-12 4 1 8 12-4Z" fill="#6d7c6e"/>
  <path d="m74 164 13 3m26 0 13-3m-53 10 14 3m26 0 14-3m-54 10 14 3m26 0 14-3" stroke="#83917e" strokeWidth="4.2"/>
  <path d="M89 144Q80 161 91 192m20-48q9 17-2 48" stroke="#263a37" strokeWidth="4"/>
  <path d="M95 145h10v7H95Zm0 13h10v8H95Z" fill="#6b8179"/>
  <circle cx="100" cy="148" r="1.5" fill="#b4b6a0"/><circle cx="100" cy="162" r="1.5" fill="#b4b6a0"/>
  <path d="M57 140 70 141 68 176 54 205H43Zm86 0-13 1 2 35 14 29h11Z" fill="#8f8166"/>
  <path d="m62 152-8 35m84-35 8 35" stroke="#b3a381" strokeWidth="1.3"/>
  <path d="M64 136Q100 149 136 136l1 13q-37 18-74 0Z" fill="#b0a17f"/>
  <path d="M70 145q31 13 60 0" stroke="#8f8266" strokeWidth="1.5"/>
  <path d="M69 191h62v10H69Z" fill="#293b36"/><rect x="95" y="191" width="10" height="8" rx="1" fill="#b6ad89"/>
  <rect x="73" y="187" width="13" height="16" rx="2" fill="#5f6c58" stroke="#293b36" strokeWidth="1.2"/><path d="M74 193h10" stroke="#9c9e82"/>
  <path d="m126 185 8-10 6 4-4 23-10-1Z" fill="#555e4e" stroke="#313f37" strokeWidth="1.1"/><path d="m131 182 4 2-3 12" stroke="#a1a288" strokeWidth="1.5"/>
 </>}

 </g>
 <BodyFinish id={type}/>
 {!portrait&&<>
  <g className="motion-arm-left"><ellipse cx={lx} cy={ly} rx="9.5" ry="8.5" fill={skin}/>
  <path d={`M${lx+6} ${ly-3}q-7-4-9 3`} stroke="#d5aa88" strokeWidth=".6"/></g>
  <g className="motion-arm-right">{harry&&<path d={`M${rx+3} ${ry+4}l10-36`} stroke="#805739" strokeWidth="2.5"/>}<ellipse cx={rx} cy={ry} rx="9.5" ry="8.5" fill={skin}/>{harry&&<path d={`M${rx+6} ${ry-8}l7-24`} stroke="#a47d51" strokeWidth="1.4"/>}</g>
 </>}
 <g className="motion-head">
 {!harry&&<path d="M45 107C31 86 38 58 57 47Q81 28 102 37q33-11 54 25 8 25-2 48l7 39-17-4-10-25-66 0-9 26-17 0Z" fill="#352c27"/>}
 <circle cx="100" cy="104" r="58" fill={skin}/>
 {harry?<>
  <path d="M43 100C37 81 42 58 60 48L56 38 73 42 87 32 98 39 116 34 122 43C145 43 159 66 157 93L149 83 143 70 131 81 122 67 111 80 99 70 86 82 77 71 65 85 58 80 50 101Z" fill="#272420"/>
  <path d="m109 80-4 5 5-1-3 6" stroke="#b67c69" strokeWidth="1.35"/>
 </>:<>
  <path d="M43 103C32 82 40 56 60 45Q82 28 102 39q26-11 44 16 15 19 12 44l-9-5-6-18q-14 7-28-16-6 19-29 25l-14-4-9 13-6-7-7 18Z" fill="#352c27"/>

 </>}
 <g className="character-expression" data-emotion={mood}>
 <path d={face.brows} stroke={harry?'#49392c':'#47362e'} strokeWidth={harry?1.25:1.65}/>
 {face.closed?<g stroke="#37302b" strokeWidth="1.8"><path d="M77 108q7-9 14 0M109 108q7-9 14 0"/></g>:<g transform={`translate(0 106) scale(1 ${face.eyeScale}) translate(0 -106)`}>
  <g fill={harry?'#fffefa':'#ecf4f1'}><ellipse cx="84" cy="106" rx="15" ry="17" transform="rotate(22 84 106)"/><ellipse cx="116" cy="106" rx="15" ry="17" transform="rotate(-22 116 106)"/></g>
  {!harry&&<><circle cx={93+pupilX} cy={107+pupilY} r="4.1" fill="#479bb3"/><circle cx={109+pupilX} cy={107+pupilY} r="4.1" fill="#479bb3"/></>}
  <circle cx={93+pupilX} cy={107+pupilY} r={mood==='surprised'?1.6:1.9} fill="#26201c"/><circle cx={109+pupilX} cy={107+pupilY} r={mood==='surprised'?1.6:1.9} fill="#26201c"/>
 </g>}
 <path d={face.mouth} stroke={ink} strokeWidth="1.1" fill={face.open?'#775146':'none'}/>
 {harry&&winning&&<path d="M95 139h10l-1 2h-8Z" fill="#fff1de"/>}
 </g>
 {harry&&<g stroke="#35302b" strokeWidth="1.3"><ellipse cx="84" cy="106" rx="16" ry="18.5" transform="rotate(22 84 106)"/><ellipse cx="116" cy="106" rx="16" ry="18.5" transform="rotate(-22 116 106)"/><path d="M99 102h2M68 101l-13-6m77 6 13-6"/></g>}
 {!harry&&<><path d="M122 139q17-3 17 19v5" stroke="#3c5145" strokeWidth="2.5"/><path d="m122 139-5 1" stroke="#475c50" strokeWidth="2.8"/></>}
 </g>
 </g></svg>;
}
