import sharp from "sharp"
import { mkdir } from "node:fs/promises"

const SRC = "public/brand/miramaya-mark-source.jpeg"
const OUT = "public/brand"

await mkdir(OUT, { recursive: true })

// 1) Trim the flat cream border so the mark is tightly cropped and centered.
const trimmed = await sharp(SRC).trim({ threshold: 18 }).toBuffer()
const meta = await sharp(trimmed).metadata()
console.log("[v0] trimmed size:", meta.width, "x", meta.height)

// 2) Build an alpha matte from inverted luminance:
//    the dark ink of the mark -> opaque, the cream ground -> transparent.
//    A gentle floor + gamma suppresses the soft drop-shadow halo while
//    preserving the delicate ripple anti-aliasing.
const { data, info } = await sharp(trimmed)
  .grayscale()
  .raw()
  .toBuffer({ resolveWithObject: true })

const px = info.width * info.height
const alpha = Buffer.alloc(px)
const FLOOR = 34 // kill faint shadow below this inverted-luminance value
for (let i = 0; i < px; i++) {
  const inv = 255 - data[i] // dark ink -> high
  let a = (inv - FLOOR) / (255 - FLOOR)
  if (a < 0) a = 0
  a = Math.pow(a, 0.85) // lift midtones so ripples stay visible
  alpha[i] = Math.round(a * 255)
}

async function compose(rgb, file, size) {
  const [r, g, b] = rgb
  const solid = {
    create: { width: info.width, height: info.height, channels: 3, background: { r, g, b } },
  }
  let img = sharp(solid).joinChannel(alpha, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
  if (size) img = img.resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  await img.png().toFile(`${OUT}/${file}`)
  console.log("[v0] wrote", file)
}

// Alpha matte (RGB is irrelevant; used as a CSS mask painted with any color).
await compose([0, 0, 0], "miramaya-mark-matte.png")
// Ready-to-use solid variants for favicon / OG / places CSS masks can't reach.
await compose([15, 17, 21], "miramaya-mark-ink.png")
await compose([244, 241, 234], "miramaya-mark-cream.png")
await compose([15, 17, 21], "favicon-ink.png", 64)
await compose([244, 241, 234], "favicon-cream.png", 64)

console.log("[v0] done")
