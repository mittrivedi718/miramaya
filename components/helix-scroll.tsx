"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { HELIX_ALBUM } from "@/lib/maya-album"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"

type Geo = {
  w: number
  trackH: number
  yCenters: number[]
  cardX: number[]
  strandA: string
  strandB: string
  rungs: { x1: number; y1: number; x2: number; y2: number }[]
  cardW: number
}

const photos = HELIX_ALBUM.photos

function computeGeo(w: number, vh: number): Geo {
  const n = photos.length
  const step = Math.max(340, vh * 0.72)
  const padTop = vh * 0.42
  const padBottom = vh * 0.52
  const amp = Math.min(w * 0.24, 130)
  const centerX = w / 2
  const k = Math.PI / step
  const p0 = Math.PI / 2 - k * padTop
  const strand = (y: number, sign: number) => centerX + sign * amp * Math.sin(k * y + p0)

  const yCenters = Array.from({ length: n }, (_, i) => padTop + i * step)
  const trackH = padTop + (n - 1) * step + padBottom
  const cardX = yCenters.map((y) => strand(y, 1))

  // sample the two strands into paths
  const build = (sign: number) => {
    let d = ""
    for (let y = 0; y <= trackH; y += 14) {
      d += `${d ? "L" : "M"} ${strand(y, sign).toFixed(1)} ${y} `
    }
    return d.trim()
  }

  // rungs down the whole helix (DNA base pairs), denser than photos
  const rungs: Geo["rungs"] = []
  const rungStep = step / 4
  for (let y = padTop * 0.5; y <= trackH - padBottom * 0.4; y += rungStep) {
    rungs.push({ x1: strand(y, 1), y1: y, x2: strand(y, -1), y2: y })
  }

  const cardW = Math.min(w * 0.56, 260)
  return { w, trackH, yCenters, cardX, strandA: build(1), strandB: build(-1), rungs, cardW }
}

