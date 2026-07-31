/**
 * What this company sells, as a list.
 *
 * The homepage used to open on an altitude chart. That chart is a good answer
 * to "which Kilimanjaro route should I pick" — but it is the wrong opening
 * question, because a visitor who has just landed does not yet know they want
 * Kilimanjaro at all. Half the catalogue (safari, Zanzibar, combos, day trips)
 * was invisible above the fold.
 *
 * So the front door is now this: five things you can buy, each with a picture,
 * a price floor and a count. The chart moves to the route pages, where someone
 * comparing Lemosho against Marangu is actually asking the question it answers.
 *
 * `from` is the cheapest real published rate in that category — never a
 * placeholder. Where a category has no confirmed rate it stays null and the
 * card says so.
 */

export type Service = {
  slug: string;
  title: string;
  href: string;
  imageKey: string;
  excerpt: string;
  /** Cheapest confirmed per-person rate in this category, or null. */
  from: number | null;
  /** How many bookable things sit behind this card. */
  count: string;
  meta: { k: string; v: string }[];
};

export const services: Service[] = [
  {
    slug: "trekking",
    title: "Kilimanjaro & Meru",
    href: "/kilimanjaro",
    imageKey: "hero-kilimanjaro",
    excerpt:
      "Five routes up Africa's highest mountain, plus Mount Meru as a warm-up. The route you pick decides whether you summit — so we publish the profile of each one.",
    from: 980,
    count: "6 routes",
    meta: [
      { k: "Length", v: "4 to 9 days" },
      { k: "Summit", v: "5,895 m" },
      { k: "Best months", v: "Jan–Mar, Jun–Oct" },
    ],
  },
  {
    slug: "safari",
    title: "Northern circuit safari",
    href: "/safaris",
    imageKey: "hero-safaris",
    excerpt:
      "Serengeti, Ngorongoro, Tarangire and Manyara in a private or shared 4x4. Built around where the herds actually are in the month you travel.",
    from: 1800,
    count: "3 itineraries · 10 parks",
    meta: [
      { k: "Length", v: "5 to 7 days" },
      { k: "Vehicle", v: "4x4, open roof" },
      { k: "Best months", v: "Jun–Oct" },
    ],
  },
  {
    slug: "zanzibar",
    title: "Zanzibar",
    href: "/zanzibar",
    imageKey: "hero-zanzibar",
    excerpt:
      "Stone Town, the spice farms, Jozani Forest and the Mnemba reef. Two nights if you only want the history, a week if you want to stop moving.",
    from: null,
    count: "6 packages",
    meta: [
      { k: "Length", v: "2 to 8 days" },
      { k: "Base", v: "Stone Town or the coast" },
      { k: "Best months", v: "Jun–Oct, Jan–Feb" },
    ],
  },
  {
    slug: "combos",
    title: "Combo trips",
    href: "/combos",
    imageKey: "hero-combos",
    excerpt:
      "Climb it, then drive it, then lie down. You have flown a long way — doing one of the three is a waste of the airfare, and the mountain has to come first.",
    from: 3378,
    count: "5 combinations",
    meta: [
      { k: "Length", v: "10 to 15 days" },
      { k: "Legs", v: "Climb, safari, beach" },
      { k: "Best months", v: "Jun–Oct, Dec–Feb" },
    ],
  },
  {
    slug: "day-trips",
    title: "Day trips from Moshi",
    href: "/day-trips",
    imageKey: "hero-daytrips",
    excerpt:
      "Waterfalls, hot springs, coffee farms and a day on the mountain. You will have spare days around a climb whether you plan them or not.",
    from: 60,
    count: "10 trips",
    meta: [
      { k: "Length", v: "6 to 12 hours" },
      { k: "From", v: "Moshi or Arusha" },
      { k: "Priced", v: "Per vehicle, tiered" },
    ],
  },
];

/**
 * Group departures are the best-selling product, so they are deliberately NOT
 * one of the five above — they get their own band directly under the hero on
 * the homepage rather than competing for attention inside a grid.
 */
export const departuresService = {
  title: "Join a group departure",
  href: "/departures",
  excerpt:
    "Fixed dates for solo climbers and pairs, below the private-climb price. Every date carries a real price and a real seat count.",
};
