/** Minimal line-glyphs for the returning symbol puzzle (marked by Mit). */
export function SymbolGlyph({ glyph, color }: { glyph: string; color: string }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }

  switch (glyph) {
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3l2.4 5.6L20 9.2l-4.2 3.9L17 19l-5-3-5 3 1.2-5.9L4 9.2l5.6-.6z" fill={color} fillOpacity={0.14} />
        </svg>
      )
    case "moon":
      return (
        <svg {...common}>
          <path d="M17 12.5A6 6 0 019 5a6 6 0 106 9 6 6 0 002-1.5z" fill={color} fillOpacity={0.14} />
        </svg>
      )
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="2.6" fill={color} fillOpacity={0.3} />
        </svg>
      )
    case "needle":
      return (
        <svg {...common}>
          <path d="M4 20L20 4" />
          <path d="M20 4l-3 1 2 2z" fill={color} fillOpacity={0.3} />
          <circle cx="5.5" cy="18.5" r="1.6" />
        </svg>
      )
    case "key":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="3.4" />
          <path d="M10.5 10.5L20 20M17 17l2-2M14 14l2-2" />
        </svg>
      )
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" fill={color} fillOpacity={0.18} />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
        </svg>
      )
    case "leaf":
      return (
        <svg {...common}>
          <path d="M4 20C4 10 12 4 20 4c0 10-8 16-16 16z" fill={color} fillOpacity={0.14} />
          <path d="M8 16C11 12 15 9 18 8" />
        </svg>
      )
    case "mountain":
      return (
        <svg {...common}>
          <path d="M3 19l6-11 4 6 2-3 6 8z" fill={color} fillOpacity={0.14} />
        </svg>
      )
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0112 7a3.5 3.5 0 017 3.5C19 15.5 12 20 12 20z" fill={color} fillOpacity={0.16} />
        </svg>
      )
    case "flower":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.2" fill={color} fillOpacity={0.3} />
          <path d="M12 3a3 3 0 010 6M12 15a3 3 0 010 6M3 12a3 3 0 016 0M15 12a3 3 0 016 0" />
        </svg>
      )
    case "bird":
      return (
        <svg {...common}>
          <path d="M3 15c4 0 6-3 9-3s4-4 9-6c-2 6-5 9-9 9s-6 3-9 3z" fill={color} fillOpacity={0.14} />
        </svg>
      )
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 18a4 4 0 01-.5-7.97A5 5 0 0116.5 9 3.5 3.5 0 0117 18z" fill={color} fillOpacity={0.14} />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" fill={color} fillOpacity={0.14} />
        </svg>
      )
  }
}
