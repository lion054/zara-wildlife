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
    platform: "Tripadvisor",
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
   * ⚠️ The live site says only "Members of the Top Tourism and Sustainable
   * Association" — unnamed, no logo, no number. The sister lodge company
   * displays nine real accreditations. These need real membership numbers
   * before they go live; each renders with a marker until `number` is filled.
   */
  credentials: [
    { name: "TATO", full: "Tanzania Association of Tour Operators", number: "" },
    { name: "TALA", full: "Tourist Agents Licensing Authority", number: "" },
    { name: "TANAPA", full: "Tanzania National Parks Authority", number: "" },
    { name: "KPAP", full: "Kilimanjaro Porters Assistance Project", number: "" },
    { name: "TTB", full: "Tanzania Tourist Board", number: "" },
  ],
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
};

export const nav: NavItem[] = [
  {
    label: "Safari",
    href: "/safaris",
    children: [
      { label: "All safaris", href: "/safaris", note: "Three itineraries, priced" },
      { label: "Destinations", href: "/safaris#parks", note: "Ten parks, three circuits" },
      { label: "Experiences", href: "/safaris#experiences", note: "Balloon, walking, night drives" },
    ],
  },
  {
    label: "Trekking",
    href: "/kilimanjaro",
    children: [
      { label: "Climbing Kilimanjaro", href: "/kilimanjaro", note: "Five routes compared" },
      { label: "Group departures", href: "/departures", note: "Fixed dates, real seats" },
      { label: "Mount Meru", href: "/kilimanjaro/mount-meru-4-day", note: "The best warm-up" },
    ],
  },
  {
    label: "Combo Safari",
    href: "/combos",
    children: [
      { label: "Combo trips", href: "/combos", note: "Climb, safari, beach" },
      { label: "Questions", href: "/combos#faq", note: "How long, when, where you sleep" },
    ],
  },
  {
    label: "Day Trips",
    href: "/day-trips",
    children: [
      { label: "All day trips", href: "/day-trips", note: "Ten, with full price ladders" },
      { label: "Plan my trip", href: "/plan", note: "Build and price a basket" },
    ],
  },
  {
    label: "Zanzibar",
    href: "/zanzibar",
    children: [
      { label: "Beach holidays", href: "/zanzibar", note: "Two nights to a week" },
      { label: "When to come", href: "/zanzibar#seasons", note: "Including the months we would not" },
    ],
  },
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
