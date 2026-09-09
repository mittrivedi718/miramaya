"use client"

import type { ReactNode } from "react"
import { BottomTabs, LeftRail } from "./navigation"
import { MirrorLine } from "./mirror-line"
import { PaletteControl } from "./palette-control"
import { InstallPrompt } from "./install-prompt"
import { Walkthrough } from "./walkthrough"
import { useMea } from "./provider"

export function MeaShell({ children }: { children: ReactNode }) {
  const { lastError } = useMea()
  const showConflict = lastError?.toLowerCase().includes("out of date") ?? false

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl lg:gap-0">
      <LeftRail />
      <div className="relative flex min-h-[100dvh] w-full flex-col">
        {showConflict ? (
          <div
            role="status"
            className="mea-conflict sticky top-0 z-30 px-4 py-2 text-center text-xs"
          >
            The workspace changed on another tab. Your text is kept — the latest state is shown below. Try again when ready.
          </div>
        ) : null}

        <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="mea-eye-mark" aria-hidden />
            <span className="font-display text-lg tracking-tight text-[var(--mea-silver)]">MEA</span>
          </div>
          <PaletteControl />
        </header>

        <div className="hidden items-center justify-end px-6 pt-6 lg:flex">
          <PaletteControl />
        </div>

        {/* Room to breathe above the Mirror Line + tab bar. */}
        <main className="flex-1 px-4 pb-[13.5rem] lg:px-6 lg:pb-40">{children}</main>

        <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 lg:bottom-6">
          <div className="mx-auto w-full max-w-6xl px-4 lg:pl-[15rem] lg:pr-6">
            <MirrorLine />
          </div>
        </div>

        <BottomTabs />
      </div>

      <InstallPrompt />
      <Walkthrough />
    </div>
  )
}
