import { redeemShareLink } from "@/app/portal-actions"

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  await redeemShareLink(token)
}
