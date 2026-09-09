"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"

/* ---------------------------------------------------------------------------
   The MIA / MEA chooser.

   One traveller stands at the base of two flights of stone steps. Choose a side
   and they hop up the blocks ONE AT A TIME until they reach the final block that
   sits behind that side's eye — then the eye opens and the route pushes.

   LEFT, at the far left, is MIA's emblem-eye → crosses to the MIA chat.
   RIGHT, at the far right, is MEA's i-in-the-iris eye → opens the assistant.

   Both eyes are real, focusable buttons (the walk is enhancement, not the only
   way through), and reduced-motion visitors skip straight to the crossing.
--------------------------------------------------------------------------- */

const MIA_URL = "https://meetmia.vercel.app/"

// Step nodes in a 300 x 260 field. Index 0 is the shared base stone; the last
// node is the SUMMIT block that sits behind that side's eye. MIA climbs to the
// far left, MEA mirrors it to the far right.
const MIA_PATH: ReadonlyArray<readonly [number, number]> = [
  [150, 236],
  [122, 212],
  [98, 186],
  [78, 150],
  [66, 92],
]
const MEA_PATH: ReadonlyArray<readonly [number, number]> = [
  [150, 236],
  [178, 212],
  [202, 186],
  [222, 150],
  [234, 92],
]

const MIA_GLOW = "#9aa6d8" // the emblem's cool silver-blue
const MEA_GLOW = "#b9a8e6" // MEA's lavender

const SEG_MS = 260 // time to hop one block
const DWELL_MS = 120 // pause landed on each block
const HOP = 17 // arc height of each hop

type Choice = "mia" | "mea"

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const pct = (v: number, span: number) => `${(v / span) * 100}%`

