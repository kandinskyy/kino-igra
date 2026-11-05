import React from 'react';

export function BackCostume({id}){
  if(id==='levi')return <path d="M63 143Q42 161 35 207l29-7 20 5 18-9 17 9 24-7 22 10q-11-53-29-65Z" fill="#465f4d"/>;
  if(id==='saitama')return <g><path d="M64 145q-17 19-24 61l22-4 18 5 21-9 19 9 21-4 21 4q-8-47-26-62Z" fill="#e1e0d6"/><path d="m61 164-11 34m87-33 13 33" stroke="#bdbfb9" strokeWidth="1.5"/></g>;
  if(id==='homelander')return <g><path d="M64 145q-15 18-25 62l24-6 22 6 17-7 18 6 23-5 22 7q-9-44-29-63Z" fill="#a64948"/><path d="m53 166-9 34m18-32-7 31m84-33 12 35m-19-29 10 27" stroke="#ddd7c1" strokeWidth="5"/><path d="m56 150-13 22h34l7-27Z" fill="#304566"/>{[[55,158],[63,160],[51,167],[69,166]].map(([x,y])=><path key={x+y} d={`m${x} ${y} 1 3 3 0-2 2 1 3-3-2-2 2 0-3-2-2 3 0Z`} fill="#e5dec8"/>)}</g>;
  if(id==='sasuke')return <g transform="rotate(12 146 186)"><path d="M146 167v48" stroke="#536074" strokeWidth="6"/><path d="M146 149v19" stroke="#3b3e48" strokeWidth="5"/><path d="M140 167h12" stroke="#b7ac91" strokeWidth="2.5"/><path d="m144 153 4 3m-4 3 4 3" stroke="#a19ca7" strokeWidth="1.2"/></g>;
  if(id==='zoro')return <g>{[0,1,2].map(i=><g key={i} transform={`rotate(${-24+i*13} 145 185)`}><path d="M145 173v44" stroke={['#eee3ca','#554d60','#a76a5c'][i]} strokeWidth="5"/><path d="M145 153v20" stroke={i===1?'#e0d0ac':'#39383d'} strokeWidth="5"/><path d="M138 173h14" stroke="#c6aa60" strokeWidth="3"/>{[157,163,169].map(y=><path key={y} d={`m143 ${y} 4 3`} stroke={i===1?'#9e8c72':'#c9ba94'} strokeWidth="1.3"/>)}</g>)}</g>;
  return null;
}

