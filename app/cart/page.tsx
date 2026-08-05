import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react"
import { removeItemAction, updateItemAction } from "@/app/actions"
import { CheckoutButton } from "@/components/checkout-button"
import { buildCheckoutUrl, getCart } from "@/lib/shopify/cart"
import { formatMoney } from "@/lib/shopify/products"

export default async function CartPage() {
  const cart = await getCart()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]"><ArrowLeft className="size-4" aria-hidden="true" /> Mirrors</Link>
        <span className="font-serif text-xl">the bag</span>
        <span className="text-[10px] uppercase tracking-[0.18em]">{cart?.totalQuantity ?? 0} items</span>
      </header>

      {!cart?.lines.length ? (
        <section className="flex min-h-[75svh] flex-col items-center justify-center gap-6 px-5 text-center">
          <h1 className="font-serif text-5xl">Nothing has crossed over yet.</h1>
          <Link href="/" className="border-b border-foreground pb-1 text-[10px] uppercase tracking-[0.18em]">Choose a mirror</Link>
        </section>
      ) : (
        <div className="grid md:grid-cols-[1fr_22rem]">
          <section aria-label="Cart items" className="border-border md:border-r">
            {cart.lines.map((line) => (
              <article key={line.id} className="grid grid-cols-[7rem_1fr] gap-5 border-b border-border p-5 md:grid-cols-[10rem_1fr] md:gap-8 md:p-8">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {line.merchandise.image && <Image src={line.merchandise.image.url} alt={line.merchandise.image.altText || line.merchandise.product.title} fill sizes="160px" className="object-cover" />}
                </div>
                <div className="flex flex-col justify-between gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{line.merchandise.product.vendor}</p><h2 className="mt-2 font-serif text-2xl">{line.merchandise.product.title}</h2></div>
                    <p className="text-sm">{formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <form action={updateItemAction.bind(null, line.id, line.quantity - 1)}><button aria-label={`Decrease ${line.merchandise.product.title} quantity`} className="p-3 hover:bg-muted"><Minus className="size-3" /></button></form>
                      <span className="min-w-8 text-center text-xs">{line.quantity}</span>
                      <form action={updateItemAction.bind(null, line.id, line.quantity + 1)}><button aria-label={`Increase ${line.merchandise.product.title} quantity`} className="p-3 hover:bg-muted"><Plus className="size-3" /></button></form>
                    </div>
                    <form action={removeItemAction.bind(null, line.id)}><button aria-label={`Remove ${line.merchandise.product.title}`} className="p-2 text-muted-foreground hover:text-foreground"><Trash2 className="size-4" /></button></form>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="p-5 md:sticky md:top-0 md:h-svh md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Summary</p>
            <div className="mt-8 flex items-end justify-between border-b border-border pb-5"><span>Subtotal</span><span className="font-serif text-3xl">{formatMoney(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span></div>
            <p className="py-5 text-xs leading-relaxed text-muted-foreground">Shipping and taxes are calculated at checkout. Each object leaves its world carefully wrapped.</p>
            <CheckoutButton url={buildCheckoutUrl(cart.checkoutUrl)} />
          </aside>
        </div>
      )}
    </main>
  )
}
