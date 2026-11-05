import React from 'react';

export function BackHair({c}){
  if(c.id==='mabel')return <g fill={c.hair}><path d="M46 75Q39 36 97 36q60-5 62 53l-3 59q-1 27 15 35-24 19-50 5l-56 5-29-10q14-23 9-51Z"/><path d="M140 116q-9 37 6 64" stroke="#936448" strokeWidth="1.4"/></g>;
  if(c.id==='makima')return <g><path d="M47 71Q45 39 100 39t53 39l-5 75-16 9H65l-20-11Z" fill={c.hair}/><path d="M143 137q17 6 10 16 13 9 2 17 10 10 0 18 4 7-4 11" stroke="#9b5a4c" strokeWidth="11"/>{[143,152,162,172,182,192].map(y=><path key={y} d={`m146 ${y} 9 5-8 5`} stroke="#d18b6e" strokeWidth="3"/>)}</g>;
  if(c.id==='sasuke')return <path d="m45 88-12-13 10-9-11-14 20 1 0-18 17 8 9-19 15 13 16-14 11 15 23-8-1 19 21-1-9 17 16 12-19 14 1 47-18-16H65l-16 19Z" fill={c.hair}/>;
  if(c.id==='l')return <path d="m44 90-15-9 14-12-10-10 23-3-1-18 19 7 8-18 15 13 18-15 10 18 22-8-1 21 23 1-12 16 19 12-21 15 10 20-18-3 10 24-21-11-13 21H69l-18 13 3-24-16 8 5-22Z" fill={c.hair}/>;
  return null;
}

