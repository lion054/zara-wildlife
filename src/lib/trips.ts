/**
 * Safaris, group departures and day trips.
 *
 * ⚠️ Prices are those published on the current live site. The group departure
 * calendar there shows a flat $2,000 on almost every date across 2026 and
 * 2027 — those are placeholders and are NOT reproduced here. Every departure
 * below carries a real price and real seat numbers, because a departure a
 * traveller cannot actually join is worse than no calendar at all.
 */

export type Safari = {
  slug: string;
  name: string;
  days: number;
  nights: number;
  price: number;
  style: string;
  parks: string[];
  summary: string;
  highlight: string;
  itinerary: { day: number; title: string; note: string; sleeps: string }[];
  photoBrief: string;
  photoKey: string;
};

export const safaris: Safari[] = [
  {
    slug: "serengeti-wildebeest-migration",
    name: "Serengeti Wildebeest Migration",
    days: 7,
    nights: 6,
    price: 2620,
    style: "Private 4x4, open roof",
    parks: ["Serengeti", "Ngorongoro", "Tarangire"],
    summary:
      "Built around where the herds actually are in your month, not a fixed loop. Six nights, three parks, and the guide picks the route each morning.",
    highlight:
      "In February you sit among the calving herds on the southern plains. In August you are at the Mara River crossings. Same trip, different mountain of animals.",
    itinerary: [
      { day: 1, title: "Arusha to Tarangire", note: "Afternoon game drive among the baobabs. Elephant density here is the highest in the north.", sleeps: "Tarangire area" },
      { day: 2, title: "Tarangire to Karatu", note: "Full morning drive, then up to the highlands for the night.", sleeps: "Highview Hotel, Karatu" },
      { day: 3, title: "Ngorongoro Crater", note: "Down at the gate for opening. Black rhino, lion and the densest game in Africa in a single caldera.", sleeps: "Ngorongoro Wild Camp" },
      { day: 4, title: "Into the Serengeti", note: "Drive north through Naabi Hill gate, game viewing all the way.", sleeps: "Serengeti camp, by season" },
      { day: 5, title: "Following the herds", note: "Full day with the migration. Route decided at breakfast based on where the herds moved overnight.", sleeps: "Serengeti camp, by season" },
      { day: 6, title: "Serengeti", note: "Second full day. Optional balloon flight at dawn.", sleeps: "Serengeti camp, by season" },
      { day: 7, title: "Fly out", note: "Morning drive, then the airstrip at Seronera and a light aircraft back to Arusha.", sleeps: "—" },
    ],
    photoBrief: "A river crossing, or calving herds — whichever the guides have. This is the trip's whole promise.",
    photoKey: "safari-migration",
  },
  {
    slug: "lion-adventure-safari",
    name: "Lion Adventure Safari",
    days: 7,
    nights: 6,
    price: 1890,
    style: "Shared 4x4, small group",
    parks: ["Serengeti", "Ngorongoro", "Manyara", "Tarangire"],
    summary:
      "Four parks in seven days at a price that works for a family. The broadest introduction to the northern circuit.",
    highlight:
      "Manyara's tree-climbing lions, the crater floor, and two full days in the Serengeti — with the driving broken up rather than done in two long hauls.",
    itinerary: [
      { day: 1, title: "Arusha to Lake Manyara", note: "Forest, hot springs and the lake shore. Flamingo in numbers when the water is right.", sleeps: "Karatu" },
      { day: 2, title: "Tarangire", note: "Baobabs and elephant. Full day.", sleeps: "Karatu" },
      { day: 3, title: "Ngorongoro Crater", note: "Early gate, full crater day, picnic lunch on the floor.", sleeps: "Karatu" },
      { day: 4, title: "To the Serengeti", note: "North across the plains, game viewing en route.", sleeps: "Serengeti" },
      { day: 5, title: "Serengeti", note: "Full day, central Serengeti.", sleeps: "Serengeti" },
      { day: 6, title: "Serengeti to Karatu", note: "Morning drive, then back south.", sleeps: "Karatu" },
      { day: 7, title: "Return to Arusha", note: "Drive out, drop at hotel or airport.", sleeps: "—" },
    ],
    photoBrief: "Tree-climbing lion at Manyara — it is in the trip name and there is no photograph of it.",
    photoKey: "safari-lion",
  },
  {
    slug: "northern-tanzania-5-day",
    name: "Northern Tanzania Safari",
    days: 5,
    nights: 4,
    price: 1800,
    style: "Seat-in-vehicle, small group",
    parks: ["Serengeti", "Ngorongoro", "Tarangire"],
    summary:
      "The short circuit. Enough to see the crater and the Serengeti properly without taking two weeks off work.",
    highlight: "A seat-in-vehicle departure, so solo travellers are not paying a private-vehicle premium.",
    itinerary: [
      { day: 1, title: "Arusha to Tarangire", note: "Afternoon drive among the baobabs.", sleeps: "Karatu" },
      { day: 2, title: "Ngorongoro Crater", note: "Full day on the crater floor.", sleeps: "Karatu" },
      { day: 3, title: "To the Serengeti", note: "North through Naabi Hill.", sleeps: "Serengeti" },
      { day: 4, title: "Serengeti", note: "Full day, then south in the afternoon.", sleeps: "Karatu" },
      { day: 5, title: "Return to Arusha", note: "Morning drive out.", sleeps: "—" },
    ],
    photoBrief: "The crater floor from the rim road at first light, wide.",
    photoKey: "safari-northern",
  },
];

