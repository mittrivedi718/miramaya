import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const sql = `
CREATE TABLE IF NOT EXISTS artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  media_type text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  poster_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS about_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  venue text,
  location text,
  start_date text NOT NULL,
  end_date text,
  start_time text,
  end_time text,
  url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
`

const res = await pool.query(sql)
console.log("[v0] Tables created successfully")
await pool.end()
