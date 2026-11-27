export const site = {
  name: "Tanzania Wildlife Adventures",
  short: "TWA",
  tagline: "Kilimanjaro, the northern circuit, and Zanzibar. Booked online, not by email.",
  description:
    "Kilimanjaro on five routes, Mount Meru, northern circuit safaris, Zanzibar and day trips from Moshi. Real prices, real seats, booked and paid for online.",
  url: "https://tanzaniawildlifeadventures.com",
  established: 2020,
  contact: {
    email: "sales@tanzaniawildlifeadventures.com",
    phone: "+255 742 068 122",
    whatsapp: "+255 742 068 122",
    address: "Moshi Town, Kilimanjaro Region, Tanzania",
  },
  reviews: {
    /* Already earned and currently buried at the bottom of the homepage. */
    platform: "TripAdvisor",
    count: 53,
    rating: 5,
    verified: true,
    url: "https://www.tripadvisor.com/Attraction_Review-g297913-d21007697-Reviews-Tanzania_Wildlife_Adventures_Arusha-Arusha_Arusha_Region.html",
  },
  social: [
    { name: "Facebook", url: "https://www.facebook.com/TanzaniaWildlifeAdventures" },
    { name: "Instagram", url: "https://www.instagram.com/tanzaniawildlifeadventures/" },
  ],
  whatsappUrl:
    "https://wa.me/255742068122?text=Hello%20I%20am%20interested%20in%20a%20Tanzania%20tour",
  /**
   * The pre- and post-climb hotel named in every itinerary on the live site.
   * Two nights are included in every climb price — one before, one after.
   */
  baseHotel: {
    name: "Sal Salinero Hotel",
    town: "Moshi",
    note: "Pool, garden, bar and restaurant. Briefing happens here the evening before you walk in.",
    orSimilar: true,
  },
  /**
   * Memberships shown on the previous site as five logos under the heading
   * "Members of the Top Tourism and Sustainable Association". Names are read
   * from the logo artwork; the site itself names none of them.
   */
  members: [
    { name: "ATTA", full: "African Travel & Tourism Association", logo: "/brand/members/atta.png", w: 282, h: 177 },
    { name: "TATO", full: "Tanzania Association of Tour Operators", logo: "/brand/members/tatologo.png", w: 300, h: 196 },
    { name: "ASTA", full: "ASTA", logo: "/brand/members/asta.png", w: 250, h: 251 },
    { name: "APTA", full: "Association for the Promotion of Tourism to Africa", logo: "/brand/members/apta.png", w: 133, h: 59 },
    { name: "MKPS", full: "Mount Kilimanjaro Porters Society", logo: "/brand/members/mkps1.png", w: 300, h: 300 },
  ],
  payment: { logo: "/brand/members/payment-01.png", w: 1024, h: 201 },
  /** Online payment page. Supplied by the backend; the Pay online links hide while it is empty. */
  payments: { url: process.env.NEXT_PUBLIC_PAYMENTS_URL ?? "", provider: "Pesapal" },
  languages: ["English", "French", "German", "Spanish"],
  /**
   * The operator's real brand assets, taken from their live site
   * (30 July 2026) rather than invented.
   *
   * `green` is sampled pixel-for-pixel off the logo artwork; the rest are
   * lifted from their stylesheet. See globals.css for how these map onto
   * design tokens — and for why the lime is a fill colour that never carries
   * white text.
   */
  brand: {
    logo: "/brand/logo.png",
    favicon: "/brand/favicon-192.png",
    green: "#9dab1f",       /* the logo itself */
    greenBright: "#acc31c", /* their lighter lime */
    forest: "#0a7024",      /* their deep green — the text-safe one */
    orange: "#fd8311",
    cyan: "#01b2e0",
    navy: "#020a2c",
    navyAccent: "#132056",
    slate: "#313d4d",
  },
  sisterBrands: [
    {
      name: "Tanzania Wild Camps",
      role: "Nine lodges and tented camps we book you into",
      url: "https://tanzaniawildcamps.com",
    },
    {
      name: "ZARA Tanzania Charity",
      role: "Community and conservation work you can visit",
      url: "https://zaratanzaniacharity.org",
    },
  ],
} as const;

