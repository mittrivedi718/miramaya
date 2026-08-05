"use client"

import { useCallback, useMemo, useState, type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { defineCatalog } from "@json-render/core"
import { schema, defineRegistry } from "@json-render/react"
import {
  ThreeCanvas,
  threeComponentDefinitions,
  threeComponents,
} from "@json-render/react-three-fiber"
import { ArrowDown, ArrowRight } from "lucide-react"
import { PortalPuzzle } from "@/components/portal-puzzle"
import { SiteLogo } from "@/components/site-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { WORLD_SCENES } from "@/lib/scene/worlds-3d"
import { WORLDS } from "@/lib/worlds"

const catalog = defineCatalog(schema, {
  components: { ...threeComponentDefinitions },
  actions: {},
})

const { registry } = defineRegistry(catalog, {
  components: { ...threeComponents },
})

function sceneSpec(handle: string) {
  const worldScene = WORLD_SCENES[handle]()
  return {
    root: "world-root",
    elements: {
      "world-root": {
        type: "Group",
        props: { position: null, rotation: null, scale: null },
        children: worldScene.children,
      },
      ...worldScene.elements,
    },
  }
}

export function PortalGallery({ sequences }: { sequences: Record<string, string[]> }) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [entering, setEntering] = useState(false)
  const [puzzleOpen, setPuzzleOpen] = useState(false)
  const world = WORLDS[activeIndex]
  const spec = useMemo(() => sceneSpec(world.handle), [world.handle])

  const select = useCallback((index: number) => {
    if (!entering) setActiveIndex(index)
  }, [entering])

  const enter = useCallback(() => {
    if (entering) return
    setPuzzleOpen(true)
  }, [entering])

  const passThrough = useCallback(() => {
    setPuzzleOpen(false)
    setEntering(true)
    window.setTimeout(() => router.push(`/store/${world.handle}`), 900)
  }, [router, world.handle])

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${entering ? "scale-[2.8]" : "scale-100"}`}>
        <ThreeCanvas
          key={world.handle}
          spec={spec}
          registry={registry}
          camera={{ position: [0, 0.1, 5.4], fov: 48 }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-border px-5 py-4 md:px-8">
        <a href="#portals" aria-label="Miramaya portal gallery" className="transition-opacity hover:opacity-80">
          <SiteLogo />
        </a>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:gap-5">
          <span className="hidden sm:inline">five collections · one passage</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / 05</span>
          <ThemeToggle />
        </div>
      </header>

      <section className={`relative z-10 flex min-h-svh flex-col justify-between px-5 pb-5 pt-24 transition-opacity duration-500 md:px-8 md:pb-8 ${entering ? "opacity-0" : "opacity-100"}`}>
        <div className="max-w-xl rounded-lg border border-border/60 bg-background/55 p-5 backdrop-blur-md md:p-6">
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">A gallery of other places</p>
          <h1 className="font-serif text-4xl leading-none tracking-tight text-balance md:text-6xl">Choose the mirror that remembers you.</h1>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <button
            type="button"
            onClick={enter}
            className="group relative flex aspect-[3/4] w-[min(58vw,24rem)] items-end justify-center overflow-hidden rounded-[50%_50%_2rem_2rem] border border-foreground/40 bg-transparent p-7 shadow-[inset_0_0_0_8px_var(--background),inset_0_0_0_9px_var(--border),0_0_80px_color-mix(in_oklab,var(--world-glow)_30%,transparent)] transition-transform duration-500 hover:scale-[1.025] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground md:w-[min(34vw,25rem)]"
            style={{ "--world-glow": world.glowColor } as CSSProperties}
            aria-label={`Enter ${world.name}`}
          >
            <span className="absolute inset-3 rounded-[50%_50%_1.5rem_1.5rem] border border-foreground/20" />
            <span className="relative flex w-full items-end justify-between border-t border-foreground/30 pt-4 text-left">
              <span>
                <span className="block font-serif text-4xl tracking-tight md:text-5xl">{world.name}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{world.tagline}</span>
              </span>
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </button>
        </div>

        <div id="portals" className="grid grid-cols-5 border-y border-border">
          {WORLDS.map((item, index) => (
            <button
              key={item.handle}
              type="button"
              onClick={() => select(index)}
              aria-pressed={index === activeIndex}
              className={`min-w-0 border-r border-border px-2 py-4 text-left last:border-r-0 md:px-4 ${index === activeIndex ? "bg-foreground text-background" : "bg-background/50 text-muted-foreground hover:bg-card hover:text-foreground"}`}
            >
              <span className="block truncate font-serif text-sm md:text-xl">{item.name}</span>
              <span className="mt-1 hidden truncate text-[9px] uppercase tracking-[0.14em] md:block">{item.keywords.join(" · ")}</span>
            </button>
          ))}
        </div>
      </section>

      {puzzleOpen && (
        <PortalPuzzle
          handle={world.handle}
          symbols={sequences[world.handle] ?? []}
          onUnlocked={passThrough}
          onCancel={() => setPuzzleOpen(false)}
        />
      )}

      {entering && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background/20">
          <p className="animate-pulse text-[10px] uppercase tracking-[0.35em]">entering {world.name}</p>
        </div>
      )}

      <ArrowDown className="absolute bottom-28 right-5 z-20 size-4 text-muted-foreground md:right-8" aria-hidden="true" />
    </main>
  )
}
