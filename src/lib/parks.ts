/**
 * Safari destinations.
 *
 * The operator runs the northern circuit off the shelf and the southern and
 * western circuits on request. Park descriptions are drawn from their own
 * destinations page (30 July 2026), tightened.
 *
 * The circuit distinction matters commercially: northern parks are drivable
 * from Arusha, southern and western ones are mostly fly-in, which is why they
 * are quoted per enquiry rather than listed with a price.
 */

export type Circuit = "north" | "south" | "west";

export const circuits: Record<
  Circuit,
  { label: string; access: string; note: string }
> = {
  north: {
    label: "Northern circuit",
    access: "Drivable from Arusha and Moshi",
    note: "The Great Migration, the Big Five and the crater. Where a first Tanzanian safari should go, and what every package on this site is built from.",
  },
  south: {
    label: "Southern circuit",
    access: "Fly-in, booked on request",
    note: "For a second visit. Emptier, wilder, and it allows boat and walking safaris the north mostly does not.",
  },
  west: {
    label: "Western circuit",
    access: "Fly-in or boat, booked on request",
    note: "Chimpanzees and Lake Tanganyika. Remote, expensive to reach, and unlike anywhere else in the country.",
  },
};

export type Park = {
  name: string;
  circuit: Circuit;
  headline: string;
  note: string;
  /** Best months, where the operator is specific about them. */
  when?: string;
  /** Key into lib/photos. Explicit, because deriving it from the name
      breaks on "Lake Manyara" and every southern park. */
  photoKey?: string;
};

export const parks: Park[] = [
  {
    name: "Serengeti National Park",
    circuit: "north",
    headline: "The Great Migration",
    photoKey: "park-serengeti",
    when: "Migration river crossings June–September; calving on the southern plains January–March",
    note: "Over a million wildebeest, zebra and gazelle on the move, and resident big cats year-round. Vast enough that where you stay decides what you see — which is why our itineraries move camp rather than sit still.",
  },
  {
    name: "Ngorongoro Crater",
    circuit: "north",
    headline: "The Big Five in a single day",
    photoKey: "park-ngorongoro",
    when: "Year-round; go in at gate opening",
    note: "A UNESCO World Heritage Site and the densest concentration of large game in Africa, held inside a collapsed caldera. One of very few places you can reasonably expect black rhino.",
  },
  {
    name: "Tarangire National Park",
    circuit: "north",
    headline: "The biggest elephant herds in the north",
    photoKey: "park-tarangire",
    when: "June–October, when game gathers on the river",
    note: "Herds sometimes over 500 strong, among baobabs on the Tarangire River. Quieter than the Serengeti and the crater, and 500-plus bird species.",
  },
  {
    name: "Lake Manyara National Park",
    circuit: "north",
    headline: "Tree-climbing lions and flamingo",
    photoKey: "park-manyara",
    when: "Year-round; birdlife best November–June",
    note: "A narrow strip between escarpment and lake — groundwater forest, open grassland and shallow water. Small enough to do properly in a day.",
  },
  {
    name: "Arusha National Park",
    circuit: "north",
    headline: "Walking safaris under Mount Meru",
    photoKey: "park-arusha",
    when: "Year-round",
    note: "Savannah, forest and mountain in one small park, with Ngurdoto Crater and the Momella Lakes. One of the few northern parks that permits walking safaris.",
  },
  {
    name: "Nyerere National Park",
    circuit: "south",
    headline: "Boat safaris on the Rufiji",
    photoKey: "park-nyerere",
    note: "The largest national park in Tanzania, formerly Selous. Game drives, boat safaris and walking safaris — big elephant and hippo populations, and wild dog.",
  },
  {
    name: "Ruaha National Park",
    circuit: "south",
    headline: "The largest elephant population in Africa",
    photoKey: "park-ruaha",
    note: "Second-largest park in the country, and the best place to see antelope variety — greater and lesser kudu, sable and roan. Over 570 bird species.",
  },
  {
    name: "Gombe Stream National Park",
    circuit: "west",
    headline: "Jane Goodall's chimpanzees",
    photoKey: "park-gombe",
    note: "On the shore of Lake Tanganyika, where chimpanzee research began in 1960. Tracking wild chimps on foot, plus olive baboons and red-tailed monkeys.",
  },
  {
    name: "Mahale Mountains National Park",
    circuit: "west",
    headline: "Chimpanzees and a white-sand lake shore",
    photoKey: "park-mahale",
    note: "Forested mountains falling into Lake Tanganyika. One of Africa's largest wild chimpanzee populations, habituated for trekking — reached by boat or light aircraft only.",
  },
  {
    name: "Katavi National Park",
    circuit: "west",
    headline: "Hippo and crocodile, and almost no people",
    photoKey: "park-katavi",
    note: "One of the least visited parks in Tanzania. Huge buffalo herds, enormous hippo concentrations in the dry-season rivers, and lion, leopard and hyena on the plains.",
  },
];

/** Add-on experiences the operator sells on top of a safari. */
export const safariExperiences = [
  {
    name: "Hot air balloon",
    where: "Serengeti",
    note: "Dawn launch, an hour over the plains, champagne breakfast under an acacia when you land.",
  },
  {
    name: "Night game drive",
    where: "Ikoma Wildlife Area, outside the park boundary",
    note: "Lion hunting, hyena, and the small nocturnal animals — civet, genet — you will never see by day. Not permitted inside the national parks.",
  },
  {
    name: "Walking safari",
    where: "Serengeti and Lake Manyara",
    note: "On foot with an armed ranger. Tracks, insects, plants and the smaller things a vehicle drives straight past.",
  },
  {
    name: "Bush lunch",
    where: "Serengeti",
    note: "A prepared picnic somewhere with a view, instead of a lunchbox in the car.",
  },
  {
    name: "Bird watching",
    where: "Everywhere, but Tarangire and Manyara especially",
    note: "Over 1,000 species in Tanzania. A guide who knows calls changes the day entirely.",
  },
  {
    name: "Maasai villages",
    where: "On the road to the Serengeti",
    note: "Herders on the plains, and a village stop if you want it. Arranged as a real visit, not a staged one.",
  },
];
