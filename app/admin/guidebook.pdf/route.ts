import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib"
import { requireAdmin } from "@/lib/admin"
import { buildGuidebookText } from "@/lib/guidebook"
import { getPortalSequences } from "@/lib/portal-access"
import { SYMBOLS } from "@/lib/portal-symbols"
import { WORLDS } from "@/lib/worlds"

export const dynamic = "force-dynamic"

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = []
  for (const paragraph of text.split("\n")) {
    if (!paragraph) { lines.push(""); continue }
    let line = ""
    for (const word of paragraph.split(" ")) {
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) > width && line) { lines.push(line); line = word } else line = candidate
    }
    if (line) lines.push(line)
  }
  return lines
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return new Response("Not found", { status: 404 })

  const records = await getPortalSequences()
  const byHandle = new Map(records.map((record) => [record.handle, record.symbolIds]))
  const sequences = WORLDS.map((world) => ({
    handle: world.handle,
    name: world.name,
    symbols: (byHandle.get(world.handle) ?? []).map((id) => SYMBOLS[id as keyof typeof SYMBOLS]?.label ?? id),
  }))
  const text = buildGuidebookText(sequences, admin.email)
  const pdf = await PDFDocument.create()
  const body = await pdf.embedFont(StandardFonts.Helvetica)
  const title = await pdf.embedFont(StandardFonts.TimesRomanBold)
  let page = pdf.addPage([612, 792])
  let y = 728
  page.drawText("MIRAMAYA", { x: 48, y, size: 11, font: body, color: rgb(0.35, 0.38, 0.4) })
  y -= 42
  page.drawText("Secret Portal Guidebook", { x: 48, y, size: 28, font: title, color: rgb(0.08, 0.09, 0.1) })
  y -= 38
  for (const line of wrap(text, body, 10.5, 516)) {
    if (y < 54) { page = pdf.addPage([612, 792]); y = 738 }
    if (line) page.drawText(line, { x: 48, y, size: 10.5, font: body, color: rgb(0.16, 0.17, 0.18) })
    y -= line ? 16 : 10
  }
  page.drawText("Private reference - generated from current portal settings", { x: 48, y: 34, size: 8, font: body, color: rgb(0.45, 0.47, 0.48) })
  const bytes = await pdf.save()
  return new Response(Buffer.from(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=miramaya-secret-portal-guidebook.pdf", "Cache-Control": "private, no-store" },
  })
}
