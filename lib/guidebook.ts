export type GuideSequence = { handle: string; name: string; symbols: string[] }

export function buildGuidebookText(sequences: GuideSequence[], adminEmail: string) {
  const portals = sequences
    .map((item) => `${item.name}. Touch ${item.symbols.join(", then ")}.`)
    .join(" ")

  return [
    "Miramaya secret portal guidebook.",
    portals,
    "To enter normally, choose a portal, select Enter this world, and touch its three symbols in order. A wrong touch resets the sequence.",
    "A private share URL bypasses the sequence and opens only its assigned store. Create, copy, expire, and revoke these URLs from the administrator portal.",
    "Administrator login. Find the small white star in the bottom left corner, activate it, and sign in.",
    `Administrator username: ${adminEmail}.`,
    "Administrator password: use the private ADMIN_PASSWORD configured in project environment variables. It is intentionally never displayed, dictated, downloaded, or printed.",
    "After login, Passages lets you change each sequence and manage private share doors.",
    "Keep this guidebook private. Revoke any share URL that reaches an unintended recipient.",
  ].join("\n\n")
}
