import planner from "@/data/planner.json";

/**
 * What the trip planner offers to add: safaris and day trips, written by the
 * Tanova sync (scripts/sync-tanova.mjs) into a small file of their own. Never
 * typed in here: change a tour or its price in Tanova and the next sync carries it.
 *
 * Group departures do not live here. Their dates and seats are read live from
 * Tanova (src/lib/departures.ts).
 */
export const safaris: { slug: string; name: string; price: number; days: number }[] = planner.safaris;

export const dayTrips: {
  slug: string;
  name: string;
  price: number;
  /** Price ladder rows: a trip without one is "ask for a price". */
  tiers: { size: string; price: number | null }[];
}[] = planner.dayTrips;
