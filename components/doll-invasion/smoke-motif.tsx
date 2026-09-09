/**
 * The signature motif, reused wherever a transition happens.
 *
 * Five beats on one 16s timeline (see .di-* keyframes in globals.css):
 *   smoke rises → condenses into a ripple → the ripple fractures into a prism
 *   → the prism resolves into a mirror → the mirror fogs like breath → smoke.
 *
 * Pure inline SVG + CSS transforms. No video, no canvas, no shader library.
 * Server component: ships zero JavaScript.
 */
export function SmokeMotif({ className = "", size = 132 }: { className?: string; size?: number }) {
  return (
    <span className={`di-stage block ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 120 120" width={size} height={size} fill="none" style={{ borderRadius: "12px" }}>
        <defs>
          <linearGradient id="di-smoke-g" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="var(--brand-taupe)" stopOpacity="0.55" />
            <stop offset="60%" stopColor="var(--brand-ocean)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--brand-lavender)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="di-prism-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-lavender)" stopOpacity="0.85" />
            <stop offset="45%" stopColor="var(--brand-ocean)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--brand-cream)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="di-mirror-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-cream)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--brand-ocean)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--brand-lavender)" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="di-fog-g" cx="0.5" cy="0.6" r="0.5">
            <stop offset="0%" stopColor="var(--brand-cream)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--brand-cream)" stopOpacity="0" />
          </radialGradient>
          <clipPath id="di-mirror-clip">
            <rect x="38" y="26" width="44" height="68" rx="22" />
          </clipPath>
        </defs>

        {/* 1 · smoke */}
        <g className="di-smoke">
          <path
            d="M60 108c-8-12 6-19 1-29-5-10-9-14-3-24 5-9 14-11 11-21"
            stroke="url(#di-smoke-g)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M60 108c7-13-5-21 0-31 4-9 11-13 6-23"
            stroke="url(#di-smoke-g)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>

        {/* 2 · ripple */}
        <g stroke="var(--brand-ocean)" fill="none">
          <ellipse className="di-ripple" cx="60" cy="62" rx="26" ry="9" strokeWidth="1.4" />
          <ellipse className="di-ripple di-ripple--2" cx="60" cy="62" rx="26" ry="9" strokeWidth="1" />
          <ellipse className="di-ripple di-ripple--3" cx="60" cy="62" rx="26" ry="9" strokeWidth="0.7" />
        </g>

        {/* 3 · prism */}
        <g className="di-prism">
          <path d="M60 28 84 82H36Z" fill="url(#di-prism-g)" opacity="0.75" />
          <path d="M60 28 84 82H36Z" stroke="var(--brand-cream)" strokeWidth="0.8" opacity="0.6" />
          <path d="M60 34v44" stroke="var(--brand-cream)" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* 4 · mirror, with a sheen that sweeps across the glass */}
        <g className="di-mirror">
          <rect
            x="38"
            y="26"
            width="44"
            height="68"
            rx="22"
            fill="url(#di-mirror-g)"
            stroke="var(--brand-cream)"
            strokeWidth="1"
          />
          <g clipPath="url(#di-mirror-clip)">
            <rect className="di-sheen" x="34" y="20" width="14" height="80" fill="var(--brand-cream)" opacity="0.8" />
          </g>
        </g>

        {/* 5 · breath fogs the glass */}
        <ellipse className="di-fog" cx="60" cy="64" rx="30" ry="34" fill="url(#di-fog-g)" />
      </svg>
    </span>
  )
}
