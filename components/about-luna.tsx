import { Moon, Star } from "lucide-react"
import type { AboutPhoto } from "@/lib/data"

export function AboutLuna({ photos }: { photos: AboutPhoto[] }) {
  const [lead, ...rest] = photos

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-14">
      <div className="order-2 md:order-1">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          About the artist
        </p>
        <h2 className="mt-5 text-balance font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
          Meet Luna
        </h2>
        <div className="mt-6 space-y-4 text-pretty leading-relaxed text-muted-foreground">
          <p>
            Luna is the resident artist and creative director of the studio — and, yes, she is a cat. She keeps a strict
            schedule of sunbeam study, midnight window-watching, and the occasional decisive paw-print across a wet
            canvas.
          </p>
          <p>
            Working from a sunlit corner in Seattle, Luna is drawn to the celestial and the earthbound alike: moons and
            moss, tide charts and dust motes. Her human, Jackie, handles the parts that require thumbs — stretching
            canvas, framing, and driving the work to shows.
          </p>
          <p>
            Every piece is one of a kind and made close to home. If a work speaks to you, come say hello at one of the
            upcoming craft and trade shows below.
          </p>
        </div>
        <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          <Moon className="h-4 w-4 text-accent" aria-hidden="true" />
          Studio cat since day one
        </p>
      </div>

      <div className="order-1 md:order-2">
        {photos.length === 0 ? (
          <div className="flex aspect-[4/5] w-full items-center justify-center rounded-xl border border-dashed border-border bg-card/50 text-center">
            <p className="max-w-xs px-6 text-muted-foreground">Photos of Luna will appear here once they are added.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {lead && (
              <figure className="overflow-hidden rounded-xl border border-border bg-card">
                <img
                  src={lead.url || "/placeholder.svg"}
                  alt={lead.caption ?? "Luna, the studio cat"}
                  className="aspect-[4/5] w-full object-cover"
                />
                {lead.caption && (
                  <figcaption className="px-4 py-3 text-sm italic text-muted-foreground">{lead.caption}</figcaption>
                )}
              </figure>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {rest.slice(0, 4).map((photo) => (
                  <figure key={photo.id} className="overflow-hidden rounded-xl border border-border bg-card">
                    <img
                      src={photo.url || "/placeholder.svg"}
                      alt={photo.caption ?? "Luna, the studio cat"}
                      className="aspect-square w-full object-cover"
                    />
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
