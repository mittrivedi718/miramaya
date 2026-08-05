export type Money = {
  amount: string
  currencyCode: string
}

export type ShopImage = {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  selectedOptions: { name: string; value: string }[]
}

export type Product = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  productType: string
  vendor: string
  availableForSale: boolean
  featuredImage: ShopImage | null
  images: ShopImage[]
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money }
  variants: ProductVariant[]
}

export type CollectionWithProducts = {
  id: string
  handle: string
  title: string
  description: string
  products: Product[]
}

export type CartLine = {
  id: string
  quantity: number
  cost: { totalAmount: Money }
  merchandise: {
    id: string
    title: string
    image: ShopImage | null
    product: { handle: string; title: string; vendor: string }
    selectedOptions: { name: string; value: string }[]
  }
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: Money
    totalAmount: Money
  }
  lines: CartLine[]
}