export function Hair({c}){
  const h=c.hair;
  switch(c.id){
    case 'walter':case 'saitama':case 'denji':return null;
    case 'jesse':return <path d="M45 91q-1-45 55-45t56 45l-8 16-8-22-18 1-20-8-19 8-21-1-9 23Z" fill={h}/>;
    case 'naruto':return <path d="m42 93-7-18 14-4-11-16 19 1-2-20 19 9 9-20 16 17 17-19 7 21 22-8-3 21 19-1-9 16 17 6-17 18-13-17-14 9-12-19-15 13-13-12-14 17-11-9-12 20Z" fill={h}/>;
    case 'sasuke':return <g fill={h}><path d="M43 109Q34 64 62 44q34-17 65-2 29 15 30 42l-7 39-15-29-6-21-14 25-12-30-17 36-11-24-12 42-11 14-1-37Z"/><path d="m61 60 18-8m36-1 21 11" stroke="#434d57" strokeWidth="1.2"/></g>;
    case 'kakashi':return <g fill={h}><path d="m43 91-12-13 17-4-9-16 21 3-3-21 20 9 6-22 15 17 13-22 9 21 22-14-1 24 22-4-9 20 16 5-21 19-15-9-16 9-15-12-17 10-15-6-14 18Z"/><path d="m58 64 20-12m14 8 11-17m17 19 16-9" stroke="#edf0eb" strokeWidth="1.4"/></g>;
    case 'gojo':return <g><path d="M41 113q-5-10-12-10l10-15q-10-1-15-7l16-11-9-8 21-6-3-17 19 5 9-17 13 9 14-16 9 17 19-9 2 17 22-2-6 17 17 4-11 13 15 8-15 12 2 14-13-10-7 16-8-27-8 18-11-23-10 19-11-19-13 24-5-19-9 28Z" fill={h}/><path d="m57 65 14-14m13 12 13-19m14 21 7-17m12 22 12-10M63 72l-9 19m75-13 12 17" stroke="#cbd2dc" strokeWidth="1.2"/></g>;
    case 'rick':return <path d="M43 117 29 106l10-15-20-12 22-10-6-24 25 9 9-27 24 21 16-27 11 29 26-11-1 25 24 4-17 21 19 14-20 12-6-22-21-20-22 3-28-2-20 19-8 24Z" fill={h}/>;
    case 'zoro':return <g><path d="M43 93 40 81l6-6-3-10 11 1 1-12 12 3 5-12 10 4 8-11 11 8 10-9 6 11 12-5 4 12 13-1 0 12 11 4-5 11 6 8-13 12-8-16-13 3-11-11-13 9-14-10-12 14-12-5-10 20Z" fill={h}/><path d="m55 66 8-6m11 5 9-7m14 3 8-7m11 10 8-7m10 12 5-5" stroke="#b2cba5" strokeWidth="1.2"/></g>;
    case 'l':return <g><path d="M42 116Q30 66 59 45q30-20 65-6 33 10 35 49l-10 30-11-24-6-20-12 30-12-29-13 33-11-30-14 34-8-19-9 34-5-22Z" fill={h}/><path d="m53 75 18-20m11 13 20-22m12 25 18-13m-8 28 14-7" stroke="#424849" strokeWidth="1"/></g>;
    case 'levi':return <g><path d="M44 114Q35 81 46 59q13-24 45-25l10 4 10-4q34 4 43 32 7 22 1 48l-7 7-1-24-6-16-2 28-6-32-2 24-8-34-5 29-6-38-8-8-8 1-8 23-5 34-4-24-6 32-3-21-9 24-3-30-6 21-1 24Z" fill={h}/><path d="M101 40q-8 7-11 19m17-19q10 7 13 24M82 44Q58 52 51 78m74-31q17 14 20 37" stroke="#54534c" strokeWidth="1.1"/></g>;
    case 'gihun':return <g><path d="M43 118Q29 98 39 81q-6-21 12-33 11-18 35-15 20-13 35 2 27-1 32 23 14 13 7 34l-7 26-8-8-2-29q-8-18-26-25-8-5-15-1 3 17-12 23-12 6-23 0-7 14-10 34l-4 8Z" fill={h}/><path d="M104 40q-12 5-10 16 4 16-17 17M50 76q3-21 25-27m42-5q22 5 27 31m1 10 6 19" stroke="#51504a" strokeWidth="1.4"/></g>;
    case 'saul':return <g><path d="M43 112Q32 71 57 49q22-21 48-13 30-7 46 17 13 21 6 55l-9 9-8-32-9-17q-20 7-35-13-11 17-38 25l-7 35Z" fill={h}/><path d="M60 68q18-19 36-21m12-3q22 0 34 19M52 92l4 16m91-18 3 17" stroke="#8c745c" strokeWidth="1.3"/></g>;
    case 'homelander':return <g><path d="M43 110Q35 64 61 44q34-21 67-4 32 13 30 51l-7 23-10-34q-28-2-44-22-18 18-43 21l-3 33Z" fill={h}/><path d="M55 67q32-30 80-12M62 71q30-25 76-10M77 68q29-16 60-3" stroke="#d0bc8a" strokeWidth="1.5"/></g>;
    case 'light':return <g><path d="M43 116Q32 73 52 51q29-27 68-14 35 9 38 47l-9 40-8-30-9-20-10 25-10-31-16 34-8-27-16 31-7-24-10 35Z" fill={h}/><path d="m52 78 17-21m10 15 18-24m8 22 14-20m12 31 11 16" stroke="#ab7950" strokeWidth="1.3"/></g>;
    case 'makima':return <g><path d="M43 117Q32 62 67 43q30-16 59-3 34 12 31 59l-4 48-13 3-2-56-10-21-11 20-13-26-13 30-10-25-17 31-6 47-12-4Z" fill={h}/><path d="m62 72-7 60m31-82-7 30m25-36-8 32m26-27-8 29m26-5 7 58" stroke="#d28b6c" strokeWidth="1.3"/></g>;
    case 'mabel':return <g><path d="M43 113Q34 68 56 48q26-21 56-13 39 7 46 47l-6 33-13-25q-24-2-42-26-14 20-41 24l-6 29Z" fill={h}/><path d="M126 40q20 22 18 54" stroke="#d96691" strokeWidth="8"/><path d="M127 41q14 16 16 32" stroke="#e987aa" strokeWidth="1.5"/></g>;
    case 'dipper':return <g fill={h}><path d="M43 110Q34 62 61 44q38-20 71 1 28 15 25 54l-10 18-12-25q-17-1-24-17-13 16-28 10-4 20-22 15l-10 21Z"/><path d="M43 84q-18 5-12 21 8 9 16-2m102-23q20 5 14 19l-9 5"/></g>;
    case 'luffy':return <path d="m43 109-5-24 6-18 13-16 15 6 13-13 15 14 18-11 12 16 17-4 12 26-5 29-13-24-6 19-14-29-9 21-14-25-13 27-9-20-13 27-6-11-6 19Z" fill={h}/>;
    case 'morty':return <path d="M44 116Q35 102 40 85 43 48 77 36q31-12 57 7 27 18 27 49l-5 25-8-11q-1-25-14-39-13-13-33-14-24-1-41 17-9 12-10 35Z" fill={h}/>;
    default:return null;
  }
}

