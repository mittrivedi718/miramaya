export type WorldTheme = {
  scheme: "light" | "dark"
  background: string
  foreground: string
  card: string
  cardForeground: string
  muted: string
  mutedForeground: string
  border: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
}

export type World = {
  /** Shopify collection handle */
  handle: string
  /** Lowercase display name, as the user named it */
  name: string
  tagline: string
  /** One line shown on the mirror in the gallery */
  whisper: string
  /** Longer intro on the store page */
  intro: string
  /** Words etched under the store name */
  keywords: string[]
  /** Mirror frame colour in the 3D gallery */
  frameColor: string
  frameMetalness: number
  frameRoughness: number
  /** Rim glow colour, also used for the hub overlay accent */
  glowColor: string
  theme: WorldTheme
}

export const WORLDS: World[] = [
  {
    handle: "mira",
    name: "mira",
    tagline: "ocean and devotion",
    whisper: "The tide keeps its promises.",
    intro:
      "Salt, tide, and the long practice of returning. mira makes objects for people who keep vigil at the water's edge — weighted, cool to the touch, made to be held for a long time.",
    keywords: ["tide", "vigil", "salt", "return"],
    frameColor: "#7d9b9b",
    frameMetalness: 0.75,
    frameRoughness: 0.3,
    glowColor: "#47c2ae",
    theme: {
      scheme: "dark",
      background: "#061a1e",
      foreground: "#e6f2f0",
      card: "#0b2a2f",
      cardForeground: "#e6f2f0",
      muted: "#123a40",
      mutedForeground: "#8fb5b3",
      border: "#17454b",
      primary: "#47c2ae",
      primaryForeground: "#04191c",
      accent: "#17454b",
      accentForeground: "#e6f2f0",
    },
  },
  {
    handle: "maya",
    name: "maya",
    tagline: "illusion and creation",
    whisper: "The veil is a doorway, not a lie.",
    intro:
      "maya is for the suspicion that the world is a rendering, and the delight of finding the render controls. Instruments for dreaming a thing into being, then wearing it out of the house.",
    keywords: ["veil", "dream", "make", "again"],
    frameColor: "#8f8496",
    frameMetalness: 0.55,
    frameRoughness: 0.35,
    glowColor: "#d8bd85",
    theme: {
      scheme: "dark",
      background: "#14121a",
      foreground: "#efeaf0",
      card: "#1d1a24",
      cardForeground: "#efeaf0",
      muted: "#2a2531",
      mutedForeground: "#a79fae",
      border: "#322c3a",
      primary: "#d8bd85",
      primaryForeground: "#17141c",
      accent: "#2a2531",
      accentForeground: "#efeaf0",
    },
  },
  {
    handle: "gaia",
    name: "gaia",
    tagline: "the gift shop at the center of the earth",
    whisper: "Small useful marvels, in stock.",
    intro:
      "gaia is the gift shop at the center of the earth. Gadgets that actually work, goods that get better with wear, and the kind of small marvel you buy for someone else and then buy again for yourself.",
    keywords: ["field", "made", "carry", "keep"],
    frameColor: "#8a6a3c",
    frameMetalness: 0.2,
    frameRoughness: 0.65,
    glowColor: "#c4673d",
    theme: {
      scheme: "light",
      background: "#f6f1e6",
      foreground: "#2a2418",
      card: "#fffdf7",
      cardForeground: "#2a2418",
      muted: "#e9e1cf",
      mutedForeground: "#6d6450",
      border: "#ddd3bd",
      primary: "#5f7038",
      primaryForeground: "#f8f6ee",
      accent: "#c4673d",
      accentForeground: "#fffaf4",
    },
  },
  {
    handle: "mia",
    name: "mia",
    tagline: "the space between",
    whisper: "What's missing leaves a shape.",
    intro:
      "mia is the space between the other rooms — the pause, the echo, the thing not yet said. It keeps what memory keeps: quiet, in-between, and still forming.",
    keywords: ["echo", "between", "quiet", "trace"],
    frameColor: "#b9c0d6",
    frameMetalness: 0.6,
    frameRoughness: 0.35,
    glowColor: "#9aa6d8",
    theme: {
      scheme: "dark",
      background: "#0c0e16",
      foreground: "#e9ebf4",
      card: "#141726",
      cardForeground: "#e9ebf4",
      muted: "#1e2133",
      mutedForeground: "#9ba1bd",
      border: "#282c42",
      primary: "#9aa6d8",
      primaryForeground: "#0c0e16",
      accent: "#1e2133",
      accentForeground: "#e9ebf4",
    },
  },
  {
    handle: "mirabelle",
    name: "mirabelle",
    tagline: "medicine, healing, wonder and love",
    whisper: "Come back to yourself slowly.",
    intro:
      "mirabelle is medicine made slowly. Roses, resins and old recipes for the tender work of coming back to yourself — with a shaman's patience and a devotional amount of love.",
    keywords: ["mend", "tend", "wonder", "love"],
    frameColor: "#c9a08c",
    frameMetalness: 0.45,
    frameRoughness: 0.4,
    glowColor: "#e0a48f",
    theme: {
      scheme: "light",
      background: "#fbf1ed",
      foreground: "#3a2320",
      card: "#fffaf8",
      cardForeground: "#3a2320",
      muted: "#f2ded7",
      mutedForeground: "#8a6a63",
      border: "#ebd5cd",
      primary: "#c0705f",
      primaryForeground: "#fff8f6",
      accent: "#e0a48f",
      accentForeground: "#3a2320",
    },
  },
  {
    handle: "marked-by-mit",
    name: "marked by Mit",
    tagline: "1:11 flash tattoos in white ink",
    whisper: "Barely there. Permanently yours.",
    intro:
      "White ink flash, drawn at 1:11. Barely there in daylight, unmistakable up close, permanent either way. Sheets, aftercare, and studio time with Mit.",
    keywords: ["1:11", "white", "flash", "kept"],
    frameColor: "#d7d7dc",
    frameMetalness: 0.9,
    frameRoughness: 0.15,
    glowColor: "#ffffff",
    theme: {
      scheme: "dark",
      background: "#08080a",
      foreground: "#f2f2f4",
      card: "#121214",
      cardForeground: "#f2f2f4",
      muted: "#1c1c20",
      mutedForeground: "#9a9aa2",
      border: "#26262b",
      primary: "#ffffff",
      primaryForeground: "#08080a",
      accent: "#1c1c20",
      accentForeground: "#f2f2f4",
    },
  },
]

export function getWorld(handle: string): World | undefined {
  return WORLDS.find((w) => w.handle === handle)
}

/** Inline CSS custom properties that retheme the shadcn tokens for a world. */
export function worldStyle(world: World): React.CSSProperties {
  const t = world.theme
  return {
    colorScheme: t.scheme,
    "--background": t.background,
    "--foreground": t.foreground,
    "--card": t.card,
    "--card-foreground": t.cardForeground,
    "--popover": t.card,
    "--popover-foreground": t.cardForeground,
    "--muted": t.muted,
    "--muted-foreground": t.mutedForeground,
    "--border": t.border,
    "--input": t.border,
    "--ring": t.primary,
    "--primary": t.primary,
    "--primary-foreground": t.primaryForeground,
    "--secondary": t.muted,
    "--secondary-foreground": t.foreground,
    "--accent": t.accent,
    "--accent-foreground": t.accentForeground,
    "--world-glow": world.glowColor,
  } as React.CSSProperties
}