const shirt=<path d="m83 147 17 10 17-10-2 49H85Z" fill="#ece7d9"/>;
const lapels=<path d="m79 147-10 14 14 7-9 26m47-47 10 14-14 7 9 26" stroke="#ffffff" strokeOpacity=".17" strokeWidth="1.2"/>;
function Tie({fill='#9d4c47'}){return <path d="m97 155 6 0 4 28-7 8-7-8Z" fill={fill}/>;}
function Eagle({x,flip=false}){return <g transform={`translate(${x} 150) scale(${flip?-1:1} 1)`}><path d="m-11 1 10-8 9 2 7 9-12 5-7-5-8 1Z" fill="#bb9c5a"/><path d="m-8 0 8 0 4 5m-10-7 8 0 5 6m-8-9 7 1 5 6" stroke="#e0c67c" strokeWidth="1.2"/><path d="m1-5 5-1 2 3-5 1Z" fill="#ddc17b"/></g>;}
export function Wardrobe({c}){
  const id=c.id;
  if(['walter','saul','light','rick'].includes(id))return <g>{shirt}{lapels}
    {id==='walter'&&<><path d="m82 149 18 10 18-10-2 47H84Z" fill="#687451"/><path d="m86 150 14 11 14-11m-13 12v34" stroke="#394932" strokeWidth="1.2"/>{[88,93,107,112].map(x=><path key={x} d={`M${x} 160v34`} stroke="#8a9170" strokeWidth=".8"/>)}<path d="m70 161 7 30m53-30-7 30" stroke="#55534a" strokeWidth="1.3"/><path d="M100 167v28" stroke="#333c2e" strokeWidth="1"/>{[170,179,188].map(y=><circle key={y} cx="104" cy={y} r="1" fill="#b0ae89"/>)}</>}
    {id==='saul'&&<><path d="m83 147 17 10 17-10v49H83Z" fill="#c57e91"/><Tie fill="#7d653a"/><path d="m96 163 8 5-9 4 11 6-11 4" stroke="#b8a16c" strokeWidth="2"/><path d="m124 163 5-7 5 7 6-5 0 8Z" fill="#dcc16f"/><path d="M122 168h19" stroke="#252f2d" strokeWidth="1.2"/><path d="m72 151 3 4 3-4-3-2Z" fill="#bca36c"/></>}
    {id==='light'&&<><Tie/><path d="M124 166h15m-38 21v9" stroke="#8e795e" strokeWidth="1.2"/><path d="m61 191 16-3m62 3-16-3" stroke="#a18a6d" strokeWidth="1"/></>}
    {id==='rick'&&<><path d="m84 147 16 9 16-9v49H84Z" fill="#91bfbb"/><path d="M63 166h14v15H63m61-12h14v14h-14" stroke="#acb2ac" strokeWidth="1.2"/><path d="m66 162 1 10m5-10v10" stroke="#8298a8" strokeWidth="1.7"/><path d="M64 193h15m42 0h15" stroke="#bfc3b9" strokeWidth="1"/></>}
  </g>;
  if(id==='jesse')return <g><path d="m80 147 20 10 20-10-4 49H84Z" fill="#282d2d"/><path d="M70 147q-7 3-9 12l16 7 7-15m46-4q7 3 9 12l-16 7-7-15" fill="#c5a32c"/><path d="M81 154 75 195m44-41 6 41" stroke="#eee1b1" strokeWidth="2"/><path d="m71 159-5 24m64-24 5 24" stroke="#e9db97" strokeWidth="1.2"/><path d="M94 167q6-6 12 0l2 10-4 4v7h-8v-7l-4-4Z" fill="#c7cfca"/><path d="m95 173 4-2-1 5-4-1m8-4 4 2 1 2-5 1m-4 4 2-2 2 2m-5 5h7" stroke="#282d2d" strokeWidth="1.3"/><path d="M53 193h26m43 0h25" stroke="#303433" strokeWidth="5"/></g>;
  if(id==='levi')return <g><path d="M83 148h34v48H83Z" fill="#e8e2d4"/><path d="m85 148 15 9 15-9-8 25-7-8-7 8Z" fill="#f5eee1"/><path d="m83 165 8 30m27-30-9 30" stroke="#4e4941" strokeWidth="3.4"/><path d="M59 188h83" stroke="#4a463f" strokeWidth="5"/><rect x="96" y="185" width="11" height="8" rx="1" fill="#9a9586"/><path d="M63 143q35 16 75-2l15 27q-27 10-53 0-27-5-44 3Z" fill="#526f55"/><path d="M65 151q35 13 71-1m-50 6 11 9m21-12 13 9" stroke="#789072" strokeWidth="1.3"/><path d="m55 169 15 10m74-10-14 10" stroke="#5b5548" strokeWidth="1.2"/>{[44,143].map(x=><g key={x}><path d={`M${x} 185h13l-1 23h-14Z`} fill="#787e77" stroke="#363e3d" strokeWidth="1"/><path d={`m${x+3} 188-1 16m5-16-1 16`} stroke="#b1b1a1" strokeWidth="1"/></g>)}</g>;
  if(id==='luffy')return <g><path d="M82 146q18 13 36 0v48H82Z" fill="#e3ac81"/><path d="M72 146h16l-9 49H51Zm56 0h-16l9 49h28Z" fill="#b64b42"/><path d="m90 166 20 20m0-20-20 20" stroke="#af7054" strokeWidth="2.6"/><path d="m89 171 6 0m10 10 6 0m-6-11 6 0m-21 11 5 0" stroke="#c38b65" strokeWidth="1.3"/>{[165,177,189].map(y=><circle key={y} cx="123" cy={y} r="2.1" fill="#d9b65b"/>)}<path d="M56 189h88v10H56Z" fill="#dabc54"/><path d="m61 192 75 0m-70 4h65" stroke="#b69a42" strokeWidth="1"/><path d="M125 194h13l-4 23-6-3-6 3Z" fill="#dfbf5a"/></g>;
  if(id==='zoro')return <g><path d="m78 147 22 15 22-15-6 32H85Z" fill="#dcb38b"/><path d="M120 149 85 176m27-22 5 5m-13 0 5 5m-12 0 5 5m-12-1 5 5" stroke="#9e7359" strokeWidth="1.1"/><path d="m75 148 9 37m42-37-10 37" stroke="#355044" strokeWidth="2"/><path d="M60 175h80v17H60Z" fill="#91a95f"/>{[67,76,85,94,103,112,121,130].map(x=><path key={x} d={`M${x} 176v15`} stroke="#6b874c" strokeWidth="1"/>)}<path d="M54 188q45 8 90-1v12q-47 8-90-1Z" fill="#8e4b66"/><path d="m60 192 77-2m-72 7 70-2" stroke="#b07184" strokeWidth="1.2"/></g>;
  if(id==='sasuke')return <g><path d="m77 145 23 19 23-19-6 34H84Z" fill="#d7b197"/><path d="m66 145 8-20 26 39-13-4-11 13Zm68 0-8-20-26 39 13-4 11 13Z" fill="#b7b6be"/><path d="m73 132 25 30m29-30-25 30" stroke="#838894" strokeWidth="1.3"/><path d="M58 185h85v15H58Z" fill="#474856"/><path d="M54 188q46-9 91 0m-91 5q46-9 91 0" stroke="#9e88ac" strokeWidth="6"/>{[57,65,73,81,89,97,105,113,121,129,137].map(x=><path key={x} d={`m${x} 184 3 11`} stroke="#6e5e83" strokeWidth="1.5"/>)}<path d="M123 188q-13-14-17-2 0 9 17 5 17 7 15-6-2-10-15 3m0 4-8 23m9-23 9 23" stroke="#9c86aa" strokeWidth="5"/><path d="m117 207 5 2m6-2 5-2" stroke="#6f5a83" strokeWidth="1.4"/></g>;
  if(id==='naruto')return <g><path d="M62 145h76l6 28H56Z" fill="#343b40"/><path d="M72 147v22m56-22v22" stroke="#252d33" strokeWidth="1.4"/><path d="M100 149v45" stroke="#9daba9" strokeWidth="1.9"/><path d="m100 169 0 6" stroke="#d3d9cb" strokeWidth="3"/><path d="M59 191h82" stroke="#af6437" strokeWidth="1.2"/><path d="M125 177h11v10h-11" stroke="#b16c3d" strokeWidth="1"/></g>;
  if(id==='kakashi')return <g><path d="m69 146 15 8 1 42H59Zm62 0-15 8-1 42h26Z" fill="#6b7865"/><path d="M89 149h22v45H89Z" fill="#3b454c"/><path d="M100 150v44" stroke="#aab0a2" strokeWidth="1.5"/>{[64,119].map(x=><g key={x}><rect x={x} y="162" width="17" height="13" rx="2" stroke="#455848" strokeWidth="1.2"/><rect x={x} y="179" width="17" height="13" rx="2" stroke="#455848" strokeWidth="1.2"/></g>)}<path d="m74 149 6 7m46-7-6 7" stroke="#9aa287" strokeWidth="1.4"/></g>;
  if(id==='saitama')return <g><path d="M100 149v43" stroke="#ebe6d8" strokeWidth="2.4"/><rect x="97" y="154" width="6" height="5" rx="1" fill="#b3b6ac"/><path d="M80 147q20 12 40 0" stroke="#e8e8dd" strokeWidth="5"/><circle cx="80" cy="151" r="4.5" fill="#676e70"/><circle cx="120" cy="151" r="4.5" fill="#676e70"/><path d="M56 185h88v10H56Z" fill="#565047"/><circle cx="100" cy="190" r="7" fill="#c2a453" stroke="#e1c977" strokeWidth="1.4"/></g>;
  if(id==='homelander')return <g><Eagle x={68}/><Eagle x={132} flip/><path d="m85 147 15 7 15-7m-44 14 16 6 3 16m39-22-16 6-3 16" stroke="#a55350" strokeWidth="1.7"/><path d="M101 155v29m-34-10 17 13m50-13-17 13" stroke="#4f6278" strokeWidth="1.1"/><path d="M58 187h86v9H58Z" fill="#ab8e52"/><path d="m94 187 7-3 7 3v10H94Z" fill="#d2b76d"/><path d="m99 188 5 2-5 5Z" fill="#927745"/></g>;
  if(id==='gihun')return <g><path d="m83 147 17 13 17-13v48H83Z" fill="#e3e2d7"/><path d="M66 149v43m68-43v43" stroke="#e8e6da" strokeWidth="3.4"/><path d="M100 160v35" stroke="#a8b4a7" strokeWidth="1.2"/><rect x="115" y="163" width="24" height="13" rx="1" fill="#2c6453"/><text x="127" y="172.5" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="8" fill="#eef0e2">456</text><path d="m60 184 17-2m63 2-17-2" stroke="#1f5a49" strokeWidth="1.2"/></g>;
  if(id==='dipper')return <g><path d="M82 148h36v48H82Z" fill="#ca765c"/><path d="m66 147 17 1-6 48H51Zm68 0-17 1 6 48h26Z" fill="#303d47"/><path d="M74 159v30m52-30v30" stroke="#51606a" strokeWidth="1.3"/></g>;
  if(id==='mabel')return <g><path d="M79 148q21 12 42 0M54 193q46 8 92 0" stroke="#ab3b6a" strokeWidth="3"/><path d="m72 172 39 4-37 10Z" fill="#e4c464"/><path d="m72 177 37 2-35 6Z" fill="#87b5ba"/><path d="m72 183 36-2-35 7Z" fill="#b38ab2"/><path d="m117 165 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#edcf72"/></g>;
  if(id==='morty')return <g><path d="M82 148q18 12 36 0" stroke="#bca444" strokeWidth="2.8"/><path d="M58 193h84" stroke="#c2ac49" strokeWidth="1.2"/></g>;
  if(id==='l')return <g><path d="M82 148q18 12 36 0" stroke="#c6c7be" strokeWidth="1.5"/><path d="m62 161 5 20m71-20-6 20M61 193h78" stroke="#cbcec7" strokeWidth="1.1"/></g>;
  if(id==='makima'||id==='denji')return <g><path d="m81 147 19 11 19-11-10 20-9-9-9 9Z" fill="#f3eee1"/><Tie fill="#30383d"/><path d="M124 165h15v13h-15M83 189v7" stroke="#a9aca4" strokeWidth="1"/>{id==='denji'&&<><path d="M100 176v10" stroke="#666c65" strokeWidth="1.3"/><path d="M95 185h10v6H95Z" fill="#62675f"/><path d="m67 175 8 3m54-3-8 3m-46 9 6 3" stroke="#aeb6a9" strokeWidth="1.2"/></>}</g>;
  return null;
}

