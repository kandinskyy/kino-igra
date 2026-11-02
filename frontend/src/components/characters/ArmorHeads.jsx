export function CaptainHead({skin,winning}) {
  return <g data-part="headgear" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="100" cy="104" r="58" fill={skin}/>
    <path d="M43 106C37 70 61 38 100 38s63 32 57 68l-7 27-12 16-12 5 6-20 7-16V99q-16-16-35-1l-4 15-4-15Q77 83 61 99v19l7 16 6 20-12-5-12-16Z" fill="#41678d" stroke="#2d4a69" strokeWidth="1"/>
    <path d="M49 86Q48 57 77 47m46 0q29 10 28 39" stroke="#7790aa" strokeWidth="1.1"/>
    <g fill="#fffaf1"><ellipse cx="84" cy="107" rx="13" ry="14.5" transform="rotate(18 84 107)"/><ellipse cx="116" cy="107" rx="13" ry="14.5" transform="rotate(-18 116 107)"/></g>
    <circle cx="92" cy="108" r="1.8" fill="#2c2925"/><circle cx="108" cy="108" r="1.8" fill="#2c2925"/>
    <path d="M94 76 98 53h5l7 23h-5l-2-6h-6l-1 6Zm4-10h4l-2-8Z" fill="#ebece1" fillRule="evenodd"/>
    <path d="m47 83-9-6 3 13 7 3m105-10 9-6-3 13-7 3" fill="#d8e2e0"/>
    <path d="m54 122 7 17 10 7m75-24-7 17-10 7" stroke="#243f5b" strokeWidth="2"/>
    <path d={winning?'M93 142q7 5 14 0':'M94 143q6 2 12 0'} stroke="#73523e" strokeWidth="1.2"/>
  </g>;
}

export function IronHead() {
  return <g data-part="headgear" data-mask="mark-iii" strokeLinecap="round" strokeLinejoin="round">
    <path d="M45 103C40 69 57 41 85 38h30c28 3 45 31 40 65l-4 30-19 22q-32 15-64 0l-19-22Z" fill="#ad493d" stroke="#6d2d2b" strokeWidth="1.4"/>
    <path d="M48 87h9v35l-5 6m100-41h-9v35l5 6" fill="#7e332e" stroke="#cd6b4f" strokeWidth="1"/>
    <path d="M63 58 80 46l13 10h14l13-10 17 12 9 24-9 14 1 29-15 23-23 8-23-8-15-23 1-29-9-14Z" fill="#d4b779" stroke="#987844" strokeWidth="1.1"/>
    <path d="M65 61 79 51l13 10h16l13-10 14 10 5 17-12 13H72L60 78Z" fill="#e3c78b"/>
    <path d="m64 98 8-7h56l8 7-5 25-12 10H81l-12-10Z" fill="#c4a365"/>
    <path d="M70 99 94 101v7l-23-2Zm60 0-24 2v7l23-2Z" fill="#34434a"/>
    <path d="m73 101 18 2v3l-18-2Zm54 0-18 2v3l18-2Z" fill="#e5fff8"/>
    <path d="m97 114 3-2 3 2v10h-6Z" fill="#cfaf70"/>
    <path d="M85 138h30l-4 3H89Z" fill="#746044"/>
    <path d="m76 143 8 8 16 4 16-4 8-8" stroke="#f0d59a" strokeWidth="1"/>
    <path d="m69 118 6 10m56-10-6 10" stroke="#f0d59a" strokeWidth="1.1"/>
    <path d="M56 65q4-12 13-16m75 16q-4-12-13-16M58 140l14 16m70-16-14 16" stroke="#d97655" strokeWidth="1.4"/>
    <path d="M91 158h18" stroke="#652b2b" strokeWidth="2"/>
  </g>;
}

function Wing() {
  return <g>
    <path d="M53 79Q32 64 28 38q16 16 36 25l-4 11Z" fill="#ced7d6" stroke="#768f9a" strokeWidth="1"/>
    <path d="M34 48q8 16 24 22M39 61l15 13" stroke="#94a9af" strokeWidth="1"/>
    <circle cx="56" cy="75" r="5.5" fill="#a9bcc2" stroke="#5b7887" strokeWidth="1"/>
    <circle cx="56" cy="75" r="2" fill="#d9e0d7"/>
  </g>;
}

export function ThorHelmet() {
  return <g data-part="headgear" data-centered="100" strokeLinecap="round" strokeLinejoin="round">
    <path d="M44 81Q40 51 60 38q40-21 80 0 20 13 16 43l-15 8-17-10-24 5-24-5-17 10Z" fill="#93a9b2" stroke="#597788" strokeWidth="1.1"/>
    <path d="M52 69q8-24 38-30m58 30q-8-24-38-30" stroke="#dce1d7" strokeWidth="1.5"/>
    <path d="M95 33h10l2 45-7 4-7-4Z" fill="#bdcbd0" stroke="#7892a0" strokeWidth=".8"/>
    <path d="M100 35v40" stroke="#f0eee0" strokeWidth="1"/>
    <Wing/><g transform="translate(200 0) scale(-1 1)"><Wing/></g>
  </g>;
}

export function ThanosFace({winning}) {
  return <g data-part="thanos-face" strokeLinecap="round" strokeLinejoin="round">
    <path d="M63 91q13-14 32-1l-3 5-12-5-15 7Zm74 0q-13-14-32-1l3 5 12-5 15 7Z" fill="#80658e"/>
    <g fill="#eee7e4"><ellipse cx="84" cy="107" rx="13.5" ry="12.5" transform="rotate(12 84 107)"/><ellipse cx="116" cy="107" rx="13.5" ry="12.5" transform="rotate(-12 116 107)"/></g>
    <g fill="#697f96"><circle cx="91" cy="108" r="3"/><circle cx="109" cy="108" r="3"/></g><g fill="#342a3c"><circle cx="91" cy="108" r="1.7"/><circle cx="109" cy="108" r="1.7"/></g>
    <path d="m96 124 4 2 4-2" stroke="#876b91" strokeWidth="1.3"/>
    <path d={winning?'M91 139q10 3 19-2':'M92 140h16'} stroke="#594562" strokeWidth="1.2"/>
    <path d="m85 146 2 9m4-8 1 11m5-10v12m6-12v12m5-13-1 11m7-12-2 9" stroke="#705679" strokeWidth="1.3"/>
    <path d="M75 128q-3 8 2 13m48-13q3 8-2 13" stroke="#8b7096" strokeWidth="1"/>
  </g>;
}
