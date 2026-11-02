// All costumes share the approved body and fixed shoulder/hand anchors.
export function CostumeBack({id}) {
  if (['vader','batman','thor','loki'].includes(id)) return <path d={id==='batman'?'M64 145Q38 168 31 211l17-6 12 7 13-6 14 7 13-7 13 7 14-7 13 6 12-7 17 6q-7-43-33-66Z':'M64 145Q43 170 39 210q61-10 122 0-4-40-25-65Z'} fill={id==='thor'?'#9b383a':id==='loki'?'#2c4c3e':'#20242c'}/>;
  return null;
}

function Suit({color='#343e4b',tie='#5d7489',vest=false,shirt='#eee9df',plaid=false,pinstripe=false}) {
  return <>
    <path d="M79 147h42l9 51H70Z" fill={shirt}/>
    {plaid&&<g stroke="#dfe9e0" strokeWidth=".8"><path d="M91 163h18m-14 8h10m-7 7h4M97 153v18m6-18v18"/></g>}
    {tie&&<><path d="m96 153 8 0 2 7-6 5-6-5Z" fill={tie}/><path d="M98 163h4l5 25-7 5-7-5Z" fill={tie}/><path d="m97 156 6 1" stroke="#ffffff22" strokeWidth="1"/></>}
    <path d="m80 145 20 12 20-12-5 18-15-6-15 6Z" fill={shirt}/>
    {vest&&<path d="m79 158 21 20 21-20 5 40H74Z" fill="#535450"/>}
    <path d="M64 147 81 145l19 38v15H47Zm72 0-17-2-19 38v15h53Z" fill={color}/>
    {pinstripe&&<path d="M60 167v27m7-39v39m7-38v38m7-22v22m7-15v15m24-15v15m7-22v22m7-38v38m7-39v39m7-27v27" stroke="#bbccd2" strokeWidth=".65" opacity=".35"/>}
    <path d="m81 147-7 13 11 2-5 8 20 13m19-36 7 13-11 2 5 8-20 13" stroke="#ffffff2e" strokeWidth=".9"/>
    <path d="m60 185 14-1m52 0 14 1" stroke="#0b141c" strokeOpacity=".22" strokeWidth="1.2"/>
    <path d="m125 172 12-1" stroke="#bfc6bd" strokeWidth="1.2"/>
    <circle cx="101" cy="187" r="1.5" fill="#a4aca9"/><path d="M100 192v5" stroke="#101a23" strokeOpacity=".25"/>
  </>;
}

