import Image from "next/image"
import { AddToCart } from "@/components/add-to-cart"
import { formatMoney } from "@/lib/shopify/products"
import type { Product } from "@/lib/shopify/types"

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="collection-title" className="grid grid-cols-1 border-t border-border md:grid-cols-3">
      {products.map((product, index) => {
        const price = product.priceRange.minVariantPrice
        return (
          <article key={product.id} className="flex flex-col border-b border-border md:border-r md:[&:nth-child(3n)]:border-r-0">
            <div className="relative aspect-square overflow-hidden bg-muted">
              {product.featuredImage && (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  priority={index < 3}
                />
              )}
              <span className="absolute left-4 top-4 border border-border bg-background/85 px-2 py-1 text-[9px] uppercase tracking-[0.16em] backdrop-blur-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-5 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="max-w-[15rem] font-serif text-2xl leading-tight text-balance">{product.title}</h2>
                <p className="shrink-0 text-sm">{formatMoney(price.amount, price.currencyCode)}</p>
              </div>
              <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              <div className="mt-auto pt-3">
                <AddToCart variants={product.variants.filter((variant) => variant.availableForSale)} />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
