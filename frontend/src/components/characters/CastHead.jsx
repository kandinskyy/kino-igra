import {ThanosFace} from './ArmorHeads';
import Headgear from './Headgear';
import {BatemanFace,JokerMakeup} from './HeadExpressions';

const haircuts = {
  achi:'M43 102Q37 77 46 59q4-12 17-17l-1-8 12 2q10-12 22-6l8-6 10 7q24-1 35 19 12 19 7 52l-8-7-6-23q-14 5-24-6-15 12-34 13l-19-4-5 21-7-7-2 14Z',
  matrix:'M43 103C34 69 54 39 94 40q44-8 61 35l2 29-11-7-7-21q-20 6-39-13Q75 82 53 79l-3 25Z',
  fight:'M44 99 39 76l10-12-1-15 16 3 7-17 15 7 13-14 11 13 19-5 4 14 17 2-1 17 10 9-5 24-10-18-13 4-10-11-14 10-14-7-15 10-11-5-8 20Z',
  marty:'M43 100Q32 72 52 57l-4-11 19 2q14-20 45-12 34 2 44 31l-1 34-13-22q-17 7-27-15-16 15-40 15l-12 20-6-10-8 14Z',
  hulk:'M43 102 39 77l9-17 14-5 6-14 16 4 14-7 15 6 16-2 5 11 15 5 9 20-2 24-13-20-9 5-10-9-12 7-12-8-14 8-11-7-10 16-7-9Z',
  widow:'M43 99Q33 79 43 58q9-17 29-16 30-18 58 2 29 17 28 48l-10 26-8-20 1-22q-20 7-33-16Q94 86 66 83l-7 17-6-11-7 24Z',
  brother:'M43 100Q36 75 50 57 65 40 92 42q39-9 59 22l6 37-11-10-3-17-14 10-12-7-14 8-11-9-13 9-10-7-11 24-6-10-4 12Z',
  terminator:'M43 97 40 68 50 50 66 39 88 35 118 36 140 45 152 60 157 99 145 88 140 69 60 68 52 98Z',
  wolf:'M43 99Q34 66 58 49q29-20 61-7 30 5 37 34l1 25-10-8-7-20q-21 5-40-14-11 18-46 19l-4 23Z',
  bill:'M43 102Q34 67 56 49 78 33 101 39q35-5 51 24 10 17 5 43l-10-5-4-27-10 7-12-4-14 4-13-4-13 4-14-6-10 29-5-13-6 16Z',
  pirate:'M42 103Q33 69 52 52q18-16 45-13 31-10 53 17 13 18 8 48l-13-18-4-16-78 0-9 31-5-9-5 17Z',
  joker:'M43 107C33 88 36 66 49 55q10-17 29-12 18-18 37-6 21-4 34 18 16 18 9 49l-10-16-4-17q-19 0-33-17-8 24-38 28l-13-4-5 25-7-10Z',
  bateman:'M43 110C34 83 40 54 58 43c14-18 42-19 61-7 27-1 43 26 38 57l-6 22-8-17-2-30q-7-4-20-17-10 25-47 27l-14-3-4 28-7-8Z',
  wick:'M42 112Q31 84 43 59q13-22 34-19 13-6 23 2 16-8 35 2 24 14 24 43l-5 27-11-14-1-24q-23-8-42-24-13 22-40 25l-3 26-8-7Z',
  sherlock:'M43 101Q34 72 54 52 72 34 100 42q35-7 52 23l5 37-13-17-3-12-11 10-12-6-14 9-11-7-14 10-11-9-10 22-6-10Z',
  jedi:'M43 105Q34 74 51 54q15-19 40-15 28-8 48 8 17 13 18 39l-3 22-10-12-5-24q-10 13-26 11l-1-14q-17 17-42 14l-11 21-6-8Z',
  loki:'M43 107Q31 80 46 57q16-22 42-17 27-7 48 9 23 17 23 45l-5 19-11-13-3-23q-24-6-40-22-17 16-40 21l-4 29-7-7Z',
};
const longHair = {
  bateman:'M55 66Q38 92 45 118l-3 24q9 18 28 23l3-17-7-46m69-36q24 25 21 50l2 26q-8 14-26 17l-5-15 7-42Z',
  widow:'M44 73Q26 97 41 132l-5 14 14 12 10-17 2-51m77-17q23 24 20 45l7 17-11 17-16-12-1-48Z',
  pirate:'M48 70Q30 98 39 145l-6 14 15 2 11-19 3-63m76-9q24 28 19 60l9 29-17 3-12-22-2-58Z',
  bill:'M46 75Q31 103 38 156l24 4 3-75m73-10q24 29 24 81l-25 4-4-76Z',
  wick:'M46 70Q30 94 37 126q2 21 19 29l7-12-1-60m74-13q28 28 25 56-2 21-18 29l-9-12 2-60Z',
  loki:'M47 70Q29 101 39 151l21 8 4-75m72-14q27 29 24 81l-19 7-6-74Z',
  joker:'M46 68Q30 96 37 120q3 16 16 25l10-63m74-14q25 25 22 49-2 18-15 28l-9-60Z',
  thor:'M45 72Q26 104 35 143q5 16 24 16l5-74m72-13q26 32 28 71-5 16-25 16l-4-74Z',
};

