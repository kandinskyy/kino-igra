export default function HandProp({id,side,x,y,winning=false,handColor='#e4c2a0',wristAngle=0}) {
  const thumb=(cx=7,cy=4)=><path d={`M${cx-3} ${cy}q6-4 8 0 0 4-7 4Z`} fill={handColor}/>;
  return <g data-part="held-prop" transform={`translate(${x} ${y})`} strokeLinecap="round" strokeLinejoin="round">
    {id==='captain'&&side==='left'&&<>
      <circle r="19" fill="#a7474a" stroke="#aebdbd" strokeWidth="1.4"/><circle r="14" fill="#dddacf"/><circle r="11" fill="#a7474a"/><circle r="8" fill="#365e87"/>
      <path d="m0-6 2 4h4L3 1l1 5-4-3-4 3 1-5-3-3h4Z" fill="#edf0e4"/>
      <path d="M-16-4q2-9 11-12" stroke="#db8a76" strokeWidth="1"/><path d="M8 15q6-3 8-8" stroke="#693b40" strokeWidth=".8"/>
      {[[0,-17],[17,0],[0,17],[-17,0]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r=".7" fill="#e8e3d4"/>)}
    </>}
    {id==='thor'&&side==='right'&&<g data-grip="mjolnir" transform="rotate(28)"><path d="M0 8v-33" stroke="#71553d" strokeWidth="5"/><path d="M-2-5h4m-4-6h4m-4-6h4m-4-6h4" stroke="#b7a383" strokeWidth="1.1"/><path d="M-15-48h29l4 4v20h-29l-4-4Z" fill="#7f9ca8" stroke="#506d7b" strokeWidth="1.1"/><path d="M-11-44h25v16h-25Z" fill="#c4d1d2"/><path d="M-15-48-11-44m25 0 4-4m-29 20-4-4" stroke="#dae2dc" strokeWidth=".9"/><path d="M1-41v11m0-5-5-4m5 4 5-4" stroke="#96aab0" strokeWidth=".7"/><path d="M-5-24H5" stroke="#d4dace" strokeWidth="2"/><path d="M0 9q-8 7 0 14" stroke="#6d543b" strokeWidth="2"/></g>}
    {['jedi','vader'].includes(id)&&side==='right'&&<>
      <path d="M1 5 7-15" stroke="#9ba6a7" strokeWidth="5"/><path d={id==='vader'?'M7-15 31-72':'M7-15 22-66'} stroke={id==='vader'?'#d66f73':'#83c583'} strokeWidth="5"/><path d={id==='vader'?'M7-15 31-72':'M7-15 22-66'} stroke={id==='vader'?'#ffddd7':'#ecffe1'} strokeWidth="2"/>
      <path d="m1 1 5 1m-4-6 5 2m-3-7 5 2m-2-7 5 2" stroke="#39434a" strokeWidth="1.4"/><circle cx="6" cy="-8" r="1.2" fill={id==='vader'?'#b86d58':'#6c9674'}/>
    </>}
    {id==='bill'&&side==='right'&&<>
      <path d="M0 6 3-15" stroke="#303a37" strokeWidth="4"/><path d="M-4-12h14" stroke="#8a7847" strokeWidth="3"/><path d="M-3-13H9" stroke="#e3cc85" strokeWidth=".8"/>
      <path d="M4-15Q11-40 11-61l-3 3L1-15Z" fill="#d4dfd9" stroke="#84999b" strokeWidth=".7"/><path d="M5-22 9-53" stroke="#f4f4dd" strokeWidth=".9"/>
      <path d="m2-6 1-2 1 2-1 2Z" fill="#c6bc8e"/>
    </>}
    {id==='jason'&&side==='right'&&<g data-grip="machete" transform="rotate(18)"><path d="M0 7v-23" stroke="#634d39" strokeWidth="5"/><path d="M-2 3h4m-4-6h4m-4-6h4" stroke="#a18660" strokeWidth=".9"/><path d="M-4-14H8" stroke="#4c5556" strokeWidth="2.8"/><path d="M-1-15 1-64q9 0 12 6v34l-8 9Z" fill="#b8c7c6" stroke="#657c83" strokeWidth=".8"/><path d="M10-55v29l-5 7" stroke="#e7e8d7" strokeWidth=".8"/><path d="m2-58 7-1 3 9-5 1-1 8-4-3Zm3 28 6-5v9l-6 6Z" fill="#7f3537"/><path d="M2-61h5" stroke="#956160" strokeWidth=".8"/></g>}
    {id==='fight'&&side==='left'&&<>
      <rect x="-13" y="-6" width="26" height="14" rx="5" fill="#d797a9" stroke="#9b6478" strokeWidth=".8"/><path d="M-8-3H8" stroke="#edb9c6" strokeWidth=".8"/>
      <text x="0" y="3" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="5" fontWeight="700" fill="#a06a80">SOAP</text>{thumb(7,2)}
    </>}
    {id==='brother'&&side==='left'&&<>
      <circle cy="1" r="12" fill="#a9bab8" stroke="#52666a" strokeWidth="1"/><circle cy="1" r="8" fill="#657b82"/><circle cy="1" r="3" fill="#c7d3cb"/>
      <path d="M-8-3q2-4 6-4m6 13 5-3" stroke="#e5e6d4" strokeWidth="1"/><path d="M-2-9v-2h5" stroke="#34494d" strokeWidth="1.3"/>{thumb(5,6)}
    </>}
    {id==='pirate'&&side==='left'&&<>
      <rect x="-7" y="-4" width="15" height="16" rx="2" fill="#8e7544" stroke="#d3b87c" strokeWidth="1"/><circle cx=".5" cy="4" r="5.5" fill="#d5c79e" stroke="#65573a" strokeWidth=".7"/>
      <path d="m.5-1 2 6-2-1-2 3Z" fill="#614e39"/><path d="M-4-4v-4h9v4" stroke="#b3985e" strokeWidth="1.2"/>{thumb(5,6)}
    </>}
    {id==='forrest'&&side==='left'&&<g data-prop="chocolate-box">
      <title>Открытая коробка шоколадных конфет</title>
      <rect x="-17" y="-26" width="34" height="19" rx="2" fill="#f1e3ce" stroke="#ad8e72" strokeWidth="1"/>
      <path d="M-14-23h28v13h-28Z" stroke="#d6c1a5" strokeWidth=".8"/>
      <path d="M0-13c-9-4-7-10-3-8l3 2 3-2c4-2 6 4-3 8Z" fill="#845440"/>
      <rect x="-18" y="-8" width="36" height="17" rx="2" fill="#b89470" stroke="#81634c" strokeWidth=".8"/>
      <rect x="-15" y="-6" width="30" height="12" rx="1" fill="#e4cdae"/>
      {[-10,0,10].flatMap((cx)=>[-2.5,3].map((cy,i)=><g key={`${cx}-${cy}`}><ellipse cx={cx} cy={cy} rx="4" ry="2.7" fill="#937355"/><rect x={cx-3} y={cy-2} width="6" height="4" rx={i?'.8':'2'} fill={i?'#57382c':'#784c33'}/><path d={`M${cx-1.5} ${cy-1}h3`} stroke="#c59467" strokeWidth=".65"/></g>))}
      <path d="M-17 7h34v3h-34Z" fill="#d5b797"/>{thumb(8,5)}
    </g>}
    {id==='wolf'&&side==='right'&&!winning&&<g data-grip="phone" transform="rotate(-8)"><rect x="-6" y="-29" width="15" height="37" rx="3" fill="#2f3940" stroke="#869b9f" strokeWidth=".9"/><path d="M5-29v-11" stroke="#333f45" strokeWidth="2.1"/><path d="M-2-25h7m-7 3h7" stroke="#a9b9b7" strokeWidth="1"/><rect x="-3" y="-19" width="9" height="7" rx=".5" fill="#a3b1a4"/><path d="M-2-8h1m3 0h1m-5 3h1m3 0h1m-5 3h1m3 0h1" stroke="#c1cdc2" strokeWidth="1.1"/></g>}
    {id==='thanos'&&side==='left'&&<g data-grip="gauntlet" transform={`rotate(${wristAngle})`}><path d="M-11-6-9-14l5-2 4 1 4-1 5 2 3 9-1 13-4 6H-8l-5-8Z" fill="#b99b59" stroke="#7b643c" strokeWidth="1"/><path d="M-10 7h20v10h-20Z" fill="#9b7f47" stroke="#d2b97b" strokeWidth=".8"/><path d="M-10-5h20M-6-13v17m6-19v19m6-17v17M-9 12H9" stroke="#dec68b" strokeWidth=".9"/>{[['#729ac6',-7,-9],['#9e7db8',-2,-12],['#bc6162',3,-12],['#cc965b',8,-9],['#85ac76',-12,0]].map(([c,cx,cy])=><circle key={c} cx={cx} cy={cy} r="2" fill={c} stroke="#77623d" strokeWidth=".6"/>)}<path d="m0-1 4 4-4 4-4-4Z" fill="#e0c365" stroke="#f1dda2" strokeWidth=".7"/></g>}
    {id==='chaplin'&&side==='right'&&<><path d="M0 21 2-27q0-8 7-8t7 8" stroke="#a48d6b" strokeWidth="3"/><path d="M2 16 4-25q0-6 5-6" stroke="#d1bb91" strokeWidth=".6"/></>}
    {id==='sherlock'&&side==='right'&&<>
      <path d="M0 5 8-18" stroke="#6a4d37" strokeWidth="4"/><path d="M6-15 9-21" stroke="#bea36b" strokeWidth="4.4"/>
      <circle cx="12" cy="-29" r="12" fill="#b4d0cd" fillOpacity=".22" stroke="#bda16a" strokeWidth="3"/><circle cx="12" cy="-29" r="10.3" stroke="#e1c99a" strokeWidth=".7"/>
      <path d="M7-35q5-4 9 0m-10 3 1 3" stroke="#e7f2e8" strokeWidth="1.2"/>
    </>}
    {id==='bateman'&&side==='right'&&<g data-prop="business-card">
      <title>Визитная карточка Патрика Бейтмана</title>
      <rect x="-14" y="-18" width="38" height="22" rx=".6" fill="#f8f1df" stroke="#b8ad97" strokeWidth=".65"/>
      <text x="-10.5" y="-12.5" fontFamily="Georgia,serif" fontSize="3" fill="#574b3d">P&amp;P</text>
      <text x="5" y="-5.3" textAnchor="middle" fontFamily="Georgia,serif" fontSize="3.4" fill="#443b31">PATRICK BATEMAN</text>
      <text x="5" y="-.7" textAnchor="middle" fontFamily="Georgia,serif" fontSize="2.1" fill="#766955">VICE PRESIDENT</text>{thumb(5,2)}
    </g>}
    {id==='toretto'&&side==='right'&&winning&&<>
      <circle cx="5" cy="7" r="5" stroke="#bdc5c2" strokeWidth="1.6"/><rect x="1" y="10" width="9" height="13" rx="3" fill="#343e43" stroke="#9da9a8" strokeWidth="1"/>
      <path d="M6 22v10l3-2m-3-4 3-2" stroke="#c6cdca" strokeWidth="2"/><circle cx="5.5" cy="14" r="1" fill="#8eaaa7"/><path d="M4 18h3" stroke="#9bb1ad" strokeWidth=".8"/>
    </>}
  </g>;
}
