import CostumeSurface from "./CostumeSurface";
import {
  IconicBack,
  IconicBody,
  IconicHead,
  IconicProps,
} from "./IconicCostumes";
import { wardrobe, tint } from "../config/robotMaterials";
const star = "m60 90 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z";
export function CostumeBack({ type }) {
  if (["cruella", "xenomorph"].includes(type))
    return <IconicBack type={type} />;
  const w = wardrobe[type];
  return (
    <CostumeSurface stroke="#293d48" strokeWidth="1.4" strokeLinejoin="round">
      {w.cape && (
        <>
          <path
            d="M34 82q26-8 52 0l17 48q-13-3-20 5-23-8-46 0-8-8-20-5Z"
            fill={w.cape}
          />
          <path
            d="m35 88-7 37m17-38-5 42m35-42 5 42m5-41 7 37"
            stroke={tint(w.cape, 0.25)}
            fill="none"
          />
          <path
            d="M21 130q17-8 38 1t40-1"
            stroke={tint(w.cape, -0.2)}
            fill="none"
          />
        </>
      )}

      {type === "bill" && (
        <>
          <path d="m24 130 69-88" stroke="#293c47" strokeWidth="6" />
          <path d="m84 53 17-22" stroke="#dce8e7" strokeWidth="4" />
          <path d="m94 41 8 5" stroke="#d7b96a" strokeWidth="3" />
          <path d="m96 37 4 3m-1-7 4 3" stroke="#5a5651" />
        </>
      )}
      {type === "widow" && (
        <>
          <path
            d="m26 121 63-45m-58 1 61 45"
            stroke="#526777"
            strokeWidth="4"
          />
          <path d="m83 80 8-6m-62 0 7 6" stroke="#96dce5" strokeWidth="3" />
        </>
      )}
      {type === "marty" && (
        <>
          <path d="m20 128-3-53q4-12 10 0l5 52q-4 10-12 1Z" fill="#d97fa2" />
          <path
            d="m20 85 6 8-5 6 7 7"
            fill="none"
            stroke="#b1cc78"
            strokeWidth="3"
          />
          <path d="m20 116 8-1" stroke="#e7d598" strokeWidth="4" />
        </>
      )}
    </CostumeSurface>
  );
}
export function CostumeBody({ type, tone, id }) {
  if (["cruella", "xenomorph", "jason", "dune", "jedi"].includes(type))
    return <IconicBody type={type} id={id} />;
  const fabric = `url(#${id}fabric)`,
    gold = `url(#${id}gold)`,
    steel = `url(#${id}steel)`;
  return (
    <CostumeSurface
      stroke="#2a3d48"
      strokeWidth="1.15"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M37 83q23 7 46 0q5 5 6 23l-6 18q-23 4-46 0l-6-18q1-18 6-23Z" fill={fabric} />
      <path
        d="M36 106q-4 10 4 16h40q8-5 5-16"
        fill="#112536"
        fillOpacity=".12"
        stroke="none"
      />
      {type === "wizard" && (
        <>
          <path d="M36 84q8 3 15 11l-7 28q-6 3-10 0l1-25Z" fill="#37465a" />
          <path d="M84 84q-8 3-15 11l7 28q6 3 10 0l-1-25Z" fill="#37465a" />
          <path d="M52 85h16v32H52Z" fill="#c3b8a7" />
          <path d="M47 84h26v8H47Z" fill="#ab4547" />
          <path d="M65 88h10v30l-2 4-3-4-3 4-2-4Z" fill="#ad4948" />
          <path
            d="M65 97h10M65 106h10M65 115h10"
            stroke="#d6ad60"
            strokeWidth="3"
          />
          <path
            d="m39 91 6 4-7 22M81 91l-6 4 7 22"
            fill="none"
            stroke="#647586"
          />
          <circle cx="42" cy="99" r="2.5" fill={gold} />
        </>
      )}

      {type === "matrix" && (
        <>
          <path d="M51 85h18v37H51Z" fill="#172931" />
          <path d="m36 83 20 10-10 39-15-5 5-20Z" fill="#2c4045" />
          <path d="m84 83-20 10 10 39 15-5-5-20Z" fill="#344b4c" />
          <path
            d="m39 87 12 9-7 19M81 87l-12 9 7 19"
            stroke="#78918b"
            fill="none"
          />
          <path d="M60 94v28" stroke="#a4b2a4" strokeWidth=".8" />
          {[101, 108, 115].map((y) => (
            <circle
              key={y}
              cx="64"
              cy={y}
              r=".9"
              fill="#a0b2a5"
              stroke="none"
            />
          ))}
          <path d="M36 119h12m24 0h12" stroke="#14272e" strokeWidth="3" />
        </>
      )}
      {type === "fight" && (
        <>
          <path d="M48 86h24v36H48Z" fill="#dfd6b0" />
          <path
            d="m51 91 5 5-3 5m12-9-4 5 6 5m-15 7 5-3 3 7m5-4 4 5"
            stroke="#77957f"
            fill="none"
            strokeWidth="1.5"
          />
          <path
            d="m36 84 16 8-8 14-6-5-3 19M84 84l-16 8 8 14 6-5 3 19"
            fill="#b6574d"
          />
          <path
            d="m38 89 8 5-5 8M82 89l-8 5 5 8"
            stroke="#e6a588"
            fill="none"
          />
          <path d="M37 115h9m28 0h9" stroke="#e2b49a" strokeWidth="1.5" />
          <path d="m45 109 7 4m23-4-7 4" stroke="#f1b497" />
          <circle cx="78" cy="92" r="1.3" fill={steel} />
        </>
      )}
      {type === "dune" && (
        <>
          <path d="M40 86h40v36H40Z" fill="#68756c" />
          <path
            d="M46 91v26m28-26v26M48 97h24M48 108h24"
            stroke="#9ba594"
            strokeWidth="2"
          />
          <path d="M57 90v25h6V90" fill="#354e4c" />
          <path d="M35 87q25 12 50 0l-6 11q-19 9-38 0Z" fill="#b4a078" />
          <path d="m40 89 9 6m22 0 9-6" stroke="#e3cd99" />
          <path
            d="M86 79v19q0 6-8 6h-8"
            stroke="#375558"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="69" cy="104" r="3" fill={steel} />
          <path d="M37 115h46" stroke="#9f9476" strokeWidth="4" />
          <path d="M37 117h46" stroke="#d6bd8a" strokeWidth="1" />
        </>
      )}
      {type === "captain" && (
        <>
          <path d="M37 87h46v22H37Z" fill="#45618b" />
          <path d="m38 86 10 9m34-9-10 9" stroke="#a58d73" strokeWidth="4" />
          <path d={star} fill="#e8eeea" stroke="#839eae" />
          <path d="M38 112h44v11H38Z" fill="#e4e5db" />
          <path
            d="M43 112v10m11-10v10m12-10v10m11-10v10"
            stroke="#b65c5d"
            strokeWidth="5"
          />
          <path d="M37 118h46" stroke="#80695b" strokeWidth="3" />
          <rect x="55" y="116" width="10" height="5" rx="1" fill={steel} />
        </>
      )}
      {type === "iron" && (
        <>
          <path d="m35 86 14 4-5 13-11-9ZM85 86l-14 4 5 13 11-9Z" fill={gold} />
          <path
            d="m44 86 16 6 16-6 5 15-13 11H52l-13-11Z"
            fill={`url(#${id}shell)`}
          />
          <path
            d="m44 90 10 5m22-5-10 5M41 100l10 8m28-8-10 8"
            stroke="#e7b179"
          />
          <circle
            cx="60"
            cy="101"
            r="9"
            fill="#446c75"
            stroke={gold}
            strokeWidth="2.5"
          />
          <circle cx="60" cy="101" r="6" fill="#d3f9f6" />
          <circle cx="60" cy="101" r="3" fill="white" stroke="none" />
          <path d="M46 115h28l-4 8H50Z" fill={gold} />
          <path d="M51 113v9m18-9v9" stroke="#916042" />
        </>
      )}

      {type === "marty" && (
        <>
          <path d="M48 84h24v39H48Z" fill="#c7dbe0" />
          <path
            d="M53 85v37m13-37v37M48 92h24m-24 10h24m-24 10h24"
            stroke="#7093a5"
            strokeWidth=".8"
          />
          <path
            d="M35 84q9-3 17 4v34H35ZM85 84q-9-3-17 4v34h17Z"
            fill="#e38b50"
          />
          <path
            d="M37 93h13m-13 9h13m-13 9h13m20-18h13m-13 9h13m-13 9h13"
            stroke="#f9bc80"
            strokeWidth="1.2"
          />
          <path
            d="M37 95h13m20 0h13M37 104h13m20 0h13"
            stroke="#ab5c3d"
            strokeWidth=".7"
          />
          <path d="m36 84 14 9 2-7m32-2-14 9-2-7" fill="#efaa6f" />
          <path d="M54 98v24m12-24v24" stroke="#eee9d3" strokeWidth="1.2" />
        </>
      )}
      {type === "hulk" && (
        <>
          <path
            d="M35 85q11-5 25 5 14-10 25-5v25q-12 8-25 4-13 4-25-4Z"
            fill={tone}
          />
          <path
            d="M37 94q11 8 23 2 12 6 23-2m-23 2v16m-10-10h5m10 0h5m-20 7h5m10 0h5"
            stroke="#50794e"
            fill="none"
            strokeWidth="1.5"
          />
          <path
            d="M36 114h48v10l-7-2-4 4-6-3-7 3-7-3-6 3-4-4-7 2Z"
            fill="#8a6f97"
          />
          <path d="m41 117 4 4m11-5 2 5m15-4-1 5" stroke="#c0a9bb" />
        </>
      )}
      {type === "thor" && (
        <>
          <path d="m35 84 25 8 25-8v13H35Z" fill="#557285" />
          <path d="m38 87 7 8m37-8-7 8" stroke={gold} strokeWidth="3" />
          {[45, 75].map((x) => (
            <g key={x}>
              {[96, 108, 120].map((y) => (
                <g key={y}>
                  <circle
                    cx={x}
                    cy={y}
                    r={y === 120 ? 3.3 : 4.2}
                    fill={steel}
                  />
                  <path
                    d={`m${x - 2} ${y - 1} 3-1`}
                    stroke="#f4f1de"
                    strokeWidth=".9"
                  />
                </g>
              ))}
            </g>
          ))}
          <path d="M60 94v29m-8-16h16m-16 8h16" stroke="#9eb2b9" fill="none" />
          <path d="M35 121h50" stroke="#8d7055" strokeWidth="3" />
        </>
      )}
      {type === "widow" && (
        <>
          <path d="M45 86h30l-5 21 7 17H43l7-17Z" fill="#263442" />
          <path d="M60 88v26" stroke="#b0bec4" strokeWidth="1.3" />
          <path
            d="m42 88 8 7m28-7-8 7m-30 14 9-3m31 3-9-3"
            stroke="#657b88"
            fill="none"
          />
          <path d="M36 115h48" stroke="#a88959" strokeWidth="4" />
          <rect x="54" y="111" width="12" height="9" rx="2" fill="#253746" />
          <path d="m56 112 4 3 4-3v7l-4-3-4 3Z" fill="#e5767f" stroke="none" />
        </>
      )}
      {type === "brother" && (
        <>
          <path d="M35 87h50v37H35Z" fill="#afa18a" />
          <path d="M35 87h50v37H35Z" fill={`url(#${id}knit)`} stroke="none" />
          <path
            d="M38 91h44m-44 12h44m-44 12h44"
            stroke="#6e786f"
            strokeWidth="3"
          />
          <path
            d="m39 96 4-4 4 4 4-4 4 4 5-4 5 4 4-4 4 4 4-4 4 4m-42 12 4-4 4 4 4-4 4 4 5-4 5 4 4-4 4 4 4-4 4 4"
            stroke="#e0d1b3"
            fill="none"
            strokeWidth="1.1"
          />
          <path
            d="M43 83q17 14 34 0"
            stroke="#d3c4a9"
            strokeWidth="5"
            fill="none"
          />
          <path d="M35 121h50" stroke="#7e8275" strokeWidth="3" />
          <path
            d="M24 58q-5 28 13 30t41 16v15"
            fill="none"
            stroke="#344b50"
            strokeWidth="1.2"
          />
          <rect x="69" y="108" width="15" height="12" rx="2" fill="#708087" />
          <circle cx="76" cy="113" r="3" fill="#ccd5cc" />
          <path d="M71 118h11" stroke="#394e55" />
        </>
      )}
      {type === "terminator" && (
        <>
          <path d="M49 85h22v38H49Z" fill="#192d36" />
          <path
            d="m35 84 18 6-7 10 8 7-12 17H35ZM85 84l-18 6 7 10-8 7 12 17h7Z"
            fill="#40535b"
          />
          <path
            d="m38 86 12 5-8 8m40-13-12 5 8 8"
            stroke="#9ab0b7"
            fill="none"
          />
          <path
            d="m44 107-6 8m38-8 6 8M57 94v28"
            stroke="#b3c1c4"
            strokeWidth="1.2"
          />
          <circle cx="78" cy="91" r="1.5" fill={steel} />
          <path d="M37 120h46" stroke="#1e3039" strokeWidth="4" />
          <rect x="54" y="118" width="9" height="5" rx="1" fill={steel} />
        </>
      )}
      {type === "pirate" && (
        <>
          <path d="M47 84h26v38H47Z" fill="#e1d2ad" />
          <path d="m49 87 11 10 11-10" fill="none" stroke="#ae9671" />
          <path d="M35 84h12l-1 40-14 5ZM85 84H73l1 40 14 5Z" fill="#816c54" />
          <path d="M37 87h7v35m39-35h-7v35" stroke="#c0a578" />
          <path d="M33 111h54" stroke="#954d4d" strokeWidth="6" />
          <path d="m36 114 47 6" stroke="#493f38" strokeWidth="3" />
          <rect x="52" y="107" width="11" height="7" rx="1" fill={gold} />
          <path d="M36 122h10m29 0h10" stroke="#d2bc8a" />
        </>
      )}
      {type === "gandalf" && (
        <>
          <path d="m36 86 24 9 24-9 9 44q-33-8-66 0Z" fill={fabric} />
          <path
            d="m39 89 11 14-6 22m37-36-11 14 6 22m-16-26v28"
            stroke="#c9d7d3"
            fill="none"
          />
          <path
            d="M33 112q27 8 54 0"
            stroke="#7d7765"
            strokeWidth="3"
            fill="none"
          />
          <path d="M71 114v9h10v-9" fill="#827e6b" />
          <circle cx="60" cy="94" r="3.5" fill={gold} />
        </>
      )}
      {type === "forrest" && (
        <>
          <path d="M50 85h20v38H50Z" fill="#a8c5d2" />
          <path
            d="m36 84 16 6-7 12 10 7-8 15H35Zm48 0-16 6 7 12-10 7 8 15h12Z"
            fill="#e6d9bd"
          />
          <path d="m38 89 9 3-5 8m40-11-9 3 5 8" stroke="#a79679" fill="none" />
          <path d="M60 90v31" stroke="#e2e5db" strokeWidth="1" />
          <path d="M37 113h9m28 0h9" stroke="#bdad8d" strokeWidth="1.6" />
        </>
      )}
      {type === "wolf" && (
        <>
          <path d="M35 85h50v39H35Z" fill={fabric} />
          <path
            d="M35 85h50v39H35Z"
            fill={`url(#${id}pinstripe)`}
            stroke="none"
          />
          <path d="m47 85 13 20 13-20" fill="#f1f0e6" />
          <path d="m60 89-4 8 4 19 4-19Z" fill="#cbb072" />
          <path d="m59 99 3 2m-3 4 3 2" stroke="#f2dfab" />
          <path
            d="m38 86 14 12-7 7 10 19m27-38-14 12 7 7-10 19"
            fill="none"
            stroke="#93a8b7"
          />
          <path d="M71 99h10" stroke="#d0d6cd" strokeWidth="3" />
          <path d="M76 95h4v5h-4" fill="#d8c389" stroke="none" />
          <circle cx="62" cy="119" r="1.4" fill={gold} />
        </>
      )}
      {type === "bill" && (
        <>
          <path d="M36 84h48v40H36Z" fill={fabric} />
          <path
            d="M39 86v37m5-37v37m32-37v37m5-37v37"
            stroke="#283b42"
            strokeWidth="2"
          />
          <path d="M60 86v36" stroke="#f2e2af" />
          <path d="m56 91 4 4 4-4" fill="none" stroke="#75623c" />
          <path d="M49 110h6m10 0h6" stroke="#a8863e" strokeWidth="1.2" />
        </>
      )}

      {type === "spider" && (
        <>
          <path d="M37 85h46v39H37Z" fill={fabric} />
          <path d="M37 104h11v20H37Zm35 0h11v20H72Z" fill="#426b8b" />
          <path
            d="M60 85v38m-21-32 42 28m-42 0 42-28M38 95q22 8 44 0m-44 9q22-8 44 0m-44 10q22-8 44 0"
            stroke="#7e4059"
            fill="none"
            strokeWidth=".8"
          />
          <ellipse
            cx="60"
            cy="102"
            rx="3"
            ry="5"
            fill="#213b50"
            stroke="none"
          />
          <path
            d="m58 99-6-5m6 8-7-2m7 5-6 4m10-10 6-5m-6 8 7-2m-7 5 6 4m-9-1-2 6m6-6 2 6"
            stroke="#203a50"
            fill="none"
            strokeWidth="1.2"
          />
        </>
      )}
      {type === "thanos" && (
        <>
          <path d="m35 85 25 9 25-9v17l-25 9-25-9Z" fill={gold} />
          <path d="m42 85 18 10 18-10v11l-18 8-18-8Z" fill="#6c6287" />
          <path d="M48 109h24l7 15H41Z" fill="#77628e" />
          <path d="M60 107v17m-14-7h28" stroke={gold} strokeWidth="3" />
          <path d="M36 88h8v10h-8m40-10h8v10h-8" fill={gold} />
        </>
      )}
      {type === "loki" && (
        <>
          <path d="M35 84h50v42H35Z" fill={fabric} />
          <path d="m39 85 21 15 21-15-7 19-14 8-14-8Z" fill="#73966d" />
          <path
            d="m41 85 19 15 19-15M60 101v24"
            stroke={gold}
            strokeWidth="3"
          />
          <path d="m35 117 19-7m31 7-19-7" stroke="#cfbd84" />
          <path d="M41 115v10m38-10v10" stroke="#b9a16b" />
        </>
      )}
      {type === "jedi" && (
        <>
          <path d="M40 84h40v40H40Z" fill="#ddd1b4" />
          <path
            d="m41 84 22 16-11 26-21 3 3-28Zm38 0-22 16 11 26 21 3-3-28Z"
            fill={fabric}
          />
          <path
            d="m42 87 17 14-9 21m28-35-17 14 9 21"
            stroke="#f1e6c9"
            strokeWidth="4"
            fill="none"
          />
          <path d="M34 113h52" stroke="#826b4f" strokeWidth="5" />
          <rect x="57" y="110" width="8" height="6" rx="1" fill={gold} />
        </>
      )}
    </CostumeSurface>
  );
}
export function CostumeHead({ type, id }) {
  if (
    [
      "cruella",
      "xenomorph",
      "jason",
      "dune",
      "jedi",
      "widow",
      "bill",
      "wolf",
      "terminator",
    ].includes(type)
  )
    return <IconicHead type={type} id={id} />;
  const gold = `url(#${id}gold)`,
    steel = `url(#${id}steel)`,
    lens = `url(#${id}lens)`;
  return (
    <CostumeSurface
      stroke="#2c3e48"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {type === "wizard" && (
        <>
          <circle
            cx="45"
            cy="56"
            r="11"
            fill="none"
            stroke={gold}
            strokeWidth="2"
          />
          <circle
            cx="75"
            cy="56"
            r="11"
            fill="none"
            stroke={gold}
            strokeWidth="2"
          />
          <path d="M56 54h8M33 53l-8-2m62 2 8-2" stroke="#916f48" />
          <path
            d="m61 36-4 5 5-2-2 6"
            stroke="#b3826d"
            fill="none"
            strokeWidth="1.5"
          />
          <path d="m37 48 3-2m29 2 3-2" stroke="#fff" />
        </>
      )}

      {type === "matrix" && (
        <>
          <path
            d="M31 48q12-7 27-2v14q-16 9-25 0Zm58 0q-12-7-27-2v14q16 9 25 0Z"
            fill={lens}
          />
          <path
            d="M58 49h4M31 49l-7-2m65 2 7-2"
            stroke="#5c7979"
            strokeWidth="2"
          />
          <path d="m36 48 13-1m18 1 12-1" stroke="#b2c7bd" strokeOpacity=".7" />
          <path d="M36 83q24 12 48 0" stroke="#263c40" strokeWidth="5" />
        </>
      )}
      {type === "fight" && (
        <>
          <path
            d="M34 47q11-5 22 0v12q-13 8-22-1Zm52 0q-11-5-22 0v12q13 8 22-1Z"
            fill="#c4a36f"
            fillOpacity=".52"
            stroke="#a58251"
          />
          <path d="M56 49h8M33 48l-7-2m61 2 7-2" stroke="#bea578" />
          <path d="m38 47 7-1m23 1 7-1" stroke="#fff1bf" />
        </>
      )}

      {type === "captain" && (
        <>
          <path d="M22 39q-2-23 38-23t38 23l-18 6-20-6-20 6Z" fill="#4b70a4" />
          <path d="M27 32q33-22 66 0" stroke="#89a8cb" fill="none" />
          <path
            d="m55 30 5-10 5 10m-8-3h6"
            stroke="#f0f2e9"
            strokeWidth="2.4"
          />
          <path d="m25 35-11-4 3 8 10 3m68-7 11-4-3 8-10 3" fill={steel} />
          <path
            d="M25 76q7 8 13 6m57-6q-7 8-13 6"
            stroke="#7896b2"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {type === "iron" && (
        <>
          <path
            d="M24 35V23l15-9h42l15 9v12l-15 10-10-9H49l-10 9Z"
            fill={gold}
          />
          <path
            d="M30 24h17l5 7h16l5-7h17"
            fill="none"
            stroke="#f4dfa5"
            strokeWidth="1.8"
          />
          <path
            d="m40 16 4 9m36-9-4 9m-31 8 9 3m21-3-9 3"
            fill="none"
            stroke="#936b3e"
          />
          <path
            d="M23 41v27l11 10m63-37v27L86 78"
            stroke="#be7d4f"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="24" cy="47" r="4" fill={steel} />
          <circle cx="96" cy="47" r="4" fill={steel} />
          <path d="M32 81h10m36 0h10" stroke="#e4ba7c" strokeWidth="2" />
        </>
      )}
      {type === "marty" && (
        <>
          <path d="M25 32h70v9H25Z" fill="#a3c4ce" />
          <rect x="28" y="28" width="26" height="16" rx="5" fill={steel} />
          <rect x="66" y="28" width="26" height="16" rx="5" fill={steel} />
          <path
            d="M32 32h18v7H32Zm38 0h18v7H70Z"
            fill="#8dbacb"
            stroke="#6b939c"
          />
          <path
            d="M54 34h12m-31-2 8 1m30-1 8 1"
            stroke="#edffff"
            strokeWidth="1.2"
          />
        </>
      )}
      {type === "hulk" && (
        <>
          <path d="m35 43 15 1m20 0 15-1" stroke="#5c8356" strokeWidth="2" />
        </>
      )}
      {type === "thor" && (
        <>
          <path d="M24 37q36-20 72 0l-5-10q-31-20-62 0Z" fill={steel} />
          <path d="M59 20h3v15h-3Z" fill={gold} />
          <path d="m29 34-15-15 3 19 13 8m61-12 15-15-3 19-13 8" fill={steel} />
          <path
            d="m18 26 10 10m-9-4 9 8m74-14L92 36m9-4-9 8"
            stroke="#f3eee2"
          />
          <path
            d="M34 30q26-12 52 0"
            fill="none"
            stroke="#eff3ed"
            strokeWidth="1.4"
          />
        </>
      )}

      {type === "brother" && (
        <>
          <path
            d="M16 56V41q0-24 44-24t44 24v15"
            fill="none"
            stroke="#354b52"
            strokeWidth="4"
          />
          <path d="M21 37q9-16 31-17" stroke="#8b9d9d" fill="none" />
          <rect x="12" y="45" width="15" height="23" rx="6" fill="#85979c" />
          <rect x="93" y="45" width="15" height="23" rx="6" fill="#85979c" />
          <rect x="16" y="49" width="7" height="15" rx="3" fill="#c1c9c1" />
          <rect x="97" y="49" width="7" height="15" rx="3" fill="#c1c9c1" />
        </>
      )}

      {type === "pirate" && (
        <>
          <path d="M25 30q35-21 70 0v13H25Z" fill="#a65b53" />
          <path d="m31 31 14 4 13-6 14 5 17-4" stroke="#d99873" fill="none" />
          <path
            d="M24 31 16 11q18 12 44-5 26 17 44 5l-8 20-18-6-18 7-18-7Z"
            fill="#675849"
          />
          <path
            d="M21 16q18 10 39-5 21 15 39 5m-76 9 19-5 18 6 18-6 19 5"
            stroke="#b29b73"
            fill="none"
            strokeWidth="1.2"
          />

          {[52, 61, 73].map((y) => (
            <g key={y}>
              <circle
                cx="28"
                cy={y}
                r="2.8"
                fill={y === 61 ? "#698b94" : gold}
              />
              <circle cx="91" cy={y + 3} r="2.3" fill={gold} />
            </g>
          ))}
          <path d="m55 79 2 14m8-14-2 14" stroke="#67523e" strokeWidth="3" />
          <circle cx="57" cy="89" r="2" fill={gold} />
        </>
      )}
      {type === "gandalf" && (
        <>
          <path d="m26 29 23-35 14 6 7 15 23 15Z" fill="#8fa5aa" />
          <path
            d="m49-3 8 8 1 19m9-7 12 10"
            fill="none"
            stroke="#c4d4d2"
            strokeWidth="1.5"
          />
          <path d="M15 34q45-15 90 0l-8 6q-37-7-74 0Z" fill="#adc1c0" />
          <path d="M22 33q38-9 76 0" stroke="#e4e9de" fill="none" />
          <path
            d="M34 75q9 8 18 3 8 4 16 0 9 5 18-3l-7 17-19 10-19-10Z"
            fill="#e0e6df"
          />
          <path
            d="m41 80 5 9m6-7 3 11m13-11-3 11m14-13-5 9"
            stroke="#a5b8b8"
            fill="none"
          />
          <path
            d="M34 44q-3 15 1 27m51-27q3 15-1 27"
            stroke="#dce5df"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {type === "forrest" && (
        <>
          <path d="M26 33q0-22 34-22t34 22l-13 7H39Z" fill="#ba5b4e" />
          <path
            d="M32 26q28-16 56 0M60 14v16"
            fill="none"
            stroke="#e9a581"
            strokeWidth="1.2"
          />
          <path d="M48 32q30-3 51 3l-8 8-42-3Z" fill="#9b4446" />
          <path d="M53 33q24 0 38 3" stroke="#e3b182" fill="none" />
          <rect x="48" y="18" width="24" height="11" rx="3" fill="#e5d4aa" />
          <text
            x="60"
            y="25"
            fontSize="4"
            textAnchor="middle"
            fill="#795347"
            stroke="none"
          >
            BUBBA
          </text>
        </>
      )}

      {type === "spider" && (
        <>
          <path d="M22 36q-2-24 38-24t38 24l-17 11-21-8-21 8Z" fill="#bd5264" />
          <path
            d="M26 37q14-7 25 1l9-5 9 5q11-8 25-1"
            stroke="#e38892"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M60 14v19m-26-15 26 15 26-15M26 25q34 10 68 0"
            stroke="#723c55"
            fill="none"
            strokeWidth=".9"
          />
          <path
            d="m30 26 22-3-8 11Zm60 0-22-3 8 11Z"
            fill="#edf3ed"
            stroke="#2b4356"
            strokeWidth="1.7"
          />
          <path d="m37 28 7-1m39 1-7-1" stroke="white" />
          <path d="M25 42v17m70-17v17" stroke="#bc5364" strokeWidth="3" />
        </>
      )}
      {type === "thanos" && (
        <>
          <path
            d="M23 35 30 17l21 5 9-9 9 9 21-5 7 18-18-4-19 8-19-8Z"
            fill={gold}
          />
          <path
            d="m32 20 4 10 15-4 9 8 9-8 15 4 4-10m-28-3v14"
            stroke="#f5dfa4"
            fill="none"
          />
          <path d="M37 78q23 16 46 0l-5 12H42Z" fill="#9a86ae" />
          <path d="M50 83v5m6-3v5m8-5v5m6-7v5" stroke="#685579" />
        </>
      )}
      {type === "loki" && (
        <>
          <path d="M24 40q36-24 72 0l-6-14q-30-18-60 0Z" fill={gold} />
          <path
            d="M60 19v16m-27-6 12 3m42-3-12 3"
            stroke="#f3dda1"
            fill="none"
          />
          <path
            d="M40 28Q11 9 29-7q-4 22 19 31ZM80 28Q109 9 91-7q4 22-19 31Z"
            fill={gold}
          />
          <path
            d="M36 24Q21 12 27 1m57 23Q99 12 93 1"
            stroke="#f8e4ac"
            fill="none"
          />
          <path d="M29 38v37m62-37v37" stroke="#6c8065" strokeWidth="3" />
        </>
      )}
    </CostumeSurface>
  );
}
export function CostumeProps({ type, id }) {
  if (["cruella", "jason", "jedi"].includes(type))
    return <IconicProps type={type} id={id} />;
  const gold = `url(#${id}gold)`,
    steel = `url(#${id}steel)`;
  return (
    <CostumeSurface
      stroke="#2a3e48"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {type === "wizard" && (
        <>
          <path d="m104 108 12-29" stroke="#98744e" strokeWidth="3" />
          <path d="m113 87 3-8" stroke="#dac69d" strokeWidth="1.3" />
          <path d="m116 75 1-4m-5 6-4-1m10 1 3-2" stroke="#e5d09a" />
          <path
            d="m115 71 1-3 1 3 3 1-3 1-1 3-1-3-3-1Z"
            fill="#f1e4ba"
            stroke="none"
          />
        </>
      )}
      {type === "captain" && (
        <>
          <circle cx="19" cy="109" r="18" fill="#b44c54" />
          <circle cx="19" cy="109" r="14" fill={steel} />
          <circle cx="19" cy="109" r="10" fill="#b6555b" />
          <circle cx="19" cy="109" r="7" fill="#426b95" />
          <path
            d="m19 103 2 4 4 1-3 2 1 5-4-3-4 3 1-5-3-2 4-1Z"
            fill="#eff1e8"
            stroke="none"
          />
          <path
            d="M7 104q3-7 10-9"
            stroke="#f0b5a1"
            strokeWidth="1.5"
            fill="none"
          />
        </>
      )}
      {type === "thor" && (
        <>
          <path d="m104 115 2-21" stroke="#8c7255" strokeWidth="5" />
          <path d="m104 102 4 1m-5 5 4 1m-4 4 4 1" stroke="#d0b58a" />
          <rect x="94" y="78" width="25" height="20" rx="3" fill={steel} />
          <path
            d="M98 82h17m-17 2h17m-16 9h16M96 81v14m21-14v14"
            stroke="#627f89"
            fill="none"
            strokeWidth=".8"
          />
          <path d="M98 79h15" stroke="#edf2e7" strokeWidth="2" />
        </>
      )}
      {type === "gandalf" && (
        <>
          <path
            d="M108 133V79l-6-8 4-10 8 3 4 9-10 6"
            stroke="#857b63"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M108 130V83m-3-12 3-7 7 4"
            stroke="#c8bd91"
            fill="none"
            strokeWidth="1.3"
          />
          <path d="m108 66-2 6 4 3 3-5Z" fill="#c1e1dd" stroke="none" />
        </>
      )}
      {type === "forrest" && (
        <>
          <rect x="1" y="94" width="27" height="17" rx="3" fill="#796352" />
          <path d="M2 96h25v6H2Z" fill="#c6b18b" />
          <path d="M14 94v16" stroke="#b68166" strokeWidth="3" />
          <path d="m11 93-4-4 7 2 6-3-3 5" fill="none" stroke="#d9bd93" />
          <path
            d="M8 88Q-3 78 4 65q12 9 9 17L7 72"
            fill="#e6e9df"
            stroke="#9cafaa"
          />
        </>
      )}
      {type === "wolf" && (
        <>
          <path d="M102 84q-8 5-4 16l7 9 7-5-4-7-3 1-3-5 2-3Z" fill="#e0e4db" />
          <path d="M107 109q12 3 7 12t-11 1" stroke="#b2c6c2" fill="none" />
          <circle cx="104" cy="108" r="5" fill={gold} />
          <circle cx="104" cy="108" r="3" fill="#eef0df" />
          <path d="m104 106 1 2-1 1" stroke="#695d48" fill="none" />
        </>
      )}
      {type === "thanos" && (
        <>
          <path
            d="M0 102q-1-7 5-8l3-9 4 8 4-10 5 10 4-7 5 9v16l-5 10H5Z"
            fill={gold}
          />
          <path
            d="M4 104h22m-21 6h20m-18 6h16M8 96v8m8-9v8m8-6v7"
            stroke="#936c3c"
            fill="none"
          />
          {["#d66f55", "#6baecd", "#be9bd6", "#98b86f", "#e4cb72"].map(
            (c, i) => (
              <circle
                key={c}
                cx={5 + i * 5}
                cy={i % 2 ? 98 : 101}
                r="2.2"
                fill={c}
                stroke="#927343"
                strokeWidth=".5"
              />
            ),
          )}
          <path d="m12 108 5-3 4 4-4 6-5-2Z" fill="#d59b6b" />
          <path d="m15 108 3-1" stroke="#f8e8bc" />
        </>
      )}
      {type === "jedi" && (
        <>
          <path d="m104 116 2-12" stroke="#82989d" strokeWidth="5" />
          <path d="m104 113 4 1m-3-5 4 1" stroke="#d2dcd5" />
          <path
            d="m106 103 2-33"
            stroke="#63bcd6"
            strokeOpacity=".24"
            strokeWidth="10"
          />
          <path d="m106 103 2-33" stroke="#8adee7" strokeWidth="5" />
          <path d="m106 102 2-31" stroke="#f0fff4" strokeWidth="2" />
        </>
      )}
      {type === "matrix" && (
        <>
          <rect x="99" y="89" width="15" height="24" rx="3" fill="#283f45" />
          <rect x="102" y="93" width="9" height="8" rx="1" fill="#a4bba2" />
          <path
            d="M102 105h2m4 0h2m-8 4h2m4 0h2"
            stroke="#b3c6b5"
            strokeWidth="1.5"
          />
        </>
      )}
      {type === "fight" && (
        <>
          <rect x="95" y="96" width="24" height="15" rx="6" fill="#e5a2bc" />
          <path d="M99 99h16m-15 9h14" stroke="#f7cad3" fill="none" />
          <text
            x="107"
            y="105"
            fontSize="4"
            textAnchor="middle"
            fill="#a35d80"
            stroke="none"
          >
            SOAP
          </text>
        </>
      )}

      {type === "pirate" && (
        <>
          <circle cx="108" cy="105" r="10" fill={gold} />
          <circle cx="108" cy="105" r="7" fill="#d6cfab" />
          <path d="m108 98 2 7-2 7-2-7Z" fill="#6e5a49" />
          <path d="m102 105 6-1 6 1-6 1Z" fill="#a17c4c" />
          <path
            d="m104 97 1-4 5-1 3 4"
            fill="none"
            stroke="#b69961"
            strokeWidth="2"
          />
        </>
      )}
      {type === "loki" && (
        <>
          <path d="m104 126 3-36 7-10" stroke="#bca25e" strokeWidth="4" />
          <path d="m109 91-8-10 6-13 11 5-2 9-7 3" fill={gold} />
          <path d="m107 72-3 7 6 4 5-7Z" fill="#83c2cf" />
          <path d="m108 73 3 2" stroke="#e0f4ed" />
        </>
      )}
    </CostumeSurface>
  );
}
