import { SymbolGlyph } from "@/components/symbol-glyph"
import { SYMBOLS, type PortalSymbolId } from "@/lib/portal-symbols"
import { worldEntry, type Mechanic } from "@/lib/world-entry-config"
import { WORLDS } from "@/lib/worlds"

/* The keeper's guidebook, drawn as an illustrated manuscript: cream paper with
   inked plates. Each realm shows its gesture as a figure — ripples, a prism, a
   cairn, a stairway, a bloom, a row of signs — so the rule is something you see,
   not only read. */

const MECHANIC: Record<Mechanic, { name: string; essence: string }> = {
  reflection: { name: "Stillness", essence: "Hold until the surface settles and knows you." },
  refraction: { name: "Perspective", essence: "Turn until the split colours agree into one." },
  earth: { name: "Making", essence: "Stack the three stones until the cairn stands." },
  join: { name: "Tending", essence: "Trace petal to petal in turn, and come full circle." },
  symbols: { name: "Memory", essence: "Touch the signs in the order the keeper kept." },
  pilgrimage: { name: "Journey", essence: "Walk the traveller up, one stone at a time." },
}

const INK = "#0b0c11"

export function GuidebookRealms() {
  return (
    <div>
      <style>{`
        @keyframes gb-ripple { 0% { transform: scale(.4); opacity:.7 } 100% { transform: scale(1.5); opacity:0 } }
        @keyframes gb-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
        @keyframes gb-glow { 0%,100% { opacity:.35 } 50% { opacity:.9 } }
        @keyframes gb-drift { 0% { stroke-dashoffset: 60 } 100% { stroke-dashoffset: 0 } }
        .gb-card { transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease }
        .gb-card:hover { transform: translateY(-4px) }
      `}</style>

      {/* The index of gestures. */}
      <section className="mt-14">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Six gestures, one rule</h2>
          <span className="h-px flex-1 bg-border" />
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(Object.keys(MECHANIC) as Mechanic[]).map((m) => (
            <li key={m} className="flex items-center gap-3 border border-border bg-card p-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                style={{ background: INK }}
              >
                <MechanicMark mechanic={m} color="#e8e6df" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-lg tracking-tight">{MECHANIC[m].name}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{m}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* The plates. */}
      <div className="mt-12 flex flex-col gap-8">
        {WORLDS.map((world, index) => {
          const cfg = worldEntry(world.handle)
          const glow = world.glowColor
          const mech = MECHANIC[cfg.mechanic]
          return (
            <article
              key={world.handle}
              className="gb-card overflow-hidden border border-border bg-card"
              style={{ boxShadow: `0 1px 0 ${glow}22` }}
            >
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${glow}, transparent)` }} />
              <div className="flex flex-col gap-6 p-5 md:flex-row md:items-stretch md:p-7">
                {/* the inked figure */}
                <div className="md:w-2/5">
                  <figure
                    className="relative flex h-44 items-center justify-center overflow-hidden rounded-sm md:h-full"
                    style={{
                      background: `radial-gradient(120% 120% at 50% 20%, ${glow}22, ${INK} 70%)`,
                      border: `1px solid ${glow}33`,
                    }}
                  >
                    <GestureScene mechanic={cfg.mechanic} handle={world.handle} glow={glow} />
                    <figcaption className="absolute bottom-2 left-3 text-[9px] uppercase tracking-[0.18em] text-white/50">
                      fig. {String(index + 1).padStart(2, "0")}
                    </figcaption>
                  </figure>
                </div>

                {/* the reading */}
                <div className="flex flex-1 flex-col md:w-3/5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]"
                      style={{ background: `${glow}1f`, color: "var(--foreground)", border: `1px solid ${glow}55` }}
                    >
                      <span className="grid h-4 w-4 place-items-center">
                        <MechanicMark mechanic={cfg.mechanic} color="currentColor" size={16} />
                      </span>
                      {mech.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Passage {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-3 font-serif text-3xl leading-none tracking-tight md:text-4xl">{world.name}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{world.tagline}</p>

                  <p className="mt-4 text-sm italic leading-relaxed text-foreground/80">“{mech.essence}”</p>

                  {/* the ordered signs, for the realm that asks for them */}
                  {cfg.mechanic === "symbols" && cfg.symbols && (
                    <OrderedSigns order={cfg.symbols.order as PortalSymbolId[]} decoys={cfg.symbols.decoys as PortalSymbolId[]} />
                  )}

                  <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                    {cfg.rule}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

/** The four remembered signs, in order, plus the decoys they hide among. */
function OrderedSigns({ order, decoys }: { order: PortalSymbolId[]; decoys: PortalSymbolId[] }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Touch, in order</p>
      <ol className="flex flex-wrap items-center gap-2">
        {order.map((id, i) => {
          const s = SYMBOLS[id]
          return (
            <li key={id} className="flex items-center gap-2">
              <span
                className="relative grid h-12 w-12 place-items-center rounded-md"
                style={{ background: INK, border: `1px solid ${s.color}44` }}
              >
                <span
                  className="absolute left-1 top-1 grid h-4 w-4 place-items-center rounded-full text-[9px] font-medium"
                  style={{ background: `${s.color}`, color: INK }}
                >
                  {i + 1}
                </span>
                <SymbolGlyph glyph={s.glyph} color={s.color} />
              </span>
              {i < order.length - 1 && <span aria-hidden className="text-muted-foreground">→</span>}
            </li>
          )
        })}
      </ol>
      <p className="mb-2 mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Ignore these decoys</p>
      <ul className="flex flex-wrap items-center gap-2">
        {decoys.map((id) => {
          const s = SYMBOLS[id]
          return (
            <li
              key={id}
              className="grid h-9 w-9 place-items-center rounded-md opacity-50"
              style={{ background: INK, border: `1px solid ${s.color}22` }}
            >
              <span className="scale-75">
                <SymbolGlyph glyph={s.glyph} color={s.color} />
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Small mark for a mechanic — used in the index and on each passage chip. */
function MechanicMark({ mechanic, color, size = 22 }: { mechanic: Mechanic; color: string; size?: number }) {
  const c = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (mechanic) {
    case "reflection":
      return (
        <svg {...c}>
          <path d="M3 14h18" />
          <path d="M6 17.5c2-1.4 10-1.4 12 0" strokeOpacity={0.5} />
          <circle cx="12" cy="8" r="1.5" fill={color} />
        </svg>
      )
    case "refraction":
      return (
        <svg {...c}>
          <path d="M11 4L4 20h14z" />
          <path d="M18 9l4-2M18 12h4M18 15l4 2" strokeOpacity={0.7} />
        </svg>
      )
    case "earth":
      return (
        <svg {...c}>
          <ellipse cx="12" cy="17" rx="6" ry="2.4" fill={color} fillOpacity={0.18} />
          <ellipse cx="12" cy="12.5" rx="4.4" ry="2" fill={color} fillOpacity={0.14} />
          <ellipse cx="12" cy="8.5" rx="2.8" ry="1.6" fill={color} fillOpacity={0.12} />
        </svg>
      )
    case "join":
      return (
        <svg {...c}>
          <path d="M12 3l7 4.5v9L12 21l-7-4.5v-9z" fill={color} fillOpacity={0.12} />
          <circle cx="12" cy="12" r="1.4" fill={color} />
        </svg>
      )
    case "symbols":
      return (
        <svg {...c}>
          <rect x="4" y="4" width="7" height="7" rx="1" />
          <rect x="13" y="4" width="7" height="7" rx="1" strokeOpacity={0.5} />
          <rect x="4" y="13" width="7" height="7" rx="1" strokeOpacity={0.5} />
          <rect x="13" y="13" width="7" height="7" rx="1" fill={color} fillOpacity={0.2} />
        </svg>
      )
    case "pilgrimage":
      return (
        <svg {...c}>
          <path d="M4 20h4v-4h4v-4h4V8h4" />
          <circle cx="19" cy="5.5" r="1.6" fill={color} />
        </svg>
      )
  }
}

/** The large inked figure inside each plate. Drawn on dark; the glow colours it. */
function GestureScene({ mechanic, handle, glow }: { mechanic: Mechanic; handle: string; glow: string }) {
  const shell = {
    viewBox: "0 0 240 130",
    className: "h-full w-full",
    fill: "none" as const,
    "aria-hidden": true,
  }

  if (mechanic === "reflection") {
    return (
      <svg {...shell}>
        <line x1="30" y1="80" x2="210" y2="80" stroke={glow} strokeOpacity={0.5} />
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            cx="120"
            cy="80"
            rx="18"
            ry="6"
            stroke={glow}
            strokeWidth={1.2}
            style={{ transformOrigin: "120px 80px", animation: `gb-ripple 3.2s ease-out ${i * 1}s infinite` }}
          />
        ))}
        <line x1="120" y1="30" x2="120" y2="72" stroke={glow} strokeWidth={1.4} strokeOpacity={0.7} />
        <circle cx="120" cy="74" r="3" fill={glow} style={{ animation: "gb-glow 3.2s ease-in-out infinite" }} />
      </svg>
    )
  }

  if (mechanic === "refraction") {
    return (
      <svg {...shell}>
        <line x1="20" y1="65" x2="95" y2="65" stroke="#f2f0ea" strokeWidth={1.4} />
        <path d="M95 40L70 90h50z" stroke={glow} strokeWidth={1.4} fill={glow} fillOpacity={0.1} />
        <path d="M120 65l90-22" stroke="#7fbfb2" strokeWidth={1.2} strokeOpacity={0.85} />
        <path d="M120 65h95" stroke={glow} strokeWidth={1.6} />
        <path d="M120 65l90 22" stroke="#c8a9e0" strokeWidth={1.2} strokeOpacity={0.85} />
        <circle cx="215" cy="65" r="3.4" fill={glow} style={{ animation: "gb-glow 2.6s ease-in-out infinite" }} />
      </svg>
    )
  }

  if (mechanic === "earth") {
    return (
      <svg {...shell}>
        <ellipse cx="120" cy="108" rx="60" ry="8" fill={glow} fillOpacity={0.12} />
        <ellipse cx="120" cy="98" rx="34" ry="11" fill={glow} fillOpacity={0.22} stroke={glow} strokeWidth={1} />
        <ellipse cx="120" cy="78" rx="24" ry="9" fill={glow} fillOpacity={0.28} stroke={glow} strokeWidth={1} />
        <ellipse
          cx="120"
          cy="60"
          rx="14"
          ry="7"
          fill={glow}
          fillOpacity={0.34}
          stroke={glow}
          strokeWidth={1}
          style={{ transformOrigin: "120px 60px", animation: "gb-float 3s ease-in-out infinite" }}
        />
      </svg>
    )
  }

  if (mechanic === "pilgrimage") {
    // A miniature of the MIA / MEA stairway: stones ascending to an eye.
    const steps = [
      [40, 100],
      [78, 90],
      [116, 76],
      [154, 58],
    ] as const
    return (
      <svg {...shell}>
        <polyline
          points={steps.map((s) => `${s[0]},${s[1]}`).join(" ")}
          stroke={glow}
          strokeWidth={1.2}
          strokeOpacity={0.5}
          strokeDasharray="2 4"
        />
        {steps.map((s, i) => (
          <g key={i}>
            <path
              d={`M ${s[0] - 14} ${s[1]} L ${s[0]} ${s[1] + 6} L ${s[0] + 14} ${s[1]} L ${s[0]} ${s[1] - 6} Z`}
              fill={glow}
              fillOpacity={0.24}
              stroke={glow}
              strokeWidth={1}
            />
          </g>
        ))}
        {/* the traveller on the second stone */}
        <g style={{ transformOrigin: "78px 84px", animation: "gb-float 3s ease-in-out infinite" }}>
          <path d="M74 84h8l-2-11h-4z" fill="#f1f2f8" />
          <circle cx="78" cy="70" r="3" fill="#f1f2f8" />
        </g>
        {/* the eye at the summit */}
        <g transform="translate(196 46)">
          <path d="M-22 0C-12 -12 12 -12 22 0C12 12 -12 12 -22 0Z" stroke={glow} strokeWidth={1.4} />
          <circle cx="0" cy="0" r="6" fill={glow} fillOpacity={0.3} style={{ animation: "gb-glow 2.8s ease-in-out infinite" }} />
        </g>
      </svg>
    )
  }

  if (mechanic === "symbols") {
    // The shuffled sheet of signs you must read — the answer key sits below.
    const cfg = worldEntry(handle)
    const all = [...(cfg.symbols?.order ?? []), ...(cfg.symbols?.decoys ?? [])] as PortalSymbolId[]
    const kept = new Set(cfg.symbols?.order ?? [])
    return (
      <div className="grid grid-cols-4 gap-2.5 p-5">
        {all.map((id) => {
          const s = SYMBOLS[id]
          const inOrder = kept.has(id)
          return (
            <span
              key={id}
              className="grid h-10 w-10 place-items-center rounded"
              style={{
                border: `1px solid ${s.color}${inOrder ? "77" : "22"}`,
                opacity: inOrder ? 1 : 0.42,
                boxShadow: inOrder ? `0 0 10px ${s.color}44` : "none",
              }}
            >
              <span className="scale-90">
                <SymbolGlyph glyph={s.glyph} color={s.color} />
              </span>
            </span>
          )
        })}
      </div>
    )
  }

  // join — a hexagonal bloom traced in order and closed.
  const cx = 120
  const cy = 65
  const r = 40
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
  })
  return (
    <svg {...shell}>
      <polygon
        points={[...pts, pts[0]].map((p) => `${p[0]},${p[1]}`).join(" ")}
        stroke={glow}
        strokeWidth={1.4}
        fill={glow}
        fillOpacity={0.06}
        strokeDasharray="60"
        style={{ animation: "gb-drift 4s linear infinite" }}
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={7} fill={INK} stroke={glow} strokeWidth={1.2} />
          <text
            x={p[0]}
            y={p[1] + 3}
            textAnchor="middle"
            fontSize="8"
            fill={glow}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {i + 1}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={5} fill={glow} fillOpacity={0.4} style={{ animation: "gb-glow 3s ease-in-out infinite" }} />
    </svg>
  )
}
