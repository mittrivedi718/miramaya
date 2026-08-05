import { CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react"
import type { ShowEvent } from "@/lib/data"
import { dayOfMonth, formatDateRange, shortMonth, weekday } from "@/lib/format"

export function UpcomingShows({ events }: { events: ShowEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-4 font-serif text-2xl text-foreground">No shows on the calendar just yet</p>
        <p className="mx-auto mt-2 max-w-md text-pretty text-muted-foreground">
          Check back soon — Luna&apos;s next craft and trade show dates around Seattle will be posted here.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:gap-6"
        >
          <div className="flex w-full shrink-0 items-center gap-4 sm:w-auto sm:flex-col sm:gap-0 sm:text-center">
            <div className="flex flex-col items-center rounded-lg bg-secondary px-4 py-2 text-secondary-foreground">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {shortMonth(event.startDate)}
              </span>
              <span className="font-serif text-3xl leading-none">{dayOfMonth(event.startDate)}</span>
            </div>
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground sm:mt-2">
              {weekday(event.startDate)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-balance font-serif text-2xl leading-tight text-foreground">{event.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{formatDateRange(event.startDate, event.endDate)}</p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-foreground">
              {(event.venue || event.location) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                  {[event.venue, event.location].filter(Boolean).join(" · ")}
                </span>
              )}
              {(event.startTime || event.endTime) && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                  {[event.startTime, event.endTime].filter(Boolean).join(" – ")}
                </span>
              )}
            </div>

            {event.notes && <p className="mt-2 text-pretty text-sm text-muted-foreground">{event.notes}</p>}
          </div>

          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-secondary"
            >
              Details
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}