export function MiaMeaGate({ world }: { world: World }) {
  const router = useRouter()
  const [choice, setChoice] = useState<Choice | null>(null)
  const [fig, setFig] = useState<readonly [number, number]>([MIA_PATH[0][0], MIA_PATH[0][1]])
  const [reached, setReached] = useState(0) // nodes fully landed on — drives the lit trail
  const [opened, setOpened] = useState(false)
  const [last, setLast] = useState<Choice | null>(null)
  const committed = useRef(false)
  const raf = useRef<number | null>(null)

  // Warm the MEA route and recall which assistant was opened last time.
  useEffect(() => {
    router.prefetch("/mea")
    try {
      const stored = window.localStorage.getItem("mm:lastAssistant")
      if (stored === "mia" || stored === "mea") setLast(stored)
    } catch {
      /* private mode — no memory, no harm */
    }
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [router])

  const cross = useCallback(
    (dir: Choice) => {
      try {
        window.localStorage.setItem("mm:lastAssistant", dir)
      } catch {
        /* ignore */
      }
      if (dir === "mia") {
        try {
          ;(window.top ?? window).location.href = MIA_URL
        } catch {
          window.location.href = MIA_URL
        }
      } else {
        router.push("/mea")
      }
    },
    [router],
  )

  const choose = useCallback(
    (dir: Choice) => {
      if (committed.current) return
      committed.current = true
      setChoice(dir)
      const path = dir === "mea" ? MEA_PATH : MIA_PATH
      const segments = path.length - 1

      const reduced =
        typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

      if (reduced) {
        setFig(path[path.length - 1])
        setReached(segments)
        setOpened(true)
        window.setTimeout(() => cross(dir), 260)
        return
      }

      // Hop block by block: for each segment, arc across in SEG_MS, then dwell.
      let seg = 0
      let segStart = performance.now()
      const tick = (now: number) => {
        const elapsed = now - segStart
        const a = path[seg]
        const b = path[seg + 1]
        if (elapsed < SEG_MS) {
          const f = easeInOut(elapsed / SEG_MS)
          const x = a[0] + (b[0] - a[0]) * f
          const y = a[1] + (b[1] - a[1]) * f - HOP * Math.sin(Math.PI * f)
          setFig([x, y])
          raf.current = requestAnimationFrame(tick)
        } else if (elapsed < SEG_MS + DWELL_MS) {
          // landed squarely on block b
          setFig(b)
          setReached(seg + 1)
          raf.current = requestAnimationFrame(tick)
        } else {
          seg += 1
          if (seg >= segments) {
            setFig(path[path.length - 1])
            setReached(segments)
            setOpened(true)
            window.setTimeout(() => cross(dir), 260)
            return
          }
          segStart = now
          raf.current = requestAnimationFrame(tick)
        }
      }
      raf.current = requestAnimationFrame(tick)
    },
    [cross],
  )

  const path = choice === "mea" ? MEA_PATH : MIA_PATH
  const litTrail = choice
    ? [...path.slice(0, reached + 1).map((p) => `${p[0]},${p[1]}`), `${fig[0]},${fig[1]}`].join(" ")
    : ""

  const dim = (side: Choice) => choice !== null && choice !== side

  return (
    <main
      style={worldStyle(world)}
      className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <style>{`
        @keyframes mm-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2.5px) } }
        @keyframes mm-ring { 0% { opacity:.5; transform:scale(.9) } 70%,100% { opacity:0; transform:scale(1.5) } }
      `}</style>

      <WorldBackground ambience="astral" />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
        <a href="/" className="min-h-11 py-3 transition-colors hover:text-foreground">
          ← the mirrors
        </a>
        <span>{world.tagline}</span>
      </header>

      <section
        className={`relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-14 text-center transition-all duration-700 ${
          opened ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <p className="mv-rise mb-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          who are you talking to?
        </p>
        <h1 className="mv-rise mv-rise-2 mb-2 font-serif text-5xl tracking-tight md:text-7xl">MIA / MEA</h1>
        <p className="mv-rise mv-rise-2 mb-8 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          Two eyes at the top of two stairs. Climb left to <span className="text-foreground">MIA</span>, who remembers —
          or right to <span className="text-foreground">MEA</span>, who helps you act.
        </p>

        {/* The forking stairway. */}
        <div
          className="mv-rise mv-rise-3 relative w-[min(92vw,26rem)] touch-none select-none"
          style={{ aspectRatio: "300 / 260" }}
        >
          <svg viewBox="0 0 300 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {/* faint dashed guides for both stairways */}
            {[MIA_PATH, MEA_PATH].map((p, idx) => (
              <polyline
                key={idx}
                points={p.map((q) => `${q[0]},${q[1]}`).join(" ")}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.14"
                strokeWidth="1"
                strokeDasharray="2 5"
                strokeLinecap="round"
              />
            ))}

            {/* the walked, glowing trail on the chosen side */}
            {choice && (
              <polyline
                points={litTrail}
                fill="none"
                stroke={choice === "mea" ? MEA_GLOW : MIA_GLOW}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 3px ${choice === "mea" ? MEA_GLOW : MIA_GLOW})` }}
              />
            )}

            {/* shared base stone */}
            <StepBlock node={MIA_PATH[0]} glow="#c9ced8" faded={choice !== null} summit={false} />

            {/* isometric step blocks for each side (index 1..N-1; last is the summit) */}
            {([[MIA_PATH, MIA_GLOW, "mia"] as const, [MEA_PATH, MEA_GLOW, "mea"] as const]).map(([p, glow, side]) =>
              p.slice(1).map((node, i) => (
                <StepBlock
                  key={`${side}-${i}`}
                  node={node}
                  glow={glow}
                  faded={dim(side as Choice)}
                  summit={i === p.length - 2}
                />
              )),
            )}

            {/* the traveller — a small luminous figure; idle bob until a way is chosen */}
            <g
              style={{
                transform: `translate(${fig[0]}px, ${fig[1] - 9}px)`,
                opacity: opened ? 0 : 1,
                transition: opened ? "opacity 0.4s ease" : "none",
                filter: "drop-shadow(0 0 4px color-mix(in oklab, var(--foreground) 60%, white))",
              }}
            >
              <g style={{ animation: choice ? "none" : "mm-bob 3.2s ease-in-out infinite" }}>
                <ellipse cx="0" cy="1" rx="7" ry="2.5" fill="#000000" opacity="0.3" />
                <path d="M -3.4 0 L 3.4 0 L 2.4 -11 L -2.4 -11 Z" fill="#f1f2f8" />
                <circle cx="0" cy="-14.5" r="3.3" fill="#f1f2f8" />
              </g>
            </g>
          </svg>

          {/* MIA eye — the existing emblem; screen blend drops its black field so
              it reads as embedded in the page, no square border. */}
          <EyeButton
            side="mia"
            label="MIA"
            sub="remembers · the chat"
            x={MIA_PATH[MIA_PATH.length - 1][0]}
            glow={MIA_GLOW}
            dimmed={dim("mia")}
            active={choice === "mia"}
            opened={opened && choice === "mia"}
            disabled={committed.current}
            onChoose={() => choose("mia")}
          >
            <img
              src="/mia/meetmia-emblem.jpeg"
              alt=""
              className="pointer-events-none w-[114%] max-w-none"
              style={{ mixBlendMode: "screen" }}
            />
          </EyeButton>

          {/* MEA eye — the almond lens with a lowercase i standing in the iris.
              Also on black, screen-blended, so it matches MIA and sits embedded. */}
          <EyeButton
            side="mea"
            label="MEA"
            sub="helps you act · the assistant"
            x={MEA_PATH[MEA_PATH.length - 1][0]}
            glow={MEA_GLOW}
            dimmed={dim("mea")}
            active={choice === "mea"}
            opened={opened && choice === "mea"}
            disabled={committed.current}
            onChoose={() => choose("mea")}
          >
            <img
              src="/mea/mea-eye.png"
              alt=""
              className="pointer-events-none w-[112%] max-w-none"
              style={{ mixBlendMode: "screen" }}
            />
          </EyeButton>
        </div>

        <p className="mv-rise mv-rise-3 mt-8 min-h-4 text-[10px] uppercase tracking-[0.26em] text-muted-foreground/80">
          {choice
            ? choice === "mia"
              ? "climbing to MIA…"
              : "climbing to MEA…"
            : last
              ? `last time, you opened ${last.toUpperCase()}`
              : "choose a stairway"}
        </p>
      </section>
    </main>
  )
}

