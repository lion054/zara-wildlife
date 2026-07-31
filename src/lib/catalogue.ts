import { routes } from "@/lib/routes";
import { safaris, dayTrips, departures } from "@/lib/trips";
import { combos } from "@/lib/combos";
import { zanzibarPackages } from "@/lib/zanzibar";
import { site } from "@/lib/site";
import { dayTripRates } from "@/lib/format";

/**
 * The catalogue — the only thing the assistant is allowed to know.
 *
 * This is the load-bearing decision behind both TWA and the planner's AI
 * suggestions. A travel chatbot's failure mode is not being unhelpful; it is
 * quoting $1,800 for a climb that costs $2,250, or inventing a departure date
 * that does not exist. On a site whose entire argument is "every price here is
 * real and every seat count is the actual one", a model that improvises a
 * number does more damage than no assistant at all.
 *
 * So the model gets no prices in its prompt. It gets TOOLS, and every one of
 * them reads the same `src/lib` dataset the pages render from. If a figure
 * appears in a chat bubble it came out of this file, which means it matches
 * the page the reader lands on. The unverified flags travel with it, so the
 * assistant repeats "rate sheet to confirm" exactly where the pages do.
 *
 * Everything here is a pure read. Nothing in this file can book, charge, or
 * mutate anything.
 */

/* ------------------------------------------------------------------ *
 * Shapes returned to the model — deliberately compact
 * ------------------------------------------------------------------ */

type Money = { usd: number; verified: boolean };

const money = (usd: number, verified = true): Money => ({ usd, verified });

/* ------------------------------------------------------------------ *
 * 1. Search
 * ------------------------------------------------------------------ */

export type CatalogueKind = "climb" | "safari" | "combination" | "beach" | "day-trip";

/**
 * Everything sellable, in one flat list the model can filter.
 *
 * `priceFrom` is null wherever the operator publishes no rate — Zanzibar, and
 * the two day trips with no ladder. Null means "we quote this", never zero,
 * and the model is told to say so rather than guess.
 */
export function searchCatalogue(args: {
  kind?: CatalogueKind;
  maxPricePerPerson?: number;
  minDays?: number;
  maxDays?: number;
}) {
  const all = [
    ...routes.map((r) => ({
      kind: "climb" as const,
      slug: r.slug,
      name: `${r.name} Route`,
      url: `/kilimanjaro/${r.slug}`,
      days: r.days,
      priceFrom: money(r.price, r.priceVerified),
      summary: r.strapline,
      detail: {
        mountain: r.mountain,
        difficulty: r.difficulty,
        summitRatePct: r.successRate,
        summitRateIsOperatorOwn: r.successVerified,
        traffic: r.traffic,
        sceneryOutOf5: r.scenery,
        bestFor: r.bestFor,
      },
    })),
    ...safaris.map((s) => ({
      kind: "safari" as const,
      slug: s.slug,
      name: s.name,
      url: `/safaris/${s.slug}`,
      days: s.days,
      priceFrom: money(s.price),
      summary: s.summary,
      detail: { style: s.style, parks: s.parks, nights: s.nights },
    })),
    ...combos.map((c) => ({
      kind: "combination" as const,
      slug: c.slug,
      name: c.name,
      url: `/combos/${c.slug}`,
      days: c.days,
      priceFrom: c.price == null ? null : money(c.price),
      summary: c.summary,
      detail: { legs: c.legs },
    })),
    ...zanzibarPackages.map((z) => ({
      kind: "beach" as const,
      slug: z.slug,
      name: z.name,
      url: `/zanzibar/${z.slug}`,
      days: z.days,
      /* Deliberately null. Zanzibar is quoted, never listed — see the note on
         the Zanzibar pages. The model must not fill this in. */
      priceFrom: null,
      summary: z.summary,
      detail: { base: z.base, nights: z.nights },
    })),
    ...dayTrips.map((t) => {
      const r = dayTripRates(t);
      return {
        kind: "day-trip" as const,
        slug: t.slug,
        name: t.name,
        url: `/day-trips/${t.slug}`,
        days: 1,
        priceFrom: r.onRequest || r.best == null ? null : money(r.best, t.priceVerified),
        summary: t.summary,
        detail: { hours: t.hours, departsFrom: t.from },
      };
    }),
  ];

  return all.filter((item) => {
    if (args.kind && item.kind !== args.kind) return false;
    if (args.minDays != null && item.days < args.minDays) return false;
    if (args.maxDays != null && item.days > args.maxDays) return false;
    if (args.maxPricePerPerson != null) {
      /* An unpriced item is never filtered out by a budget — we do not know
         what it costs, so we cannot claim it is over or under. */
      if (item.priceFrom != null && item.priceFrom.usd > args.maxPricePerPerson) return false;
    }
    return true;
  });
}