export function BackHair({id,hair}) { return longHair[id]?<path d={longHair[id]} fill={hair}/>:null; }

export function FrontHair({id,hair}) {
  if(id==='achi') return <g><path d={haircuts.achi} fill={hair}/><path d="M53 61q8-16 30-17m-20 16q14-17 36-18m-17 18q15-15 31-14m-9 14q15-8 25 4" stroke="#45464A" strokeWidth="1.5" fill="none" strokeLinecap="round"/></g>;
  if(id==='bateman') return <g><path d={haircuts.bateman} fill={hair}/><path d="M48 64q13-31 43-31m-33 24q19-25 49-21m9 5q21 4 32 27" stroke="#705042" strokeWidth="1" strokeOpacity=".55" fill="none"/></g>;
  if (id==='toretto'||id==='thanos'||id==='vader'||id==='batman'||id==='jason') return null;
  if (id==='thor') return <path d="M43 103Q32 70 51 51 73 30 100 40q29-8 47 16 14 17 10 45l-13-21-3-11q-19 3-41-17-15 18-42 24l-5 27-5-12Z" fill={hair}/>;
  if (id==='chaplin') return <g fill={hair}><path d="M43 107Q32 80 47 61q15-20 48-19 34-5 54 19 15 18 7 47l-11-16-6-18-77 0-9 31-6-13Z"/>{[[50,79],[56,69],[67,65],[80,62],[126,65],[141,74],[150,89]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="9"/>)}</g>;
  return haircuts[id]?<path d={haircuts[id]} fill={hair}/>:null;
}

export function FaceUnderlay({id}) {
  if (id==='joker') return <g><path d="M61 102q1-15 20-17l15 6 2 18-7 18-17 3-14-12Zm43-11 15-6q20 2 22 18l-2 16-14 11-17-4-6-17Z" fill="#837c71" fillOpacity=".4"/><path d="M65 102q1-13 16-13l13 5 1 17-6 12-15 1-10-9Zm40-8 14-5q15 0 17 14l-1 12-11 10-15-3-5-12Z" fill="#4a4742"/><path d="m72 122 1 5m55-4-1 5" stroke="#70665d" strokeWidth="1.7"/></g>;
  if (id==='terminator') return <><path d="m131 111 11 4-2 18-10-2-6-10Z" fill="#a58b7c"/><path d="m134 114 7 3-4 13-7-3Z" fill="#9ba8a5"/><path d="m136 117-4 9m3-4 5 0" stroke="#536467" strokeWidth="1"/></>;
  return null;
}

