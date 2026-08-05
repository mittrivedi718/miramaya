import Link from "next/link"
import { SiteLogo } from "@/components/site-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { WORLDS, type World } from "@/lib/worlds"

export function StoreHeader({ world }: { world: World }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-5 md:px-8">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Return to MiraMaya portal gallery">
          <SiteLogo compact />
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Worlds">
          {WORLDS.map((item) => (
            <Link
              key={item.handle}
              href={`/store/${item.handle}`}
              aria-current={item.handle === world.handle ? "page" : undefined}
              className={`text-[10px] uppercase tracking-[0.18em] ${item.handle === world.handle ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Preview</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