/* ------------------------------------------------------------------ *
 * 2. One product, in full
 * ------------------------------------------------------------------ */

export function getProduct(kind: CatalogueKind, slug: string) {
  switch (kind) {
    case "climb": {
      const r = routes.find((x) => x.slug === slug);
      if (!r) return { found: false as const };
      return {
        found: true as const,
        name: `${r.name} Route`,
        url: `/kilimanjaro/${r.slug}`,
        days: r.days,
        summit: `${r.summit}, ${r.summitAltitude} m`,
        difficulty: r.difficulty,
        summitRatePct: r.successRate,
        summitRateIsOperatorOwn: r.successVerified,
        traffic: r.traffic,
        summary: r.summary,
        character: r.character,
        bestFor: r.bestFor,
        priceFrom: money(r.price, r.priceVerified),
        partySizeLadder: r.groupPricing,
        itinerary: r.itinerary.map((d) => ({
          day: d.day,
          from: d.from,
          to: d.to,
          altitudeM: d.altitude,
          hours: d.hours,
        })),
      };
    }
    case "safari": {
      const s = safaris.find((x) => x.slug === slug);
      if (!s) return { found: false as const };
      return {
        found: true as const,
        name: s.name,
        url: `/safaris/${s.slug}`,
        days: s.days,
        nights: s.nights,
        style: s.style,
        parks: s.parks,
        summary: s.summary,
        priceFrom: money(s.price),
      };
    }
    case "combination": {
      const c = combos.find((x) => x.slug === slug);
      if (!c) return { found: false as const };
      return {
        found: true as const,
        name: c.name,
        url: `/combos/${c.slug}`,
        days: c.days,
        legs: c.legs,
        summary: c.summary,
        priceFrom: c.price == null ? null : money(c.price),
        quotedNotListed: c.price == null,
      };
    }
    case "beach": {
      const z = zanzibarPackages.find((x) => x.slug === slug);
      if (!z) return { found: false as const };
      return {
        found: true as const,
        name: z.name,
        url: `/zanzibar/${z.slug}`,
        days: z.days,
        nights: z.nights,
        base: z.base,
        highlights: z.highlights,
        summary: z.summary,
        priceFrom: null,
        quotedNotListed: true,
        whyQuoted:
          "The price moves with hotel standard and season by more than an honest 'from' figure would survive.",
      };
    }
    case "day-trip": {
      const t = dayTrips.find((x) => x.slug === slug);
      if (!t) return { found: false as const };
      const r = dayTripRates(t);
      return {
        found: true as const,
        name: t.name,
        url: `/day-trips/${t.slug}`,
        hours: t.hours,
        departsFrom: t.from,
        summary: t.summary,
        priceFrom: r.onRequest || r.best == null ? null : money(r.best, t.priceVerified),
        quotedNotListed: r.onRequest,
        rateLadder: r.tiers,
      };
    }
  }
}

/* ------------------------------------------------------------------ *
 * 3. Dated departures, with the seat count that is actually left
 * ------------------------------------------------------------------ */