function LeafPlate(){return <g><rect x="69" y="78" width="63" height="20" rx="5" fill="#aab4b8" stroke="#6e7c81" strokeWidth="1"/><path d="M99 83q-11-2-11 5 0 8 10 6 9-3 1-7l-7 5-7 0m15-8 4-5m-14 15-5 3" stroke="#53626a" strokeWidth="1.6"/>{[74,127].map(x=><g key={x}><circle cx={x} cy="83" r="1.2" fill="#53626a"/><circle cx={x} cy="93" r="1.2" fill="#53626a"/></g>)}</g>;}
export function Headwear({c}){
  if(c.id==='luffy')return <g><path d="M51 70q2-41 49-41t49 41Z" fill="#d6b86b"/><path d="M52 60q48 10 96 0v13H52Z" fill="#ab4640"/><ellipse cx="100" cy="77" rx="72" ry="11" fill="#e1c57b"/><path d="M34 77q65 10 132 0M64 45l7 13m14-22 5 22m22-22-3 22m23-13-8 13" stroke="#b89a56" strokeWidth="1.1"/></g>;
  if(c.id==='walter')return <g><path d="M52 69 59 35q41-11 82 0l6 34Z" fill="#292b2a"/><path d="M57 57q43 9 86 0v13H55Z" fill="#161d20"/><path d="M34 69q66 13 132 0l-5 10q-61 13-122 0Z" fill="#272a29"/><path d="M65 39q35-6 70 0" stroke="#46443c" strokeWidth="1.2"/></g>;
  if(c.id==='jesse')return <g><path d="M42 78Q39 32 98 31q60-2 60 47Z" fill="#282e30"/><path d="M42 70q57-12 116 0v20q-57-8-116 0Z" fill="#34393a"/>{[49,58,67,76,85,94,103,112,121,130,139,148,153].map(x=><path key={x} d={`M${x} 75v10`} stroke="#4a4d49" strokeWidth="1"/>)}</g>;
  if(c.id==='dipper')return <g><path d="M42 77Q42 30 99 31q58 0 59 46Z" fill="#e5e4d9"/><path d="M42 77q0-33 23-39l-4 39m97 0q0-33-23-39l5 39" fill="#406480"/><path d="m100 41-9 13h5l-10 12h28l-10-12h5Z" fill="#416882"/><path d="M42 76q69-16 121 0l-15 12q-47-9-106-3Z" fill="#35566f"/><path d="M48 79q54-9 105 2" stroke="#638499" strokeWidth="1"/></g>;
  if(c.id==='kakashi')return <g><path d="M43 77Q100 71 157 77v18Q100 89 43 95Z" fill="#313c46"/><rect x="69" y="76" width="63" height="16" rx="3" fill="#aab4b8" stroke="#6e7c81" strokeWidth="1"/><path d="M99 80q-10-1-10 4 0 6 9 4 7-2 1-5l-6 4h-6m13-7 3-4" stroke="#53626a" strokeWidth="1.3"/>{[74,127].map(x=><g key={x}><circle cx={x} cy="80" r="1" fill="#53626a"/><circle cx={x} cy="88" r="1" fill="#53626a"/></g>)}</g>;
  if(c.id==='naruto')return <g><path d="M42 78q58-13 116 0v22q-58-12-116 0Z" fill="#30373b"/><LeafPlate/><path d="m43 84-17 8 15 6m113-12 18 12-16 2" fill="#33393e"/></g>;
  return null;
}

