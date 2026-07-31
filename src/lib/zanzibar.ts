/**
 * Zanzibar.
 *
 * The operator sells six Zanzibar packages and this rebuild carried none of
 * them, despite the strapline promising Zanzibar on every page. Names, lengths
 * and itinerary outlines below are theirs, from the Zanzibar Beach Holiday
 * page and the three package pages (30 July 2026).
 *
 * ⚠️ PRICES. The live site shows "From $2,000" against the 2-day Stone Town
 * package and nothing at all against the other five. $2,000 is the CMS
 * placeholder that also appears on a day trip, a Meru climb and a 10-day
 * combo — it is not a Zanzibar rate. No price is published here until the
 * operator supplies a real rate card; every package reads "on request".
 */

export type ZanzibarPackage = {
  slug: string;
  name: string;
  days: number;
  nights: number;
  base: string;
  summary: string;
  highlights: string[];
  price: number | null;
  photoKey: string;
};

export const zanzibarPackages: ZanzibarPackage[] = [
  {
    slug: "stone-town-exploration",
    name: "Stone Town Exploration",
    days: 2,
    nights: 1,
    base: "Stone Town",
    price: null,
    summary:
      "The shortest way to see the island's history properly — a night in Stone Town and a full day walking it.",
    photoKey: "zanzibar-stonetown",
    highlights: [
      "The Old Fort and the House of Wonders",
      "Freddie Mercury's birthplace and the Hamamni Persian Baths",
      "Forodhani night market at sunset",
    ],
  },
  {
    slug: "stone-town-spice-prison-island",
    name: "Stone Town, Spice Tour & Prison Island",
    days: 3,
    nights: 2,
    base: "Stone Town",
    price: null,
    summary:
      "Culture, spice farms and the giant tortoises on Changuu — the standard three days, and the one most people should book.",
    photoKey: "zanzibar-spice",
    highlights: [
      "Guided Stone Town walk, a UNESCO World Heritage Site",
      "Spice plantation: cloves, cinnamon and nutmeg, tasted off the tree",
      "Prison Island and its Aldabra giant tortoises",
    ],
  },
  {
    slug: "jozani-forest",
    name: "Exploration and Relaxation: Jozani Forest",
    days: 4,
    nights: 3,
    base: "Stone Town and the east coast",
    price: null,
    summary:
      "Three nights, with a day given over to Jozani and the red colobus — the only place in the world they live.",
    photoKey: "zanzibar-jozani",
    highlights: [
      "Jozani Forest Reserve and the Zanzibar red colobus",
      "The mangrove boardwalk",
      "Beach time on the east coast",
    ],
  },
  {
    slug: "mnemba-snorkeling",
    name: "Zanzibar Escape: Snorkelling at Mnemba",
    days: 5,
    nights: 4,
    base: "Northeast coast",
    price: null,
    summary:
      "The secluded northeast coast, built around a day on the Mnemba atoll reef.",
    photoKey: "zanzibar-mnemba",
    highlights: [
      "Mnemba Atoll snorkelling — the island's best reef",
      "Dolphin spotting, conditions allowing",
      "Zanzibar Queen Hotel or similar",
    ],
  },
  {
    slug: "matemwe-coast-stone-town",
    name: "Zanzibar Escape: Matemwe Coast & Stone Town",
    days: 5,
    nights: 4,
    base: "Matemwe and Stone Town",
    price: null,
    summary:
      "Matemwe for the beach and the reef, then back into Stone Town for the history. The best-balanced of the five-day options.",
    photoKey: "zanzibar-matemwe",
    highlights: [
      "Matemwe's reef-protected shallows",
      "A Stone Town night at the end, not the start",
      "Private transfers throughout",
    ],
  },
  {
    slug: "emerald-luxury",
    name: "Luxury at Emerald Zanzibar Resort & Spa",
    days: 8,
    nights: 7,
    base: "Matemwe",
    price: null,
    summary:
      "A week at one beach, all-inclusive, on one of the better stretches of sand on the island. For after a climb, when you want to stop moving.",
    photoKey: "zanzibar-emerald",
    highlights: [
      "Emerald Zanzibar Resort & Spa, all-inclusive",
      "Seven nights, one unpacking",
      "Excursions bookable on the day, not pre-committed",
    ],
  },
];

/** Attractions the operator names across the Zanzibar pages. */
export const zanzibarAttractions = [
  {
    name: "Stone Town",
    note: "A UNESCO World Heritage Site. Arab, Indian and European architecture down alleys too narrow for cars — the Old Fort, the House of Wonders, the old slave market.",
  },
  {
    name: "Nungwi and Kendwa",
    note: "The north-west beaches, and the only ones where the tide does not walk out half a kilometre. Snorkelling, diving and sunset dhow cruises.",
  },
  {
    name: "Jozani Forest Reserve",
    note: "Home of the Zanzibar red colobus, which lives nowhere else on earth. Mangrove boardwalk and a short guided forest walk.",
  },
  {
    name: "The spice farms",
    note: "Cloves, cinnamon, nutmeg and vanilla, picked and crushed in your hand. The reason the island was worth fighting over.",
  },
  {
    name: "Mnemba Atoll",
    note: "The best reef in reach of a day boat. Coral in good condition, turtles and reef fish in numbers.",
  },
];

/**
 * When to go, in the operator's own framing — reproduced because it is
 * accurate and most operators fudge the rainy season.
 */
export const zanzibarSeasons = [
  {
    label: "June to October",
    kind: "Peak",
    note: "Warm, dry, and it lines up with peak safari season on the mainland. Clear skies and calm seas. Book early.",
  },
  {
    label: "January to February",
    kind: "Short dry",
    note: "Hotter, but sunny and clear — the best window for snorkelling and diving, with fewer people than mid-year.",
  },
  {
    label: "November to December",
    kind: "Short rains",
    note: "Showers, usually late afternoon and brief. Fewer crowds and lower rates; beach days still work.",
  },
  {
    label: "March to May",
    kind: "Long rains",
    note: "Heavy rain and high humidity. Some lodges close. Cheapest time to come, and we will tell you honestly whether it is worth it.",
  },
];
