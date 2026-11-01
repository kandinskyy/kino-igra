import CostumeSurface from "./CostumeSurface";
import { wardrobe, tint } from "../config/robotMaterials";
export function MaterialDefs({ id, tone, type }) {
  const w = wardrobe[type];
  return (
    <defs>
      <linearGradient id={id + "shell"} x1=".1" y1="0" x2=".9" y2="1">
        <stop stopColor={tint(tone, 0.42)} />
        <stop offset=".48" stopColor={tone} />
        <stop offset="1" stopColor={tint(tone, -0.2)} />
      </linearGradient>
      <linearGradient id={id + "porcelain"} x1="0" y1="0" x2=".7" y2="1">
        <stop stopColor="#fffefa" />
        <stop offset=".62" stopColor="#f0f4f2" />
        <stop offset="1" stopColor="#cbd9dc" />
      </linearGradient>
      <linearGradient id={id + "fabric"} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor={tint(w.cloth, 0.3)} />
        <stop offset=".36" stopColor={w.cloth} />
        <stop offset="1" stopColor={tint(w.cloth, -0.4)} />
      </linearGradient>
      <filter id={id + "contact"} x="-30%" y="-100%" width="160%" height="300%">
        <feGaussianBlur stdDeviation="1.3" />
      </filter>
      <linearGradient id={id + "gold"} x1="0" y1="0" x2="1" y2=".9">
        <stop stopColor="#f4dfa0" />
        <stop offset=".3" stopColor="#d3ae61" />
        <stop offset=".55" stopColor="#f0d490" />
        <stop offset="1" stopColor="#a57b42" />
      </linearGradient>
      <linearGradient id={id + "steel"} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f4f7ee" />
        <stop offset=".35" stopColor="#a4bac4" />
        <stop offset=".58" stopColor="#e3ecec" />
        <stop offset="1" stopColor="#6c8994" />
      </linearGradient>
      <radialGradient id={id + "iris"} cx=".35" cy=".2" r=".9">
        <stop stopColor={tint(tone, 0.65)} />
        <stop offset=".55" stopColor={tone} />
        <stop offset="1" stopColor={tint(tone, -0.45)} />
      </radialGradient>
      <linearGradient id={id + "lens"} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#718f95" />
        <stop offset=".3" stopColor="#253f4c" />
        <stop offset="1" stopColor="#142b38" />
      </linearGradient>
      <pattern
        id={id + "knit"}
        width="10"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="m1 1 3 3-3 3m5-6 3 3-3 3"
          fill="none"
          stroke="#e5d8bf"
          strokeOpacity=".35"
          strokeWidth=".8"
        />
      </pattern>
      <pattern
        id={id + "pinstripe"}
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M2 0v5"
          stroke="#b9c7d0"
          strokeOpacity=".28"
          strokeWidth=".65"
        />
      </pattern>
    </defs>
  );
}
export function CostumeLegs({ type, tone, id }) {
  const w = wardrobe[type],
    armored = ["iron", "captain", "thor", "thanos"].includes(type);
  return (
    <CostumeSurface stroke="#283d49" strokeWidth="1.25" strokeLinejoin="round">
      {[36, 70].map((x, n) => {
        const b = n ? 68 : 30;
        return (
          <g key={x}>
            <path d={`M${x} 114h14v19q-7 4-14 0Z`} fill={w.pants} />
            {type === "wolf" && (
              <rect
                x={x + 1}
                y="114"
                width="12"
                height="18"
                fill={`url(#${id}pinstripe)`}
                stroke="none"
              />
            )}
            {type === "bill" && (
              <path
                d={`M${x + (n ? 10 : 3)} 115v19`}
                stroke="#303b3d"
                strokeWidth="3"
              />
            )}
            {type === "spider" && (
              <path
                d={`M${x} 124h14m-13-4 12 12m-12 0 12-12`}
                stroke="#274963"
                fill="none"
                strokeWidth=".8"
              />
            )}
            {armored && (
              <path
                d={`M${x + 1} 121h12l-2 7h-8Z`}
                fill={type === "iron" ? `url(#${id}gold)` : w.trim}
              />
            )}
            <path d={`M${b} 139q0-10 16-10h6v13H${b}Z`} fill={w.boot} />
            <path
              d={`M${b + 2} 140h18`}
              stroke={
                ["marty", "forrest", "racer", "bill"].includes(type)
                  ? "#e6ebe5"
                  : "#263c48"
              }
              strokeWidth="2.5"
            />
            {["marty", "forrest", "racer"].includes(type) && (
              <>
                <path
                  d={`M${x + 3} 132h8m-10 3h8`}
                  stroke={type === "marty" ? "#b95055" : "#758d91"}
                  strokeWidth="1.2"
                />
                <path d={`M${x - 3} 136h4`} stroke={tone} strokeWidth="2" />
              </>
            )}
            {["pirate", "gandalf", "jedi", "matrix"].includes(type) && (
              <path d={`M${x} 131h14`} stroke={w.trim} strokeWidth="2" />
            )}
          </g>
        );
      })}
      {type === "hulk" && (
        <path
          d="M35 116h50v8l-6-3-4 6-6-5-9 4-9-4-6 5-6-6-4 3Z"
          fill="#7e678f"
        />
      )}
    </CostumeSurface>
  );
}
export function CostumeSleeve({ type, side, id }) {
  const w = wardrobe[type],
    left = side === "left";
  return (
    <CostumeSurface
      transform={left ? undefined : "translate(120 0) scale(-1 1)"}
      stroke="#2b3e4a"
      strokeWidth="1.1"
      strokeLinejoin="round"
    >
      <path d="M34 87q7 2 3 9l-10 12q-3 4-7 0l-10-7 5-8 9 6Z" fill={w.sleeve} />
      <path
        d="m33 92-9 11-7-5"
        fill="none"
        stroke={w.trim}
        strokeOpacity=".6"
      />
      <path
        d="m12 93 9 7-5 6-9-7Z"
        fill={["widow", "thanos"].includes(type) ? `url(#${id}gold)` : w.trim}
      />
      <path
        className="robot-hand"
        d="M5 95q2-5 7-3l5 4q3 5-2 8l-5-1q-6-1-5-8Z"
        fill={"url(#" + id + "shell)"}
      />
      <path
        d="m8 96 5 4m-6-1 4 3"
        stroke="#445c69"
        strokeOpacity=".65"
        fill="none"
        strokeWidth=".8"
      />
      {type === "iron" && (
        <>
          <path d="m31 87 10 8-9 8-9-9Z" fill={`url(#${id}shell)`} />
          <path d="m20 98 8 7-5 5-8-7Z" fill={`url(#${id}gold)`} />
          <circle cx="12" cy="98" r="3" fill="#c3f6fa" stroke="none" />
        </>
      )}
      {type === "bill" && (
        <path d="m32 89-12 13" stroke="#303b3d" strokeWidth="3" />
      )}
      {type === "spider" && (
        <path
          d="m30 91-12 13m7-10 8 7m-13-2 8 7"
          stroke="#2c455d"
          strokeWidth=".8"
          fill="none"
        />
      )}
      {type === "widow" && (
        <path d="m18 101 8 7m-10-5 8 7" stroke="#e5c27b" strokeWidth="1.2" />
      )}
      {type === "brother" && (
        <path d="m30 92-9 10m12-7-9 10" stroke="#dacdb6" strokeWidth="2" />
      )}
    </CostumeSurface>
  );
}
