import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import { getCart } from "@/lib/shopify/cart"
import { WORLDS, type World } from "@/lib/worlds"

export async function StoreHeader({ world }: { world: World }) {
  const cart = await getCart()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-5 md:px-8">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Return to Miramaya portal gallery">
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
        <Link href="/cart" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
          <ShoppingBag className="size-4" aria-hidden="true" />
          Bag ({cart?.totalQuantity ?? 0})
        </Link>
      </div>
    </header>
  )
}
