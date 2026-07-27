type Pattern = "orbit" | "wave" | "grid" | "burst" | "stack" | "spark";

type WorkPatternProps = {
  pattern: Pattern;
  accent: string;
};

export function WorkPattern({ pattern, accent }: WorkPatternProps) {
  switch (pattern) {
    case "orbit":
      return (
        <svg viewBox="0 0 320 400" className="h-full w-full" aria-hidden>
          <circle cx="160" cy="180" r="78" fill="none" stroke={accent} strokeWidth="3" />
          <circle cx="160" cy="180" r="42" fill={accent} opacity="0.85" />
          <circle cx="230" cy="120" r="18" fill="#14282F" opacity="0.35" />
          <path
            d="M70 290c40-30 90-30 130 0s90 30 130 0"
            fill="none"
            stroke="#14282F"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 320 400" className="h-full w-full" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M20 ${120 + i * 48}c40-28 80-28 120 0s80 28 120 0 80-28 120 0`}
              fill="none"
              stroke={i % 2 ? accent : "#14282F"}
              strokeWidth="4"
              strokeLinecap="round"
              opacity={0.55 + i * 0.08}
            />
          ))}
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 320 400" className="h-full w-full" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => {
            const x = 40 + (i % 3) * 90;
            const y = 70 + Math.floor(i / 3) * 80;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width="58"
                height="58"
                rx="14"
                fill={i % 2 ? accent : "#14282F"}
                opacity={i % 2 ? 0.9 : 0.18}
              />
            );
          })}
        </svg>
      );
    case "burst":
      return (
        <svg viewBox="0 0 320 400" className="h-full w-full" aria-hidden>
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const x2 = 160 + Math.cos(angle) * 120;
            const y2 = 190 + Math.sin(angle) * 120;
            return (
              <line
                key={i}
                x1="160"
                y1="190"
                x2={x2}
                y2={y2}
                stroke={i % 2 ? accent : "#14282F"}
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })}
          <circle cx="160" cy="190" r="36" fill={accent} />
        </svg>
      );
    case "stack":
      return (
        <svg viewBox="0 0 320 400" className="h-full w-full" aria-hidden>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={70 + i * 18}
              y={110 + i * 28}
              width="160"
              height="150"
              rx="22"
              fill={i === 2 ? accent : "#14282F"}
              opacity={i === 2 ? 0.95 : 0.16 + i * 0.1}
              transform={`rotate(${-8 + i * 6} ${150 + i * 18} ${185 + i * 28})`}
            />
          ))}
        </svg>
      );
    case "spark":
    default:
      return (
        <svg viewBox="0 0 320 400" className="h-full w-full" aria-hidden>
          <path
            d="M160 70l22 78h82l-66 48 25 78-63-46-63 46 25-78-66-48h82z"
            fill={accent}
            opacity="0.95"
          />
          <circle cx="80" cy="300" r="14" fill="#14282F" opacity="0.25" />
          <circle cx="250" cy="280" r="22" fill="#14282F" opacity="0.2" />
        </svg>
      );
  }
}
