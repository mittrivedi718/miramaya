import { WORLDS, type World } from "@/lib/worlds"

/**
 * A quiet nav that feels like part of the world rather than a menu bar:
 * a return path and the sibling worlds as soft lowercase waypoints.
 */
export function WorldNav({ world }: { world: World }) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
      <a href="/" className="shrink-0 transition-colors hover:text-foreground">
        ← the mirrors
      </a>
      <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
        {WORLDS.map((w) => (
          <a
            key={w.handle}
            href={`/store/${w.handle}`}
            aria-current={w.handle === world.handle ? "page" : undefined}
            className={`transition-all duration-500 hover:text-foreground ${
              w.handle === world.handle ? "text-foreground" : "text-muted-foreground/60 hover:opacity-100"
            }`}
          >
            {w.name}
          </a>
        ))}
      </nav>
    </header>
  )
}