export type Departure = {
  id: string;
  routeSlug: string;
  start: string;
  end: string;
  price: number;
  capacity: number;
  booked: number;
};

/**
 * Real departures with real seats.
 *
 * PRICES are confirmed against the operator's live group-departure calendar
 * (30 July 2026): Lemosho 8-day $2,272, Machame 7-day $1,962, Marangu 6-day
 * $1,758, Rongai 7-day $2,022. These are the four the calendar prices
 * individually, and they are the four used below.
 *
 * ⚠️ SEAT COUNTS are still ours, not theirs — the live calendar shows no
 * capacity at all. Get the real numbers before launch; a "3 seats left" we
 * invented is the one thing on this site that could not be defended.
 *
 * ⚠️ Northern Circuit has no calendar price on the live site, so d6 uses the
 * private 2-climber rate. Confirm the group rate or drop the date.
 */
export const departures: Departure[] = [
  { id: "d1", routeSlug: "machame-7-day", start: "2026-08-10", end: "2026-08-16", price: 1962, capacity: 12, booked: 9 },
  { id: "d2", routeSlug: "marangu-6-day", start: "2026-08-13", end: "2026-08-18", price: 1758, capacity: 12, booked: 12 },
  { id: "d3", routeSlug: "lemosho-8-day", start: "2026-09-06", end: "2026-09-13", price: 2272, capacity: 10, booked: 4 },
  { id: "d4", routeSlug: "rongai-7-day", start: "2026-09-20", end: "2026-09-26", price: 2022, capacity: 12, booked: 7 },
  { id: "d5", routeSlug: "machame-7-day", start: "2026-10-11", end: "2026-10-17", price: 1962, capacity: 12, booked: 2 },
  { id: "d6", routeSlug: "northern-circuit-9-day", start: "2027-01-15", end: "2027-01-23", price: 2522, capacity: 8, booked: 1 },
  { id: "d7", routeSlug: "lemosho-8-day", start: "2027-02-06", end: "2027-02-13", price: 2272, capacity: 10, booked: 3 },
  { id: "d8", routeSlug: "marangu-6-day", start: "2027-03-13", end: "2027-03-18", price: 1758, capacity: 12, booked: 0 },
];

/**
 * Day trips.
 *
 * ⚠️ Prices here are the operator's OWN published tiers, scraped from the
 * per-trip pricing tables (30 July 2026). They are substantially higher than
 * the placeholder figures this rebuild previously carried — a park day trip
 * is $280 per head at 5–7 people, not $210, because park entry alone is most
 * of it. Quoting the old numbers would have meant honouring them.
 *
 * Day trips are priced per person on a sliding scale: one person pays for the
 * whole vehicle, so the solo rate is close to double the group rate. `from` is
 * the cheapest tier and `tiers` is the full published table.
 */
export type DayTrip = {
  slug: string;
  name: string;
  /** Cheapest published per-person tier. */
  price: number;
  tiers: { size: string; price: number }[];
  hours: string;
  from: string;
  summary: string;
  /** False where the operator publishes no rate table for this trip. */
  priceVerified: boolean;
  photoKey?: string;
};

