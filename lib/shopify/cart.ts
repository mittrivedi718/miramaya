import { cookies } from "next/headers"
import { storefront } from "./client"
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "./queries"
import type { Cart, CartLine } from "./types"

const CART_COOKIE = "portal_cart_id"

/** Hard server-side ceiling on any single line. */
export const MAX_LINE_QUANTITY = 10
/** Hard server-side ceiling across the whole cart. */
export const MAX_CART_QUANTITY = 50

type RawCart = Omit<Cart, "lines"> & { lines: { nodes: CartLine[] } }

function flatten(raw: RawCart | null): Cart | null {
  if (!raw) return null
  return { ...raw, lines: raw.lines?.nodes ?? [] }
}

export function sanitizeQuantity(input: unknown): number {
  const n = typeof input === "number" ? input : Number.parseInt(String(input ?? ""), 10)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return 1
  return Math.min(n, MAX_LINE_QUANTITY)
}

export async function getCartId() {
  const store = await cookies()
  return store.get(CART_COOKIE)?.value ?? null
}

async function setCartId(id: string) {
  const store = await cookies()
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function getCart(): Promise<Cart | null> {
  const id = await getCartId()
  if (!id) return null

  try {
    const data = await storefront<{ cart: RawCart | null }>(CART_QUERY, { variables: { id } })
    return flatten(data.cart)
  } catch {
    return null
  }
}

function assertNoUserErrors(errors: { message: string }[] | undefined) {
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "))
}

export async function addToCart(variantId: string, requestedQuantity: unknown): Promise<Cart> {
  const quantity = sanitizeQuantity(requestedQuantity)
  const existing = await getCart()

  // Enforce the cap over the aggregate, not per request.
  if (existing) {
    const currentForVariant = existing.lines
      .filter((line) => line.merchandise.id === variantId)
      .reduce((sum, line) => sum + line.quantity, 0)

    const room = Math.min(
      MAX_LINE_QUANTITY - currentForVariant,
      MAX_CART_QUANTITY - existing.totalQuantity,
    )
    if (room <= 0) return existing

    const data = await storefront<{
      cartLinesAdd: { cart: RawCart | null; userErrors: { message: string }[] }
    }>(CART_LINES_ADD_MUTATION, {
      variables: {
        cartId: existing.id,
        lines: [{ merchandiseId: variantId, quantity: Math.min(quantity, room) }],
      },
    })
    assertNoUserErrors(data.cartLinesAdd.userErrors)
    const cart = flatten(data.cartLinesAdd.cart)
    if (!cart) throw new Error("Could not update the cart")
    return cart
  }

  const data = await storefront<{
    cartCreate: { cart: RawCart | null; userErrors: { message: string }[] }
  }>(CART_CREATE_MUTATION, {
    variables: { lines: [{ merchandiseId: variantId, quantity }] },
  })
  assertNoUserErrors(data.cartCreate.userErrors)
  const cart = flatten(data.cartCreate.cart)
  if (!cart) throw new Error("Could not create a cart")

  await setCartId(cart.id)
  return cart
}

export async function updateCartLine(lineId: string, requestedQuantity: unknown): Promise<Cart | null> {
  const cartId = await getCartId()
  if (!cartId) return null

  const raw = typeof requestedQuantity === "number" ? requestedQuantity : Number(requestedQuantity)
  if (Number.isFinite(raw) && raw <= 0) return removeCartLine(lineId)

  const quantity = sanitizeQuantity(requestedQuantity)

  const data = await storefront<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: { message: string }[] }
  }>(CART_LINES_UPDATE_MUTATION, {
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  })
  assertNoUserErrors(data.cartLinesUpdate.userErrors)
  return flatten(data.cartLinesUpdate.cart)
}

export async function removeCartLine(lineId: string): Promise<Cart | null> {
  const cartId = await getCartId()
  if (!cartId) return null

  const data = await storefront<{
    cartLinesRemove: { cart: RawCart | null; userErrors: { message: string }[] }
  }>(CART_LINES_REMOVE_MUTATION, {
    variables: { cartId, lineIds: [lineId] },
  })
  assertNoUserErrors(data.cartLinesRemove.userErrors)
  return flatten(data.cartLinesRemove.cart)
}

/** Appends the params needed to bypass the storefront password screen. */
export function buildCheckoutUrl(checkoutUrl: string) {
  const url = new URL(checkoutUrl)
  url.searchParams.set("channel", "online_store")
  return url.toString()
}