export function FaceDetails({c,winning}){
  const id=c.id;
  if(id==='walter')return <g><path d="M82 133q18-13 36 0l2 13q-3 16-20 18-17-2-20-18Z" fill="#614632"/><path d="M88 136q12-5 24 0v9q-12 5-24 0Z" fill={c.skin}/><path d="M93 142h14" stroke="#76513b" strokeWidth="1.2"/><path d="m88 151 4 5m5-6 1 8m7-8-1 8m8-7-3 5" stroke="#7e5b3e" strokeWidth="1"/><g stroke="#3b3932" strokeWidth="1.8" fill="none"><path d="M62 96h34l-3 19q-13 9-27-1Zm42 0h34l-4 18q-14 10-27 1Zm-8 7h8m-43-5-14-2m92 2 13-3"/></g><path d="M73 84h17m20 0h17" stroke="#9c7b5c" strokeWidth="1"/></g>;
  if(id==='jesse')return <g><path d="M57 123q8 23 25 31 18 9 36 0 17-8 25-31-2 31-43 39-40-8-43-39Z" fill="#766047" opacity=".2"/><path d="M87 137q6-5 13-3 7-2 13 3l-3 2q-6-2-10-1-5-1-10 1Z" fill="#80664c" opacity=".75"/><path d="M91 143q9-2 18 0m-15 3h12" stroke="#a67564" strokeWidth="1.3"/><path d="M94 152q6-2 12 0l-2 5h-8Z" fill="#846b50" opacity=".45"/></g>;
  if(id==='mabel')return <g><path d="M91 142q10 5 20-1" stroke="#684236" strokeWidth="1.3"/><ellipse cx="64" cy="125" rx="6" ry="3" fill="#db9a85" opacity=".5"/><ellipse cx="136" cy="125" rx="6" ry="3" fill="#db9a85" opacity=".5"/></g>;
  if(id==='naruto')return <path d="m55 116 18 5m-17 4 16 2m-14 6h12m59-12 18-5m-17 11 16-2m-14 8h12" stroke="#a0754d" strokeWidth="1.2"/>;
  if(id==='kakashi')return <g><path d="M43 116Q70 117 100 111q30 6 57 5-5 42-57 46-52-4-57-46Z" fill="#293640"/><path d="M48 120q27 0 52-5 25 5 52 5" stroke="#43515c" strokeWidth="1"/><path d="m118 97-2 18" stroke="#ad7e6a" strokeWidth="1.2"/></g>;
  if(id==='zoro')return <g><path d="m115 88-2 42" stroke="#aa7c62" strokeWidth="1.7"/>{[119,125,131].map(y=><path key={y} d={`M51 ${y}q-7-2-6 4 0 7 7 3`} stroke="#d7b465" strokeWidth="2"/>)}</g>;
  if(id==='gihun')return <g><path d="M70 117q11 5 21 0m18 0q11 5 21 0" stroke="#b18d72" strokeWidth=".9"/><path d="M100 117q-4 6-2 9l6 1" stroke="#af8569" strokeWidth="1.1"/><path d="M89 140q11-2 22 0m-16 4h10" stroke="#815c48" strokeWidth="1.2"/><path d="M76 128q-4 5-3 10m51-10q4 5 3 10" stroke="#c19a7c" strokeWidth=".8"/></g>;
  if(id==='saul')return <g stroke="#aa8267" strokeWidth="1"><path d="M78 79q22-5 44 0m-40 5q18-4 36 0m-49 39-4 9m66-9 4 9m-46 17q11 4 22 0"/></g>;
  if(id==='l')return null;
  if(id==='rick')return <g><path d="M70 88q29-8 60 0" stroke="#95afb3" strokeWidth="5"/><path d="M71 113h24m10 0h24" stroke="#bfa68c" strokeWidth="1.2"/><path d="M92 141q10 4 19-1m-4 4v9q-5 6-6 0v-5" stroke="#a7bf8b" strokeWidth="2.5"/></g>;
  if(id==='luffy')return <path d="m122 125 13-2m-11-2 1 8m5-10 1 8" stroke="#825a3e" strokeWidth="1.2"/>;
  if(id==='gojo')return <path d={winning?'M91 142q11 5 21-2':'M93 143q8 3 15-1'} stroke="#775440" strokeWidth="1.2"/>;
  return null;
}
