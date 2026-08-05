import { Moon } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="font-serif text-lg text-foreground">From Here Studio</p>
            <p className="text-xs text-muted-foreground">Original artwork by Luna · Seattle, WA</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#gallery" className="transition-colors hover:text-foreground">
            Gallery
          </a>
          <a href="#shows" className="transition-colors hover:text-foreground">
            Shows
          </a>
          <a href="/portal" className="transition-colors hover:text-foreground">
            Artist Login
          </a>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-5 py-4 text-xs text-muted-foreground md:px-8">
          &copy; {new Date().getFullYear()} From Here Studio. Every piece made by paw and heart.
        </p>
      </div>
    </footer>
  )
}
