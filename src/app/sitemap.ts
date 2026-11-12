import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";
import { tourPath, tours } from "@/lib/tours";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = [
    "/", "/about", "/contact", "/plan", "/kilimanjaro", "/departures", "/safaris", "/combos", "/day-trips",
    "/zanzibar", "/halal-tours", "/faqs/kilimanjaro", "/faqs/safari", "/privacy-policy", "/tipping-policy", "/terms",
  ];
  const paths = [
    ...fixed,
    ...routes.map((r) => `/kilimanjaro/${r.slug}`),
    ...tours.map((t) => tourPath(t)),
    ...(await getPosts()).map((p) => `/blog/${p.slug}`),
  ];
  return paths.map((p) => ({ url: `${site.url}${p}` }));
}
