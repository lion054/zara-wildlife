/**
 * Kilimanjaro and Meru routes.
 *
 * Altitudes and camp names are the established published figures for each
 * route. Distances are approximate and should be checked against the
 * operator's own briefing notes.
 *
 * ⚠️ SUCCESS RATES are indicative industry figures, not this operator's own.
 * They render with a visible marker until `successVerified` is set true.
 * Publishing someone else's summit rate as your own is the fastest way to
 * lose a complaint you cannot defend.
 *
 * PRICES: `groupPricing` is this operator's own rate card, scraped from the
 * per-route pricing tables on tanzaniawildlifeadventures.com (30 July 2026)
 * and reproduced verbatim. Where the live product has the same number of
 * hiking days as the route below, `priceVerified` is true.
 *
 * ⚠️ Where it does not, `published` records what the operator actually sells
 * and charges, and `priceVerified` stays false. The live site sells the SHORT
 * variants of Marangu (5 days), Machame (6) and Lemosho (7); the routes below
 * are the longer, higher-success variants, so their rates are still estimates.
 * Do not quote the short-variant price for a long-variant climb.
 */

/** The nearest equivalent product on the operator's live site, with its real rate card. */
export type Published = {
  /** Product name as sold, e.g. "Lemosho Route (7 days hike)". */
  name: string;
  /** Hiking days in the live product, excluding arrival and departure days. */
  hikingDays: number;
  /** Lowest published per-person rate. */
  from: number;
  path: string;
  /** True when the live product is the same length as the route it sits on. */
  sameLength: boolean;
};

export type Day = {
  day: number;
  from: string;
  to: string;
  /** Sleeping altitude at the end of the day, in metres. */
  altitude: number;
  /** Highest point reached during the day, where it differs from sleeping altitude. */
  high?: number;
  distance: string;
  hours: string;
  zone: Zone;
  note: string;
};

export type Zone = "forest" | "moorland" | "desert" | "arctic";

export const zones: Record<Zone, { label: string; range: string; description: string }> = {
  forest: {
    label: "Rainforest",
    range: "1,800 – 2,800 m",
    description: "Humid, dripping, colobus monkeys overhead. Expect mud and rain in the afternoon.",
  },
  moorland: {
    label: "Heath and moorland",
    range: "2,800 – 4,000 m",
    description: "Giant lobelia and senecio, big skies, cold nights. Most people first feel the altitude here.",
  },
  desert: {
    label: "Alpine desert",
    range: "4,000 – 5,000 m",
    description: "Rock, dust and hard sun by day, well below freezing at night. Half the oxygen of sea level.",
  },
  arctic: {
    label: "Arctic summit",
    range: "5,000 m and above",
    description: "Glacier and scree. Roughly a third of the oxygen at sea level. You will move very slowly.",
  },
};

export type Route = {
  slug: string;
  name: string;
  mountain: "kilimanjaro" | "meru";
  days: number;
  summit: string;
  summitAltitude: number;
  strapline: string;
  summary: string;
  character: string;
  difficulty: "Moderate" | "Challenging" | "Hard";
  scenery: 1 | 2 | 3 | 4 | 5;
  traffic: "Quiet" | "Moderate" | "Busy";
  successRate: number;
  successVerified: boolean;
  /** Published price, per person, USD. */
  price: number;
  priceVerified: boolean;
  groupPricing: { size: string; price: number }[];
  /** The operator's live equivalent, absent where they do not publish one. */
  published?: Published;
  itinerary: Day[];
  bestFor: string;
  photoBrief: string;
  /** Key into lib/photos. */
  photoKey: string;
};

const KILI_SUMMIT = 5895;

