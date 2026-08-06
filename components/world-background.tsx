import type { Ambience } from "@/lib/world-entry-config"

/** The continuous, understated motion of a world's element, sitting behind content. */
export function WorldBackground({ ambience }: { ambience: Ambience }) {
  return (
    <div className={`world-bg world-bg--${ambience}`} aria-hidden="true">
      <span />
      <span />
    </div>
  )
}
