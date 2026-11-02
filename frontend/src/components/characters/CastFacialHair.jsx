// Facial hair sits UNDER the mouth. Blended stubble follows the cheek and jaw;
// no punched-out skin patches or second mouth painted over a beard sticker.
export default function FacialHair({id}) {
  if(id==='thor') return <g>
    <path d="M68 126Q74 129 80 137Q100 148 120 137Q126 129 132 126L129 144Q123 157 100 162Q77 157 71 144Z" fill="#9d7849" fillOpacity=".52"/>
    <path d="M86 135Q93 131 99 135L100 137 101 135Q107 131 114 135L111 138 102 137 98 137 89 138Z" fill="#967244"/>
    <path d="m78 143 3 6m9 4 2 4m30-14-3 6m-9 4-2 4" stroke="#a38250" strokeWidth=".8" fill="none"/>
  </g>;
  if(id==='wick') return <g data-part="wick-beard">
    <path d="M69 127Q74 129 79 136Q82 141 86 145Q91 151 100 152Q109 151 114 145Q118 141 121 136Q126 129 131 127L128 140Q122 154 100 161Q78 154 72 140Z" fill="#49423E" fillOpacity=".62"/>
    <path d="M74 136Q78 140 82 146Q89 155 100 156Q111 155 118 146Q122 140 126 136L124 145Q115 157 100 160Q85 157 76 145Z" fill="#393430" fillOpacity=".75"/>
    <path d="M88 135Q93 131 98 134L100 135L102 134Q107 131 112 135L114 139Q108 137 102 138H98Q92 137 86 139Z" fill="#39322E"/>
    <path d="M87 138Q86 141 84 144M113 138Q114 141 116 144" stroke="#49403A" strokeWidth="2.2" strokeLinecap="round"/>
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
