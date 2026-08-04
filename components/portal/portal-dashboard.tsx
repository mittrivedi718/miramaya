"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Moon, ExternalLink, LogOut } from "lucide-react"
import type { AboutPhoto, Artwork, ShowEvent } from "@/lib/data"
import { signOutArtist } from "@/app/portal/actions"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArtworkManager } from "@/components/portal/artwork-manager"
import { AboutManager } from "@/components/portal/about-manager"
import { EventsManager } from "@/components/portal/events-manager"

export function PortalDashboard({
  artworks,
  aboutPhotos,
  events,
  artistName,
}: {
  artworks: Artwork[]
  aboutPhotos: AboutPhoto[]
  events: ShowEvent[]
  artistName: string
}) {
  const [signingOut, startSignOut] = useTransition()

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Moon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">From Here Studio</p>
            <h1 className="font-serif text-2xl leading-tight text-foreground">Artist Studio</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/" target="_blank" />}>
            View gallery
            <ExternalLink data-icon="inline-end" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={signingOut}
            onClick={() => startSignOut(() => signOutArtist())}
          >
            <LogOut data-icon="inline-start" />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </header>

      <p className="mt-6 text-pretty text-sm leading-relaxed text-muted-foreground">
        Welcome back, {artistName}. Everything you add here appears on the public gallery right away.
      </p>

      <Tabs defaultValue="artwork" className="mt-6">
        <TabsList>
          <TabsTrigger value="artwork">Artwork ({artworks.length})</TabsTrigger>
          <TabsTrigger value="shows">Shows ({events.length})</TabsTrigger>
          <TabsTrigger value="about">About Luna ({aboutPhotos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="artwork" className="mt-6">
          <ArtworkManager artworks={artworks} />
        </TabsContent>
        <TabsContent value="shows" className="mt-6">
          <EventsManager events={events} />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <AboutManager photos={aboutPhotos} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
