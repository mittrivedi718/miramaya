const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Parse an ISO "YYYY-MM-DD" string into parts without any timezone shifting.
function parseISODate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) }
}

export function formatDate(iso: string): string {
  const parts = parseISODate(iso)
  if (!parts) return iso
  return `${MONTHS[parts.month]} ${parts.day}, ${parts.year}`
}

export function formatDateRange(startISO: string, endISO?: string | null): string {
  const start = parseISODate(startISO)
  if (!start) return startISO
  if (!endISO || endISO === startISO) return formatDate(startISO)
  const end = parseISODate(endISO)
  if (!end) return formatDate(startISO)
  // Same month & year: "August 4 – 6, 2026"
  if (start.year === end.year && start.month === end.month) {
    return `${MONTHS[start.month]} ${start.day} – ${end.day}, ${start.year}`
  }
  // Same year: "August 30 – September 2, 2026"
  if (start.year === end.year) {
    return `${MONTHS[start.month]} ${start.day} – ${MONTHS[end.month]} ${end.day}, ${start.year}`
  }
  return `${formatDate(startISO)} – ${formatDate(endISO)}`
}

export function shortMonth(iso: string): string {
  const parts = parseISODate(iso)
  if (!parts) return ""
  return MONTHS_SHORT[parts.month]
}

export function dayOfMonth(iso: string): string {
  const parts = parseISODate(iso)
  if (!parts) return ""
  return String(parts.day)
}

export function weekday(iso: string): string {
  const parts = parseISODate(iso)
  if (!parts) return ""
  const d = new Date(parts.year, parts.month, parts.day)
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()]
}

// True when the given ISO date is today or in the future.
export function isUpcoming(iso: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return iso >= today
}
