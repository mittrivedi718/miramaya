// One underlying rule of entry — "each keeper asks for a small act of attention" —
// expressed a different way per world. The guidebook explains all of them.
export type Mechanic = "reflection" | "refraction" | "earth" | "join" | "symbols"
export type Ambience = "water" | "light" | "earth" | "air" | "bloom" | "ink" | "astral"

/** A "joining" gesture: connect points into a shape. Worn several ways. */
export type JoinPattern = {
  /** Points in a 300x200 field. */
  points: { x: number; y: number }[]
  /** Must be joined in sequence (vs. any order). */
  ordered: boolean
  /** Must return to the first point to close the shape. */
  closed?: boolean
  /** Visual character of the nodes and trail. */
  glyph: "constellation" | "bloom" | "sigil" | "orbital"
  label: { idle: string; active: string }
}

/** A "symbols" gesture: touch a shuffled grid of glyphs in a remembered order. */
export type SymbolSequence = {
  /** The secret order (symbol ids from lib/portal-symbols). */
  order: string[]
  /** Extra glyphs mixed into the grid as decoys. */
  decoys: string[]
}

export type WorldEntryConfig = {
  mechanic: Mechanic
  ambience: Ambience
  /** True only for the shop (gaia). Everything else shows a placeholder inside. */
  sells: boolean
  /** The keeper's instruction shown on the gate. */
  clue: string
  /** The rule as written in the guidebook. */
  rule: string
  /** Themes listed on the "still unwritten" placeholder (non-shops only). */
  themes?: string[]
  /** Present when mechanic is "join". */
  join?: JoinPattern
  /** Present when mechanic is "symbols". */
  symbols?: SymbolSequence
}

// A hexagonal ring of petals for mirabelle's bloom.
const BLOOM_POINTS = (() => {
  const cx = 150
  const cy = 100
  const r = 68
  return Array.from({ length: 6 }, (_, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180)
    return { x: Math.round(cx + r * Math.cos(a)), y: Math.round(cy + r * Math.sin(a)) }
  })
})()

// mia's orbital star chart: five bodies on nested orbits, joined inner-to-outer.
const ORBITAL_POINTS = [
  { x: 150, y: 100 }, // the core
  { x: 150, y: 44 }, // inner body, north
  { x: 226, y: 118 }, // mid body, east-south
  { x: 74, y: 132 }, // mid body, west-south
  { x: 246, y: 44 }, // outer body, far
]

const DEFAULT: WorldEntryConfig = {
  mechanic: "reflection",
  ambience: "water",
  sells: false,
  clue: "Be still, and let the surface settle until it knows you.",
  rule: "Rest your hand on the surface and hold, until it settles.",
}

export const WORLD_ENTRY: Record<string, WorldEntryConfig> = {
  mira: {
    mechanic: "reflection",
    ambience: "water",
    sells: false,
    clue: "Be still. Let the water settle until it finds your face.",
    rule: "mira — attention as stillness. Rest a finger on the water and hold, until the reflection resolves.",
    themes: ["ocean", "devotion", "art", "music"],
  },
  maya: {
    mechanic: "refraction",
    ambience: "light",
    sells: false,
    clue: "Turn until the light agrees. Find the angle where the many become one.",
    rule: "maya — attention as perspective. Drag to turn the light until the split colours align into a single clear form.",
    themes: ["photography", "retouching", "graphic design", "illusion"],
  },
  gaia: {
    mechanic: "earth",
    ambience: "earth",
    sells: true,
    clue: "Build the cairn. Stone upon stone, until it stands.",
    rule: "gaia — attention as making. Gather the three stones into a cairn; when it stands, the ground opens.",
  },
  mia: {
    mechanic: "join",
    ambience: "astral",
    sells: false,
    clue: "Bring the system online. Lock each body to the next, core outward, until the orbits sync.",
    rule: "mia — attention as alignment. Trace the five bodies from the core outward in sequence; when the array locks, the gate powers on.",
    themes: ["signal", "the in-between", "orbit", "echo"],
    join: {
      points: ORBITAL_POINTS,
      ordered: true,
      glyph: "orbital",
      label: { idle: "acquire · align the array", active: "syncing orbits…" },
    },
  },
  mirabelle: {
    mechanic: "join",
    ambience: "bloom",
    sells: false,
    clue: "Coax it open. Join each petal to the next, in turn, until the bloom comes round.",
    rule: "mirabelle — attention as tending. Trace petal to petal in order and close the ring; the flower opens when it comes full circle.",
    themes: ["medicine", "healing", "wonder", "love"],
    join: {
      points: BLOOM_POINTS,
      ordered: true,
      closed: true,
      glyph: "bloom",
      label: { idle: "open the bloom", active: "come full circle" },
    },
  },
  "marked-by-mit": {
    mechanic: "symbols",
    ambience: "ink",
    sells: false,
    clue: "Read the mark. Touch the signs in the order the keeper set — star, needle, moon, eye.",
    rule: "marked by Mit — attention as memory. From the shuffled signs, touch in order: white star, silver needle, white moon, black eye.",
    themes: ["white ink", "1:11", "flash", "permanence"],
    symbols: {
      order: ["white-star", "silver-needle", "white-moon", "black-eye"],
      decoys: ["red-star", "gold-eye", "silver-moon", "blue-key"],
    },
  },
}

export function worldEntry(handle: string): WorldEntryConfig {
  return WORLD_ENTRY[handle] ?? DEFAULT
}
