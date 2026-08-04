import { AboutLuna } from "@/components/about-luna"
import { Gallery } from "@/components/gallery"
import { Hero } from "@/components/hero"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { UpcomingShows } from "@/components/upcoming-shows"
import { getAboutPhotos, getArtworks, getUpcomingEvents } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [artworks, aboutPhotos, events] = await Promise.all([getArtworks(), getAboutPhotos(), getUpcomingEvents()])

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main>
        <Hero />

        <section id="gallery" className="scroll-mt-24 border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">The collection</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Gallery
                </h2>
              </div>
              <p className="max-w-sm text-pretty text-muted-foreground">
                Paintings, photographs, and short films. Select any piece to view it up close.
              </p>
            </div>
            <Gallery artworks={artworks} />
          </div>
        </section>

        <section id="about" className="scroll-mt-24 bg-card/40 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <AboutLuna photos={aboutPhotos} />
          </div>
        </section>

        <section id="shows" className="scroll-mt-24 border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Find the work in person</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  Upcoming Shows
                </h2>
              </div>
              <p className="max-w-sm text-pretty text-muted-foreground">
                Luna&apos;s art travels to craft and trade shows around Seattle. Here is where to find it next.
              </p>
            </div>
            <UpcomingShows events={events} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