export const routes: Route[] = [
  {
    slug: "lemosho-8-day",
    name: "Lemosho",
    mountain: "kilimanjaro",
    days: 8,
    summit: "Uhuru Peak",
    summitAltitude: KILI_SUMMIT,
    strapline: "The long approach from the west. The best odds on the mountain, short of the Northern Circuit.",
    summary:
      "Eight days in from the western side, crossing the Shira Plateau before joining the southern circuit. The extra acclimatisation day is what turns a hard climb into a likely summit.",
    character:
      "Starts in thick forest with a real chance of buffalo on day one, then opens onto the Shira Plateau — the single best campsite view on the mountain. Quiet for the first three days, busier once it merges with Machame.",
    difficulty: "Challenging",
    scenery: 5,
    traffic: "Moderate",
    successRate: 90,
    successVerified: false,
    price: 2250,
    priceVerified: false,
    groupPricing: [
      { size: "1 climber", price: 2650 },
      { size: "2 climbers", price: 2250 },
      { size: "4+ climbers", price: 2050 },
    ],
    published: {
      name: "Lemosho Route (7 days hike)",
      hikingDays: 7,
      from: 2022,
      path: "/climbing-kilimanjaro-lemosho-route-7-days-hike/",
      sameLength: false,
    },
    itinerary: [
      { day: 1, from: "Londorosi Gate", to: "Mti Mkubwa (Big Tree) Camp", altitude: 2780, distance: "6 km", hours: "3–4 hrs", zone: "forest", note: "Drive in from Moshi, walk through montane forest. Short day, deliberately." },
      { day: 2, from: "Mti Mkubwa", to: "Shira 1 Camp", altitude: 3610, distance: "16 km", hours: "6–8 hrs", zone: "moorland", note: "Out of the trees and onto the plateau. The first big altitude gain — walk it slowly." },
      { day: 3, from: "Shira 1", to: "Shira 2 Camp", altitude: 3850, distance: "11 km", hours: "5–6 hrs", zone: "moorland", note: "An easy day by design. Kibo ahead of you the whole way." },
      { day: 4, from: "Shira 2", to: "Barranco Camp", altitude: 3960, high: 4630, distance: "15 km", hours: "7–8 hrs", zone: "desert", note: "Climb high to Lava Tower at 4,630 m, then drop to sleep low. This is the acclimatisation day that wins summits." },
      { day: 5, from: "Barranco", to: "Karanga Camp", altitude: 3995, distance: "5 km", hours: "4–5 hrs", zone: "desert", note: "The Barranco Wall first thing — scrambling, hands needed, no technical skill. Short day after it." },
      { day: 6, from: "Karanga", to: "Barafu Camp", altitude: 4673, distance: "4 km", hours: "4–5 hrs", zone: "desert", note: "Into base camp early. Eat, then sleep from about 7pm — you leave around midnight." },
      { day: 7, from: "Barafu", to: "Uhuru Peak, then Mweka Camp", altitude: 3100, high: KILI_SUMMIT, distance: "17 km", hours: "12–14 hrs", zone: "arctic", note: "Summit night. Midnight start, sunrise at Stella Point, Uhuru shortly after, then 2,800 m of descent. The longest day of your life." },
      { day: 8, from: "Mweka Camp", to: "Mweka Gate", altitude: 1640, distance: "10 km", hours: "3–4 hrs", zone: "forest", note: "Down through the forest, certificates at the gate, back to Moshi for a shower." },
    ],
    bestFor: "Anyone who wants the highest realistic chance of standing on the summit.",
    photoBrief: "Camp on the Shira Plateau at dawn with Kibo behind — the defining Lemosho image.",
    photoKey: "route-lemosho",
  },
  {
    slug: "machame-7-day",
    name: "Machame",
    mountain: "kilimanjaro",
    days: 7,
    summit: "Uhuru Peak",
    summitAltitude: KILI_SUMMIT,
    strapline: "The Whiskey Route. Steeper, more popular, and superb if you take the seventh day.",
    summary:
      "The most walked route on the mountain, and for good reason — the scenery changes every single day. Seven days rather than six makes a large difference to your chances.",
    character:
      "Harder walking than Lemosho with more up-and-down, which is exactly what helps you acclimatise. Busy campsites, a sociable climb, and the Barranco Wall on the fourth morning.",
    difficulty: "Challenging",
    scenery: 5,
    traffic: "Busy",
    successRate: 85,
    successVerified: false,
    price: 2250,
    priceVerified: false,
    groupPricing: [
      { size: "1 climber", price: 2590 },
      { size: "2 climbers", price: 2250 },
      { size: "4+ climbers", price: 1990 },
    ],
    published: {
      name: "Machame Route (6 days hike)",
      hikingDays: 6,
      from: 1712,
      path: "/climbing-kilimanjaro-machame-route-6-days-hike/",
      sameLength: false,
    },
    itinerary: [
      { day: 1, from: "Machame Gate", to: "Machame Camp", altitude: 2835, distance: "11 km", hours: "5–7 hrs", zone: "forest", note: "Straight into rainforest. Wet underfoot most of the year — waterproofs on the outside of your daypack." },
      { day: 2, from: "Machame Camp", to: "Shira Camp", altitude: 3750, distance: "5 km", hours: "4–6 hrs", zone: "moorland", note: "Steep, short, and out of the trees. First proper view of Kibo." },
      { day: 3, from: "Shira", to: "Barranco Camp", altitude: 3960, high: 4630, distance: "10 km", hours: "6–8 hrs", zone: "desert", note: "Up to Lava Tower, then down to Barranco. Headaches are normal here and they pass as you descend." },
      { day: 4, from: "Barranco", to: "Karanga Camp", altitude: 3995, distance: "5 km", hours: "4–5 hrs", zone: "desert", note: "The Barranco Wall. Slow, exposed in places, no ropes. Then a short valley walk." },
      { day: 5, from: "Karanga", to: "Barafu Camp", altitude: 4673, distance: "4 km", hours: "4–5 hrs", zone: "desert", note: "Base camp. Rest, hydrate, sleep early." },
      { day: 6, from: "Barafu", to: "Uhuru Peak, then Mweka Camp", altitude: 3100, high: KILI_SUMMIT, distance: "17 km", hours: "12–14 hrs", zone: "arctic", note: "Summit night, then a very long descent." },
      { day: 7, from: "Mweka Camp", to: "Mweka Gate", altitude: 1640, distance: "10 km", hours: "3–4 hrs", zone: "forest", note: "Down and out." },
    ],
    bestFor: "Fit walkers who want the classic route and do not mind company.",
    photoBrief: "The Barranco Wall with a line of climbers on it — shows the scramble honestly.",
    photoKey: "route-machame",
  },
  {
    slug: "marangu-6-day",
    name: "Marangu",
    mountain: "kilimanjaro",
    days: 6,
    summit: "Uhuru Peak",
    summitAltitude: KILI_SUMMIT,
    strapline: "The only route with huts. Take the sixth day — the five-day version is where people fail.",
    summary:
      "Sleeping in huts rather than tents, up and down the same path. The gentlest gradient on the mountain, but the shortest profile, which is why the acclimatisation day matters so much.",
    character:
      "Beds, mattresses and a dining hut. Comfortable, and a good choice in the wet season. The five-day version is widely sold and has roughly half the summit rate of the six-day.",
    difficulty: "Moderate",
    scenery: 3,
    traffic: "Busy",
    successRate: 70,
    successVerified: false,
    price: 1680,
    priceVerified: false,
    groupPricing: [
      { size: "1 climber", price: 1980 },
      { size: "2 climbers", price: 1680 },
      { size: "4+ climbers", price: 1520 },
    ],
    published: {
      name: "Marangu Route (5 days hike)",
      hikingDays: 5,
      from: 1484,
      path: "/climbing-kilimanjaro-marangu-route-5-days-hike/",
      sameLength: false,
    },
    itinerary: [
      { day: 1, from: "Marangu Gate", to: "Mandara Hut", altitude: 2700, distance: "8 km", hours: "4–5 hrs", zone: "forest", note: "Gentle forest path, well graded. Optional walk to Maundi Crater before dinner." },
      { day: 2, from: "Mandara", to: "Horombo Hut", altitude: 3720, distance: "12 km", hours: "6–7 hrs", zone: "moorland", note: "Out of the forest into moorland. Giant lobelia along the path." },
      { day: 3, from: "Horombo", to: "Zebra Rocks and back", altitude: 3720, high: 4020, distance: "6 km", hours: "3–4 hrs", zone: "moorland", note: "The acclimatisation day. Climb to 4,020 m, come back to sleep at 3,720. Do not skip this." },
      { day: 4, from: "Horombo", to: "Kibo Hut", altitude: 4700, distance: "10 km", hours: "5–6 hrs", zone: "desert", note: "Across the saddle between Mawenzi and Kibo. Bleak, dusty, and cold once the sun drops." },
      { day: 5, from: "Kibo Hut", to: "Uhuru Peak, then Horombo", altitude: 3720, high: KILI_SUMMIT, distance: "22 km", hours: "12–15 hrs", zone: "arctic", note: "Midnight start up the scree to Gilman's Point, then the crater rim to Uhuru. Long, cold and steep." },
      { day: 6, from: "Horombo", to: "Marangu Gate", altitude: 1860, distance: "20 km", hours: "5–6 hrs", zone: "forest", note: "All the way down in one go." },
    ],
    bestFor: "Climbers who want a bed, and anyone climbing in the rains.",
    photoBrief: "Horombo huts in cloud, with the moorland vegetation in the foreground.",
    photoKey: "route-marangu",
  },
  {
    slug: "rongai-7-day",
    name: "Rongai",
    mountain: "kilimanjaro",
    days: 7,
    summit: "Uhuru Peak",
    summitAltitude: KILI_SUMMIT,
    strapline: "In from the north, on the dry side, with the emptiest first three days on the mountain.",
    summary:
      "The only route approaching from the northern, Kenyan side. Drier than everything else, far quieter, and it comes at Mawenzi from an angle nobody else sees.",
    character:
      "Genuinely remote for the first half — you may not see another group. Gentler gradients than Machame, and the best choice if you are climbing in the wet season.",
    difficulty: "Moderate",
    scenery: 4,
    traffic: "Quiet",
    successRate: 80,
    successVerified: false,
    price: 2022,
    priceVerified: false,
    /**
     * The operator sells Rongai on the group calendar at $2,022 for a 7-day
     * hike, but publishes no per-route page and no rate table for it. The
     * tiers below are inferred from the calendar price and still need signing
     * off.
     */
    groupPricing: [
      { size: "1 climber", price: 2380 },
      { size: "2 climbers", price: 2022 },
      { size: "4+ climbers", price: 1860 },
    ],
    itinerary: [
      { day: 1, from: "Nalemuru Gate", to: "Simba Camp", altitude: 2625, distance: "8 km", hours: "3–4 hrs", zone: "forest", note: "Long drive around the mountain, then a short walk through farmland and forest edge." },
      { day: 2, from: "Simba", to: "Kikelewa Camp", altitude: 3600, distance: "12 km", hours: "6–7 hrs", zone: "moorland", note: "Open moorland with Kibo ahead all day. Very few people." },
      { day: 3, from: "Kikelewa", to: "Mawenzi Tarn", altitude: 4330, distance: "6 km", hours: "4–5 hrs", zone: "desert", note: "Steep but short, ending at a tarn under the spires of Mawenzi. Best campsite on the mountain." },
      { day: 4, from: "Mawenzi Tarn", to: "Mawenzi Tarn", altitude: 4330, high: 4600, distance: "5 km", hours: "3–4 hrs", zone: "desert", note: "Acclimatisation day. Walk up towards Mawenzi and come back down to sleep." },
      { day: 5, from: "Mawenzi Tarn", to: "Kibo Hut", altitude: 4700, distance: "9 km", hours: "5–6 hrs", zone: "desert", note: "Across the saddle. Exposed, dusty, and long." },
      { day: 6, from: "Kibo Hut", to: "Uhuru Peak, then Horombo", altitude: 3720, high: KILI_SUMMIT, distance: "22 km", hours: "12–15 hrs", zone: "arctic", note: "Summit night up the scree to Gilman's Point, then the rim." },
      { day: 7, from: "Horombo", to: "Marangu Gate", altitude: 1860, distance: "20 km", hours: "5–6 hrs", zone: "forest", note: "Down the Marangu path and out." },
    ],
    bestFor: "Wet-season climbs, and anyone who wants solitude before the summit push.",
    photoBrief: "Mawenzi Tarn camp with the Mawenzi spires behind — nobody else photographs this well.",
    photoKey: "route-rongai",
  },
  {
    slug: "northern-circuit-9-day",
    name: "Northern Circuit",
    mountain: "kilimanjaro",
    days: 9,
    summit: "Uhuru Peak",
    summitAltitude: KILI_SUMMIT,
    strapline: "The longest route on the mountain, and the highest summit rate of any of them.",
    summary:
      "Nine days, circling the entire northern flank before the summit push. More time above 3,500 m than any other route, which is precisely why it works.",
    character:
      "Almost nobody walks it. You spend two full days on a side of the mountain most climbers never see, then join the summit push far better acclimatised than anyone who came up in six.",
    difficulty: "Challenging",
    scenery: 5,
    traffic: "Quiet",
    successRate: 95,
    successVerified: false,
    price: 2522,
    priceVerified: true,
    /* Verbatim from the operator's own rate table — same 9-day product. */
    groupPricing: [
      { size: "1 climber", price: 2712 },
      { size: "2 climbers", price: 2522 },
      { size: "6 climbers", price: 2453 },
    ],
    published: {
      name: "Northern Circuit Route (9 days hike)",
      hikingDays: 9,
      from: 2522,
      path: "/climbing-kilimanjaro-northern-circuit-route-9-days-hike/",
      sameLength: true,
    },
    itinerary: [
      { day: 1, from: "Londorosi Gate", to: "Mti Mkubwa Camp", altitude: 2780, distance: "6 km", hours: "3–4 hrs", zone: "forest", note: "Forest walk in, short by design." },
      { day: 2, from: "Mti Mkubwa", to: "Shira 1 Camp", altitude: 3610, distance: "16 km", hours: "6–8 hrs", zone: "moorland", note: "Onto the Shira Plateau." },
      { day: 3, from: "Shira 1", to: "Shira 2 Camp", altitude: 3850, distance: "11 km", hours: "5–6 hrs", zone: "moorland", note: "Easy day across the plateau." },
      { day: 4, from: "Shira 2", to: "Moir Hut", altitude: 4200, high: 4630, distance: "14 km", hours: "6–7 hrs", zone: "desert", note: "Via Lava Tower, then north to a camp almost nobody uses." },
      { day: 5, from: "Moir Hut", to: "Buffalo Camp", altitude: 4020, distance: "12 km", hours: "5–7 hrs", zone: "desert", note: "Around the northern slopes. Long views into Kenya." },
      { day: 6, from: "Buffalo Camp", to: "Third Cave", altitude: 3800, distance: "8 km", hours: "5–6 hrs", zone: "moorland", note: "Continuing the traverse. Sleeping lower again — this is deliberate." },
      { day: 7, from: "Third Cave", to: "School Hut", altitude: 4800, distance: "5 km", hours: "4–5 hrs", zone: "desert", note: "Up to base camp on the northern side." },
      { day: 8, from: "School Hut", to: "Uhuru Peak, then Millennium Camp", altitude: 3820, high: KILI_SUMMIT, distance: "18 km", hours: "12–14 hrs", zone: "arctic", note: "Summit night from School Hut. You will be the best-acclimatised people on the rim." },
      { day: 9, from: "Millennium Camp", to: "Mweka Gate", altitude: 1640, distance: "12 km", hours: "4–5 hrs", zone: "forest", note: "Down through the forest and out." },
    ],
    bestFor: "Anyone who has failed before, is over 55, or simply wants the best odds money buys.",
    photoBrief: "The northern slopes with nobody in frame — the emptiness is the selling point.",
    photoKey: "route-northern-circuit",
  },
  {
    slug: "mount-meru-4-day",
    name: "Mount Meru",
    mountain: "meru",
    days: 4,
    summit: "Socialist Peak",
    summitAltitude: 4566,
    strapline: "Africa's fifth-highest, and the best possible warm-up for Kilimanjaro.",
    summary:
      "Four days on a mountain inside a national park, walking out past giraffe and buffalo with an armed ranger. Climb it the week before Kilimanjaro and your summit chances rise sharply.",
    character:
      "A knife-edge crater rim on summit morning that is more dramatic than anything on Kilimanjaro, and a fraction of the traffic. The park rule requiring an armed ranger is not theatre — there is real game on the lower slopes.",
    difficulty: "Challenging",
    scenery: 5,
    traffic: "Quiet",
    successRate: 85,
    successVerified: false,
    price: 980,
    priceVerified: false,
    /**
     * ⚠️ The live Meru page shows "From $2,000" — but $2,000 is the CMS
     * placeholder that also appears on Marangu Waterfalls (a day trip), a
     * 2-day Zanzibar package and a 10-day combo. It is not a real Meru rate
     * and has deliberately not been imported. Get the operator's actual Meru
     * rate card before this goes live. They sell a 3-day version too.
     */
    groupPricing: [
      { size: "1 climber", price: 1180 },
      { size: "2 climbers", price: 980 },
      { size: "4+ climbers", price: 880 },
    ],
    itinerary: [
      { day: 1, from: "Momella Gate", to: "Miriakamba Hut", altitude: 2514, distance: "10 km", hours: "4–5 hrs", zone: "forest", note: "Walk in past giraffe, buffalo and warthog with an armed ranger. Genuinely a game walk." },
      { day: 2, from: "Miriakamba", to: "Saddle Hut", altitude: 3570, distance: "5 km", hours: "3–4 hrs", zone: "moorland", note: "Steep forest and moorland. Optional afternoon climb of Little Meru at 3,801 m." },
      { day: 3, from: "Saddle Hut", to: "Socialist Peak, then Miriakamba", altitude: 2514, high: 4566, distance: "18 km", hours: "10–12 hrs", zone: "desert", note: "Pre-dawn start along the crater rim — narrow, exposed, spectacular at sunrise with Kilimanjaro across the plain." },
      { day: 4, from: "Miriakamba", to: "Momella Gate", altitude: 1500, distance: "10 km", hours: "3 hrs", zone: "forest", note: "Down the vehicle track, more game on the way out." },
    ],
    bestFor: "Acclimatising before Kilimanjaro, or a short climb on its own.",
    photoBrief: "The crater rim at sunrise with Kilimanjaro on the horizon — the single best shot in the portfolio.",
    photoKey: "route-meru",
  },
];

export const getRoute = (slug: string) => routes.find((r) => r.slug === slug);

/**
 * Per-person rate for a given party size.
 *
 * Tier labels differ between routes — the operator's own tables jump straight
 * from "2 climbers" to "6 climbers" on some routes and stop at "4+" on others
 * — so match on the leading number rather than the label text, and take the
 * largest tier the party actually reaches. Falls back to the headline price.
 */
export const rateFor = (route: Route, people: number): number => {
  const tier = route.groupPricing
    .map((g) => ({ min: parseInt(g.size, 10), price: g.price }))
    .filter((g) => Number.isFinite(g.min) && g.min <= people)
    .sort((a, b) => b.min - a.min)[0];
  return tier?.price ?? route.price;
};
export const kilimanjaroRoutes = routes.filter((r) => r.mountain === "kilimanjaro");

/** Zone for a given altitude, used to band the profile chart. */
export const zoneFor = (m: number): Zone =>
  m >= 5000 ? "arctic" : m >= 4000 ? "desert" : m >= 2800 ? "moorland" : "forest";
