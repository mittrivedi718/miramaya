"use server"

import { revalidatePath } from "next/cache"
import { addToCart, removeCartLine, updateCartLine } from "@/lib/shopify/cart"

export async function addItemAction(variantId: string) {
  if (!variantId.startsWith("gid://shopify/ProductVariant/")) {
    throw new Error("Invalid product variant")
  }
  await addToCart(variantId, 1)
  revalidatePath("/cart")
}

export async function updateItemAction(lineId: string, quantity: number) {
  if (!lineId.startsWith("gid://shopify/CartLine/")) throw new Error("Invalid cart line")
  await updateCartLine(lineId, quantity)
  revalidatePath("/cart")
}

export async function removeItemAction(lineId: string) {
  if (!lineId.startsWith("gid://shopify/CartLine/")) throw new Error("Invalid cart line")
  await removeCartLine(lineId)
  revalidatePath("/cart")
}
