import type { Metadata } from "next";
import { photo, type Photo } from "@/lib/photos";
import { site } from "@/lib/site";

type Img = { src: string; width?: number; height?: number; alt?: string | null };

/** The photo every share card falls back to: Kilimanjaro over the savannah. */
const DEFAULT_IMAGE: Img | undefined = photo("hero-combos") as Photo | undefined;

/**
 * A page's metadata with what search engines and share cards need, all pointing at this page:
 *  - a canonical address, so old WordPress addresses, trailing slashes and tracking codes count as this page;
 *  - Open Graph (WhatsApp, Facebook, LinkedIn) and Twitter/X cards with the page's own title, description, address and
 *    a large photo, instead of the home page's.
 * `title` is the page's own title; the layout adds " · TWA" to the <title>, and the share card uses the full name.
 */
export function withSeo(path: string, meta: Metadata & { title?: string; description?: string }, image?: Img | null): Metadata {
  const title = typeof meta.title === "string" ? meta.title : undefined;
  const description = meta.description ?? site.description;
  const img = image ?? DEFAULT_IMAGE;
  const images = img ? [{ url: img.src, width: img.width, height: img.height, alt: img.alt ?? title ?? site.name }] : undefined;
  const shareTitle = title ? `${title} · ${site.name}` : site.name;
  return {
    ...meta,
    description,
    alternates: { ...meta.alternates, canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: site.name,
      locale: "en_GB",
      type: "website",
      images,
      ...meta.openGraph,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: shareTitle, description, images: images?.map((i) => i.url) },
  };
}
