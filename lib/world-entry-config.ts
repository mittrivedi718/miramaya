// One underlying rule of entry — "each keeper asks for a small act of attention" —
// expressed a different way per world. The guidebook explains all of them.
export type Mechanic = "reflection" | "refraction" | "earth" | "join"
export type Ambience = "water" | "light" | "earth" | "air" | "bloom" | "ink"

/** A "joining" gesture: connect points into a shape. Worn several ways. */
export type JoinPattern = {
  /** Points in a 300x200 field. */
  points: { x: number; y: number }[]
  /** Must be joined in sequence (vs. any order). */
  ordered: boolean
  /** Must return to the first point to close the shape. */
  closed?: boolean
  /** Visual character of the nodes and trail. */
  glyph: "constellation" | "bloom" | "sigil"
  label: { idle: string; active: string }
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
    ambience: "air",
    sells: false,
    clue: "Draw the line between what's scattered. Connect the three lights in one stroke.",
    rule: "mia — attention as connection. In a single unbroken stroke, trace a path through the three lights.",
    themes: ["memory", "the in-between", "quiet", "echo"],
    join: {
      points: [
        { x: 40, y: 150 },
        { x: 150, y: 50 },
        { x: 260, y: 140 },
      ],
      ordered: false,
      glyph: "constellation",
      label: { idle: "connect the lights", active: "keep the line unbroken" },
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
    mechanic: "join",
    ambience: "ink",
    sells: false,
    clue: "Draw the mark as it wants to be drawn — one stroke, in order, without lifting.",
    rule: "marked by Mit — attention as intention. Trace the five points of the sigil in sequence, in one unbroken stroke.",
    themes: ["white ink", "1:11", "flash", "permanence"],
    join: {
      points: [
        { x: 55, y: 55 },
        { x: 150, y: 38 },
        { x: 118, y: 150 },
        { x: 245, y: 88 },
        { x: 198, y: 162 },
      ],
      ordered: true,
      glyph: "sigil",
      label: { idle: "draw the mark", active: "don't lift the line" },
    },
  },
}

export function worldEntry(handle: string): WorldEntryConfig {
  return WORLD_ENTRY[handle] ?? DEFAULT
}
