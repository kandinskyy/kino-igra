import {CaptainHead,IronHead,ThorHelmet} from './ArmorHeads';
// Headgear is constructed around the same round head. Eye openings are drawn
// with the eyes, not cut by unrelated polygons placed over the pupils.
export default function Headgear({id,skin,winning}) {
  if(id==='captain') return <CaptainHead skin={skin} winning={winning}/>;
  if(id==='iron') return <IronHead/>;
  if(id==='thor') return <ThorHelmet/>;

  if(id==='forrest') return <g data-part="headgear" strokeLinecap="round" strokeLinejoin="round">
    <path d="M43 82C39 52 58 33 86 33h28c28 0 47 19 43 49l-16 7H59Z" fill="#ab4c41" stroke="#853e38" strokeWidth=".8"/>
    <path d="M100 35v39M73 37Q55 51 54 75m73-38q18 14 19 38" stroke="#ca7560" strokeWidth="1.1"/>
    <ellipse cx="100" cy="34" rx="4" ry="2.5" fill="#7d3b34"/>
    <ellipse cx="100" cy="59" rx="16" ry="12" fill="#f0e3c4" stroke="#cfb990" strokeWidth=".8"/>
    <text x="100" y="57" textAnchor="middle" fill="#96463c" fontFamily="Arial,sans-serif" fontSize="5.2" fontWeight="800">BUBBA</text>
    <text x="100" y="64" textAnchor="middle" fill="#96463c" fontFamily="Arial,sans-serif" fontSize="5.2" fontWeight="800">GUMP</text>
    <path d="M44 80q55-13 112 0l8 9q-24 6-63-2-32-4-62 3Z" fill="#b95948" stroke="#8c4238" strokeWidth=".8"/>
    <path d="M45 86q28-6 55-2 35 7 57 3" stroke="#d48c70" strokeWidth="1.1"/>
    <path d="M43 90q31-6 58-1 31 6 56 1" stroke="#7f3d34" strokeWidth="1.4"/>
    <circle cx="70" cy="59" r="1.2" fill="#793c33"/><circle cx="130" cy="59" r="1.2" fill="#793c33"/>
  </g>;

  if(id==='sherlock') return <g data-part="headgear" strokeLinecap="round" strokeLinejoin="round">
    <path d="M44 81q-5-23 14-37 16-14 42-14t42 14q19 14 14 37l-17 10H61Z" fill="#9b896a" stroke="#675744" strokeWidth="1.1"/>
    <path d="M100 31q30 5 38 37l-3 15 21-2q5-23-14-37-16-14-42-14Z" fill="#857256"/>
    <path d="M60 45h80M51 57h98M47 69h106M66 39v38m17-44v42m17-43v43m17-42v42m17-36v38" stroke="#635640" strokeWidth=".8" opacity=".65"/>
    <path d="m67 49 4 3 4-3m9 0 4 3 4-3m15 0 4 3 4-3m9 0 4 3 4-3M58 62l4 3 4-3m9 0 4 3 4-3m9 0 4 3 4-3m10 0 4 3 4-3m9 0 4 3 4-3" stroke="#c0ab85" strokeWidth=".8"/>
    <path d="m45 75-5 27 12-3 10-22m93-2 5 27-12-3-10-22" fill="#8d795a" stroke="#675744" strokeWidth=".9"/>
    <path d="M43 78q57-15 114 0l8 12q-65-15-130 0Z" fill="#7d6b50" stroke="#5c4f3c" strokeWidth="1"/>
    <path d="M44 85q56-11 112 0" stroke="#c5af87" strokeWidth="1"/>
    <path d="m100 32-9-7 1 10 8-3 8 3 1-10Z" fill="#716047"/><circle cx="100" cy="31" r="2" fill="#ad9771"/>
    <path d="m46 86 3 9m105-9-3 9" stroke="#baa37b" strokeWidth="1"/>
  </g>;

  return null;
}
