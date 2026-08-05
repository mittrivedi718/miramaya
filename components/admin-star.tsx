"use client"

import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

export function AdminStar() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.push("/admin/login")}
      className="fixed bottom-2 left-2 z-50 flex size-7 items-center justify-center text-foreground/35 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-1 focus-visible:outline-offset-2"
      aria-label="Administrator entrance"
    >
      <Star className="size-3 fill-current" aria-hidden="true" />
    </button>
  )
}
