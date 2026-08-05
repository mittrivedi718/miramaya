"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { AboutPhoto } from "@/lib/data"
import { addAboutPhoto, deleteAboutPhoto } from "@/app/portal/actions"
import { uploadFile } from "@/lib/upload-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { FileDropzone } from "@/components/portal/file-dropzone"

export function AboutManager({ photos }: { photos: AboutPhoto[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return toast.error("Please choose a photo of Luna first.")

    setSaving(true)
    try {
      const url = await uploadFile(file)
      await addAboutPhoto({ url, caption })
      toast.success("Photo of Luna added.")
      setFile(null)
      setCaption("")
    } catch (err) {
      console.error("[v0] About photo upload failed:", err)
      toast.error("Something went wrong uploading that photo. Please try again.")
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
              <h2 className="font-serif text-xl text-foreground">Add a photo of Luna</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These appear in the &ldquo;About the Artist&rdquo; section of the gallery.
              </p>
            </div>

            {file ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
                <span className="truncate text-sm text-foreground">{file.name}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} disabled={saving}>
                  Change
                </Button>
              </div>
            ) : (
              <FileDropzone accept="image/*" disabled={saving} onFile={setFile} hint="JPG, PNG, GIF or WEBP" />
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Luna supervising the studio"
                disabled={saving}
              />
            </div>

            <div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                {saving ? "Uploading…" : "Add photo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-serif text-xl text-foreground">Luna&apos;s photos ({photos.length})</h2>
        {photos.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No photos yet. Add the first one above.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PhotoCard({ photo }: { photo: AboutPhoto }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-square bg-muted">
        <Image src={photo.url || "/placeholder.svg"} alt={photo.caption ?? "Luna"} fill className="object-cover" sizes="200px" />
      </div>
      <div className="flex items-center justify-between gap-2 p-2">
        <p className="truncate text-xs text-muted-foreground">{photo.caption || "Luna"}</p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete photo"
          disabled={pending}
          onClick={() => {
            if (!confirm("Remove this photo of Luna?")) return
            startTransition(async () => {
              await deleteAboutPhoto(photo.id)
              toast.success("Photo removed.")
            })
          }}
        >
          {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}
