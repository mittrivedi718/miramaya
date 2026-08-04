"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import { Pencil, Trash2, Film, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Artwork } from "@/lib/data"
import { addArtwork, deleteArtwork, updateArtwork } from "@/app/portal/actions"
import { uploadFile } from "@/lib/upload-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileDropzone } from "@/components/portal/file-dropzone"

export function ArtworkManager({ artworks }: { artworks: Artwork[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Artwork | null>(null)

  const isVideo = file?.type.startsWith("video/")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return toast.error("Please choose a photo or video first.")
    if (!title.trim()) return toast.error("Please give the piece a title.")

    setSaving(true)
    try {
      const url = await uploadFile(file)
      await addArtwork({
        title,
        description,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
        url,
      })
      toast.success("Artwork added to the gallery.")
      setFile(null)
      setTitle("")
      setDescription("")
    } catch (err) {
      console.error("[v0] Artwork upload failed:", err)
      toast.error("Something went wrong uploading that piece. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h2 className="font-serif text-xl text-foreground">Add a new piece</h2>
              <p className="mt-1 text-sm text-muted-foreground">Upload a photo or video of your artwork.</p>
            </div>

            {file ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2 truncate">
                  {isVideo ? (
                    <Film className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  ) : null}
                  <span className="truncate text-sm text-foreground">{file.name}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} disabled={saving}>
                  Change
                </Button>
              </div>
            ) : (
              <FileDropzone
                accept="image/*,.heic,.heif,video/*"
                disabled={saving}
                onFile={setFile}
                hint="JPG, PNG, GIF, WEBP, HEIC (iPhone) or MP4, MOV"
              />
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="art-title">Title</Label>
              <Input
                id="art-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Moonrise Over the Sound"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="art-desc">Description</Label>
              <Textarea
                id="art-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short note about the piece — medium, story, size..."
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                {saving ? "Uploading…" : "Add to gallery"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-serif text-xl text-foreground">Your gallery ({artworks.length})</h2>
        {artworks.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No pieces yet. Add your first one above.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {artworks.map((art) => (
              <ArtworkCard key={art.id} art={art} onEdit={() => setEditing(art)} />
            ))}
          </div>
        )}
      </div>

      <EditDialog artwork={editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function ArtworkCard({ art, onEdit }: { art: Artwork; onEdit: () => void }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-square bg-muted">
        {art.mediaType === "video" ? (
          <>
            <video src={art.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            <Badge variant="secondary" className="absolute left-2 top-2">
              <Film data-icon="inline-start" />
              Video
            </Badge>
          </>
        ) : (
          <Image src={art.url || "/placeholder.svg"} alt={art.title} fill className="object-cover" sizes="200px" />
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        <p className="truncate text-sm font-medium text-foreground">{art.title}</p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${art.title}`}
            disabled={pending}
            onClick={() => {
              if (!confirm(`Remove "${art.title}" from the gallery?`)) return
              startTransition(async () => {
                await deleteArtwork(art.id)
                toast.success("Piece removed.")
              })
            }}
          >
            {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function EditDialog({ artwork, onClose }: { artwork: Artwork | null; onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (artwork) {
      setTitle(artwork.title)
      setDescription(artwork.description ?? "")
    }
  }, [artwork])

  return (
    <Dialog
      open={!!artwork}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent key={artwork?.id}>
        <DialogHeader>
          <DialogTitle>Edit piece</DialogTitle>
          <DialogDescription>Update the title and description for this artwork.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            disabled={saving}
            onClick={async () => {
              if (!artwork) return
              setSaving(true)
              try {
                await updateArtwork(artwork.id, { title, description })
                toast.success("Piece updated.")
                onClose()
              } catch {
                toast.error("Could not save changes.")
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
