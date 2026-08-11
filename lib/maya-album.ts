// The photography albums that live inside maya (refraction of light).
//
// This manifest is the single source of truth. To add your own photos:
//   1. Drop the image files into /public/maya/helix/ (any name, any format).
//   2. Add/replace entries in `photos` below with the src, date and location.
//      Photos are shown along the helix in date order (earliest -> latest),
//      so the spiral reads as a transformation through time.
// The images are used as-is; the frames crop them artistically (object-cover).

export type HelixPhoto = {
  /** Public path to the image, e.g. "/maya/helix/2019-reykjavik.jpg". */
  src: string
  /** Date the photo was taken. Any parseable date string; used only for ordering. */
  date: string
  /** A short, human label for the date shown on screen (e.g. "2019"). */
  year: string
  /** Where it was taken. */
  location: string
  /** One line: the transformation at this point. */
  caption: string
  /** Accessible description. */
  alt: string
}

export type Album = {
  slug: string
  title: string
  /** Shown on the lock screen, before you enter. */
  tagline: string
  /** A short line under the album title. */
  kicker: string
  photos: HelixPhoto[]
}

// NOTE: the dates/locations/captions below are placeholders to be replaced with
// your real photos. The prismatic portraits in /public/maya/helix are stand-ins.
const HELIX_PHOTOS: HelixPhoto[] = [
  {
    src: "/maya/helix/t1.png",
    date: "2019-05-01",
    year: "2019",
    location: "Reykjavík",
    caption: "before the unwind",
    alt: "A figure dissolving into prismatic light against deep space",
  },
  {
    src: "/maya/helix/t2.png",
    date: "2020-09-01",
    year: "2020",
    location: "Lisbon",
    caption: "the first turn",
    alt: "A figure emerging from a prism of refracted rainbow light",
  },
  {
    src: "/maya/helix/t3.png",
    date: "2021-11-01",
    year: "2021",
    location: "Tokyo",
    caption: "light finds the angle",
    alt: "A silhouette made of starlight against a distant spiral galaxy",
  },
  {
    src: "/maya/helix/t4.png",
    date: "2022-07-01",
    year: "2022",
    location: "Marrakesh",
    caption: "half particle, half self",
    alt: "A figure turning, dissolving into a helix of light particles",
  },
  {
    src: "/maya/helix/t5.png",
    date: "2024-03-01",
    year: "2024",
    location: "New York",
    caption: "still unwinding",
    alt: "A luminous figure made of spectral light against the cosmos",
  },
]

export const HELIX_ALBUM: Album = {
  slug: "helix",
  title: "Interstellar Helix",
  tagline: "Traveling through space and time. Interstellar helix unwind.",
  kicker: "Photography — refraction of light",
  // Always ordered earliest -> latest so the spiral is a timeline.
  photos: [...HELIX_PHOTOS].sort((a, b) => +new Date(a.date) - +new Date(b.date)),
}

export function getAlbum(slug: string): Album | null {
  return slug === HELIX_ALBUM.slug ? HELIX_ALBUM : null
}