export function openDepartures(args: { routeSlug?: string } = {}) {
  return departures
    .filter((d) => (args.routeSlug ? d.routeSlug === args.routeSlug : true))
    .map((d) => {
      const r = routes.find((x) => x.slug === d.routeSlug);
      const left = d.capacity - d.booked;
      return {
        id: d.id,
        url: `/departures#${d.id}`,
        route: r ? `${r.name} Route` : d.routeSlug,
        routeSlug: d.routeSlug,
        days: r?.days ?? null,
        start: d.start,
        end: d.end,
        pricePerPerson: money(d.price),
        seatsLeft: left,
        capacity: d.capacity,
        soldOut: left <= 0,
      };
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

/* ------------------------------------------------------------------ *
 * 4. Price a trip, using the party-size ladder
 * ------------------------------------------------------------------ */

const climbRate = (slug: string, people: number) => {
  const r = routes.find((x) => x.slug === slug);
  if (!r) return null;
  let best: { min: number; price: number } | null = null;
  for (const tier of r.groupPricing) {
    const min = parseInt(tier.size, 10);
    if (Number.isFinite(min) && min <= people && (!best || min > best.min)) {
      best = { min, price: tier.price };
    }
  }
  return best ? best.price : r.price;
};

const dayRate = (slug: string, people: number) => {
  const t = dayTrips.find((x) => x.slug === slug);
  if (!t || !t.tiers.length) return null;
  let best: { min: number; price: number } | null = null;
  for (const tier of t.tiers) {
    const min = parseInt(tier.size, 10);
    if (Number.isFinite(min) && min <= people && (!best || min > best.min)) {
      best = { min, price: tier.price };
    }
  }
  return best ? best.price : t.price;
};

/**
 * The same arithmetic the planner's basket does, exposed to the model.
 *
 * The model is not allowed to add up prices itself — party size moves the
 * per-head rate on climbs and day trips, and a model doing mental arithmetic
 * over a ladder is exactly where a wrong quote comes from.
 */
export function priceTrip(args: {
  climbSlug?: string;
  safariSlug?: string;
  comboSlug?: string;
  dayTripSlugs?: string[];
  people: number;
}) {
  const people = Math.min(16, Math.max(1, Math.round(args.people || 1)));
  const lines: { name: string; kind: string; perPerson: number }[] = [];
  const notes: string[] = [];

  if (args.comboSlug) {
    const c = combos.find((x) => x.slug === args.comboSlug);
    if (c?.price != null) lines.push({ name: c.name, kind: "Combination", perPerson: c.price });
    else if (c) notes.push(`${c.name} includes a Zanzibar leg, which we quote rather than list.`);
  } else {
    if (args.climbSlug) {
      const rate = climbRate(args.climbSlug, people);
      const r = routes.find((x) => x.slug === args.climbSlug);
      if (rate != null && r) lines.push({ name: `${r.name} Route`, kind: "Climb", perPerson: rate });
    }
    if (args.safariSlug) {
      const s = safaris.find((x) => x.slug === args.safariSlug);
      if (s) lines.push({ name: s.name, kind: "Safari", perPerson: s.price });
    }
  }

  for (const slug of args.dayTripSlugs ?? []) {
    const rate = dayRate(slug, people);
    const t = dayTrips.find((x) => x.slug === slug);
    if (rate != null && t) lines.push({ name: t.name, kind: "Day trip", perPerson: rate });
    else if (t) notes.push(`${t.name} has no published rate card, so we quote it to your group.`);
  }

  const perPerson = lines.reduce((sum, l) => sum + l.perPerson, 0);
  const total = perPerson * people;
  return {
    people,
    lines,
    perPerson,
    total,
    depositDue: Math.round(total * 0.3),
    balanceDue: total - Math.round(total * 0.3),
    terms: "30% deposit confirms. Balance due 45 days before arrival.",
    notes,
    plannerUrl: "/plan",
  };
}

/* ------------------------------------------------------------------ *
 * 5. The operator itself
 * ------------------------------------------------------------------ */

export function operatorFacts() {
  return {
    name: site.name,
    basedIn: "Moshi, Kilimanjaro Region, Tanzania",
    operatingSince: site.established,
    phone: site.contact.phone,
    whatsapp: site.whatsappUrl,
    email: site.contact.email,
    languages: site.languages,
    reviews: {
      platform: site.reviews.platform,
      rating: site.reviews.rating,
      count: site.reviews.count,
      url: site.reviews.url,
    },
    baseHotel: `${site.baseHotel.name}, ${site.baseHotel.town}${site.baseHotel.orSimilar ? " or similar" : ""} — two nights included in every climb price`,
    deposit: "30% confirms a booking; balance due 45 days before arrival.",
  };
}