export function FaceDetails({id,skin,winning}) {
  if(id==='thanos') return <ThanosFace winning={winning}/>;
  if(['captain','iron','forrest','sherlock','thor'].includes(id)) return <Headgear id={id} skin={skin} winning={winning}/>;
  if(id==='bateman') return <BatemanFace winning={winning}/>;
  if(id==='joker') return <JokerMakeup winning={winning}/>;
  return <g strokeLinecap="round" strokeLinejoin="round">
    {id==='matrix'&&<g fill="#202725" stroke="#59615a" strokeWidth="1"><path d="M67 98q12-5 29-1l-3 15q-17 6-24-5Z"/><path d="M104 97q17-4 29 1l-2 9q-7 11-24 5Z"/><path d="M96 101h8m-37 0-12-5m78 5 12-5" fill="none"/><path d="m71 100 10-1m28 0 10 1" stroke="#a3aca1" strokeWidth=".8"/></g>}
    {id==='fight'&&<g stroke="#68473c" strokeWidth="1.5"><path d="M65 96q14-4 31 0l-2 17H67Zm39 0q17-4 31 0l-2 17h-27Z" fill="#9b4d48" fillOpacity=".7"/><path d="M96 100h8m-39-1-11-4m81 4 10-4"/></g>}
    {id==='brother'&&<><path d="M44 92Q35 45 100 40q65 5 56 52" stroke="#383d3b" strokeWidth="5"/><rect x="39" y="88" width="12" height="27" rx="5" fill="#505b58" stroke="#a3aaa0" strokeWidth="1.3"/><rect x="149" y="88" width="12" height="27" rx="5" fill="#505b58" stroke="#a3aaa0" strokeWidth="1.3"/><path d="M44 94v15m112-15v15" stroke="#b7bdb1" strokeWidth="1.4"/></>}
    {id==='terminator'&&<g><path d="M66 97h30l-3 16H69Zm38 0h30l-3 16h-24Z" fill="#222a2f" stroke="#79858a" strokeWidth="1.4"/><path d="M96 101h8m-38 0-11-5m79 5 11-5" stroke="#343d42" strokeWidth="2"/><path d="M110 101h10" stroke="#c15e59" strokeWidth="2"/></g>}
    {id==='pirate'&&<><path d="M47 76q53-23 106 0l-4 13q-49-20-98 0Z" fill="#9a4c46"/><path d="m57 80-12 34 9-3 4-27" fill="#b16c55"/><path d="M44 75Q27 42 38 36l28 9 34-24 34 24 28-9q11 6-6 39l-28-9-28 10-28-10Z" fill="#654c38" stroke="#a88c61" strokeWidth="2"/><path d="m46 48 21 8 33-23 33 23 21-8" stroke="#8e714c" strokeWidth="1.4"/><path d="M56 91v48m88-48v45m-87-7-6 12m91-10 7 11" stroke="#514032" strokeWidth="3"/>{[[55,111,'#d0b67b'],[57,122,'#7d9e99'],[145,117,'#cdbb91'],[142,131,'#b05d50']].map(([cx,cy,c])=><circle key={cx+cy} cx={cx} cy={cy} r="3" fill={c}/>)}</>}
    {id==='wolf'&&<><path d="M58 63q22-3 38-15m10 1q20 16 37 18" stroke="#96714d" strokeWidth="1.3"/><path d="M76 131q-5 4-3 9m51-9q5 4 3 9" stroke="#ca9e80" strokeWidth="1"/></>}
    {id==='bill'&&<><path d="M52 78q48 10 96 0" stroke="#ab8b50" strokeWidth="1.2"/><path d="M45 112v36m110-36v36" stroke="#ddbc7d" strokeWidth="1.2"/></>}
    {id==='jason'&&<><path d="M58 58q42-22 84 0 18 18 13 52-5 32-25 46-30 13-60 0-20-14-25-46-5-34 13-52Z" fill="#d7ceb1" stroke="#9b927a" strokeWidth="1.6"/><path d="M66 98q14-9 28 0l-1 13H70Zm40 0q14-9 28 0l-4 13h-23Z" fill="#343935"/><path d="m88 77 12 10 12-10m-47 43 14 4-5 9m61-13-14 4 5 9" stroke="#aa5a4c" strokeWidth="4"/><path d="m100 111-4 12h8Z" fill="#a79d81"/>{[[83,61],[100,58],[117,61],[69,76],[131,76],[57,92],[143,92],[60,110],[140,110],[85,137],[100,136],[115,137],[90,148],[110,148]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.1" fill="#5d6356"/>)}<path d="M68 64 61 73m73-7-6 8m-58 65-5-6" stroke="#a69c80" strokeWidth="1"/></>}
    {id==='spider'&&<><path d="M43 89Q34 57 66 39q34-17 68 1 31 16 23 50-56-16-114-1Z" fill="#b84c55" stroke="#6a333c" strokeWidth="1"/><path d="M100 34v44m-30-38 14 40m46-40-14 40M52 54q48 16 96 0M44 71q56 15 112 0" stroke="#6c343d" strokeWidth="1"/><path d="m61 56 24 7-11 8-12-4Zm78 0-24 7 11 8 12-4Z" fill="#e9e6d9" stroke="#30363c" strokeWidth="2"/><path d="M46 85q54-10 108 0" stroke="#743b43" strokeWidth="5"/><path d="m71 84 14 2-5 9 16-9 9 7 12-9 14 4-5-8-44-3Z" fill="#694630"/></>}
    {id==='loki'&&<><path d="M49 85q6-29 24-29l27 13 27-13q18 0 24 29l-15-9-15-6-21 12-21-12-15 6Z" fill="#c3a450" stroke="#8d7541" strokeWidth="1.2"/><path d="M70 66C42 43 37 19 48 7q-1 29 31 43Zm60 0c28-23 33-47 22-59 1 29-31 43-31 43Z" fill="#cdb367" stroke="#977f45" strokeWidth="1.2"/><path d="M100 70V57" stroke="#e7cd87" strokeWidth="3"/></>}
    {id==='vader'&&<><path d="M42 98q-7-61 58-67 65 6 58 67l10 53-28 10-16-13H76l-16 13-28-10Z" fill="#2b3037" stroke="#5d6870" strokeWidth="1.4"/><path d="M100 34v67M48 91q23-20 52-12 29-8 52 12" stroke="#66747c" strokeWidth="2"/><path d="m58 92 31-3 7 18-27 11-15-9Zm84 0-31-3-7 18 27 11 15-9Z" fill="#121c25" stroke="#7d8282" strokeWidth="1"/><path d="m63 95 18-2m38 0 18 2" stroke="#485c6b" strokeWidth="1.5"/><path d="m100 105-25 38h50Z" fill="#151c23" stroke="#8e9799" strokeWidth="1.2"/><path d="M100 112v25m-5-17v17m10-17v17m-15-10v10m20-10v10" stroke="#788489" strokeWidth="1.7"/><path d="m69 119-5 26 12 5m55-31 5 26-12 5" stroke="#737f83" strokeWidth="2"/><circle cx="69" cy="142" r="5" fill="#202a32" stroke="#adb3b1" strokeWidth="1.5"/><circle cx="131" cy="142" r="5" fill="#202a32" stroke="#adb3b1" strokeWidth="1.5"/><path d="M53 67q4-17 21-23" stroke="#7e898d" strokeWidth="2"/></>}
    {id==='batman'&&<><path d="M43 103 47 20l28 30q25-10 50 0l28-30 4 83-13 28-23-2-8-13H87l-8 13-23 2Z" fill="#2e3741" stroke="#53616a" strokeWidth="1"/><path d="m65 98 29 8-7 9-16-2Zm70 0-29 8 7 9 16-2Z" fill="#e0e7df"/><path d="m100 99-8 20 8 9 8-9Z" fill="#445260"/><path d="m55 57-4 32m94-32 4 32" stroke="#687680" strokeWidth="1.4"/></>}

    {id==='chaplin'&&<><path d="M55 63V47q0-24 25-24h40q25 0 25 24v16Z" fill="#302e2f" stroke="#666160" strokeWidth="1.1"/><path d="M55 52h90v10H55Z" fill="#535050"/><ellipse cx="100" cy="65" rx="57" ry="8" fill="#302e2f" stroke="#625e5b" strokeWidth="1"/><path d="M68 90q9-8 22-3m20 0q13-5 22 3" stroke="#3f342f" strokeWidth="2.4"/></>}
    {id==='toretto'&&<><path d="M63 75q8-18 31-22-19 0-31 13Z" fill="#efd0a8" fillOpacity=".18"/></>}
  </g>;
}