// A single isometric stone block. The summit block is the one that sits behind
// the eye — where the traveller finally lands.
function StepBlock({
  node,
  glow,
  faded,
  summit,
}: {
  node: readonly [number, number]
  glow: string
  faded: boolean
  summit: boolean
}) {
  const w = summit ? 24 : 21
  const h = 8
  const depth = 12
  return (
    <g style={{ opacity: faded ? 0.25 : 1, transition: "opacity 0.5s ease" }}>
      <path
        d={`M ${node[0] - w} ${node[1]} L ${node[0]} ${node[1] + h} L ${node[0]} ${node[1] + h + depth} L ${node[0] - w} ${node[1] + depth} Z`}
        fill={`color-mix(in oklab, ${glow} 16%, #05060d)`}
      />
      <path
        d={`M ${node[0] + w} ${node[1]} L ${node[0]} ${node[1] + h} L ${node[0]} ${node[1] + h + depth} L ${node[0] + w} ${node[1] + depth} Z`}
        fill={`color-mix(in oklab, ${glow} 9%, #05060d)`}
      />
      <path
        d={`M ${node[0]} ${node[1] - h} L ${node[0] + w} ${node[1]} L ${node[0]} ${node[1] + h} L ${node[0] - w} ${node[1]} Z`}
        fill={`color-mix(in oklab, ${glow} ${summit ? 34 : 26}%, #05060d)`}
        stroke={glow}
        strokeOpacity={summit ? 0.75 : 0.5}
        strokeWidth={summit ? 1 : 0.75}
      />
    </g>
  )
}

function EyeButton({
  side,
  label,
  sub,
  x,
  glow,
  dimmed,
  active,
  opened,
  disabled,
  onChoose,
  children,
}: {
  side: Choice
  label: string
  sub: string
  x: number
  glow: string
  dimmed: boolean
  active: boolean
  opened: boolean
  disabled: boolean
  onChoose: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={disabled}
      aria-label={side === "mia" ? "Climb to MIA — the chat that remembers" : "Climb to MEA — the executive assistant"}
      className="group absolute flex flex-col items-center gap-2 rounded-2xl p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-default"
      style={{
        left: pct(x, 300),
        top: "-2%",
        width: "33%",
        opacity: dimmed ? 0.3 : 1,
        transition: "opacity 0.5s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        transform: `translateX(-50%) scale(${opened ? 1.16 : 1})`,
      }}
    >
      <span className="relative grid aspect-square w-full place-items-center">
        {/* glow halo */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[8%] rounded-full blur-md"
          style={{
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            opacity: active ? 0.7 : 0.28,
            transition: "opacity 0.6s ease",
          }}
        />
        {/* invitation ring while idle */}
        {!disabled && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[10%] rounded-full border"
            style={{ borderColor: glow, animation: "mm-ring 2.8s ease-out infinite", transformOrigin: "center" }}
          />
        )}
        <span className="relative grid w-[86%] place-items-center transition-transform duration-500 group-hover:scale-105">
          {children}
        </span>
      </span>
      <span className="flex flex-col items-center leading-none">
        <span className="font-serif text-xl tracking-tight text-foreground [text-shadow:0_1px_10px_var(--background)]">
          {label}
        </span>
        <span className="mt-1 text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">{sub}</span>
      </span>
    </button>
  )
}
