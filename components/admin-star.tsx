"use client"

import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

export function AdminStar() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.push("/guidebook")}
      className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-[max(0.5rem,env(safe-area-inset-left))] z-50 flex size-11 items-center justify-center text-foreground/35 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-1 focus-visible:outline-offset-2"
      aria-label="The white star — guidebook"
    >
      <Star className="size-3 fill-current" aria-hidden="true" />
    </button>
  )
}
