/**
 * Navigation.
 *
 * Plain words, parallel shape: Climb / Safari / Climb & Safari / Beach. Four
 * labels that read as one family so the eye groups them without effort, and
 * short enough that seven items and a CTA sit comfortably on a 1200px laptop.
 * Everything the operator sells is one of those four things; "Tours" holds the
 * shorter and scheduled products.
 *
 * Every dropdown line carries a number — a count, a price or a duration. A
 * label gives a visitor nothing to act on; a figure does. All of them are
 * computed from the dataset rather than typed, so they cannot drift away from
 * the pages they describe.
 *
 * SEO is unaffected: no URL differs from the static build, and "Climbing
 * Kilimanjaro", "Tanzania Safari", "Tanzania Combo Tours" and "Zanzibar Beach
 * Holidays" all remain in the page titles and H1s, which is where search reads
 * them.
 */

import { routes } from "./routes";
import { safaris, departures, dayTrips } from "./trips";
import { combos } from "./combos";
import { zanzibarPackages } from "./zanzibar";
import { parks } from "./parks";
import { halalConfidence } from "./halal";

const lowest = (values: readonly (number | null | undefined)[]) =>
  Math.min(...values.filter((v): v is number => typeof v === "number"));

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

const openDates = departures.filter((d) => d.capacity > d.booked).length;
const soldOut = departures.filter((d) => d.capacity <= d.booked).length;
const ratedDayTrips = dayTrips.filter((t) => t.tiers.length > 0);

export type NavChild = { label: string; href: string; note: string };
export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
  /** Closing row of the panel — the next step for THAT decision, not one generic line. */
  foot?: NavChild;
};

export const nav: NavItem[] = [
  {
    label: "Climb",
    href: "/kilimanjaro",
    foot: {
      label: "Not sure which route? Compare all six",
      href: "/kilimanjaro",
      note: "Summit rate, days and price in one table",
    },
    children: [
      {
        label: "Compare all six routes",
        href: "/kilimanjaro",
        note: `Days, summit rate and price, from ${money(lowest(routes.map((r) => r.price)))}`,
      },
      {
        label: "Group departures",
        href: "/departures",
        note: `${openDates} dates with seats left, from ${money(lowest(departures.map((d) => d.price)))}`,
      },
      {
        label: "Mount Meru",
        href: "/kilimanjaro/mount-meru-4-day",
        note: "4 days — the best acclimatisation there is",
      },
      { label: "Day hikes from Moshi", href: "/day-trips", note: "Acclimatisation days before you climb" },
      { label: "Which route suits me?", href: "/kilimanjaro#faqs", note: "The 12 questions we are asked most" },
    ],
  },
  {
    label: "Safari",
    href: "/safaris",
    foot: {
      label: "Not sure when to come? Read the months",
      href: "/destinations",
      note: "Migration timing and calving, park by park",
    },
    children: [
      {
        label: "All safaris, fully priced",
        href: "/safaris",
        note: `${safaris.length} itineraries from ${money(lowest(safaris.map((s) => s.price)))}, all in`,
      },
      { label: "Where you actually go", href: "/destinations", note: `${parks.length} parks, and when each is best` },
      {
        label: "Add a balloon or a walking safari",
        href: "/safaris#experiences",
        note: "Balloon, walking safari, night drive",
      },
      { label: "Short safaris from Moshi", href: "/day-trips", note: "Arusha, Tarangire and Mkomazi in a day" },
      { label: "Safari questions", href: "/safaris#faqs", note: "Including what we cannot promise" },
    ],
  },
  {
    label: "Climb & Safari",
    href: "/combos",
    foot: {
      label: "Build your own instead",
      href: "/plan",
      note: "Pick a climb and a safari and see the total",
    },
    children: [
      {
        label: "Mountain, parks and beach",
        href: "/combos",
        note: `${combos.length} ways to combine them, from ${money(lowest(combos.map((c) => c.price)))}`,
      },
      { label: "How a combined trip works", href: "/combos#faq", note: "One booking, one deposit, one operator" },
    ],
  },
  {
    /**
     * "Beach Vibes" is the operator's own voice. Zanzibar is a destination brand
     * in its own right — 917,000 visitors a year — so a visitor scanning the bar
     * for that word will not find it. The first line of the panel leads with it,
     * which recovers the scan without changing the label.
     */
    label: "Beach Vibes",
    href: "/zanzibar",
    foot: {
      label: "Add the beach to a climb or safari",
      href: "/combos",
      note: "Five combinations, one booking, one deposit",
    },
    children: [
      {
        label: "Zanzibar beach holidays",
        href: "/zanzibar",
        note: `${zanzibarPackages.length} packages, two nights to a week`,
      },
      { label: "Best months to come", href: "/zanzibar#seasons", note: "Including the months we would avoid" },
    ],
  },
  {
    /**
     * Halal is not a fifth destination — it is a way of travelling that spans
     * the four above it. It sits top-level anyway because the people who need
     * it search for that word specifically, and a cross-cutting page buried as
     * the fourth child of a dropdown is a page they will never find.
     */
    label: "Halal",
    href: "/halal",
    children: [
      {
        label: "What we can confirm",
        href: "/halal",
        note: `${halalConfidence().confirmed} of ${halalConfidence().total} confirmed, the rest flagged openly`,
      },
      {
        label: "Zanzibar",
        href: "/zanzibar",
        note: "99% Muslim — halal food and prayer are the default",
      },
      {
        label: "Private climbs",
        href: "/kilimanjaro",
        note: "Your own crew, your own timing and catering",
      },
    ],
  },
  {
    label: "Tours",
    href: "/day-trips",
    foot: {
      label: "Build and price a whole trip",
      href: "/plan",
      note: "See the total and the 30% deposit first",
    },
    children: [
      {
        label: "All day trips",
        href: "/day-trips",
        note: `${dayTrips.length} trips from ${money(lowest(ratedDayTrips.map((t) => t.price)))}, priced by group`,
      },
      {
        label: "Fixed departure dates",
        href: "/departures",
        note: `${openDates} open, ${soldOut} sold out — the counts are real`,
      },
      { label: "Build and price your trip", href: "/plan", note: "See the total and deposit first" },
    ],
  },
  { label: "Why us", href: "/about" },
  /* "Contact", not "Talk to us": people scan utility navigation for the literal
     word, and warmth is not worth the half-second of hesitation. */
  { label: "Contact", href: "/contact" },
];
