"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { Palette } from "@/lib/mea/rooms"
import type { Command, WorkspaceDocument } from "@/lib/mea/schema"

type RunResult =
  | { ok: true; note?: string; resultId?: string }
  | { ok: false; error: string; missing?: string[]; conflict?: boolean }

type MeaContextValue = {
  document: WorkspaceDocument
  revision: number
  saving: boolean
  lastError: string | null
  run: (command: Command) => Promise<RunResult>
  refresh: () => Promise<void>
  palette: Palette
  resolvedPalette: Exclude<Palette, "auto">
  setPalette: (p: Palette) => void
}

const MeaContext = createContext<MeaContextValue | null>(null)

const PALETTE_KEY = "mea-palette"

// Follow-the-light: Daylight 06:00–17:00, Miramire 17:00–20:00, Obsidian 20:00–06:00.
function paletteForHour(hour: number): Exclude<Palette, "auto"> {
  if (hour >= 6 && hour < 17) return "daylight"
  if (hour >= 17 && hour < 20) return "miramire"
  return "obsidian"
}

export function MeaProvider({
  initialDocument,
  initialRevision,
  children,
}: {
  initialDocument: WorkspaceDocument
  initialRevision: number
  children: React.ReactNode
}) {
  const [document, setDocument] = useState(initialDocument)
  const [revision, setRevision] = useState(initialRevision)
  const [saving, setSaving] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const [palette, setPaletteState] = useState<Palette>("miramire")
  const [clockHour, setClockHour] = useState(() => new Date().getHours())

  // Palette lives in localStorage only; everything else is on the server.
  useEffect(() => {
    const stored = window.localStorage.getItem(PALETTE_KEY) as Palette | null
    if (stored) setPaletteState(stored)
  }, [])

  // When following the light, re-check the device clock every minute.
  useEffect(() => {
    if (palette !== "auto") return
    const tick = () => setClockHour(new Date().getHours())
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [palette])

  const setPalette = useCallback((p: Palette) => {
    setPaletteState(p)
    window.localStorage.setItem(PALETTE_KEY, p)
  }, [])

  const resolvedPalette: Exclude<Palette, "auto"> = palette === "auto" ? paletteForHour(clockHour) : palette

  // Drive the scoped palette via a data attribute on the MEA world root, so the
  // CSS in mea.css can theme every surface without touching the rest of the site.
  useEffect(() => {
    const root = window.document.querySelector<HTMLElement>(".mea-world")
    if (root) root.dataset.palette = resolvedPalette
  }, [resolvedPalette])

  const run = useCallback(
    async (command: Command): Promise<RunResult> => {
      setSaving(true)
      setLastError(null)
      try {
        const res = await fetch("/api/workspace", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ revision, command }),
        })
        const data = await res.json().catch(() => ({}))

        if (res.status === 409 && data.document) {
          // Conflict: adopt the server's current state without discarding the
          // user's typed text (forms keep their own local state).
          setDocument(data.document)
          setRevision(data.revision)
          const message = data.error ?? "Your view was out of date."
          setLastError(message)
          return { ok: false, error: message, conflict: true }
        }
        if (!res.ok) {
          const message = data.error ?? "That didn't save."
          setLastError(message)
          return { ok: false, error: message, missing: data.missing }
        }

        setDocument(data.document)
        setRevision(data.revision)
        return { ok: true, note: data.note, resultId: data.resultId }
      } catch {
        const message = "Couldn't reach the server. Your text is safe — try again."
        setLastError(message)
        return { ok: false, error: message }
      } finally {
        setSaving(false)
      }
    },
    [revision],
  )

  const refresh = useCallback(async () => {
    const res = await fetch("/api/workspace")
    if (!res.ok) return
    const data = await res.json()
    setDocument(data.document)
    setRevision(data.revision)
  }, [])

  const value = useMemo<MeaContextValue>(
    () => ({ document, revision, saving, lastError, run, refresh, palette, resolvedPalette, setPalette }),
    [document, revision, saving, lastError, run, refresh, palette, resolvedPalette, setPalette],
  )

  return <MeaContext.Provider value={value}>{children}</MeaContext.Provider>
}

export function useMea(): MeaContextValue {
  const ctx = useContext(MeaContext)
  if (!ctx) throw new Error("useMea must be used inside MeaProvider")
  return ctx
}
