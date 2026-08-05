import { storefront } from "./client"
import { COLLECTION_QUERY, PRODUCT_QUERY } from "./queries"
import type { CollectionWithProducts, Product } from "./types"

type RawProduct = Omit<Product, "images" | "variants"> & {
  images: { nodes: Product["images"] }
  variants: { nodes: Product["variants"] }
}

function flatten(raw: RawProduct): Product {
  return {
    ...raw,
    images: raw.images?.nodes ?? [],
    variants: raw.variants?.nodes ?? [],
  }
}

export async function getCollection(handle: string): Promise<CollectionWithProducts | null> {
  const data = await storefront<{
    collection: {
      id: string
      handle: string
      title: string
      description: string
      products: { nodes: RawProduct[] }
    } | null
  }>(COLLECTION_QUERY, {
    variables: { handle },
    revalidate: 300,
    tags: ["shopify", `collection:${handle}`],
  })

  if (!data.collection) return null

  return {
    id: data.collection.id,
    handle: data.collection.handle,
    title: data.collection.title,
    description: data.collection.description,
    products: data.collection.products.nodes.map(flatten),
  }
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefront<{ product: RawProduct | null }>(PRODUCT_QUERY, {
    variables: { handle },
    revalidate: 300,
    tags: ["shopify", `product:${handle}`],
  })

  return data.product ? flatten(data.product) : null
}

export function formatMoney(amount: string, currencyCode: string) {
  const value = Number.parseFloat(amount)
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value)
  } catch {
    return `${currencyCode} ${amount}`
  }
}
