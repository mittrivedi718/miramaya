"use client"

import { useEffect } from "react"

/**
 * The Ended page is a normal GET render and cannot set cookies. Hitting the Node
 * heartbeat once clears the (now invalid) viewer cookies server-side. Display only;
 * the server remains the authority.
 */
export function ClearViewerCookies() {
  useEffect(() => {
    void fetch("/api/pv/heartbeat", { cache: "no-store" }).catch(() => {})
  }, [])
  return null
}
