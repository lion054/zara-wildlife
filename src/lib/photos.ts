/**
 * Photography.
 *
 * Every image here is the operator's own, downloaded from their live site on
 * 30 July 2026 and served locally so Next can optimise it. Filenames are
 * normalised to what the picture is FOR (`route-lemosho`) rather than what
 * the CMS called it (`Lemosho-Route.jpg`), so swapping a photo later means
 * replacing one file and nothing else.
 *
 * Intrinsic width/height are recorded because `next/image` needs them to
 * reserve space before the bytes arrive — without them the page reflows as
 * each photo lands, which is the single biggest avoidable hit to CLS.
 *
 * ⚠️ Provenance: these came out of a WordPress media library. Most are
 * clearly the operator's own, but a WP library can accumulate stock with a
 * licence that does not transfer. Confirm with the Moshi office before this
 * goes to production.
 */

export type Photo = {
  src: string;
  width: number;
  height: number;
  /** Describes what is in frame. Never the filename. */
  alt: string;
};

export const photos = {
  "combo-kili-safari": { src: "/photos/combo-kili-safari.jpg", width: 1024, height: 768, alt: "Kilimanjaro trek and safari combined" },
  "combo-lemosho-safari": { src: "/photos/combo-lemosho-safari.jpg", width: 999, height: 749, alt: "Barranco Camp on the Lemosho route" },
  "combo-machame-serengeti": { src: "/photos/combo-machame-serengeti.jpg", width: 900, height: 537, alt: "The Machame route and the Serengeti" },
  "combo-safari-zanzibar-12": { src: "/photos/combo-safari-zanzibar-12.jpg", width: 1920, height: 1280, alt: "Beach and bush across a twelve-day trip" },
  "combo-safari-zanzibar": { src: "/photos/combo-safari-zanzibar.jpg", width: 1920, height: 1149, alt: "Safari vehicle and coastline, combined trip" },
  "exp-balloon": { src: "/photos/exp-balloon.jpg", width: 700, height: 500, alt: "A hot air balloon over the Serengeti at dawn" },
  "exp-birding": { src: "/photos/exp-birding.jpg", width: 700, height: 500, alt: "Birdlife on the northern circuit" },
  "exp-walking": { src: "/photos/exp-walking.jpg", width: 800, height: 827, alt: "A cheetah seen on a walking safari" },
  "hero-about": { src: "/photos/hero-about.jpg", width: 1000, height: 750, alt: "A Kilimanjaro high camp at dusk" },
  "hero-combos": { src: "/photos/hero-combos.jpg", width: 1600, height: 899, alt: "Kilimanjaro rising behind open savannah" },
  "hero-daytrips": { src: "/photos/hero-daytrips.jpg", width: 2000, height: 1333, alt: "Materuni waterfall in the Chagga hills above Moshi" },
  "hero-departures": { src: "/photos/hero-departures.jpg", width: 960, height: 640, alt: "A group of trekkers on the Kilimanjaro trail" },
  "hero-home": { src: "/photos/hero-home.jpg", width: 2000, height: 1124, alt: "Trekkers on the upper slopes of Kilimanjaro" },
  "hero-kilimanjaro": { src: "/photos/hero-kilimanjaro.webp", width: 1600, height: 1067, alt: "Climbers on the upper slopes of Kilimanjaro" },
  "hero-safaris": { src: "/photos/hero-safaris.jpg", width: 1200, height: 800, alt: "Wildebeest herds crossing the Serengeti plains" },
  "hero-zanzibar": { src: "/photos/hero-zanzibar.jpg", width: 1024, height: 833, alt: "White sand and clear water on a Zanzibar beach" },
  "park-arusha": { src: "/photos/park-arusha.jpg", width: 1600, height: 1060, alt: "The Momella Lakes below Mount Meru" },
  "park-gombe": { src: "/photos/park-gombe.jpg", width: 1000, height: 667, alt: "Forested slopes above Lake Tanganyika at Gombe" },
  "park-katavi": { src: "/photos/park-katavi.jpg", width: 1200, height: 828, alt: "Hippo pools in Katavi National Park" },
  "park-mahale": { src: "/photos/park-mahale.jpg", width: 1200, height: 738, alt: "The Mahale Mountains meeting Lake Tanganyika" },
  "park-manyara": { src: "/photos/park-manyara.jpg", width: 700, height: 500, alt: "Forest and lake shore at Lake Manyara" },
  "park-mkomazi": { src: "/photos/park-mkomazi.jpg", width: 700, height: 500, alt: "Savannah and acacia in Mkomazi National Park" },
  "park-ngorongoro": { src: "/photos/park-ngorongoro.jpg", width: 700, height: 500, alt: "The Ngorongoro Crater floor from the rim" },
  "park-nyerere": { src: "/photos/park-nyerere.jpg", width: 1249, height: 831, alt: "The Rufiji river in Nyerere National Park" },
  "park-ruaha": { src: "/photos/park-ruaha.jpg", width: 1200, height: 675, alt: "Dry-season riverbed in Ruaha" },
  "park-serengeti": { src: "/photos/park-serengeti.jpg", width: 700, height: 500, alt: "Acacia and open grassland in the Serengeti" },
  "park-tarangire": { src: "/photos/park-tarangire.jpg", width: 700, height: 500, alt: "Baobabs and elephant in Tarangire" },
  "route-lemosho": { src: "/photos/route-lemosho.jpg", width: 1200, height: 1500, alt: "The Lemosho approach across the Shira Plateau" },
  "route-machame": { src: "/photos/route-machame.jpg", width: 1339, height: 1336, alt: "The Machame trail through moorland" },
  "route-marangu": { src: "/photos/route-marangu.jpg", width: 1920, height: 1080, alt: "The Marangu route below Kibo" },
  "route-meru": { src: "/photos/route-meru.jpg", width: 1600, height: 1060, alt: "The crater rim of Mount Meru at sunrise" },
  "route-northern-circuit": { src: "/photos/route-northern-circuit.jpg", width: 2000, height: 1258, alt: "The remote northern slopes of Kilimanjaro" },
  "route-rongai": { src: "/photos/route-rongai.jpg", width: 1200, height: 1011, alt: "The Rongai approach from the northern side" },
  "safari-lion": { src: "/photos/safari-lion.jpg", width: 600, height: 400, alt: "A lion in the Serengeti" },
  "safari-migration": { src: "/photos/safari-migration.jpg", width: 1200, height: 800, alt: "Wildebeest on the move during the Great Migration" },
  "safari-northern": { src: "/photos/safari-northern.jpg", width: 768, height: 768, alt: "Open plains on the northern circuit" },
  "trip-chemka": { src: "/photos/trip-chemka.jpg", width: 1024, height: 768, alt: "The turquoise pools at Chemka hot springs" },
  "trip-maasai": { src: "/photos/trip-maasai.png", width: 1200, height: 530, alt: "A Maasai homestead on the plains" },
  "trip-mandara": { src: "/photos/trip-mandara.jpg", width: 1200, height: 681, alt: "Rainforest on the path to Mandara Hut" },
  "trip-marangu-waterfalls": { src: "/photos/trip-marangu-waterfalls.jpg", width: 719, height: 479, alt: "Waterfalls on the lower slopes at Marangu" },
  "trip-materuni": { src: "/photos/trip-materuni.jpg", width: 1200, height: 800, alt: "Coffee roasting on the Materuni village tour" },
  "trip-shira": { src: "/photos/trip-shira.jpg", width: 1000, height: 600, alt: "The Shira Plateau at 3,800 metres" },
  "zanzibar-attraction-beach": { src: "/photos/zanzibar-attraction-beach.jpg", width: 1024, height: 833, alt: "White sand and palms on a Zanzibar beach" },
  "zanzibar-attraction-stonetown": { src: "/photos/zanzibar-attraction-stonetown.jpg", width: 1600, height: 1067, alt: "Stone Town waterfront" },
  "zanzibar-emerald": { src: "/photos/zanzibar-emerald.jpg", width: 1200, height: 801, alt: "A beachfront resort on Zanzibar's east coast" },
  "zanzibar-jozani": { src: "/photos/zanzibar-jozani.jpg", width: 800, height: 737, alt: "Red colobus monkeys in Jozani Forest" },
  "zanzibar-matemwe": { src: "/photos/zanzibar-matemwe.jpg", width: 567, height: 400, alt: "The Matemwe coastline at low tide" },
  "zanzibar-mnemba": { src: "/photos/zanzibar-mnemba.jpg", width: 800, height: 600, alt: "Reef and clear water off Mnemba atoll" },
  "zanzibar-spice": { src: "/photos/zanzibar-spice.jpg", width: 829, height: 550, alt: "Spices on a Zanzibar plantation tour" },
  "zanzibar-stonetown": { src: "/photos/zanzibar-stonetown.jpg", width: 1920, height: 1384, alt: "Carved doors and alleys in Stone Town" },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Look up a photo by key, tolerating keys that have no image yet. */
export const photo = (key: string): Photo | undefined =>
  (photos as Record<string, Photo>)[key];
