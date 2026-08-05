/**
 * A very subtle, always-present layer of settled water light — slow caustic
 * drift plus a faint refraction. Purely decorative: fixed, non-interactive,
 * and silenced entirely for visitors who prefer reduced motion (via CSS).
 */
export function WaterAmbience() {
  return <div className="water-ambience" aria-hidden="true" />
}
