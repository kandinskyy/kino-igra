import { HairBack, HairFront } from "./RobotHair";
import { robots, robotIndex } from "../config/playerSymbols";
import { useId } from "react";
import { MaterialDefs, CostumeLegs, CostumeSleeve } from "./RobotMaterials";
import {
  CostumeBack,
  CostumeBody,
  CostumeHead,
  CostumeProps,
} from "./RobotCostume";

// One shared chassis and face; the selected film adds removable costume layers.
export default function Character({
  color,
  index,
  full = false,
  celebrate = false,
  className = "",
}) {
  const id = "robot-" + useId().replace(/[^a-zA-Z0-9_-]/g, "") + "-";
  const i = index ?? robotIndex(color),
    robot = robots[i] || robots[0],
    tone = robot.color,
    type = robot.outfit;
  return (
    <svg
      className={`character ${full ? "robot-full" : "robot-portrait"} robot-${i} ${celebrate ? "robot-celebrating" : ""} ${className}`}
      viewBox={full ? "0 -8 120 160" : "7 -8 106 108"}
      fill="none"
      aria-hidden="true"
      style={{ "--character-color": tone, "--robot-delay": `${-i * 0.17}s` }}
    >
      <MaterialDefs id={id} type={type} tone={tone} />
      {full && (
        <ellipse
          className="robot-shadow"
          cx="60"
          cy="144"
          rx="29"
          ry="3"
          fill="#050b1d"
          opacity=".3"
        />
      )}
      <g
        className="robot-rig"
        stroke="#29384a"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {full && (
          <>
            <CostumeBack type={type} tone={tone} id={id} />
            <CostumeLegs type={type} tone={tone} id={id} />
            <g className="robot-arm robot-arm-left">
              <CostumeSleeve type={type} side="left" id={id} />
              <CostumeProps
                id={id}
                type={
                  ["captain", "forrest", "thanos"].includes(type) ? type : null
                }
              />
            </g>
            <g className="robot-arm robot-arm-right">
              <CostumeSleeve type={type} side="right" id={id} />
              <CostumeProps
                id={id}
                type={
                  ["captain", "forrest", "thanos"].includes(type) ? null : type
                }
              />
            </g>
            <CostumeBody type={type} tone={tone} id={id} />
            <ellipse cx="60" cy="88" rx="24" ry="4.5" fill="#071320"
              opacity=".38" filter={`url(#${id}contact)`} />
          </>
        )}
        {!full && <CostumeBody type={type} tone={tone} id={id} />}
        <g className="robot-head">
          <HairBack type={type} />
          <path d="m31 24-5-13" stroke={tone} strokeWidth="3" />
          <circle cx="25" cy="9" r="4" fill={tone} />
          <circle cx="19" cy="55" r="10" fill={`url(#${id}shell)`} />
          <circle cx="101" cy="55" r="10" fill={`url(#${id}shell)`} />
          <circle cx="19" cy="55" r="6" fill={`url(#${id}steel)`} />
          <circle cx="101" cy="55" r="6" fill={`url(#${id}steel)`} />
          <circle cx="19" cy="55" r="2.8" fill={tone} stroke="none" />
          <circle cx="101" cy="55" r="2.8" fill={tone} stroke="none" />
          <rect
            x="22"
            y="23"
            width="76"
            height="66"
            rx="27"
            fill={`url(#${id}shell)`}
          />
          <path
            d="M33 34q16-13 37-8"
            stroke="#fff"
            strokeOpacity=".5"
            strokeWidth="3"
          />
          <rect
            x="27.5"
            y="34.5"
            width="65"
            height="46"
            rx="20"
            fill="#9dafb6"
            fillOpacity=".45"
            stroke="none"
          />
          <rect
            x="29"
            y="36"
            width="62"
            height="43"
            rx="18"
            fill={`url(#${id}porcelain)`}
          />
          <path
            d="M34 48q2-8 12-8h26"
            stroke="#fff"
            strokeOpacity=".85"
            strokeWidth="2"
            fill="none"
          />
          <ellipse cx="45" cy="55" rx="5.5" ry="8" fill={`url(#${id}iris)`} />
          <ellipse cx="75" cy="55" rx="5.5" ry="8" fill={`url(#${id}iris)`} />
          <path d="M43 50v3M73 50v3" stroke="white" strokeWidth="2.3" />
          <path
            className="robot-smile"
            d={celebrate ? "M54 68q6 8 12 0Z" : "M55 69q5 3 10 0"}
            fill={celebrate ? "#9eb3bb" : "none"}
            stroke="#6d8792"
            strokeWidth="1.8"
          />
          <circle
            cx="36"
            cy="66"
            r="2"
            fill={tone}
            stroke="none"
            opacity=".4"
          />
          <circle
            cx="84"
            cy="66"
            r="2"
            fill={tone}
            stroke="none"
            opacity=".4"
          />
          <HairFront type={type} />
          <CostumeHead type={type} tone={tone} id={id} />
        </g>
      </g>
    </svg>
  );
}