export const dayTrips: DayTrip[] = [
  {
    slug: "chemka-hot-springs",
    name: "Chemka Hot Springs",
    price: 60,
    tiers: [
      { size: "1 person", price: 120 },
      { size: "2–5 people", price: 100 },
      { size: "6–10 people", price: 80 },
      { size: "11+ people", price: 60 },
    ],
    hours: "6 hrs",
    from: "Moshi",
    priceVerified: true,
    summary:
      "Turquoise spring-fed pools under fig roots, 40 km from Moshi — about an hour's drive. Swim, eat, and be back for dinner.",
    photoKey: "trip-chemka",
  },
  {
    slug: "materuni-waterfall-coffee",
    name: "Materuni Waterfall & Coffee Tour",
    price: 60,
    tiers: [{ size: "From", price: 60 }],
    hours: "7 hrs",
    from: "Moshi",
    priceVerified: false,
    summary:
      "An 80-metre waterfall 15 km from Moshi, a Chagga lunch with banana beer, then roasting and grinding coffee with a village family.",
    photoKey: "trip-materuni",
  },
  {
    slug: "mandara-hut",
    name: "Mandara Hut Day Hike",
    price: 247,
    tiers: [
      { size: "1 person", price: 411 },
      { size: "2–4 people", price: 274 },
      { size: "5–7 people", price: 265 },
      { size: "8–10 people", price: 256 },
      { size: "11+ people", price: 247 },
    ],
    hours: "8 hrs",
    from: "Moshi",
    priceVerified: true,
    summary:
      "Up the Marangu route to Mandara Hut at 2,700 m and back, with the option of Maundi Crater. Rainforest and colobus, without the eight days.",
    photoKey: "trip-mandara",
  },
  {
    slug: "shira-plateau",
    name: "Shira Plateau Day Hike",
    price: 256,
    tiers: [
      { size: "1 person", price: 411 },
      { size: "2–4 people", price: 274 },
      { size: "5–7 people", price: 265 },
      { size: "8–10 people", price: 256 },
    ],
    hours: "10 hrs",
    from: "Moshi",
    priceVerified: true,
    summary:
      "A 2–3 hour drive to Londorossi Gate, then a 3-hour hike onto the plateau at 3,800 m. The only way to stand that high on Kilimanjaro in a day.",
    photoKey: "trip-shira",
  },
  {
    slug: "marangu-waterfalls",
    name: "Marangu Waterfalls & Chagga Caves",
    price: 0,
    tiers: [],
    hours: "6 hrs",
    from: "Moshi",
    priceVerified: false,
    summary:
      "Waterfalls on the lower slopes, the caves the Chagga hid in, traditional houses and a coffee farm.",
    photoKey: "trip-marangu-waterfalls",
  },
  {
    slug: "arusha-national-park",
    name: "Arusha National Park Day Safari",
    price: 280,
    tiers: [
      { size: "1 person", price: 506 },
      { size: "2–4 people", price: 312 },
      { size: "5–7 people", price: 280 },
    ],
    hours: "10 hrs",
    from: "Moshi or Arusha",
    priceVerified: true,
    summary:
      "Ngurdoto Crater, the Momella Lakes and a walking safari under Mount Meru. Giraffe, colobus, flamingo and 400 bird species.",
    photoKey: "park-arusha",
  },
  {
    slug: "tarangire-national-park",
    name: "Tarangire National Park Day Safari",
    price: 280,
    tiers: [
      { size: "1 person", price: 506 },
      { size: "2–4 people", price: 312 },
      { size: "5–7 people", price: 280 },
    ],
    hours: "12 hrs",
    from: "Moshi or Arusha",
    priceVerified: true,
    summary:
      "The biggest elephant herds in northern Tanzania — sometimes over 500 in one group — among baobabs on the river. A long day: 198 km each way from Moshi.",
    photoKey: "park-tarangire",
  },
  {
    slug: "mkomazi-national-park",
    name: "Mkomazi National Park Day Safari",
    price: 280,
    tiers: [
      { size: "1 person", price: 506 },
      { size: "2–5 people", price: 312 },
      { size: "5–7 people", price: 280 },
    ],
    hours: "10 hrs",
    from: "Moshi",
    priceVerified: true,
    summary:
      "Two hours from Moshi and almost nobody goes. Black rhino and African wild dog sanctuaries, savannah and acacia under the Pare Mountains.",
    photoKey: "park-mkomazi",
  },
  {
    slug: "lake-chala",
    name: "Lake Chala",
    price: 150,
    tiers: [{ size: "From", price: 150 }],
    hours: "7 hrs",
    from: "Moshi",
    priceVerified: false,
    summary:
      "A crater lake straddling the Kenyan border, changing colour through the day. Walk the rim, then down to the water.",
  },
  {
    slug: "maasai-boma",
    name: "Maasai Boma Cultural Day",
    price: 0,
    tiers: [],
    hours: "6 hrs",
    from: "Moshi or Arusha",
    priceVerified: false,
    summary:
      "A day in a Maasai homestead — herding, building, beadwork and the questions you actually want to ask, with an interpreter who lives locally.",
    photoKey: "trip-maasai",
  },
];

