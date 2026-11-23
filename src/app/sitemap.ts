import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";
import { tourPath, tours } from "@/lib/tours";

/**
 * Every public page, with when it last changed so search engines know what to fetch again: a blog post by its
 * publishing date; pages built from Tanova (tours, departures) as of this build, since every deploy pulls them fresh.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const built = new Date();
  const fixed: [string, number][] = [
    ["/", 1], ["/kilimanjaro", 0.9], ["/departures", 0.9], ["/safaris", 0.9], ["/combos", 0.8], ["/day-trips", 0.8],
    ["/zanzibar", 0.8], ["/halal-tours", 0.7], ["/plan", 0.7], ["/about", 0.6], ["/contact", 0.6],
    ["/faqs/kilimanjaro", 0.6], ["/faqs/safari", 0.6], ["/privacy-policy", 0.2], ["/tipping-policy", 0.3], ["/terms", 0.3],
  ];
  const posts = await getPosts();
  return [
    ...fixed.map(([p, priority]) => ({ url: `${site.url}${p}`, lastModified: built, priority })),
    ...routes.map((r) => ({ url: `${site.url}/kilimanjaro/${r.slug}`, lastModified: built, priority: 0.8 })),
    ...tours.map((t) => ({ url: `${site.url}${tourPath(t)}`, lastModified: built, priority: t.kind === "group" ? 0.8 : 0.7 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date ? new Date(p.date) : built, priority: 0.5 })),
  ];
}
