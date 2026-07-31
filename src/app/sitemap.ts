import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { routes } from "@/lib/routes";
import { safaris, dayTrips } from "@/lib/trips";
import { combos } from "@/lib/combos";
import { zanzibarPackages } from "@/lib/zanzibar";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (p: string, priority: number) => ({ url: `${site.url}${p}`, priority });
  return [
    at("/", 1),
    at("/kilimanjaro", 0.9),
    at("/safaris", 0.9),
    at("/plan", 0.9),
    at("/departures", 0.8),
    at("/combos", 0.8),
    at("/zanzibar", 0.8),
    at("/day-trips", 0.7),
    at("/destinations", 0.7),
    at("/halal", 0.7),
    at("/about", 0.6),
    at("/contact", 0.6),
    ...routes.map((r) => at(`/kilimanjaro/${r.slug}`, 0.8)),
    ...safaris.map((s) => at(`/safaris/${s.slug}`, 0.8)),
    ...combos.map((c) => at(`/combos/${c.slug}`, 0.7)),
    ...zanzibarPackages.map((z) => at(`/zanzibar/${z.slug}`, 0.7)),
    ...dayTrips.map((t) => at(`/day-trips/${t.slug}`, 0.6)),
  ];
}
