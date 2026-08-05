import { notFound, redirect } from "next/navigation"
import { ProductGrid } from "@/components/product-grid"
import { StoreHeader } from "@/components/store-header"
import { requireAdmin } from "@/lib/admin"
import { hasWorldGrant } from "@/lib/portal-access"
import { getCollection } from "@/lib/shopify/products"
import { getWorld, worldStyle, WORLDS } from "@/lib/worlds"

export const dynamic = "force-dynamic"

export default async function WorldStorePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const world = getWorld(handle)
  if (!world) notFound()
  if (!(await hasWorldGrant(handle)) && !(await requireAdmin())) redirect(`/?locked=${handle}`)

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

      <footer className="flex items-end justify-between border-t border-border px-5 py-12 md:px-8">
        <div>
          <p className="font-serif text-3xl">{world.name}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">One passage of five</p>
        </div>
        <a href="/" className="text-[10px] uppercase tracking-[0.18em] underline underline-offset-4">Return to the mirrors</a>
      </footer>
    </main>
  )
}