export function HelixScroll({ world }: { world: World }) {
  const columnRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [geo, setGeo] = useState<Geo | null>(null)
  const [active, setActive] = useState(0)
  const reduced = useRef(false)

  // measure + build geometry
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const measure = () => {
      const el = columnRef.current
      if (!el) return
      setGeo(computeGeo(el.clientWidth, window.innerHeight))
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // scroll-driven twist + parallax
  const raf = useRef<number | null>(null)
  const update = useCallback(() => {
    raf.current = null
    const vh = window.innerHeight
    let nearest = 0
    let nearestDist = Infinity

    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const d = (center - vh / 2) / (vh * 0.62)
      const clamped = Math.max(-1.3, Math.min(1.3, d))
      const abs = Math.min(Math.abs(clamped), 1)
      if (Math.abs(center - vh / 2) < nearestDist) {
        nearestDist = Math.abs(center - vh / 2)
        nearest = i
      }
      if (reduced.current) {
        el.style.transform = "translate(-50%, -50%)"
        el.style.opacity = "1"
        return
      }
      const rotateY = clamped * 40
      const scale = 1 - abs * 0.26
      el.style.transform = `translate(-50%, -50%) perspective(900px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`
      el.style.opacity = (1 - abs * 0.55).toFixed(3)
      el.style.zIndex = String(100 - Math.round(abs * 100))
    })

    setActive((prev) => (prev === nearest ? prev : nearest))

    if (!reduced.current && bgRef.current) {
      const max = document.documentElement.scrollHeight - vh
      const prog = max > 0 ? window.scrollY / max : 0
      bgRef.current.style.transform = `translateY(${(-prog * vh * 0.14).toFixed(1)}px)`
    }
  }, [])

  useEffect(() => {
    if (!geo) return
    const onScroll = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(update)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf.current != null) cancelAnimationFrame(raf.current)
    }
  }, [geo, update])

  const activePhoto = photos[active]

  return (
    <main style={worldStyle(world)} className="relative min-h-svh overflow-x-clip bg-background text-foreground">
      {/* deep space, gently parallaxed */}
      <div className="pointer-events-none fixed inset-0 z-0 scale-125">
        <div ref={bgRef} className="absolute inset-0">
          <WorldBackground ambience="astral" />
        </div>
      </div>

      {/* nav */}
      <div className="relative z-30 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
        <a href="/store/maya" className="transition-colors hover:text-foreground">
          ← {world.name}
        </a>
        <span>{HELIX_ALBUM.kicker}</span>
      </div>

      {/* hero */}
      <section className="relative z-10 flex min-h-[82svh] flex-col items-center justify-center px-6 text-center">
        <p className="mv-rise mb-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {HELIX_ALBUM.photos.length} transformations
        </p>
        <h1 className="mv-rise mb-6 font-serif text-6xl leading-[0.9] tracking-tight text-balance md:text-8xl">
          {HELIX_ALBUM.title}
        </h1>
        <p className="mv-rise mv-rise-2 max-w-md text-pretty font-serif text-xl leading-snug text-[color:var(--primary)] md:text-2xl">
          {HELIX_ALBUM.tagline}
        </p>
        <div className="mv-rise mv-rise-3 mt-14 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <span>scroll to travel</span>
          <span className="animate-bounce">↓</span>
        </div>
      </section>

      {/* the helix */}
      <section className="relative z-10">
        <div ref={columnRef} className="relative mx-auto w-full max-w-2xl" style={{ height: geo ? geo.trackH : undefined }}>
          {geo && (
            <>
              <svg
                width={geo.w}
                height={geo.trackH}
                viewBox={`0 0 ${geo.w} ${geo.trackH}`}
                className="pointer-events-none absolute left-0 top-0"
                aria-hidden="true"
              >
                {geo.rungs.map((r, i) => (
                  <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} className="helix-rung" />
                ))}
                <path d={geo.strandA} className="helix-strand" />
                <path d={geo.strandB} className="helix-strand" />
                <path d={geo.strandA} className="helix-strand--flow" style={{ fill: "none" }} />
                <path d={geo.strandB} className="helix-strand--flow" style={{ fill: "none", animationDelay: "-1.2s" }} />
              </svg>

              {photos.map((photo, i) => (
                <figure
                  key={photo.src}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  className="helix-card absolute"
                  style={{ left: geo.cardX[i], top: geo.yCenters[i], width: geo.cardW }}
                >
                  <div
                    className="relative overflow-hidden rounded-xl border border-[color:var(--primary)]/30 bg-card shadow-[0_0_40px_-8px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
                    style={{ aspectRatio: "3 / 4" }}
                  >
                    <img
                      src={photo.src || "/placeholder.svg"}
                      alt={photo.alt}
                      loading={i < 2 ? "eager" : "lazy"}
                      className="h-full w-full object-cover"
                    />
                    {/* prismatic edge sheen */}
                    <div
                      className="pointer-events-none absolute inset-0 mix-blend-screen opacity-40"
                      style={{ background: "linear-gradient(130deg, transparent 40%, color-mix(in oklab, var(--primary) 55%, transparent) 60%, transparent 72%)" }}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2 py-0.5 font-mono text-[10px] tracking-wide text-foreground backdrop-blur-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <figcaption className="mt-3 text-center">
                    <p className="font-serif text-lg leading-tight">{photo.caption}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {photo.year} · {photo.location}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </>
          )}
        </div>
      </section>

      {/* outro */}
      <section className="relative z-10 flex min-h-[60svh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-3xl leading-tight text-balance md:text-4xl">The helix keeps turning.</p>
        <a href="/store/maya" className="text-[10px] uppercase tracking-[0.24em] underline underline-offset-4 hover:text-foreground">
          back to maya
        </a>
      </section>

      {/* fixed readout: where and when in the transformation you are */}
      {geo && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <div className="rounded-full border border-border bg-card/70 px-4 py-2 text-center backdrop-blur-md">
            <p className="font-mono text-[11px] tracking-wide text-foreground">
              {activePhoto.year} · {activePhoto.location}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
