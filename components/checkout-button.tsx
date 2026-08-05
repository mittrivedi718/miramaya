"use client"

import { ArrowUpRight } from "lucide-react"

export function CheckoutButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.self !== window.top) window.open(url, "_blank", "noopener,noreferrer")
        else window.location.assign(url)
      }}
      className="flex w-full items-center justify-between bg-primary px-5 py-4 text-sm text-primary-foreground hover:opacity-85"
    >
      Checkout
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </button>
  )
}
