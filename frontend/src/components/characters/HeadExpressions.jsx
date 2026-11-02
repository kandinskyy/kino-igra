function BatemanExpression({winning}) {
  const gaze=winning?-3:0;
  return <g data-expression={winning?'sigma':'composed'} strokeLinecap="round" strokeLinejoin="round">
    <path d={winning?'M66 122q10 5 19 4-6 4-8 8-8-2-11-12Zm68 0q-10 5-19 4 6 4 8 8 8-2 11-12Z':'M68 125q8 4 13 4l-4 3q-6-1-9-7Zm64 0q-8 4-13 4l4 3q6-1 9-7Z'} fill="#b98c74" fillOpacity={winning?'.45':'.25'}/>
    <path d={winning?'M72 91q10-2 20 5m16 0q10-7 20-5':'M73 89q8-2 18 0m18 0q9-2 17-1'} stroke="#48332b" strokeWidth="2"/>
    <g transform={`translate(0 106) scale(1 ${winning?.58:.88}) translate(0 -106)`}>
      <g fill="#fff8ed"><ellipse cx="84" cy="106" rx="15" ry="17" transform="rotate(22 84 106)"/><ellipse cx="116" cy="106" rx="15" ry="17" transform="rotate(-22 116 106)"/></g>
      <circle cx={93+gaze} cy="106" r="1.9" fill="#33281f"/><circle cx={109+gaze} cy="106" r="1.9" fill="#33281f"/>
    </g>
    {winning?<>
      <path d="m98 87-1 5m6-5 1 5" stroke="#be927a" strokeWidth=".8"/>
      <path d="M94 139q4-3 8 0 4-2 6 2l-3 4q-5 2-10-2Z" fill="#b77e68" stroke="#8e5d4c" strokeWidth=".6"/>
      <path d="M96 141q6 2 10-1m-7 6 5-1" stroke="#875c4c" strokeWidth="1"/>
      <path d="m102 123-3 3 4 1M89 151q11 3 22-1" stroke="#bc8d73" strokeWidth=".9"/>
    </>:<><path d="M94 143h13" stroke="#7c5747" strokeWidth="1.2"/><path d="M98 146h7" stroke="#c1977d" strokeWidth=".8"/></>}
  </g>;
}

export function BatemanFace({winning}) {
  return <g data-part="bateman-expression" data-cycle={winning?'normal-sigma-normal':'none'}>
    {winning?<>
      <g className="bateman-face-normal" opacity="0"><BatemanExpression winning={false}/></g>
      <g className="bateman-face-sigma" opacity="1"><BatemanExpression winning/></g>
    </>:<BatemanExpression winning={false}/>}
  </g>;
}

export function JokerMakeup({winning}) {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <path d={winning?'M77 137q23 18 46-1':'M78 139q22 12 44-2'} stroke="#9d514e" strokeWidth="4"/>
    <path d={winning?'M87 142q13 5 27-1':'M89 143q11 3 23-1'} stroke="#493b35" strokeWidth="1.6"/>
    <path d="m77 137-5-5m51 4 5-6" stroke="#a86259" strokeWidth="2.2"/>
    <path d="m72 133 3 8m53-10-3 9" stroke="#bc8a79" strokeWidth="1"/>
    <path d="m64 115-1 6m72-6 1 5" stroke="#94847a" strokeWidth="1.3"/>
  </g>;
}
