"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { CalendarDays, MapPin, Pencil, Plus, Trash2, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import type { ShowEvent } from "@/lib/data"
import { deleteEvent, saveEvent } from "@/app/portal/actions"
import { formatDateRange, isUpcoming } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type EventDraft = {
  id?: string
  title: string
  venue: string
  location: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  url: string
  notes: string
}

const emptyDraft: EventDraft = {
  title: "",
  venue: "",
  location: "Seattle, WA",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  url: "",
  notes: "",
}

function toDraft(e: ShowEvent): EventDraft {
  return {
    id: e.id,
    title: e.title,
    venue: e.venue ?? "",
    location: e.location ?? "",
    startDate: e.startDate,
    endDate: e.endDate ?? "",
    startTime: e.startTime ?? "",
    endTime: e.endTime ?? "",
    url: e.url ?? "",
    notes: e.notes ?? "",
  }
}

export function EventsManager({ events }: { events: ShowEvent[] }) {
  const [draft, setDraft] = useState<EventDraft | null>(null)

  const eventDays = useMemo(() => {
    const days: Date[] = []
    for (const e of events) {
      const start = new Date(`${e.startDate}T00:00:00`)
      const end = e.endDate ? new Date(`${e.endDate}T00:00:00`) : start
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d))
      }
    }
    return days
  }, [events])

  const sorted = useMemo(() => [...events].sort((a, b) => a.startDate.localeCompare(b.startDate)), [events])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-foreground">Show calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the craft &amp; trade shows where your work will be available.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...emptyDraft })}>
          <Plus data-icon="inline-start" />
          Add show
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <Calendar
            mode="multiple"
            selected={eventDays}
            className="p-0"
            modifiersClassNames={{ selected: "bg-primary text-primary-foreground rounded-md" }}
          />
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-3 w-3 rounded-sm bg-primary" aria-hidden="true" />
            Days with a scheduled show
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
              <CalendarDays className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No shows scheduled yet.</p>
            </div>
          ) : (
            sorted.map((e) => (
              <EventRow key={e.id} event={e} onEdit={() => setDraft(toDraft(e))} />
            ))
          )}
        </div>
      </div>

      <EventDialog draft={draft} onClose={() => setDraft(null)} />
    </div>
  )
}

function EventRow({ event, onEdit }: { event: ShowEvent; onEdit: () => void }) {
  const [pending, startTransition] = useTransition()
  const upcoming = isUpcoming(event.endDate ?? event.startDate)

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-foreground">{event.title}</h3>
          {upcoming ? (
            <Badge variant="secondary">Upcoming</Badge>
          ) : (
            <Badge variant="outline">Past</Badge>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formatDateRange(event.startDate, event.endDate)}
          {event.startTime ? ` · ${event.startTime}${event.endTime ? `–${event.endTime}` : ""}` : ""}
        </p>
        {event.venue || event.location ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {[event.venue, event.location].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
          >
            Event page
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${event.title}`}
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete "${event.title}"?`)) return
            startTransition(async () => {
              await deleteEvent(event.id)
              toast.success("Show deleted.")
            })
          }}
        >
          {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

function EventDialog({ draft, onClose }: { draft: EventDraft | null; onClose: () => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EventDraft>(emptyDraft)

  useEffect(() => {
    if (draft) setForm(draft)
  }, [draft])

  function set<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) return toast.error("Please add a show name.")
    if (!form.startDate) return toast.error("Please choose a start date.")
    setSaving(true)
    try {
      await saveEvent(form)
      toast.success(form.id ? "Show updated." : "Show added.")
      onClose()
    } catch (err) {
      console.error("[v0] Save event failed:", err)
      toast.error("Could not save this show.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!draft} onOpenChange={(open) => !open && onClose()}>
      <DialogContent key={draft?.id ?? "new"} className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft?.id ? "Edit show" : "Add a show"}</DialogTitle>
          <DialogDescription>Details about a craft or trade show where your art will be available.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ev-title">Show name</Label>
            <Input
              id="ev-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Ballard Night Market"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ev-start">Start date</Label>
              <Input
                id="ev-start"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ev-end">End date (optional)</Label>
              <Input
                id="ev-end"
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ev-stime">Start time (optional)</Label>
              <Input
                id="ev-stime"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                placeholder="10:00 AM"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ev-etime">End time (optional)</Label>
              <Input
                id="ev-etime"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                placeholder="5:00 PM"
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ev-venue">Venue (optional)</Label>
            <Input
              id="ev-venue"
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
              placeholder="e.g. Ballard Commons Park"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ev-loc">City / location</Label>
            <Input
              id="ev-loc"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Seattle, WA"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ev-url">Event link (optional)</Label>
            <Input
              id="ev-url"
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://..."
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ev-notes">Notes (optional)</Label>
            <Textarea
              id="ev-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Booth number, what you'll bring, etc."
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
            {draft?.id ? "Save changes" : "Add show"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
