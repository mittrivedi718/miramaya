// One underlying rule of entry — "each keeper asks for a small act of attention" —
// expressed four different ways, one per world. The guidebook explains all of them.
export type Mechanic = "reflection" | "refraction" | "earth" | "constellation"
export type Ambience = "water" | "light" | "earth" | "air"

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
}

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
    mechanic: "constellation",
    ambience: "air",
    sells: false,
    clue: "Draw the line between what's scattered. Connect the three lights in one stroke.",
    rule: "mia — attention as connection. In a single unbroken stroke, trace a path through the three lights.",
    themes: ["memory", "the in-between", "quiet", "echo"],
  },
  mirabelle: {
    ...DEFAULT,
    clue: "Come back to yourself slowly. Rest here and hold, until you're ready.",
    rule: "mirabelle — attention as stillness. Rest your hand and hold, until you have arrived.",
  },
  "marked-by-mit": {
    ...DEFAULT,
    clue: "Hold, and let the mark decide it wants you.",
    rule: "marked by Mit — attention as stillness. Hold, until the ink is sure of you.",
  },
}

export function worldEntry(handle: string): WorldEntryConfig {
  return WORLD_ENTRY[handle] ?? DEFAULT
}
