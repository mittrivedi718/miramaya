import { worldEntry } from "@/lib/world-entry-config"
import { worldStyle, type World } from "@/lib/worlds"
import { WorldBackground } from "./world-background"
import { WorldNav } from "./world-nav"

/**
 * The interior of a world that isn't a shop yet: a calm, unhurried holding
 * state. The "still unwritten" copy is the intended final wording for now.
 */
export function WorldPlaceholder({ world }: { world: World }) {
  const cfg = worldEntry(world.handle)

  return (
    <main
      style={worldStyle(world)}
      className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <WorldBackground ambience={cfg.ambience} />
      <WorldNav world={world} />

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <p className="mv-rise mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{world.tagline}</p>
        <h1 className="mv-rise mb-6 font-serif text-6xl lowercase leading-[0.9] tracking-tight text-balance md:text-8xl">
          {world.name}
        </h1>
        <p className="mv-rise mv-rise-2 mb-10 max-w-md text-pretty font-serif text-2xl leading-snug md:text-3xl">
          {world.whisper}
        </p>

        {cfg.themes && (
          <div className="mv-rise mv-rise-2 mb-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {cfg.themes.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}

        <div className="mv-rise mv-rise-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          <p>This place is temporary. The rest is still unwritten.</p>
          <p className="mt-2">For now, this is what you can know. As more uncovers, you&apos;ll know more.</p>
        </div>
      </section>

      <footer className="relative z-10 flex items-center justify-between px-5 py-6 text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:px-8">
        <span>{world.name}</span>
        <span>still forming</span>
      </footer>
    </main>
  )
}
