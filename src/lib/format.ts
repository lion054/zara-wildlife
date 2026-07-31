/**
 * Formatting and the small pieces of derived truth the pages share.
 *
 * Everything here is pure and server-safe. The rule the whole build follows:
 * a figure shown to a visitor must be derivable from `lib/`, never typed into
 * a template — which is what makes it impossible for a page to quote a price
 * the basket disagrees with.
 */

import type { Route } from "./routes";
import type { DayTrip } from "./trips";

export const money = (n: number | null | undefined) =>
  n == null ? null : `$${Number(n).toLocaleString("en-US")}`;

export const metres = (n: number) => `${n.toLocaleString("en-US")} m`;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** `2026-08-10` → `10 August 2026`. Parsed as parts, never via Date, so no timezone drift. */
export function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function dateParts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { day: String(d), month: MONTHS[m - 1].slice(0, 3), year: String(y) };
}

/** a, b and c. */
export const list = (arr: readonly string[]) =>
  arr.length <= 1 ? arr[0] ?? "" : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;

/**
 * Day-trip pricing, resolved honestly.
 *
 * The dataset's `price` is the CHEAPEST published tier — the rate an
 * eleven-person group gets. Labelling that "From $60" when a solo traveller
 * pays $120 is exactly the bait this rebuild exists to remove, so this returns
 * both ends and forces the caller to say which is which.
 *
 * Two trips carry no rate table at all. They are `onRequest` — never a price,
 * never an Add button, never $0 in a basket.
 */
export function dayTripRates(t: DayTrip) {
  const tiers = t.tiers ?? [];
  if (!tiers.length || !t.price) {
    return { onRequest: true as const, tiers: [], solo: null, best: null, single: null };
  }
  return {
    onRequest: false as const,
    tiers,
    solo: tiers[0].price,
    best: tiers[tiers.length - 1].price,
    single: tiers.length === 1 ? tiers[0].price : null,
  };
}

/**
 * Recommendation badges.
 *
 * Six routes at similar prices is how a booking is lost to hesitation — the
 * reader cannot tell which is *for them*, so they leave to think about it.
 * Both badges are computed, not asserted: highest summit rate, and lowest cost
 * per day. Nothing is labelled "most popular", because booking volumes are not
 * in this dataset and inventing one is the sort of claim this build avoids.
 */
export function routeBadges(route: Route, all: readonly Route[]) {
  const pool = all.filter((r) => r.mountain === route.mountain);
  if (pool.length < 2) return [] as { kind: "odds" | "value"; label: string; title: string }[];

  const bestOdds = pool.reduce((a, r) => (r.successRate > a.successRate ? r : a), pool[0]);
  const perDay = (r: Route) => r.price / r.days;
  const bestValue = pool.reduce((a, r) => (perDay(r) < perDay(a) ? r : a), pool[0]);

  const out: { kind: "odds" | "value"; label: string; title: string }[] = [];
  if (route.slug === bestOdds.slug) {
    out.push({
      kind: "odds",
      label: `Best odds${route.successVerified ? "" : " *"}`,
      title: `Highest summit rate of the ${pool.length} routes${route.successVerified ? "" : " — indicative figures, not yet confirmed against this operator's own records"}`,
    });
  }
  if (route.slug === bestValue.slug && route.slug !== bestOdds.slug) {
    out.push({
      kind: "value",
      label: "Best value",
      title: `Lowest cost per day on the mountain: ${money(Math.round(perDay(route)))} a day`,
    });
  }
  return out;
}

/** Total ascent, for the route facts strip. */
export function totalAscent(route: Route) {
  const it = route.itinerary;
  const gain = it.reduce((a, d, i) => {
    const prev = i === 0 ? it[0].altitude : it[i - 1].altitude;
    return a + Math.max(0, (d.high ?? d.altitude) - prev);
  }, 0);
  return Math.round(gain / 50) * 50;
}

/** The earliest sensible arrival: permits and long-haul flights need lead time. */
export const earliestArrival = () =>
  new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