export function CostumeBody({id,cloth}) {
  return <g strokeLinecap="round" strokeLinejoin="round">
    {id==='achi'&&<g data-part="achi-leather-jacket" data-cut="fitted-motorcycle">
      <path d="M87 149h26l-7 18H97Z" fill="#101820"/>
      <path d="M77 145q4-6 10-4l10 22-9 6-8-12Z" fill="#27313C" stroke="#111A23" strokeWidth="1.1"/>
      <path d="M121 145q-4-6-10-4l-8 22 8 5 8-12Z" fill="#27313C" stroke="#111A23" strokeWidth="1.1"/>
      <path d="m81 148 5 12 7 5m23-17-4 12-5 4" stroke="#61707B" strokeWidth=".8"/>
      <path d="M99 166q2 15 2 31" stroke="#111923" strokeWidth="3.5"/>
      <path d="M99 166q2 15 2 31" stroke="#8898A2" strokeWidth=".9"/>
      <rect x="98" y="169" width="2.6" height="4.5" rx=".8" fill="#B5C0C6"/>
      <path d="m114 181 15-10" stroke="#111923" strokeWidth="3.3"/>
      <path d="m114 181 15-10" stroke="#798994" strokeWidth=".8"/>
      <path d="m127 173 1 3" stroke="#A7B5BD" strokeWidth="1.2"/>
      <path d="M71 164q-3 9-2 18m60-18q3 9 2 18" stroke="#111D27" strokeWidth="1.1"/>
      <path d="m73 187 12-2m31 0 12 2" stroke="#53616C" strokeWidth=".7"/>
      <path d="M48 193q52 9 104 0l2 2q-54 10-108 0Z" fill="#27313C"/>
      <path d="M52 195q48 7 96 0" stroke="#495965" strokeWidth=".7"/>
      <circle cx="86" cy="160" r="1.3" fill="#A3AFB6"/>
    </g>}
    {id==='matrix'&&<><path d="M66 147 87 145l13 9 13-9 21 2 17 52H49Z" fill="#252d2b"/><path d="m81 145 9 11 10-2 10 2 9-11m-19 9v43" stroke="#4a5550" strokeWidth="1.5"/>{[163,174,185].map(y=><circle key={y} cx="104" cy={y} r="1" fill="#89938a"/>)}</>}
    {id==='fight'&&<><path d="M78 147h44v50H78Z" fill="#d5ad72"/><path d="m83 150 9 5-9 6 11 7-8 6 9 7m17-32-7 8 10 8-8 6 9 8" stroke="#715246" strokeWidth="2"/><path d="M64 147h17l7 51H47Zm72 0h-17l-7 51h41Z" fill={cloth}/><path d="m80 146-9 18 12 3-10 18m47-39 9 18-12 3 10 18" stroke="#d48a67" strokeWidth="1.5"/><path d="m56 182 15-3m58 0 15 3" stroke="#733933" strokeWidth="2"/></>}
    {id==='captain'&&<><path d="M66 147h68l8 35H58Z" fill="#344f7b"/><path d="m100 153 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#e1e5df"/><path d="M65 180h70v18H65Z" fill="#eee1d2"/><path d="M76 180v18m16-18v18m16-18v18m16-18v18" stroke="#a84649" strokeWidth="7"/><path d="M61 192h78v7H61Z" fill="#574a43"/><rect x="94" y="191" width="12" height="8" rx="1" stroke="#b7b9b4" fill="#6a6359"/></>}
    {id==='iron'&&<g data-part="mark-vii-armor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M65 147q35-10 70 0l13 48q-48 14-96 0Z" fill="#B62F38" stroke="#69212B" strokeWidth="1"/>
      <path d="m65 147 15-2 7 8-8 8-20-1Zm70 0-15-2-7 8 8 8 20-1Z" fill="#D34944" stroke="#762631" strokeWidth=".8"/>
      <path d="m61 160 15-1 9 9-5 9-17-6Zm78 0-15-1-9 9 5 9 17-6Z" fill="#D8AD59" stroke="#956B35" strokeWidth=".7"/>
      <path d="m64 161 10 0 7 7-3 4-13-5Zm72 0-10 0-7 7 3 4 13-5Z" fill="#F0CD7F"/>
      <path d="m80 155 20 5 20-5m-43 15 10 5m36-5-10 5" stroke="#6C202B" strokeWidth="1.3"/>
      <circle cx="100" cy="171" r="10" fill="#5D3538" stroke="#CBD8D7" strokeWidth="1.8"/>
      <circle cx="100" cy="171" r="7.5" fill="#69C9DE"/><circle cx="100" cy="171" r="5.2" fill="#E5FCFF"/>
      <path d="M80 182q20 8 40 0l-2 7q-18 5-36 0Z" fill="#C43A3D" stroke="#762631" strokeWidth=".9"/>
      <path d="M83 190q17 5 34 0l-3 7H86Z" fill="#A72A34" stroke="#762631" strokeWidth=".9"/>
      <path d="m61 178 14 5-2 6-13-5m79-6-14 5 2 6 13-5" fill="#C99F51" stroke="#762631" strokeWidth=".8"/>
      <path d="m60 190 17 6-4 5-15-5m82-6-17 6 4 5 15-5" fill="#E0B764"/>
      <path d="M89 200h22" stroke="#DF5B50" strokeWidth="1.5"/>
    </g>}
    {id==='marty'&&<><path d="M76 147h48v51H76Z" fill="#e9e2d4"/><path d="M83 147v51m13-51v51m13-51v51m-31-41h45m-45 10h45m-45 10h45m-45 10h45" stroke="#7e9ba8" strokeWidth="1.2"/><path d="M68 147h15l4 51H53Zm64 0h-15l-4 51h34Z" fill="#658698"/><path d="m70 147 13-1-2 49-22 2-3-23Zm60 0-13-1 2 49 22 2 3-23Z" fill="#dd6a46"/><path d="m62 167 18 1m-20 12 20 1m40-13 18-1m-18 14 20-1" stroke="#ac4f35" strokeWidth="1"/><path d="M100 149v46" stroke="#747f87" strokeWidth="1"/></>}
    {id==='hulk'&&<><path d="M67 150q15-4 25 5m16 0q10-9 25-5M73 166q12-8 24-1m6 0q12-7 24 1M100 158v28m-14-8h10m8 0h10" stroke="#6a944c" strokeWidth="2"/><path d="m52 190 12-5 7 5 9-4 9 5 11-4 10 4 10-5 8 5 11-6 9 5-5 17H57Z" fill="#67547e"/><path d="M100 193v15" stroke="#4e405e" strokeWidth="1.5"/></>}
    {id==='thor'&&<><path d="M66 148h68l9 49H57Z" fill="#445760"/><path d="m76 149-5 43m53-43 5 43M84 151l16 12 16-12m-32 27 16 12 16-12" stroke="#a9bbc0" strokeWidth="2"/>{[78,122].flatMap(x=>[160,178].map(y=><circle key={`${x}-${y}`} cx={x} cy={y} r="5.2" fill="#c2d0d1" stroke="#738992" strokeWidth="1.5"/>))}<path d="M65 195h70" stroke="#342f30" strokeWidth="5"/></>}
    {id==='widow'&&<><path d="M80 146h40l9 52H71Z" fill="#343d46"/><path d="m83 147 17 19 17-19m-17 19v28m-31-37 14 13m48-13-14 13" stroke="#6c7881" strokeWidth="1.1"/><path d="M61 185h78v7H61Z" fill="#202731"/><rect x="94" y="182" width="12" height="12" rx="2" fill="#9e464b"/><path d="m97 185 6 0-3 3 3 3h-6l3-3Z" fill="#e1b8a7"/><path d="m66 196 7-18m61 18-7-18" stroke="#171f29" strokeWidth="4"/></>}
    {id==='brother'&&<><path d="M64 146q36 9 72 0l12 50H52Z" fill="#b7ab90"/><path d="M75 147q25 10 50 0m-54 11h58m-61 11h64m-67 12h70m-73 11h76" stroke="#837e6c" strokeWidth="2"/>{[65,76,87,98,109,120,131].map(x=><path key={x} d={`m${x} 159 3 5-3 5 3 5-3 5 3 5-3 5`} stroke="#d0c4a7" strokeWidth="1.2"/>)}<path d="M66 196h68" stroke="#817d6a" strokeWidth="3"/></>}
    {id==='terminator'&&<><path d="M82 147h36v49H82Z" fill="#73746c"/><path d="M65 147h19l7 17 9 33H51Zm70 0h-19l-7 17-9 33h49Z" fill="#2d3338"/><path d="m81 148-9 16 14 4-8 10 22 14m18-44 9 16-14 4 8 10-21 14" stroke="#899097" strokeWidth="1.5"/><path d="m61 181 17-3m46 0 16 3" stroke="#b3b4ac" strokeWidth="1.5"/><circle cx="72" cy="162" r="1.5" fill="#c6c9c7"/><circle cx="127" cy="162" r="1.5" fill="#c6c9c7"/></>}
    {id==='pirate'&&<><path d="M78 147h44l6 49H72Z" fill="#d6c4a2"/><path d="m94 151 6 12 6-12m-6 12v25" stroke="#89785d" strokeWidth="1.4"/><path d="M64 147h17l-3 49H49Zm72 0h-17l3 49h29Z" fill="#655047"/><path d="m70 151-6 33m66-33 6 33" stroke="#a89168" strokeWidth="1.6"/><path d="M60 186h80v10H60Z" fill="#8c4846"/><path d="m69 191 64-35" stroke="#514538" strokeWidth="7"/><rect x="100" y="165" width="9" height="10" transform="rotate(-29 104 170)" stroke="#c9ac68" strokeWidth="2" fill="#594b38"/></>}
    {id==='forrest'&&<Suit color="#d6cdbb" tie={null} shirt="#a9bfc1" plaid/>}
    {id==='wolf'&&<><Suit color="#33475b" tie="#7a718f" shirt="#e4e9e6" pinstripe/><path d="m98 165 6 2m-7 4 8 3m-7 3 8 3" stroke="#d8cfba" strokeWidth="1"/><path d="m127 171 9-2-3 3" fill="#f0eadd"/></>}
    {id==='bill'&&<><path d="M66 146h68l14 50H52Z" fill="#e8c747"/><path d="m67 150-13 40m79-40 13 40" stroke="#2b3030" strokeWidth="5"/><path d="M100 148v49" stroke="#313637" strokeWidth="2"/><path d="m78 179-11 7m55-7 11 7" stroke="#9f8f36" strokeWidth="1.2"/><path d="M66 196h68" stroke="#af983c" strokeWidth="2"/></>}
    {id==='jason'&&<><path d="M80 147h40v50H80Z" fill="#6e6952"/><path d="M66 147h17l4 51H50Zm68 0h-17l-4 51h37Z" fill="#626c56"/><path d="m79 149-7 12 10 5m39-17 7 12-10 5m-60 18 13-2m58 0 13 2" stroke="#93957a" strokeWidth="1.6"/><path d="m62 170 4 2-3 4m75 13-6-1 2 5m-53-9 4 3-3 5" stroke="#3c4b40" strokeWidth="2"/></>}
    {id==='spider'&&<><path d="M63 148h74l6 30-18 2-5 19H80l-5-19-18-2Z" fill="#b64750"/><path d="m57 178 18 2 5 19H51Zm86 0-18 2-5 19h29Z" fill="#3d5777"/><path d="M100 148v40m-31-33 31 9 31-9m-66 12 35 9 35-9m-61-20 13 33m39-33-13 33m-28-32 9 35m22-35-9 35" stroke="#69333c" strokeWidth=".9"/><ellipse cx="100" cy="169" rx="3" ry="5" fill="#252e37"/><path d="m98 166-8-6-3 2m15 4 8-6 3 2m-15 7-10-2-3 3m17-1 10-2 3 3m-17 2-8 5-1 5m13-10 8 5 1 5" stroke="#252e37" strokeWidth="1.4"/></>}
    {id==='thanos'&&<><path d="M66 148h68l9 49H57Z" fill="#303b50"/><path d="m65 149 17-4 18 13 18-13 17 4-8 18-27 13-27-13Z" fill="#b69a5c" stroke="#7c653d" strokeWidth=".9"/><path d="m81 149 19 15 19-15-5 16-14 9-14-9Z" fill="#d2b577"/><path d="M94 174h12l4 19H90Z" fill="#b69a5c" stroke="#d7bd81" strokeWidth="1"/><path d="m67 170 14 8-4 17H62m71-25-14 8 4 17h15" stroke="#1b293f" strokeWidth="3"/><path d="M63 194h74v6H63Z" fill="#b49b60"/><rect x="94" y="193" width="12" height="8" rx="1" fill="#d8bf83" stroke="#7c653d" strokeWidth=".8"/></>}
    {id==='loki'&&<><path d="M65 147h70l11 51H54Z" fill="#34564a"/><path d="m77 147 23 17 23-17-8 23-15 8-15-8Z" fill="#bca45f"/><path d="m100 165-14 31m14-31 14 31M65 194h70" stroke="#d0b976" strokeWidth="3"/><path d="m71 169-7 18m65-18 7 18" stroke="#182f2c" strokeWidth="3"/></>}
    {id==='jedi'&&<><path d="M65 148h70l14 49H51Z" fill="#333b37"/><path d="m91 150 11 16 11-16-5 26-8-10" fill="#d9d4bf"/><path d="M100 167v27" stroke="#677067" strokeWidth="1.4"/><path d="M61 187h78v8H61Z" fill="#282e2b"/><rect x="95" y="187" width="11" height="8" rx="1" fill="#9b9c8e"/></>}
    {id==='vader'&&<><path d="M66 147h68l12 51H54Z" fill="#282d34"/><path d="M75 150v39m7-39v39m36-39v39m7-39v39" stroke="#515962" strokeWidth="2"/><rect x="86" y="159" width="28" height="25" rx="2" fill="#171d24" stroke="#6c7479" strokeWidth="1"/><path d="M90 164h9m-9 5h9m-9 5h9" stroke="#d4d6c9" strokeWidth="2"/><rect x="104" y="163" width="5" height="5" fill="#79a8bd"/><rect x="104" y="171" width="5" height="5" fill="#c15b5a"/><path d="M61 190h78v8H61Z" fill="#171c21"/><rect x="94" y="189" width="12" height="10" rx="1" fill="#b6bcb8"/><rect x="72" y="191" width="8" height="6" fill="#acb7af"/><rect x="120" y="191" width="8" height="6" fill="#9cb3a6"/></>}
    {id==='batman'&&<><path d="M66 148h68l12 49H54Z" fill="#303c46"/><path d="m67 153 25 4 8 9-15 10-19-5Zm66 0-25 4-8 9 15 10 19-5Z" fill="#3d4b56" stroke="#596973" strokeWidth=".7"/><path d="m77 161 9 3 8-3 4 4 2-2 2 2 4-4 8 3 9-3-4 9-9-2-10 8-10-8-9 2Z" fill="#172029"/><path d="M86 178h28l-3 8H89Zm3 10h22l-3 8H92Z" fill="#26313b" stroke="#4e5e6a" strokeWidth=".65"/><path d="M61 190h78v8H61Z" fill="#a18c59"/>{[66,78,114,126].map(x=><rect key={x} x={x} y="189" width="8" height="10" rx="1.3" fill="#b49d66" stroke="#796c4c" strokeWidth=".7"/>)}<rect x="94" y="190" width="12" height="8" rx="1.5" fill="#ccb783" stroke="#8a7950" strokeWidth=".8"/></>}
    {id==='joker'&&<><Suit color="#6b527c" tie="#7d7160" shirt="#89909a" vest/><path d="M82 163h36l-5 31H87Z" fill="#78835a"/><path d="M100 169v24" stroke="#a9ac78" strokeWidth="1"/>{[176,184,191].map(y=><circle key={y} cx="103" cy={y} r="1" fill="#d6c48a"/>)}<path d="m77 151 10 13m36-13-10 13" stroke="#b092bb" strokeWidth="1.5"/></>}
    {id==='bateman'&&<><Suit color="#293c53" tie="#823d47" shirt="#eef0e8" pinstripe/><path d="M63 147 78 147l9 25 13 18v9H47l7-34Zm74 0-15 0-9 25-13 18v9h53l-7-34Z" fill="#c0d7d8" fillOpacity=".14" stroke="#a4b8bf" strokeOpacity=".55" strokeWidth=".8"/><path d="m57 174 4 20m82-20-4 20m-39-4v9" stroke="#c9dedc" strokeOpacity=".55" strokeWidth=".9"/><path d="m65 149 12 6 6 12m52-18-12 6-6 12" stroke="#d7e5dd" strokeOpacity=".5" strokeWidth=".9"/><circle cx="102" cy="194" r="1.2" fill="#d6dfd7"/><path d="M69 159q31 24 62 0" stroke="#343f43" strokeWidth="3"/><rect x="65" y="157" width="7" height="11" rx="3" fill="#344247"/><rect x="128" y="157" width="7" height="11" rx="3" fill="#344247"/></>}
    {id==='chaplin'&&<><Suit color="#383739" tie="#2d2a2b" vest/><path d="m83 150 17 8 17-8-3 13-14-5-14 5Z" fill="#ddd9cc"/><path d="M75 193q11-3 21 2m8 0q11-5 21-2" stroke="#9b9590" strokeWidth="1"/></>}
    {id==='sherlock'&&<><path d="M80 147h40v51H80Z" fill="#554d43"/><path d="m97 149 6 0 3 25-6 5-6-5Z" fill="#975e46"/><path d="M65 146q35 12 70 0l17 29-28 5-9-15-15 13-15-13-9 15-28-5Z" fill="#8b7d63"/><path d="M69 175h62l12 23H57Z" fill="#80745e"/><path d="M64 153h73m-79 12h85m-79 18h73m-63-36 0 22m14-20v26m24-26v26m14-28v22" stroke="#584f43" strokeWidth="1" opacity=".65"/><path d="M94 184q10 12 22 1" stroke="#c0a66a" strokeWidth="1.3"/><circle cx="116" cy="185" r="2" fill="#cdb679"/></>}
    {id==='wick'&&<><Suit color="#283039" tie="#171e25" shirt="#454b50"/><path d="m126 171 8-1m-8-7 2 2" stroke="#95a3a5" strokeWidth="1.1"/></>}
    {id==='toretto'&&<g data-part="tank-top">
      <path d="M73 149Q79 157 81 166Q100 180 119 166Q121 157 127 149Q125 170 141 182L154 195Q100 203 46 195L59 182Q75 170 73 149Z" fill="#fffdf8"/>
      <path d="M81 166q19 14 38 0" stroke="#e4dfd4" strokeWidth=".8"/>
      <path d="M88 163q12 20 24 0" stroke="#8e9998" strokeWidth="1"/>
      <path d="M100 175v10m-3-6h6" stroke="#748487" strokeWidth="1.7"/>
    </g>}
  </g>;
}

export {default as HandProp} from './CastProps';
