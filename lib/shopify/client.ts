const API_VERSION = "2025-10"

function endpoint() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN is not set")
  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
  return `https://${host}/api/${API_VERSION}/graphql.json`
}

type StorefrontOptions = {
  variables?: Record<string, unknown>
  /** Seconds to cache. Omit for no-store (cart / mutations). */
  revalidate?: number
  tags?: string[]
}

export async function storefront<T>(query: string, options: StorefrontOptions = {}): Promise<T> {
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!token) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set")

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables: options.variables ?? {} }),
    ...(typeof options.revalidate === "number"
      ? { next: { revalidate: options.revalidate, tags: options.tags } }
      : { cache: "no-store" as RequestCache }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Shopify Storefront request failed (${res.status}): ${body.slice(0, 400)}`)
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new Error(`Shopify Storefront errors: ${json.errors.map((e) => e.message).join("; ")}`)
  }
  if (!json.data) {
    throw new Error("Shopify Storefront returned no data")
  }

  return json.data
}
