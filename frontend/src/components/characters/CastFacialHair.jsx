// Facial hair sits UNDER the mouth. Blended stubble follows the cheek and jaw;
// no punched-out skin patches or second mouth painted over a beard sticker.
export default function FacialHair({id}) {
  if(id==='thor') return <g>
    <path d="M68 126Q74 129 80 137Q100 148 120 137Q126 129 132 126L129 144Q123 157 100 162Q77 157 71 144Z" fill="#9d7849" fillOpacity=".52"/>
    <path d="M86 135Q93 131 99 135L100 137 101 135Q107 131 114 135L111 138 102 137 98 137 89 138Z" fill="#967244"/>
    <path d="m78 143 3 6m9 4 2 4m30-14-3 6m-9 4-2 4" stroke="#a38250" strokeWidth=".8" fill="none"/>
  </g>;
  if(id==='wick') return <g>
    <path d="M68 126Q74 129 80 137Q100 147 120 137Q126 129 132 126L129 144Q123 157 100 162Q77 157 71 144Z" fill="#302722" fillOpacity=".94"/>
    <path d="M86 135Q93 131 99 135L100 137 101 135Q107 131 114 135L111 138 102 137 98 137 89 138Z" fill="#30251f"/>
    <path d="m75 139 3 6m44-6-3 6m-33 6 2 4m24-4-2 4" stroke="#685044" strokeWidth=".8"/>
  </g>;
  if(id==='pirate') return <g>
    <path d="M83 136Q89 131 96 134L100 136 104 134Q111 131 117 136L114 138Q108 136 104 137L100 139 96 137Q90 136 86 138Z" fill="#493427"/>
    <path d="M93 150q7 3 14 0l-2 7-5 3-5-3Z" fill="#493427"/>
    <path d="m97 156-2 11m8-11 2 11" stroke="#493427" strokeWidth="3.2"/>
    <path d="M94 163h3m6 0h3" stroke="#bd9d59" strokeWidth="2.2"/>
    <path d="m95 168-2 3m12-3 2 3" stroke="#493427" strokeWidth="1.7"/>
  </g>;
  if(id==='chaplin') return <path d="M93 130q7-2 14 0v6H93Z" fill="#332c29"/>;
  return null;
}
