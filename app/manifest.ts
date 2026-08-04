import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "From Here Studio",
    short_name: "From Here",
    description:
      "The artwork of Luna — paintings, photography, and moving pieces made in Seattle. Art rooted in place.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe4",
    theme_color: "#f4efe4",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  }
}
