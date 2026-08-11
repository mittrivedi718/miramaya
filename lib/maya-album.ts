// The photography albums that live inside maya (refraction of light).
//
// This manifest is the single source of truth. To add photos:
//   1. Drop the image files into /public/maya/helix/uploads/.
//   2. Add/replace entries in HELIX_PHOTOS below with the src, date and (optional) location.
//      Photos are shown along the helix in date order (earliest -> latest),
//      so the spiral reads as a transformation through time.
// The images are used as-is; the frames crop them artistically (object-cover).

export type HelixPhoto = {
  /** Public path to the image. */
  src: string
  /** Date the photo was taken. Any parseable date string; used only for ordering. */
  date: string
  /** A short, human label for the date shown on screen (e.g. "2019"). */
  year: string
  /** Where it was taken. Optional — omitted from the label when empty. */
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

// The transformation, ordered from the earliest, quietest self toward the most
// fully expressed. Only u32 carries a known capture date (2025-08-22); the rest
// are sequenced as an arc. Update `date`/`location` as real metadata comes in.
const HELIX_PHOTOS: HelixPhoto[] = [
  { src: "/maya/helix/uploads/u18.jpeg", date: "2019-01-01", year: "2019", location: "", caption: "before the unwind", alt: "Portrait in a car, natural, in a leather puffer over a brown sweater" },
  { src: "/maya/helix/uploads/u22.jpeg", date: "2019-06-01", year: "2019", location: "", caption: "still folded in", alt: "Mirror selfie in a grey eyelet camp-collar shirt in a gallery" },
  { src: "/maya/helix/uploads/u31.jpeg", date: "2019-11-01", year: "2019", location: "", caption: "the wind starts it", alt: "Beach at sunset in a sage zip mock-neck, long braids catching the wind" },
  { src: "/maya/helix/uploads/u01.jpeg", date: "2020-03-01", year: "2020", location: "", caption: "learning the body", alt: "Gym mirror selfie in a black compression top" },
  { src: "/maya/helix/uploads/u21.jpeg", date: "2020-07-01", year: "2020", location: "", caption: "first loosening", alt: "Bathroom mirror in a striped-sleeve leather jacket over an open shirt" },
  { src: "/maya/helix/uploads/u20.jpeg", date: "2020-11-01", year: "2020", location: "", caption: "shedding", alt: "Mirror selfie in a yellow-and-brown snake-print mesh tank, wet hair" },
  { src: "/maya/helix/uploads/u33.jpeg", date: "2021-02-01", year: "2021", location: "", caption: "the spine hardens", alt: "Ornate gold mirror, black PVC corset with a braided harness" },
  { src: "/maya/helix/uploads/u35.jpeg", date: "2021-03-15", year: "2021", location: "", caption: "lacquered", alt: "Red-glass hallway mirror, glossy plaid PVC shirt with a laced corset belt" },
  { src: "/maya/helix/uploads/u07.jpeg", date: "2021-05-01", year: "2021", location: "", caption: "not from here", alt: "Hallway mirror selfie wearing a green alien mask, shirtless" },
  { src: "/maya/helix/uploads/u06.jpeg", date: "2021-07-01", year: "2021", location: "", caption: "a different animal", alt: "A raccoon walking across grass" },
  { src: "/maya/helix/uploads/u34.jpeg", date: "2021-09-01", year: "2021", location: "", caption: "walking it out", alt: "Street profile against a corrugated wall, camo shorts and a long braid" },
  { src: "/maya/helix/uploads/u25.jpeg", date: "2021-12-01", year: "2021", location: "", caption: "the mane", alt: "Park at golden hour, long wavy hair and flame pendants" },
  { src: "/maya/helix/uploads/u12.jpeg", date: "2022-02-01", year: "2022", location: "", caption: "gilded", alt: "Club close-up with orange eye makeup and an orange macramé harness" },
  { src: "/maya/helix/uploads/u02.jpeg", date: "2022-05-01", year: "2022", location: "", caption: "plumage", alt: "Sheer black bodysuit with an ostrich-feather headpiece" },
  { src: "/maya/helix/uploads/u04.jpeg", date: "2022-08-01", year: "2022", location: "", caption: "domestic villain", alt: "Black mask, fur hat and shades in a kitchen" },
  { src: "/maya/helix/uploads/u11.jpeg", date: "2022-11-01", year: "2022", location: "", caption: "scaled", alt: "Warehouse mirror in a black cut-out crop top and dragon-print shorts" },
  { src: "/maya/helix/uploads/u03.jpeg", date: "2023-01-01", year: "2023", location: "", caption: "mirror face", alt: "Silver mask and cap at a chain-link fence" },
  { src: "/maya/helix/uploads/u05.jpeg", date: "2023-03-01", year: "2023", location: "", caption: "the double", alt: "Silver-mask figure with a red chrome-thorn chest piece" },
  { src: "/maya/helix/uploads/u13.jpeg", date: "2023-06-01", year: "2023", location: "", caption: "second skin", alt: "Pink wall, blue-rhinestone catsuit with long braids" },
  { src: "/maya/helix/uploads/u16.jpeg", date: "2023-09-01", year: "2023", location: "", caption: "the doll", alt: "Bathroom mirror in a blue strappy look" },
  { src: "/maya/helix/uploads/u17.jpeg", date: "2023-11-01", year: "2023", location: "", caption: "definition", alt: "Black curly-fringe halter dress with cowboy boots in a red-lit alley" },
  { src: "/maya/helix/uploads/u27.jpeg", date: "2024-01-01", year: "2024", location: "", caption: "teal hour", alt: "Teal cut-crease eye makeup with a messy topknot" },
  { src: "/maya/helix/uploads/u28.jpeg", date: "2024-02-15", year: "2024", location: "", caption: "ember eye", alt: "Dramatic red smoky eye and long crimped hair" },
  { src: "/maya/helix/uploads/u08.jpeg", date: "2024-04-01", year: "2024", location: "", caption: "afterglow", alt: "Chain top and mesh skirt on white stairs, holding an album cover" },
  { src: "/maya/helix/uploads/u09.jpeg", date: "2024-06-01", year: "2024", location: "", caption: "ultraviolet", alt: "UV blacklight club, glowing blue lace mask and body appliqués" },
  { src: "/maya/helix/uploads/u23.jpeg", date: "2024-08-01", year: "2024", location: "", caption: "where is joe cool", alt: "Dressing room in a nude fishnet bodysuit and mesh mask" },
  { src: "/maya/helix/uploads/u36.jpeg", date: "2024-09-15", year: "2024", location: "", caption: "skyline skin", alt: "Rooftop lounge at night with sputnik chandeliers, sheer printed bodysuit and rhinestone boots" },
  { src: "/maya/helix/uploads/u26.jpeg", date: "2024-10-31", year: "2024", location: "", caption: "veiled", alt: "Halloween party in a blue sari drape with a fishnet mask" },
  { src: "/maya/helix/uploads/u29.jpeg", date: "2025-01-01", year: "2025", location: "", caption: "liquid", alt: "Shimmering blue mesh gown in a pink event room" },
  { src: "/maya/helix/uploads/u10.jpeg", date: "2025-02-01", year: "2025", location: "", caption: "in the red", alt: "Red-lit party in an oversized grey suit" },
  { src: "/maya/helix/uploads/u14.jpeg", date: "2025-04-01", year: "2025", location: "", caption: "mirrorball", alt: "Rooftop at night with a disco ball, silver rhinestone mesh look" },
  { src: "/maya/helix/uploads/u15.jpeg", date: "2025-05-01", year: "2025", location: "", caption: "familiar", alt: "White draped garment with red staining, holding a black cat" },
  { src: "/maya/helix/uploads/u19.jpeg", date: "2025-06-01", year: "2025", location: "", caption: "lounge", alt: "Red-lit lounge, seated in a corset and leather with a green drink" },
  { src: "/maya/helix/uploads/u30.jpeg", date: "2025-07-01", year: "2025", location: "", caption: "daylight", alt: "Daytime deck party in a green halter jumpsuit" },
  { src: "/maya/helix/uploads/u32.jpeg", date: "2025-08-22", year: "2025", location: "", caption: "still unwinding", alt: "Night apartment in a green pleated jumpsuit" },
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
