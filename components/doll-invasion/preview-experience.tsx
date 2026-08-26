"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { SmokeMotif } from "./smoke-motif"
import { ReflectionForm } from "./reflection-form"

/** Name + a few words. Appears and dissolves like breath on a mirror. */
const FRAGMENTS = [
  { name: "MIRA", words: "reflection, memory, community care" },
  { name: "MAYA", words: "creation, transformation, image-making" },
  { name: "MIA", words: "evolving identity, the AI persona" },
  { name: "MIRABELLE", words: "healing, wellness, care for the body" },
  { name: "markedbyMit", words: "tattoo artistry, permanence, what you choose to carry" },
  { name: "ALSO", words: "photography · makeup · retouching & special effects · styling" },
]

/** Traces of the larger work. Tap one to read a little more. */
const TRACES = [
  {
    src: "/preview/doll-invasion/armor.jpeg",
    alt: "Take a Hit, Leave the Armor — chainmail dress covered in charms on a dress form",
    title: "Take a Hit, Leave the Armor",
    line: "The chainmail is what remains.",
    more: "A wearable performance. Through the night the dress transforms — each piece removed reveals more of the chainmail beneath, until only the armor is left. Not a costume, a conversation. Not a product, a participation piece.",
  },
  {
    src: "/preview/doll-invasion/fundraiser.jpeg",
    alt: "Wearable fundraiser poster for trans joy, safety and community care",
    title: "The dress transforms",
    line: "The care remains.",
    more: "A wearable fundraiser for trans joy, safety and community care. Support funds handmade wearable art, harm-reduction and nightlife-care kits, earplugs, hydration and first-aid supplies, and EMS-informed community safety. Part of a larger family of dresses for Doll Invasion, Fire Island, and chosen family.",
  },
  {
    src: "/preview/doll-invasion/care-kit.jpeg",
    alt: "A Little Love For A Magical Night — care kit tins in pink, white and blue",
    title: "A little love for a magical night",
    line: "Everything you need is already here.",
    more: "A compact tin in pink, white, or blue. Inside: glitter, tiny zip bags, breath mints, hair ties, temporary tattoos, a wipe, a sweet message. Small things, big love — thoughtful, practical, made for connection.",
  },
  {
    src: "/preview/doll-invasion/loop-link.jpeg",
    alt: "Loop Link earplug necklace shown three ways on a mannequin",
    title: "Loop Link",
    line: "Earplug necklace. Always with you.",
    more: "Wear it as jewelry, use it when you need it. Three ways: as a pendant, in-ear with the chain looped under your chin, or secured behind the neck. Protect your hearing, stay in the moment.",
  },
  {
    src: "/preview/doll-invasion/universe.jpeg",
    alt: "The Meet Mit Universe — a directory of Mira, Maya, MIA, Mirabelle, Gaia, Miya and markedbyMit",
    title: "The Meet Mit Universe",
    line: "Meet the mirror that remembers you.",
    more: "Mira remembers. Maya creates. MIA evolves. Mirabelle heals. Gaia gives. Miya accompanies. markedbyMit leaves a trace.",
  },
]

/** Adds .is-in when a section scrolls into view, so reveals condense like breath. */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll(".di-reveal")
    if (!nodes?.length) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-in"))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in")
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: "-10% 0px -10% 0px" },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return ref
}

