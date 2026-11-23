import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Lets a phone add the site to its home screen with the company's icon and colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "TWA Tanzania",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#566a1b",
    icons: [
      { src: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/favicon-270.png", sizes: "270x270", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
