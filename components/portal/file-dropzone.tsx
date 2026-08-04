"use client"

import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

export function FileDropzone({
  accept,
  disabled,
  onFile,
  hint,
}: {
  accept: string
  disabled?: boolean
  onFile: (file: File) => void
  hint: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (!disabled) handleFiles(e.dataTransfer.files)
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors",
        dragging && "border-primary bg-primary/5",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/60 hover:bg-muted/70",
      )}
    >
      <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <span className="text-sm font-medium text-foreground">Click to choose or drag a file here</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </button>
  )
}
