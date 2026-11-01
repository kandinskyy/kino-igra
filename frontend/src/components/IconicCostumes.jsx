import CostumeSurface from "./CostumeSurface";
export function IconicBack({ type }) {
  return (
    <CostumeSurface stroke="#293d48" strokeWidth="1.4" strokeLinejoin="round">
      {type === "cruella" && (
        <>
          <path
            d="M33 80q27-12 54 0l18 51-22 5-23-8-23 8-22-5Z"
            fill="#d9d7cb"
          />
          <path d="M60 75q18-2 27 5l18 51-22 5-23-8Z" fill="#33353e" />
          <path
            d="M26 93q-7 15-7 32m76-32q7 15 7 32"
            stroke="#92968e"
            fill="none"
          />
        </>
      )}
      {type === "xenomorph" && (
        <>
          <path
            d="M33 115Q3 94 6 124t26 10q-21 20-29 0"
            stroke="#344b53"
            strokeWidth="7"
            fill="none"
          />
          <path
            d="M7 117q0 11 4 16m-3-4 4-2m3 9 2-3m7 4 1-3"
            stroke="#8ba99f"
            fill="none"
          />
          <path d="m2 132 4 9 3-6Z" fill="#344b53" />
          <path
            d="M33 88 24 74l7-10 5 20m51 4 9-14-7-10-5 20M39 85l-4-19m46 19 4-19"
            fill="none"
            stroke="#405a61"
            strokeWidth="5"
          />
        </>
      )}
    </CostumeSurface>
  );
}
export function IconicBody({ type, id }) {
  const steel = `url(#${id}steel)`,
    fabric = `url(#${id}fabric)`;
  return (
    <CostumeSurface
      stroke="#2a3d48"
      strokeWidth="1.15"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {type === "cruella" && (
        <>
          <path d="M36 84h48l3 41H33Z" fill={fabric} />
          <path d="M42 85h18v38H36ZM60 85h18l6 38H60Z" fill="#e7e2d5" />
          <path d="M60 85h18l6 38H60Z" fill="#30313c" />
          <path
            d="m35 83 24 12-16 8-12-12m54-8L61 95l16 8 12-12"
            fill="#f1ebdf"
          />
          <path
            d="m35 86 10 7-7 4m47-11-10 7 7 4"
            stroke="#aca99e"
            fill="none"
          />
          <path d="M37 115h46" stroke="#8d414d" strokeWidth="4" />
          <circle cx="60" cy="115" r="3" fill="#d2c1a0" />
        </>
      )}
      {type === "xenomorph" && (
        <>
          <path d="M37 83q23-7 46 0l8 22-9 20H38l-9-20Z" fill={fabric} />
          <path d="M60 86v36" stroke="#98aca3" strokeWidth="3" />
          {[90, 98, 106, 114].map((y) => (
            <g key={y}>
              <path
                d={`M58 ${y}q-15-7-20-1m24 1q15-7 20-1`}
                stroke="#91a79e"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d={`M58 ${y + 3}q-15-7-20-1m24 1q15-7 20-1`}
                stroke="#203940"
                fill="none"
              />
            </g>
          ))}
        </>
      )}
      {type === "jason" && (
        <>
          <path d="M36 84h48v42H36Z" fill={fabric} />
          <path d="M49 85h22v40H49Z" fill="#777c73" />
          <path d="m35 84 18 8-9 13-10-5m51-16-18 8 9 13 10-5" fill="#7c8878" />
          <path d="M37 111h10m26 0h10" stroke="#a8b09d" strokeWidth="2" />
          <path d="m41 115-3 7m43-7 3 7" stroke="#40544e" />
          <path
            d="m56 93-3 6 5 5-3 10m12-20-4 6"
            stroke="#a7a998"
            fill="none"
          />
        </>
      )}
      {type === "dune" && (
        <>
          <path d="M36 84h48l6 25-8 16H38l-8-16Z" fill={fabric} />
          <path
            d="M45 88v32m30-32v32M48 93h24m-24 9h24m-24 9h24"
            stroke="#8fa49b"
            strokeWidth="2.5"
          />
          <path d="M55 88v34h10V88" fill="#263d43" />
          <path
            d="M85 80v21q0 5-9 5h-8"
            stroke="#7b9592"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="68" cy="106" r="3" fill={steel} />
          <path d="M35 84q25 16 50 0l-4 11q-21 8-42 0Z" fill="#a79a7d" />
          <path d="M37 116h46" stroke="#778476" strokeWidth="4" />
        </>
      )}
      {type === "jedi" && (
        <>
          <path d="M36 84h48l3 41H33Z" fill={fabric} />
          <path d="M55 83h10v38H55Z" fill="#25333c" />
          <path d="m43 85 17 15 17-15" fill="none" stroke="#697e83" />
          <path d="m65 95 8-5-2 17Z" fill="#cbd1c4" />
          <path d="M35 115h50" stroke="#35474e" strokeWidth="5" />
          <rect x="55" y="112" width="10" height="6" rx="1" fill={steel} />
        </>
      )}
    </CostumeSurface>
  );
}
export function IconicHead({ type, id }) {
  const steel = `url(#${id}steel)`,
    lens = `url(#${id}lens)`;
  return (
    <CostumeSurface
      stroke="#2b3d49"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {type === "cruella" && (
        <>
          <path d="m36 48 11-3m27 0 10 3" stroke="#3c4146" strokeWidth="2" />
          <path d="M54 68q6 3 12 0-6 8-12 0Z" fill="#bc4c5a" stroke="none" />
          <circle cx="28" cy="73" r="3" fill="#bb4b56" />
          <circle cx="92" cy="73" r="3" fill="#bb4b56" />
        </>
      )}
      {type === "xenomorph" && (
        <>
          <path
            d="M11 59Q1 11 48 5q61-13 64 34l-14 23-9-12q0-21-29-23-29 2-29 23l-6 14Z"
            fill="#344852"
          />
          <path
            d="M18 36Q28 5 68 12q31 2 37 23"
            stroke="#718e93"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M21 31Q44 9 78 17"
            stroke="#a6beb4"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M27 42q33-22 66 0"
            stroke="#203b45"
            strokeWidth="4"
            fill="none"
          />
          <path d="M26 69q34 15 68 0l-8 20q-26 10-52 0Z" fill="#344c52" />
          <path d="M35 76q25 12 50 0v8q-25 12-50 0Z" fill="#20363e" />
          {[39, 46, 53, 60, 67, 74, 81].map((x, i) => (
            <path
              key={x}
              d={`M${x} ${i % 2 ? 79 : 78}v7`}
              stroke="#cbd1bd"
              strokeWidth="2"
            />
          ))}
          <path
            d="m32 54-8 13 9 16m55-29 8 13-9 16"
            stroke="#8ea99f"
            strokeWidth="2"
            fill="none"
          />
        </>
      )}
      {type === "jason" && (
        <>
          <path
            d="M25 35q-1-22 35-22t35 22l-3 34q-4 21-32 23-28-2-32-23Z"
            fill="#dfd8b8"
            stroke="#756f5d"
            strokeWidth="2"
          />
          <path
            d="M33 31q27-17 54 0M34 72q26 25 52 0"
            stroke="#f7efd2"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M34 45q10-7 21 0v10q-11 4-21-1Zm52 0q-10-7-21 0v10q11 4 21-1Z"
            fill="#293b42"
          />
          <path d="m51 30 9 5 9-5-9 12Z" fill="#ae5753" stroke="none" />
          <path d="m35 62 8 3-5 5m47-8-8 3 5 5" fill="#ae5753" stroke="none" />
          {[45, 55, 65, 75].map((x) => (
            <g key={x}>
              <circle cx={x} cy="73" r="1.8" fill="#6d7165" stroke="none" />
              <circle cx={x} cy="80" r="1.7" fill="#6d7165" stroke="none" />
            </g>
          ))}
          {[41, 50, 70, 79].map((x) => (
            <circle
              key={x}
              cx={x}
              cy="24"
              r="1.5"
              fill="#727466"
              stroke="none"
            />
          ))}
          <path
            d="m78 30-4 6m-38 0 4 4m40 45-5 2"
            stroke="#a1a08c"
            fill="none"
          />
          <path
            d="M22 39h6m64 0h6M24 65h5m62 0h5"
            stroke="#6c766c"
            strokeWidth="3"
          />
        </>
      )}
      {type === "dune" && (
        <>
          <ellipse
            cx="45"
            cy="55"
            rx="4"
            ry="6"
            fill="#62bed8"
            stroke="#336e89"
          />
          <ellipse
            cx="75"
            cy="55"
            rx="4"
            ry="6"
            fill="#62bed8"
            stroke="#336e89"
          />
          <path d="M43 52v2m30-2v2" stroke="#d7f8f8" strokeWidth="2" />
          <path d="M29 77q31 19 62 0l5 12-17 9H41l-17-9Z" fill="#a89b79" />
          <path
            d="M33 83q27 13 54 0m-50 6q23 11 46 0"
            stroke="#d5c8a3"
            fill="none"
          />
          <path d="M87 73v17" stroke="#4c6e70" strokeWidth="3" />
        </>
      )}
      {type === "jedi" && (
        <>
          <g className="portrait-saber">
            <path d="m93 82 9-31" stroke="#76ce96" strokeWidth="4" />
            <path d="m94 81 8-29" stroke="#e3ffe8" strokeWidth="1.5" />
          </g>
        </>
      )}
      {type === "widow" && (
        <>
          <path d="m35 47 9-2m32 0 9 2" stroke="#6a4946" strokeWidth="1.8" />
        </>
      )}
      {type === "bill" && (
        <>
          <path d="M35 85h50v8H35Z" fill="#e2ba3a" />
          <path
            d="M39 85v8m4-8v8m34-8v8m4-8v8"
            stroke="#303e44"
            strokeWidth="2"
          />
        </>
      )}
      {type === "wolf" && (
        <>
          <path d="m35 45 14-1m22 0 14 1" stroke="#6a5549" strokeWidth="1.6" />
          <path d="m38 87 15 7 7-8 7 8 15-7" fill="#ecebe0" />
          <path d="m60 90-4 5 4 5 4-5Z" fill="#bba16b" />
        </>
      )}
      {type === "terminator" && (
        <>
          <path d="m73 41 12-3 9 12-5 26-11 8-5-14Z" fill={steel} />
          <path
            d="m81 45 7 8-2 13-7 9m-2-32 3 8"
            stroke="#627b86"
            fill="none"
          />
          <path d="M32 46q11-5 25 0v14q-13 8-24-1Z" fill={lens} />
          <path d="M57 50h9m-31-2 12-1" stroke="#b6c9c6" />
          <circle cx="76" cy="55" r="6.5" fill="#3c535e" />
          <circle cx="76" cy="55" r="3.2" fill="#f5756a" stroke="none" />
          <circle cx="75" cy="54" r="1" fill="#ffe6bf" stroke="none" />
          <path d="M34 83h52l-13 13-13-6-13 6Z" fill="#35444e" />
        </>
      )}
    </CostumeSurface>
  );
}
export function IconicProps({ type, id }) {
  const steel = `url(#${id}steel)`;
  return (
    <CostumeSurface
      stroke="#2b3e49"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {type === "cruella" && (
        <>
          <path
            d="m107 126 1-29q-6-9-10-2"
            fill="none"
            stroke="#514852"
            strokeWidth="3"
          />
          <path d="M108 103v7" stroke="#c2a46c" strokeWidth="2" />
        </>
      )}
      {type === "jason" && (
        <>
          <path d="m103 115 3-15" stroke="#6d5d4d" strokeWidth="5" />
          <path d="m106 101 3-25q11 4 10 14l-10 14Z" fill={steel} />
          <path d="m110 79 5 7-4 12" stroke="#e2e9de" fill="none" />
        </>
      )}
      {type === "jedi" && (
        <>
          <path d="m104 116 2-12" stroke="#8b9c9f" strokeWidth="5" />
          <path d="m104 113 4 1m-3-5 4 1" stroke="#d2dcd5" />
          <path
            d="m106 103 2-33"
            stroke="#72ce8c"
            strokeOpacity=".25"
            strokeWidth="10"
          />
          <path d="m106 103 2-33" stroke="#8de9a2" strokeWidth="5" />
          <path d="m106 102 2-31" stroke="#edfff0" strokeWidth="2" />
        </>
      )}
    </CostumeSurface>
  );
}