/**
 * Main navigation.
 *
 * Top-level names and grouping follow the operator's own live menu — Safari,
 * Trekking, Combo Safari, Day Trips, Zanzibar — because that is the vocabulary
 * their returning visitors and their SEO already use. "Kilimanjaro" as a
 * top-level item was ours, and nobody was searching for it.
 *
 * Their Blog is not carried: this rebuild has no posts, and a menu item
 * leading to an empty archive is worse than one less item.
 *
 * Children are real destinations on this site, not the anchor links into a
 * single long page that the live menu uses.
 */
export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; note?: string }[];
  /** A photo card shown beside the links in the desktop mega menu. */
  featured?: { title: string; note: string; href: string; imageKey: string; cta: string };
};

/* Only the two product lines with enough to show get a menu. The rest are
   single links: a dropdown holding one item that repeats its parent is noise,
   and every extra panel is another thing a keyboard user has to tab through. */
export const nav: NavItem[] = [
  {
    label: "Safari",
    href: "/safaris",
    children: [
      { label: "Safari packages", href: "/safaris", note: "Seven itineraries, day by day" },
      { label: "Destinations", href: "/safaris#parks", note: "Ten parks, three circuits" },
      { label: "Experiences", href: "/safaris#experiences", note: "Balloon, walking, birding" },
      { label: "Safari FAQs", href: "/faqs/safari", note: "Before you book" },
    ],
    featured: {
      title: "Serengeti Wildebeest Migration",
      note: "Seven days, built around where the herds are.",
      href: "/safaris/serengeti-wildebeest-migration",
      imageKey: "hero-safaris",
      cta: "See the itinerary",
    },
  },
  {
    label: "Trekking",
    href: "/kilimanjaro",
    children: [
      { label: "Climbing Kilimanjaro", href: "/kilimanjaro", note: "Every route compared" },
      { label: "Kilimanjaro packages", href: "/kilimanjaro#packages", note: "Fourteen itineraries and prices" },
      { label: "Group departures", href: "/departures", note: "Fixed dates, shared crew" },
      { label: "Mount Meru", href: "/kilimanjaro/packages/mount-meru-4", note: "The best warm-up" },
      { label: "Kilimanjaro FAQs", href: "/faqs/kilimanjaro", note: "Before you book" },
      { label: "Plan my climb", href: "/plan", note: "Build and price your trip" },
    ],
    featured: {
      title: "Join a group climb",
      note: "Fixed dates below the private price, with a live seat count.",
      href: "/departures",
      imageKey: "hero-departures",
      cta: "See the calendar",
    },
  },
  // Group climbs are the main thing to sell: a top-level link, not only an entry inside Trekking.
  { label: "Group climbs", href: "/departures" },
  { label: "Combo", href: "/combos" },
  { label: "Day trips", href: "/day-trips" },
  { label: "Zanzibar", href: "/zanzibar" },
  { label: "Halal Tours", href: "/halal-tours" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * The operator states a crew of "+40 highly skilled Kilimanjaro and Meru
 * guides" on the Mount Meru page. Only the guides guests name in their own
 * TripAdvisor reviews are listed individually below.
 */
export const crewSize = 40;

/** Guides guests already name in their TripAdvisor reviews. Put them on the site. */
export const guides = [
  { name: "Patrick", role: "Operations, Moshi office", years: 12, languages: "English, Swahili" },
  { name: "Yusuph", role: "Kilimanjaro lead guide", years: 14, languages: "English, Swahili" },
  { name: "Rafael", role: "Safari guide", years: 9, languages: "English, French, Swahili" },
  { name: "Mansoul", role: "Safari guide", years: 11, languages: "English, Swahili" },
  { name: "Patmos", role: "Safari guide", years: 8, languages: "English, Swahili" },
  { name: "Kihori", role: "Safari guide", years: 15, languages: "English, Swahili" },
  { name: "Mustapha", role: "Safari guide, cultural specialist", years: 10, languages: "English, Swahili, Maa" },
  { name: "Baraka", role: "Safari guide", years: 7, languages: "English, Swahili" },
  { name: "Jason", role: "Safari guide", years: 13, languages: "English, Swahili" },
];
