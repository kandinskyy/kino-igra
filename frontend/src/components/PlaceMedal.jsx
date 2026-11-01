export default function PlaceMedal({ rank, className = "" }) {
  return (
    <svg
      viewBox="0 0 48 56"
      className={`place-medal medal-${rank} ${className}`}
      role="img"
      aria-label={`${rank} место`}
    >
      <path
        d="m11 30-5 22 10-4 7 7 3-22M37 30l5 22-10-4-7 7-3-22"
        fill="var(--ribbon, #8266c4)"
      />
      <circle cx="24" cy="23" r="20" fill="var(--metal)" />
      <circle
        cx="24"
        cy="23"
        r="15.5"
        fill="none"
        stroke="#172139"
        strokeOpacity=".2"
        strokeWidth="1.5"
      />
      <path
        d="M12 15a15 15 0 0 1 15-7"
        fill="none"
        stroke="white"
        strokeOpacity=".65"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill="#302d39"
        fontFamily="inherit"
        fontWeight="800"
        fontSize="21"
      >
        {rank}
      </text>
    </svg>
  );
}
