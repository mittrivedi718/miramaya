import { notFound } from "next/navigation"
import { ConsultationForm } from "@/components/consultation-form"
import { ProductGrid } from "@/components/product-grid"
import { StoreHeader } from "@/components/store-header"
import { WorldGate } from "@/components/world-entry"
import { WorldPlaceholder } from "@/components/world-placeholder"
import { requireAdmin } from "@/lib/admin"
import { hasWorldGrant } from "@/lib/portal-access"
import { getCollection } from "@/lib/shopify/products"
import { getWorld, worldStyle, WORLDS } from "@/lib/worlds"

export const dynamic = "force-dynamic"

// Only these worlds are still landing pages; everything else is a shop.
const PLACEHOLDER_WORLDS = new Set(["mira", "maya", "mia"])

export default async function WorldStorePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const world = getWorld(handle)
  if (!world) notFound()

  const entered = (await hasWorldGrant(handle)) || (await requireAdmin())
  // Not yet inside: show this world's own keeper's gate (a distinct act of attention).
  if (!entered) return <WorldGate world={world} />

  // Inside, but this world is still being written: quiet placeholder.
  if (PLACEHOLDER_WORLDS.has(handle)) return <WorldPlaceholder world={world} />

  const collection = await getCollection(handle)

  return (
    <main style={worldStyle(world)} className="min-h-svh bg-background text-foreground">
      <StoreHeader world={world} />

      <section className="grid min-h-[72svh] items-end border-b border-border px-5 pb-8 pt-24 md:grid-cols-2 md:px-8 md:pb-12">
        <div>
          <p className="mb-5 text-[10px] uppercase tracking-[0.26em] text-muted-foreground">World {String(WORLDS.indexOf(world) + 1).padStart(2, "0")} · {world.keywords.join(" / ")}</p>
          <h1 id="collection-title" className="font-serif text-7xl leading-[0.84] tracking-[-0.05em] text-balance md:text-[10rem]">{world.name}</h1>
        </div>
        <div className="mt-12 flex max-w-xl flex-col gap-8 md:ml-auto md:mt-0">
          <p className="font-serif text-3xl leading-tight text-balance md:text-5xl">{world.whisper}</p>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">{world.intro}</p>
          <div className="flex gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{collection?.products.length ?? 0} objects</span><span>·</span><span>{world.tagline}</span>
          </div>
        </div>
      </section>

      {collection?.products.length ? (
        <ProductGrid products={collection.products} />
      ) : (
        <section className="px-5 py-24 text-center md:px-8">
          <p className="font-serif text-3xl">This world is still gathering its objects.</p>
        </section>
      )}

      {world.handle === "marked-by-mit" && (
        <section id="book" className="border-t border-border px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.26em] text-muted-foreground">Book a marking</p>
              <h2 className="font-serif text-4xl leading-[0.9] tracking-tight text-balance md:text-6xl">A consultation before the needle.</h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Every mark begins with a conversation. Tell me what you carry and what you want to keep. I read every
                request myself and answer from{" "}
                <a href="mailto:createwithmit@gmail.com" className="underline underline-offset-4">createwithmit@gmail.com</a>.
              </p>
            </div>
            <ConsultationForm />
          </div>
        </section>
      )}

      <footer className="flex items-end justify-between border-t border-border px-5 py-12 md:px-8">
        <div>
          <p className="font-serif text-3xl">{world.name}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">One passage of {WORLDS.length}</p>
        </div>
        <a href="/" className="text-[10px] uppercase tracking-[0.18em] underline underline-offset-4">Return to the mirrors</a>
      </footer>
    </main>
  )
}
