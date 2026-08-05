"use client"

import { useState, useTransition } from "react"
import { Check, Plus } from "lucide-react"
import { addItemAction } from "@/app/actions"
import type { ProductVariant } from "@/lib/shopify/types"

export function AddToCart({ variants }: { variants: ProductVariant[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "")
  const [added, setAdded] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!variants.length) return null

  return (
    <div className="flex flex-col gap-3">
      {variants.length > 1 && (
        <label className="flex items-center justify-between border-b border-border pb-3 text-sm">
          <span className="text-muted-foreground">Choose</span>
          <select
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
            className="bg-transparent text-right text-foreground outline-none"
            aria-label="Product variant"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id} className="bg-background text-foreground">
                {variant.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        disabled={pending || !variantId}
        onClick={() => startTransition(async () => {
          await addItemAction(variantId)
          setAdded(true)
          window.setTimeout(() => setAdded(false), 1800)
        })}
        className="flex w-full items-center justify-between bg-primary px-5 py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        <span>{pending ? "Adding" : added ? "Added to bag" : "Add to bag"}</span>
        {added ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
      </button>
    </div>
  )
}
