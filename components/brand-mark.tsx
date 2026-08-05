import type { CSSProperties } from "react"

type BrandMarkTone = "aurora" | "cream" | "current"

/**
 * The Miramaya signature mark — an "M" reflected through water into a "W".
 * Rendered as a CSS mask so it can be painted in the brand's multiple colors
 * (aurora) or a single tone, and sit cleanly on any background.
 *
 * Size it by setting a height via `className` (e.g. "h-11"); the width follows
 * the mark's aspect ratio automatically.
 */
export function BrandMark({
  tone = "aurora",
  className = "",
  style,
  title,
  shimmer = true,
}: {
  tone?: BrandMarkTone
  className?: string
  style?: CSSProperties
  title?: string
  /** Subtle light band that drifts through the reflection line. */
  shimmer?: boolean
}) {
  return (
    <span className="brand-mark-wrap" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <span className={`brand-mark brand-mark--${tone} ${className}`} style={style} aria-hidden="true" />
      {shimmer && <span className={`brand-mark--sheen ${className}`} aria-hidden="true" />}
    </span>
  )
}
