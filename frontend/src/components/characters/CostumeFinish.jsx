// Fabric seams follow existing garment edges. No decorative strokes extend
// outside the clothing or get reused as detached accessories on other figures.
const bodyFinishes={
    wizard:()=><><path d="m64 172-6 23m78-23 6 23M58 197q42 5 84 0" stroke="#68616d" strokeWidth=".8"/><path d="m71 182-4 8m62-2 5 7" stroke="#191f2b" strokeWidth="1.5"/><path d="M112 181h9m-9 8h9" stroke="#e4c471" strokeWidth=".6"/></>,
    dune:()=><><path d="m70 172 14 3m32 0 14-3m-60 8 14 3m32 0 14-3" stroke="#a3ad8d" strokeWidth=".8"/><path d="m88 185 4 10m20-10-4 10M66 198l-5-2m73 2 5-2" stroke="#263b34" strokeWidth="1.2"/><path d="M95 178h10v4H95Z" fill="#788a76" stroke="#344f43" strokeWidth=".7"/></>,
    matrix:()=><><path d="m80 159 9 6m31-6-9 6M63 181l14-2m46 0 14 2M67 195l-4-6m70 6 4-6" stroke="#526159" strokeWidth=".9"/><path d="M100 188v12m-6-3 6-3 6 3" stroke="#111d1a" strokeWidth="1.1"/></>,
    fight:()=><><path d="m69 169 7 23m55-23-7 23" stroke="#e3a181" strokeWidth=".8"/><path d="m95 174q-7-9-8-1 0 4 6 4m12-8q9-5 8 2-1 4-6 3" stroke="#916b4e" strokeWidth="1.1"/><circle cx="66" cy="164" r="1.2" fill="#c9b08a"/><circle cx="134" cy="164" r="1.2" fill="#c9b08a"/></>,
    captain:()=><><path d="m67 158 12 6m54-6-12 6m-52 9 11 3m51-3-11 3" stroke="#7b97ae" strokeWidth="1.1"/><path d="M62 190h76" stroke="#172e49" strokeWidth="1.2"/><path d="M68 194v4m64-4v4" stroke="#af9a74" strokeWidth="1"/><path d="M70 201h20v5H70Zm40 0h20v5h-20Z" fill="#9d4549"/></>,
    iron:()=><><path d="M66 200h25v6H64Zm43 0h25l2 6h-27Z" fill="#B62F38" stroke="#70232C" strokeWidth=".8"/><path d="M66 207h25m18 0h25" stroke="#E2B65A" strokeWidth="1.7"/></>,
    marty:()=><><path d="M82 164v29m36-29v29" stroke="#f0b984" strokeWidth="1.1"/><path d="M65 176h12m46 0h12m-71 12 12-1m48 0 12 1" stroke="#ef9a6a" strokeWidth=".9"/><path d="M87 200v5m26-5v5" stroke="#aec1c6" strokeWidth=".9"/></>,
    hulk:()=><><path d="m69 195 7 4-8 4m60-8-7 4 8 4M87 195l-3 9m29-9 3 9" stroke="#514365" strokeWidth="1.1"/><path d="m75 207 4-3 4 3m34 0 4-3 4 3" stroke="#8fba63" strokeWidth="1.5"/></>,
    thor:()=><><path d="M91 171h18m-18 3 9 6 9-6m-9 6v10" stroke="#c1ccc8" strokeWidth=".9"/><path d="m61 187 6 5m72-5-6 5" stroke="#263b46" strokeWidth="2"/>{[78,122].flatMap(x=>[160,178].map(y=><path key={`${x}-${y}`} d={`M${x-3} ${y-1}q1-3 4-2`} stroke="#f1f1de" strokeWidth="1"/>))}<path d="M65 202h25m20 0h25" stroke="#81949a" strokeWidth="1.5"/></>,
    widow:()=><><path d="M99 168v13m3-12v12" stroke="#899397" strokeWidth=".65"/><path d="M68 188h9v10h-9Zm55 0h9v10h-9Z" fill="#252d38" stroke="#53616d" strokeWidth=".8"/><path d="m69 190 7 1m48 0 7-1" stroke="#7b8a93" strokeWidth=".9"/><circle cx="100" cy="171" r="1.4" stroke="#bac3bd" strokeWidth=".7"/></>,
    brother:()=><><path d="M63 193h74m-72 4v3m7-3v3m7-3v3m7-3v3m7-3v3m7-3v3m7-3v3m7-3v3m7-3v3m7-3v3m7-3v3" stroke="#817c67" strokeWidth=".9"/><path d="m70 173 4 5-4 5m56-10-4 5 4 5" stroke="#d0c4a7" strokeWidth=".9"/></>,
    terminator:()=><><path d="m74 169-9 17m61-17 9 17" stroke="#a1a7a2" strokeWidth=".9"/><circle cx="78" cy="166" r="1.3" fill="#aeb5b0"/><circle cx="122" cy="166" r="1.3" fill="#aeb5b0"/><path d="M66 195h68" stroke="#171e26" strokeWidth="4"/><rect x="96" y="193" width="8" height="6" rx="1" stroke="#b6c1bd" strokeWidth="1.2"/></>,
    pirate:()=><><path d="M98 168v12m-3-10 10 4m-10 0 10 4" stroke="#8c7d64" strokeWidth=".9"/>{[173,181,189].flatMap(y=>[71,129].map(x=><circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#bba572"/>))}<path d="m62 190 14 3m48 0 14-3" stroke="#b76b5a" strokeWidth="1.1"/></>,
    forrest:()=><><path d="M60 180h14m52 0h14m-78 2h11m54 0h11" stroke="#afa994" strokeWidth=".9"/><path d="m66 192 8 2m60-2-8 2" stroke="#eee7d4" strokeWidth=".9"/></>,
    wolf:()=><><path d="M98 172h5" stroke="#d5b76a" strokeWidth="1.2"/><path d="m68 193 10 1m44 0 10-1" stroke="#728595" strokeWidth=".8"/><path d="m83 202 8 3m18 0 8-3" stroke="#596977" strokeWidth=".8"/></>,
    bill:()=><><circle cx="100" cy="177" r="1.7" stroke="#7d7c5f" strokeWidth=".7"/><rect x="117" y="166" width="9" height="5" rx="1" fill="#313b38"/><path d="M119 168h5m-57 24 9 1m48 0 9-1" stroke="#f0db80" strokeWidth=".9"/></>,
    jason:()=><><path d="M69 168h10v9H69Zm52 0h10v9h-10Z" fill="#57634e" stroke="#919278" strokeWidth=".8"/><path d="m69 170 5 3 5-3m42 0 5 3 5-3" stroke="#9b9a7b" strokeWidth=".8"/><path d="m63 188 4 2-3 5m73-7-4 2 3 5" stroke="#3e4e42" strokeWidth="1.2"/></>,
    spider:()=><><path d="M80 190q20 5 40 0" stroke="#913e49" strokeWidth=".8"/><path d="M72 201h16m24 0h16" stroke="#233d59" strokeWidth="1"/></>,
    thanos:()=><><path d="M97 180h6v9h-6m-25-16 10 5m46-5-10 5" stroke="#e3ca90" strokeWidth=".8"/><path d="M70 201h20v5H70Zm40 0h20v5h-20Z" fill="#8c774b" stroke="#c5ae76" strokeWidth=".8"/></>,
    loki:()=><><path d="m65 177 8 19m62-19-8 19M86 184l-5 13m33-13 5 13" stroke="#182f2b" strokeWidth="2"/><path d="M98 177h4v7h-4Z" fill="#d1b76b"/><path d="M65 200h26m18 0h26" stroke="#aa985c" strokeWidth="1.1"/></>,
    jedi:()=><><path d="m83 171 5 11m29-11-5 11M62 196l8-2m68 2-8-2" stroke="#626e65" strokeWidth=".8"/><rect x="72" y="187" width="8" height="8" rx="1" fill="#50574d"/><rect x="121" y="187" width="8" height="8" rx="1" fill="#50574d"/><path d="M74 189h4m45 0h4" stroke="#a3a697" strokeWidth=".8"/></>,
    vader:()=><><path d="m68 151 14 7m50-7-14 7" stroke="#8c979a" strokeWidth="3"/><path d="M73 162v24m54-24v24" stroke="#68747b" strokeWidth=".8"/><rect x="113" y="191" width="3" height="3" fill="#bb655e"/><rect x="85" y="191" width="3" height="3" fill="#83a997"/></>,
    batman:()=><><path d="m64 181 7 5m65-5-7 5M72 202h19m18 0h19" stroke="#52616b" strokeWidth=".8"/></>,
    joker:()=><><path d="m97 162 6 0 4 13-7 4-7-4Z" fill="#756679"/><path d="m98 166 3 2 2-2m-6 7 3 2 3-2" stroke="#bcad8e" strokeWidth=".8"/><path d="m67 182 9-1m48 0 9 1" stroke="#b28da8" strokeWidth=".8"/></>,
    bateman:()=><><path d="M131 166q-9 8-6 16" stroke="#2b343b" strokeWidth=".8"/><rect x="122" y="181" width="8" height="12" rx="1.5" fill="#34444c" stroke="#85999b" strokeWidth=".7"/><rect x="124" y="184" width="4" height="3" fill="#9baba4"/><path d="M124 190h4" stroke="#b1b9ae" strokeWidth=".7"/><path d="m58 190 3 5m81-5-3 5" stroke="#c2d7d6" strokeWidth=".75"/></>,
    chaplin:()=><><path d="M108 184q7 12 17 2" stroke="#9c8b63" strokeWidth=".9"/><path d="m62 191 8 3m60-3-8 3" stroke="#7d7770" strokeWidth=".8"/><path d="M78 201v5m44-5v5" stroke="#7b736a" strokeWidth=".9"/></>,
    sherlock:()=><><path d="M55 173q45 11 90 0" stroke="#c0a985" strokeWidth=".9"/><path d="m70 181 4 3 4-3m8 0 4 3 4-3m12 0 4 3 4-3m8 0 4 3 4-3" stroke="#b49d79" strokeWidth=".75"/><circle cx="100" cy="179" r="1.7" fill="#695b44"/></>,
    wick:()=><><path d="M97 174h5m-38 17 9 1m54 0 9-1" stroke="#6a7780" strokeWidth=".7"/><path d="M81 200v6m38-6v6" stroke="#505e68" strokeWidth=".8"/></>,
    toretto:()=>null,
};
export function BodyFinish({id}) {
  return <g data-part="costume-finish" strokeLinecap="round" strokeLinejoin="round" fill="none">{bodyFinishes[id]?.()}</g>;
}

export function SleeveFinish({id,x,y,control,side}) {
  if(['toretto','hulk','thanos'].includes(id)) return null;
  const tone={marty:'#dba071',captain:'#d28d7b',iron:'#d4ae6b',bill:'#494c37',widow:'#627c84',wolf:'#d8c28a',forrest:'#c0b6a1',jason:'#92927a',sherlock:'#b29b75',pirate:'#baa47d',bateman:'#c1d4d4'}[id]||'#6d7981';
  const angle=Math.atan2(y-control[1],x-control[0])*180/Math.PI-90;
  return <g data-part="cuff" transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d="M-7-10H7" stroke={tone} strokeWidth={id==='wolf'?2.5:1.1} strokeLinecap="round"/>
    {id==='widow'&&[-5,-1,3].map(cx=><rect key={cx} x={cx} y="-14" width="2" height="3" rx=".5" fill="#a1bbc2"/>)}
    {id==='batman'&&<path d={side==='left'?'m-8-13-4-4 4 1m0-6-4-4 4 1':'m8-13 4-4-4 1m0-6 4-4-4 1'} stroke="#62727c" strokeWidth="1.4" strokeLinejoin="round"/>}
    {id==='iron'&&<><rect x="-6.5" y="-22" width="13" height="12" rx="3" fill="#E2B65A" stroke="#AB7636" strokeWidth=".7"/><path d="M-7-7H7" stroke="#70232C" strokeWidth="1.3"/></>}
    {id==='wolf'&&<rect x="-3" y="-13" width="6" height="5" rx="1" fill="#d3b674" stroke="#f0d699" strokeWidth=".8"/>}
  </g>;
}

export function ShoeFinish({id}) {
  if(id==='hulk') return <g stroke="#6c934e" strokeWidth=".8"><path d="m62 207 1 3m8-4 1 4m8-4 1 4m8-3 1 3m20-3-1 3m8-4-1 4m8-4-1 4m8-3-1 3"/></g>;
  const bright=['marty','forrest','bill'].includes(id);
  return <g data-part="footwear" fill="none" strokeLinecap="round">
    <path d="M55 211h42m6 0h42" stroke={bright?'#d8ddcf':'#111a20'} strokeWidth="1.2"/>
    <path d="M63 207q13-2 24 0m26 0q11-2 24 0" stroke={bright?'#a6afa6':'#69757a'} strokeOpacity={bright?'.8':'.5'} strokeWidth=".7"/>
    {bright&&<path d={id==='bill'?'m68 206 6 3m5-3 6 3m30-3 6 3m5-3 6 3':'M65 208h22m26 0h22'} stroke={id==='bill'?'#303632':'#a24e42'} strokeWidth="1.2"/>}
  </g>;
}
