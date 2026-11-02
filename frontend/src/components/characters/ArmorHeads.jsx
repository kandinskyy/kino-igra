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
  return <g data-part="headgear" data-mask="mark-vii-sculpted" strokeLinecap="round" strokeLinejoin="round">
    <path d="M48 99C46 66 64 43 91 42h18c27 1 45 24 43 57l-5 30-14 22-17 10H84l-17-10-14-22Z" fill="#A9212D" stroke="#641D27" strokeWidth="1.3"/>
    <path d="M53 87Q54 59 77 49m46 0q23 10 24 38" stroke="#D74A43" strokeWidth="1.6"/>
    <path d="m51 96 9-5 2 28-5 8Zm98 0-9-5-2 28 5 8Z" fill="#6E1D29"/>
    <path d="M66 64 85 60l4 19h22l4-19 19 4 3 31-8 18-1 17-15 19H87l-15-19-1-17-8-18Z" fill="#D8AE59" stroke="#9C7238" strokeWidth="1"/>
    <path d="m68 66 14-3 5 20h26l5-20 14 3 2 26-9 8H75l-9-8Z" fill="#EBC77B"/>
    <path d="M86 48h28l-3 27H89Z" fill="#94212B"/>
    <path d="M89 50h22l-1 8H90Z" fill="#BA3339"/>
    <path d="m73 97 22 4v7l-22-3-5-6Zm54 0-22 4v7l22-3 5-6Z" fill="#3D3333"/>
    <path d="m73 100 20 3v3l-19-3Zm54 0-20 3v3l19-3Z" fill="#D8FBFF"/>
    <path d="m72 109 10 11 3 14-10-8Zm56 0-10 11-3 14 10-8Z" fill="#B88C42"/>
    <path d="m85 112 15-5 15 5-5 23H90Z" fill="#DDB460"/>
    <path d="m85 137 4 3h22l4-3" stroke="#745431" strokeWidth="1.4"/>
    <path d="m88 143 3 9h18l3-9Z" fill="#EDC77A"/>
    <path d="m59 124 10 21 16 10m56-31-10 21-16 10" stroke="#D64D45" strokeWidth="1.8"/>
    <path d="m67 133 7 11m59-11-7 11" stroke="#7A202C" strokeWidth="2"/>
    <path d="M87 158h26" stroke="#631D27" strokeWidth="2"/>
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

function ThanosHelmet() {
  return <g data-part="thanos-helmet" data-design="endgame-reference" strokeLinecap="round" strokeLinejoin="round">
    <path d="M40 94C34 64 52 32 80 30h40c28 2 46 34 40 64l-4 39-21 30-12-2 12-20 7-30-5-24-19-5-18 13-18-13-19 5-5 24 7 30 12 20-12 2-21-30Z" fill="#303432" stroke="#625238" strokeWidth="1.2"/>
    <path d="M81 31Q48 36 40 77l5 39 10 14 3-23-4-18 8-18 13 7 8-10 5-37Z" fill="#B59A62" stroke="#7D6742" strokeWidth=".9"/>
    <path d="M119 31q33 5 41 46l-5 39-10 14-3-23 4-18-8-18-13 7-8-10-5-37Z" fill="#B59A62" stroke="#7D6742" strokeWidth=".9"/>
    <path d="M74 35Q53 44 48 69l10-5 14 6 8-8 3-29Zm52 0q21 9 26 34l-10-5-14 6-8-8-3-29Z" fill="#D8BE85"/>
    <path d="m43 92 11-7 7 24 7 18-9 14-13-15Zm114 0-11-7-7 24-7 18 9 14 13-15Z" fill="#BDA16A" stroke="#7D6742" strokeWidth=".9"/>
    <path d="m46 116 13 12 9-1 9 33-12-4-16-24Zm108 0-13 12-9-1-9 33 12-4 16-24Z" fill="#947B4F"/>
    <path d="m48 120 9 12 8 20m87-32-9 12-8 20" stroke="#CFB77E" strokeWidth="1.1"/>
    <path d="M79 32q-8 24-7 42l16 11m33-53q8 24 7 42l-16 11" stroke="#AD925B" strokeWidth="3"/>
    <path d="M88 31q-6 31-4 44l12 13m16-57q6 31 4 44l-12 13" stroke="#C3A970" strokeWidth="3"/>
    <path d="M96 30q-3 34-1 49l5 13 5-13q2-15-1-49Z" fill="#6F6141" stroke="#BCA16A" strokeWidth="1"/>
    <path d="M100 32v45m-1 5 1 5 1-5" stroke="#DDC48B" strokeWidth="1.5"/>
    <path d="m62 72 20 10 18 13 18-13 20-10" stroke="#CEB47A" strokeWidth="1.7"/>
    <path d="m58 86 5-8 10 5m69 3-5-8-10 5" stroke="#1E2525" strokeWidth="3"/>
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
    <ThanosHelmet/>
  </g>;
}
