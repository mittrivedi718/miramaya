import { redirect } from "next/navigation"

// The cart/checkout flow is disabled. These are display-only preview pages,
// so anyone landing on /cart is sent back to the portal gallery.
export default function CartPage() {
  redirect("/")
}
