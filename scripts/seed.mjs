import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function futureDate(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

async function count(table) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table}`)
  return rows[0].count
}

async function main() {
  // Artworks
  if ((await count("artworks")) === 0) {
    const art = [
      ["Moonrise Over the Sound", "Acrylic on canvas. A full moon lifting over the hills and water of home.", "/art/moonrise.png"],
      ["Tide & Phase", "Ink on cotton paper. A quiet study of tide lines and the moon's phases.", "/art/tide-chart.png"],
      ["Field Notes", "Watercolor and pressed botanicals gathered on studio walks.", "/art/botanical.png"],
      ["Dust in a Sunbeam", "Mixed media. The small, drifting galaxies that live in an afternoon light.", "/art/dust-motes.png"],
    ]
    let i = 0
    for (const [title, description, url] of art) {
      await pool.query(
        `INSERT INTO artworks (title, description, media_type, url, sort_order) VALUES ($1, $2, 'image', $3, $4)`,
        [title, description, url, i++],
      )
    }
    console.log(`Seeded ${art.length} artworks`)
  } else {
    console.log("Artworks already present, skipping")
  }

  // About photos of Luna
  if ((await count("about_photos")) === 0) {
    const photos = [
      ["/luna/luna-portrait.jpeg", "Luna, resident artist and creative director, holding court in the Seattle studio."],
    ]
    let i = 0
    for (const [url, caption] of photos) {
      await pool.query(`INSERT INTO about_photos (url, caption, sort_order) VALUES ($1, $2, $3)`, [url, caption, i++])
    }
    console.log(`Seeded ${photos.length} about photos`)
  } else {
    console.log("About photos already present, skipping")
  }

  // Upcoming shows
  if ((await count("events")) === 0) {
    const events = [
      ["Ballard Sunday Farmers Market", "Ballard Ave NW", "Seattle, WA", futureDate(9), null, "10:00 AM", "3:00 PM", "Look for the moon-and-moss banner near the north end."],
      ["Fremont Sunday Market", "N 34th St & Evanston Ave N", "Seattle, WA", futureDate(16), null, "10:00 AM", "4:00 PM", null],
      ["Seattle Handmade Holiday Fair", "Seattle Center, Fisher Pavilion", "Seattle, WA", futureDate(45), futureDate(46), "11:00 AM", "6:00 PM", "Two-day show — new winter pieces debut here."],
    ]
    for (const e of events) {
      await pool.query(
        `INSERT INTO events (title, venue, location, start_date, end_date, start_time, end_time, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        e,
      )
    }
    console.log(`Seeded ${events.length} events`)
  } else {
    console.log("Events already present, skipping")
  }

  console.log("Seed complete.")
  await pool.end()
}

main().catch(async (e) => {
  console.error(e)
  await pool.end()
  process.exit(1)
})