export function Legs({id,skin}){
  const pants=({naruto:'#cc7e3f',sasuke:'#343b4d',mabel:'#85668d',jesse:'#303536',luffy:'#4d779a',dipper:'#77746d',morty:'#40536b',l:'#394e59',rick:'#7b795e',homelander:'#344259',saitama:'#d1af43',zoro:'#496352'})[id]||'#353d43';
  const sandals=['naruto','sasuke','kakashi','luffy'].includes(id),bare=id==='l';
  return <g><path d={id==='mabel'?'M58 193h84l4 13H54Z':'M59 192h82v17H59Z'} fill={pants}/><path d="M99 199v10" stroke="#252d33" strokeWidth="1"/>{id==='zoro'&&<path d="M58 197h84v12H58Z" fill="#486452"/>}{id==='naruto'&&<path d="M115 196h25m-24 4h24" stroke="#e4dfca" strokeWidth="2"/>}{id==='levi'&&<path d="m65 198 18 9m-18 0 18-9m33 0 18 9m-18 0 18-9" stroke="#abb2a8" strokeWidth="1.5"/>}
    {bare?<><path d="M58 205q19-4 39 0v6H51q-2-3 7-6Zm45 0q20-4 39 0 9 3 7 6h-46Z" fill={skin}/><path d="m56 208 4 2m4-3 3 3m4-3 3 3m54-3 3 3m4-3 3 3m4-2 4 1" stroke="#bc9476" strokeWidth=".7"/></>:<><path d="M57 207q22-6 41 0v4H53q-1-2 4-4Zm45 0q19-6 41 0 5 2 4 4h-45Z" fill={id==='saitama'||id==='homelander'?'#9b4843':['morty','dipper','denji'].includes(id)?'#dfdfd3':'#242c2d'}/>{sandals&&<><path d="M57 207h20m47 0h20" stroke={skin} strokeWidth="3"/><path d="m63 207 2 3m67-3 2 3" stroke="#303c40" strokeWidth="2"/></>}{id==='jesse'&&<path d="m59 206 13 3m59-3 13 3" stroke="#a6b4ba" strokeWidth="2"/>}</>}
  </g>;
}

