import { MapPin, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* celestial accent field */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute left-1/3 top-40 h-56 w-56 rounded-full bg-sage/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-12 md:grid-cols-2 md:gap-12 md:px-8 md:pb-24 md:pt-20">
        <div className="order-2 md:order-1">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            Made in Seattle, under the moon
          </p>

          <h1 className="mt-6 text-balance font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Art rooted in place
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            The gallery of <span className="text-foreground">Luna</span> — a small studio of paintings, photographs, and
            moving pieces shaped by the earth and the night sky. Every work is made by paw and heart, then carried out
            to craft and trade shows across the city.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#gallery"
              className="rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              View the gallery
            </a>
            <a
              href="#shows"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              Where to find the work
            </a>
          </div>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
            <img
              src="/from-here-studio-logo.png"
              alt="From Here Studio — a cat resting in a crescent moon above a Pacific Northwest landscape of mountains, a lake, and pines, framed by wildflowers"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
