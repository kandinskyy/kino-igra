import { useId } from "react";
import { hairStyles } from "../config/hairStyles";
import { tint } from "../config/robotMaterials";

function HairLayer({ type, back = false }) {
  const raw = useId(),
    h = hairStyles[type],
    id = "hair-" + raw.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!h || !(back ? h.back : h.front)) return null;
  const shape = back ? h.back : h.front,
    lines = back ? h.linesBack : h.lines;
  return (
    <g
      className={back ? "robot-hair-back" : "robot-hair-front"}
      stroke="#293c44"
      strokeWidth=".8"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <radialGradient id={id} cx=".35" cy=".18" r=".9">
          <stop stopColor={h.light} />
          <stop offset=".42" stopColor={h.base} />
          <stop offset="1" stopColor={tint(h.base, -0.4)} />
        </radialGradient>
        {h.right && (
          <radialGradient id={id + "right"} cx=".32" cy=".18" r=".95">
            <stop stopColor="#646b72" />
            <stop offset=".46" stopColor="#30343a" />
            <stop offset="1" stopColor="#171c25" />
          </radialGradient>
        )}
        <filter id={id + "shadow"} x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation=".8" />
        </filter>
      </defs>
      {!back && (
        <path
          d={shape}
          transform="translate(0 2)"
          fill="#142a32"
          opacity=".3"
          filter={`url(#${id}shadow)`}
          stroke="none"
        />
      )}
      <path d={shape} fill={"url(#" + id + ")"} />
      {lines && (
        <path
          d={lines}
          fill="none"
          stroke={h.light}
          strokeWidth="1.1"
          opacity=".7"
        />
      )}
      {!back && h.right && (
        <>
          <path d={h.right} fill={`url(#${id}right)`} />
          <path
            d={h.rightLines}
            fill="none"
            stroke="#747c7b"
            strokeWidth="1.1"
          />
        </>
      )}
    </g>
  );
}
export function HairBack({ type }) {
  return <HairLayer type={type} back />;
}
export function HairFront({ type }) {
  return <HairLayer type={type} />;
}