export function SleeveDetail({id,side,x,y}){
  if(id==='homelander')return <g><path d={`M${x-7} ${y-6}h14`} stroke="#b69b58" strokeWidth="4"/><path d={`M${x-7} ${y-8}h14`} stroke="#ddc17c" strokeWidth="1"/></g>;
  if(id==='jesse')return <path d={`M${x-7} ${y-5}h14`} stroke="#333936" strokeWidth="4"/>;
  if(id==='kakashi'&&side==='right')return <path d="m139 160 10 4" stroke="#9e4f4b" strokeWidth="5"/>;
  if(id==='saitama')return <path d={`M${x-7} ${y-5}h14`} stroke="#c06b58" strokeWidth="2"/>;
  return null;
}

export function HeldProp({id,side,x,y}){
  if(id==='light'&&side==='left')return <g transform={`translate(${x-17} ${y-20}) rotate(-9 12 17)`}><rect width="29" height="37" rx="1" fill="#282d30" stroke="#565c5d" strokeWidth="1"/><path d="M3 3v31" stroke="#7d8079" strokeWidth=".8"/><text x="15" y="10" textAnchor="middle" fontFamily="serif" fontSize="4.5" fill="#deddd0">DEATH</text><text x="15" y="16" textAnchor="middle" fontFamily="serif" fontSize="4.5" fill="#deddd0">NOTE</text></g>;
  if(id==='dipper'&&side==='left')return <g transform={`translate(${x-17} ${y-19}) rotate(-8 12 17)`}><rect width="29" height="36" rx="2" fill="#8f4e47" stroke="#c2a165" strokeWidth="1.3"/><path d="M3 3v31" stroke="#cbb47e" strokeWidth="1"/><path d="m12 10-2-5 3-1 3 6 4-5 2 2-3 7 5-2 1 3-5 4v8H10l-4-9 2-2 4 4Z" fill="#d4b36b"/><text x="16" y="25" fontFamily="serif" fontSize="9" textAnchor="middle" fill="#6e4936">3</text></g>;
  if(id==='rick'&&side==='right')return <g transform={`translate(${x-5} ${y-6}) rotate(-23)`}><path d="M-28-1H8l10 8-12 6h-33Z" fill="#aebbb0" stroke="#62756c" strokeWidth="1"/><path d="M-18 10h9v11h-9Z" fill="#7b897d"/><path d="M-23-5h17v7h-17Z" fill="#8bb768"/><ellipse cx="-15" cy="-5" rx="8" ry="5" fill="#a6d271"/><path d="M-15-9v8m-4-4h8" stroke="#d3eba5" strokeWidth="1"/><path d="M-29 2h-6v7h6" fill="#6d8271"/><circle cx="6" cy="5" r="2" fill="#c47758"/></g>;
  return null;
}

