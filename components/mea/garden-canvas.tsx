"use client"

import type { Item } from "@/lib/mea/schema"
import type { GardenModel } from "@/lib/mea/select"

// A calm SVG canvas. Cool light, soft depth, hand-drawn-feeling geometry — every
// object maps to a real record. Tapping opens it. Not scenery.
export function GardenCanvas({
  model,
  onPick,
}: {
  model: GardenModel
  onPick: (item: Item) => void
}) {
  const doors = model.openDoors
  // Positions are laid out along a gentle horizon so the path can connect doors.
  const doorX = (i: number) => 70 + (i * 260) / Math.max(1, doors.length)
  const doorPositions = doors.map((_, i) => ({ x: doorX(i), y: 150 }))

  return (
    <figure className="mea-surface overflow-hidden p-0">
      <svg
        viewBox="0 0 360 230"
        role="img"
        aria-label="Garden of mirrors, windows, doors and the room's tree"
        className="block h-auto w-full"
        style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--mea-ground) 88%, var(--mea-teal) 12%), var(--mea-ground))" }}
      >
        <defs>
          <linearGradient id="mea-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--mea-cyan)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--mea-teal)" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* horizon: cool water line */}
        <line x1="0" y1="182" x2="360" y2="182" stroke="var(--mea-veil)" strokeWidth="1" />
        <path d="M0 182 Q180 176 360 182" fill="none" stroke="var(--mea-teal)" strokeWidth="0.75" opacity="0.5" />

        {/* Path: the ordered next actions between doors, a thin teal line. */}
        {doorPositions.length > 1 ? (
          <path
            d={doorPositions.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x + 14} ${p.y + 26}`).join(" ")}
            fill="none"
            stroke="var(--mea-teal)"
            strokeWidth="1.25"
            strokeDasharray="1 5"
            strokeLinecap="round"
            opacity="0.9"
          />
        ) : null}

        {/* Tree: one visible ring per confirmed memory; unrooted memories are pale. */}
        <GardenTree rings={model.rings} unrooted={model.unrootedMemories} />

        {/* Mirrors: reflective, low ovals near the water — captured, not yet shaped. */}
        {model.mirrors.map((m, i) => (
          <GardenObject key={m.id} label={`Mirror: ${m.title}`} onPick={() => onPick(m)} x={40 + i * 46} y={196}>
            <ellipse cx="0" cy="0" rx="15" ry="6" fill="url(#mea-glass)" stroke="var(--mea-silver)" strokeWidth="0.75" opacity="0.85" />
          </GardenObject>
        ))}

        {/* Windows: upright panes — open ideas, visible not actionable. */}
        {model.windows.map((w, i) => (
          <GardenObject key={w.id} label={`Window: ${w.title}`} onPick={() => onPick(w)} x={90 + i * 60} y={70}>
            <rect x="-13" y="-20" width="26" height="40" rx="3" fill="url(#mea-glass)" stroke="var(--mea-silver)" strokeWidth="0.9" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="var(--mea-silver)" strokeWidth="0.6" opacity="0.7" />
            <line x1="-13" y1="0" x2="13" y2="0" stroke="var(--mea-silver)" strokeWidth="0.6" opacity="0.7" />
          </GardenObject>
        ))}

        {/* Open doors: an opportunity with an owner and a date. */}
        {doorPositions.map((p, i) => (
          <GardenObject key={doors[i].id} label={`Door: ${doors[i].title}`} onPick={() => onPick(doors[i])} x={p.x + 14} y={p.y}>
            <rect x="-14" y="-30" width="28" height="52" rx="4" fill="var(--mea-surface)" stroke="var(--mea-mira)" strokeWidth="1.1" />
            <path d="M-14 -30 L-14 22" stroke="var(--mea-cyan)" strokeWidth="1.4" opacity="0.7" />
            <circle cx="8" cy="0" r="1.6" fill="var(--mea-mira)" />
          </GardenObject>
        ))}

        {/* Closed doors: kept visible in a lower register — nothing deleted silently. */}
        {model.closedDoors.map((d, i) => (
          <GardenObject key={d.id} label={`Closed door: ${d.title}`} onPick={() => onPick(d)} x={40 + i * 40} y={150}>
            <rect x="-11" y="-24" width="22" height="42" rx="3" fill="none" stroke="var(--mea-veil)" strokeWidth="1" opacity="0.7" />
          </GardenObject>
        ))}
      </svg>
    </figure>
  )
}

function GardenTree({ rings, unrooted }: { rings: number; unrooted: number }) {
  return (
    <g transform="translate(305 150)" aria-hidden>
      {/* trunk */}
      <path d="M0 32 C -2 12 -2 6 0 -6" fill="none" stroke="var(--mea-teal)" strokeWidth="3" strokeLinecap="round" />
      {/* canopy grows one ring per confirmed memory */}
      {Array.from({ length: Math.max(1, rings) }).map((_, i) => (
        <circle
          key={i}
          cx="0"
          cy="-16"
          r={10 + i * 6}
          fill="none"
          stroke="var(--mea-teal)"
          strokeWidth="0.9"
          opacity={rings === 0 ? 0.25 : 0.35 + i * 0.12}
        />
      ))}
      {/* unrooted memories: pale, floating dots not yet part of the tree */}
      {Array.from({ length: unrooted }).map((_, i) => (
        <circle key={`u${i}`} cx={-24 - i * 7} cy={-30 - i * 4} r="2" fill="var(--mea-silver)" opacity="0.3" />
      ))}
    </g>
  )
}

function GardenObject({
  label,
  onPick,
  x,
  y,
  children,
}: {
  label: string
  onPick: () => void
  x: number
  y: number
  children: React.ReactNode
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onPick()
        }
      }}
      style={{ cursor: "pointer" }}
      className="mea-garden-object"
    >
      {children}
    </g>
  )
}
