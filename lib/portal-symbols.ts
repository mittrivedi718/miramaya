export const SYMBOLS = {
  "blue-bird": { label: "blue bird", glyph: "bird", color: "#54a9d5" },
  "red-star": { label: "red star", glyph: "star", color: "#d35f57" },
  "silver-moon": { label: "silver moon", glyph: "moon", color: "#c5cbd1" },
  "gold-eye": { label: "gold eye", glyph: "eye", color: "#d8bd85" },
  "white-cloud": { label: "white cloud", glyph: "cloud", color: "#f0eee8" },
  "blue-key": { label: "blue key", glyph: "key", color: "#638ac4" },
  "green-leaf": { label: "green leaf", glyph: "leaf", color: "#728c4d" },
  "orange-sun": { label: "orange sun", glyph: "sun", color: "#c4673d" },
  "brown-mountain": { label: "brown mountain", glyph: "mountain", color: "#8a6a3c" },
  "pink-heart": { label: "pink heart", glyph: "heart", color: "#d8908c" },
  "gold-flower": { label: "gold flower", glyph: "flower", color: "#c7a45d" },
  "white-moon": { label: "white moon", glyph: "moon", color: "#f4eee8" },
  "white-star": { label: "white star", glyph: "star", color: "#ffffff" },
  "black-eye": { label: "black eye", glyph: "eye", color: "#777780" },
  "silver-needle": { label: "silver needle", glyph: "needle", color: "#c8c8cf" },
} as const

export type PortalSymbolId = keyof typeof SYMBOLS