export function Chainsaw({arm=false,side='right',x=0,y=0}){
  if(arm)return <g transform={`translate(${x} ${y}) rotate(${side==='right'?-18:18})`}><path d="M-5-5h10l3 35-8 9-8-9Z" fill="#8f9b92" stroke="#353f3e" strokeWidth="1.5"/><path d="M0 1v29" stroke="#404e4a" strokeWidth="2"/>{[0,7,14,21,28].map(yy=><g key={yy} fill="#b8bca7"><path d={`m-6 ${yy}-5 3 5 3m12-6 5 3-5 3`}/></g>)}</g>;
  return <g>
    <path d="M50 64Q58 39 91 39h31l26 25 5 43-21 42H65l-21-31V82Z" fill="#9e512f" stroke="#623b2c" strokeWidth="1.5"/>
    <path d="M49 79 58 58q10-13 33-13h30l22 23-7 41-33 12-49-9Z" fill="#d87835"/>
    <path d="M54 76 62 58q9-10 29-10h26l12 11-25-4-25 1-15 9-7 15Z" fill="#e99b52"/>
    <path d="m54 87 4 22 43 10-6-57-14-4-14 7Z" fill="#df8540"/>
    <path d="m104 58 16-5 19 17-5 37-31 12Z" fill="#c96a30"/>
    <path d="M99 47 101 119" stroke="#754832" strokeWidth="2.2"/>
    <path d="M102 49 104 115" stroke="#efaa65" strokeWidth=".9"/>
    <path d="M62 76q-8 11-6 24m13-20q-7 10-6 23m13-18q-6 9-5 20M130 66q9 10 10 25m-16-20q8 10 9 25m-16-20q7 10 8 24" stroke="#302c27" strokeWidth="2.8"/>
    <path d="m56 110 45 11 34-13" stroke="#f0ad6a" strokeWidth="1.2"/>
    <path d="M45 79q-14 17-2 40l11-4-2-34Z" fill="#243235" stroke="#18292c" strokeWidth="1.3"/>
    <path d="M44 88q-6 12 1 22" stroke="#52625d" strokeWidth="2"/>
    <path d="M58 114 101 122l37-14-8 24-29 14-34-12Z" fill="#202d2f"/>
    {[0,1,2,3].map(i=><path key={`upper-left-${i}`} d={`M${62+i*9} ${115+i*1.7}l7 1.3-4 9Z`} fill="#e7e2ca"/>)}
    {[0,1,2,3].map(i=><path key={`upper-right-${i}`} d={`M${103+i*8} ${121-i*2.7}l7-2.4-5 11Z`} fill="#e7e2ca"/>)}
    {[0,1,2,3,4,5].map(i=>{const x=70+i*10,y=i<3?134+i*3:140-(i-3)*4;return <path key={`lower-${i}`} d={`M${x} ${y}l3-7 4 8Z`} fill="#d8d8c2"/>;})}
    <path d="m66 136 35 12 29-14-29 20Z" fill="#cd7134" stroke="#8c4b2f" strokeWidth="1.3"/>
    <path d="m70 137 31 11 24-11" stroke="#e89b56" strokeWidth="1"/>
    <path d="M90 64h15l6 8v17l-8 6H90Z" fill="#354743" stroke="#223633" strokeWidth="1.6"/>
    <path d="M95 67h82l17 12-17 12H95Z" fill="#75827c" stroke="#34413f" strokeWidth="2"/>
    <path d="M102 72h72l11 7-11 7h-72Z" fill="#64736e"/>
    <path d="M103 79h76" stroke="#b7bdb0" strokeWidth="1.8"/>
    {[71,87].map(y=><g key={y}><circle cx="98" cy={y} r="2" fill="#c0c2a9"/><path d={`m97 ${y}h2`} stroke="#52635a" strokeWidth=".7"/></g>)}
    {Array.from({length:10},(_,i)=><path key={i} d={`m${101+i*8} 67 3-6 3 6m-6 24 3 6 3-6`} fill="#c4c5b2"/>)}
    <path d="M83.5 46V31h33v15" stroke="#293a39" strokeWidth="6"/><path d="M88.5 35h23" stroke="#718078" strokeWidth="1.3"/>
    {[83.5,116.5].map(x=><g key={x}><rect x={x-4} y="42" width="8" height="8" rx="1.5" fill="#384744"/><circle cx={x} cy="46" r="1.3" fill="#a4a891"/></g>)}
  </g>;}