export function PreviewExperience() {
  const [entered, setEntered] = useState(false)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [openTrace, setOpenTrace] = useState<number | null>(null)
  const root = useReveal()

  // Entry veil lifts on its own — never make anyone wait.
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 2200)
    return () => clearTimeout(t)
  }, [])

  // Fragments auto-cycle; interacting pauses the drift.
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setActive((i) => (i + 1) % FRAGMENTS.length), 2600)
    return () => clearInterval(t)
  }, [paused])

  return (
    <div ref={root} className="di-world">
      {/* 1 · ENTRY — near-empty, smoke thinning into a ripple */}
      <button
        type="button"
        onClick={() => setEntered(true)}
        aria-label="Continue to the preview"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-6 transition-opacity duration-1000 ${
          entered ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <SmokeMotif size={150} />
        <span className="text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
          Private Preview · Doll Invasion 2026
        </span>
        <span className="font-serif text-lg text-muted-foreground">Some things are only here for a moment.</span>
      </button>

      <main className="mx-auto flex w-full max-w-xl flex-col gap-24 px-6 pb-24 pt-20">
        {/* 2 · WHO I AM */}
        <section className="di-reveal flex flex-col items-center gap-6 text-center">
          <SmokeMotif size={104} />
          <h1 className="font-serif text-3xl leading-tight text-balance">Doll Invasion 2026</h1>
          <p className="max-w-md text-base leading-relaxed text-pretty">
            You met the vape fairy — the chainmail dress, the armor underneath.{" "}
            <span className="text-muted-foreground">Here&apos;s the rest of it.</span>
          </p>
        </section>

        {/* 3 · THE UNIVERSE — drifting fragments, under 20 seconds to take in */}
        <section className="di-reveal flex flex-col gap-6" aria-label="The universe">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">The Universe</p>

          <div
            className="relative min-h-[132px]"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            {FRAGMENTS.map((f, i) => (
              <div
                key={f.name}
                className="di-frag absolute inset-0 flex flex-col justify-center gap-2"
                data-state={i === active ? "in" : "out"}
                aria-hidden={i !== active}
              >
                <span className="font-serif text-2xl tracking-wide">{f.name}</span>
                <span className="text-sm leading-relaxed text-muted-foreground text-pretty">{f.words}</span>
              </div>
            ))}
          </div>

          {/* Tap through instead of waiting */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Universe fragments">
            {FRAGMENTS.map((f, i) => (
              <button
                key={f.name}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={f.name}
                onClick={() => {
                  setActive(i)
                  setPaused(true)
                }}
                className={`min-h-[44px] min-w-[44px] rounded-full border px-4 text-[10px] uppercase tracking-[0.16em] transition focus-visible:ring-2 focus-visible:ring-ring ${
                  i === active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:border-accent"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <p className="font-serif text-base leading-relaxed text-pretty">
            Mira reflects. Maya creates.{" "}
            <span className="text-muted-foreground">Mit is the mirror holding them all.</span>
          </p>
        </section>

        {/* TRACES — images you can open to read a little more */}
        <section className="di-reveal flex flex-col gap-5" aria-label="Traces">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Traces</p>
          <div className="flex flex-col gap-4">
            {TRACES.map((t, i) => {
              const open = openTrace === i
              return (
                <article key={t.src} className="overflow-hidden rounded-xl border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setOpenTrace(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`trace-${i}`}
                    className="flex w-full items-stretch gap-4 text-left transition hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden">
                      <Image
                        src={t.src}
                        alt={t.alt}
                        fill
                        sizes="96px"
                        className="object-cover object-top"
                        loading={i < 2 ? "eager" : "lazy"}
                      />
                    </span>
                    <span className="flex min-h-[44px] flex-1 flex-col justify-center gap-1 py-4 pr-4">
                      <span className="font-serif text-lg leading-snug text-pretty">{t.title}</span>
                      <span className="text-sm leading-relaxed text-muted-foreground text-pretty">{t.line}</span>
                      <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-accent">
                        {open ? "Close" : "Read more"}
                      </span>
                    </span>
                  </button>

                  {open ? (
                    <div id={`trace-${i}`} className="di-clearing flex flex-col gap-4 border-t border-border p-4">
                      <Image
                        src={t.src}
                        alt={t.alt}
                        width={1320}
                        height={2400}
                        sizes="(max-width: 640px) 90vw, 560px"
                        className="h-auto w-full rounded-lg"
                      />
                      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{t.more}</p>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        {/* 4 · WHAT'S NEXT */}
        <section className="di-reveal flex flex-col items-center gap-5 text-center">
          <SmokeMotif size={96} />
          <p className="max-w-sm text-base leading-relaxed text-pretty">
            Doll Invasion photos and the full album go out privately after the weekend.
          </p>
        </section>

        {/* 5 · LEAD CAPTURE */}
        <ReflectionForm />
      </main>
    </div>
  )
}
