"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

const VISITS_KEY = "mea-visits"
const DISMISS_KEY = "mea-install-dismissed"

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  const iOSDevice = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ reports as Mac; detect touch to catch it.
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  return iOSDevice || iPadOS
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes this non-standard flag.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

// A quiet one-line iOS hint after a few visits. Dismissible for good.
export function InstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isIOS() || isStandalone()) return
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return
    const visits = Number(window.localStorage.getItem(VISITS_KEY) ?? "0") + 1
    window.localStorage.setItem(VISITS_KEY, String(visits))
    if (visits >= 3) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-[calc(9rem+env(safe-area-inset-bottom))] z-30 px-4 lg:hidden">
      <div className="mea-surface mx-auto flex max-w-lg items-center gap-3 rounded-2xl p-3">
        <span className="mea-eye-mark" aria-hidden />
        <p className="flex-1 text-xs leading-snug text-[var(--mea-dim)]">
          Add MEA to your home screen: tap Share, then <span className="text-[var(--mea-silver)]">Add to Home Screen</span>.
        </p>
        <button
          type="button"
          aria-label="Dismiss for good"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1")
            setShow(false)
          }}
          className="mea-tap shrink-0 rounded-lg p-1 text-[var(--mea-dim)]"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}
