"use server"

// Purchasing is intentionally disabled on this site. These are display-only
// preview pages. The cart/checkout server actions are kept as hard stops so
// that even a hand-crafted or replayed request cannot add items or check out.
const PURCHASING_DISABLED = "Purchasing is disabled on this preview site."

export async function addItemAction(): Promise<never> {
  throw new Error(PURCHASING_DISABLED)
}

export async function updateItemAction(): Promise<never> {
  throw new Error(PURCHASING_DISABLED)
}

export async function removeItemAction(): Promise<never> {
  throw new Error(PURCHASING_DISABLED)
}
