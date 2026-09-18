import type { ReactNode } from "react"

/**
 * Shared full-viewport shell for the private-view screens (Gateway / Already
 * Viewed / Ended). Reuses the /enter visual language: dark ground, serif display,
 * small-caps mono labels, generous negative space, safe-area padding.
 */
export function ViewScreen({ children }: { children: ReactNode }) {
  return (
    <main
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-10 bg-background px-6 text-foreground"
      style={{
        paddingTop: "max(4rem, env(safe-area-inset-top))",
        paddingBottom: "max(4rem, env(safe-area-inset-bottom))",
        animation: "mm-pv-fade 220ms ease-out both",
      }}
    >
      <style>{"@keyframes mm-pv-fade{from{opacity:0}to{opacity:1}}"}</style>
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">{children}</div>
    </main>
  )
}

export function ViewLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">{children}</p>
}

export function EndedScreen() {
  return (
    <ViewScreen>
      <ViewLabel>Private view ended</ViewLabel>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
        This private link has expired.
      </p>
      <a
        href="https://meetmit.me"
        className="font-serif text-2xl tracking-tight underline decoration-1 underline-offset-8"
      >
        meetmit.me
      </a>
    </ViewScreen>
  )
}

export function AlreadyViewedScreen() {
  return (
    <ViewScreen>
      <ViewLabel>Private link already viewed</ViewLabel>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
        This private viewing link has already been activated.
      </p>
    </ViewScreen>
  )
}
