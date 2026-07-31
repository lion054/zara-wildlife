/**
 * FAQs.
 *
 * The operator has `/faqs-about-tanzania-safari/` and
 * `/faqs-about-climbing-mount-kilimanjaro/` indexed on the live site, and the
 * first pass of this rebuild had nowhere to send them.
 *
 * Every answer is grounded in something already in this dataset: the inclusions
 * and exclusions in `inclusions.ts`, the deposit and cancellation terms on the
 * route pages, the zone table in `routes.ts`, park timing in `parks.ts`, and the
 * seasons in `zanzibar.ts`. Nothing here introduces a fact that is not stated
 * elsewhere on the site — an FAQ that contradicts the product page is worse
 * than no FAQ at all.
 */

export type Faq = { q: string; a: string };

export const kilimanjaroFaqs: Faq[] = [
  {
    q: "Do I need climbing experience?",
    a: "No. There is no technical climbing on any of our routes — it is a long, high walk, and every route is walkable. What it asks for is stamina over consecutive days and a tolerance for altitude, which nobody can predict in advance. If you can walk six hours a day on hills, you are fit enough to start.",
  },
  {
    q: "Which route should I pick?",
    a: "The one with the most days you can afford. Summit rates track acclimatisation more than anything else, which is why the nine-day Northern Circuit outperforms the six-day Marangu by a wide margin. Compare all six on our Kilimanjaro page — days, difficulty, summit rate, traffic and price are set out side by side, each with its altitude profile drawn.",
  },
  {
    q: "What is the success rate, really?",
    a: "The rates on this site are the established published figures for each route, and they are flagged as such. They are not yet this operator's own records — we would rather show you a marked estimate than quote someone else's number as ours. The Moshi office is pulling three seasons of its own data, and the markers come off when it does.",
  },
  {
    q: "When is the best time to climb?",
    a: "January to March and June to October. Both are dry. January to March is colder, quieter and often clearer; June to October is the busiest window and coincides with peak safari season, so it combines well with the parks. April, May and November are the rains — climbable, cheaper, and considerably less pleasant.",
  },
  {
    q: "How cold does it get?",
    a: "You walk through four climate zones in under a week — rainforest at the gate at about 1,800 m, then moorland, then alpine desert, then glacier. Expect humid and wet at the bottom and well below freezing on summit night, with roughly a third of the oxygen you have at sea level. The zone bands on each route's profile chart show exactly which day you cross into what.",
  },
  {
    q: "What is included in the price?",
    a: "Park and rescue fees, your guides and mountain crew, all camping or hut accommodation, all meals on the mountain, drinking water, transfers, and two nights' hotel in Moshi — one before the climb and one after. The full list, and the equally important list of what is not included, is on every route page.",
  },
  {
    q: "What is not included?",
    a: "International flights, your Tanzanian visa, travel insurance, personal climbing equipment, drinks off the mountain, and tips for your crew. Personal gear can be hired in Moshi and we will tell you honestly what is worth hiring and what is worth owning.",
  },
  {
    q: "Do I need insurance?",
    a: "Yes, and it is a condition of climbing with us rather than a suggestion. It must cover trekking to 5,895 m and helicopter evacuation — most standard policies do neither. We check the policy before you walk in, because the alternative is discovering the gap at 4,600 m.",
  },
  {
    q: "How do you handle altitude sickness?",
    a: "Blood oxygen and pulse are checked morning and evening from the second camp up and written down, every climb carries bottled oxygen and a first-aid kit, and there is a written evacuation plan for each camp on each route. Your guide has the final say on whether you go higher, and that decision is not negotiable.",
  },
  {
    q: "How are the porters treated?",
    a: "Paid above the KPAP wage floor, paid monthly rather than per climb, and paid whether or not the climb reaches the summit. Loads are weighed at the gate so nobody carries above the park limit, and boots, jackets and sleeping bags are issued by us rather than bought out of a tip.",
  },
  {
    q: "How much should I tip?",
    a: "Tipping is customary and it is real income for the crew. As a guide, budget roughly 10% of your climb price across the whole team, pooled and distributed at the end. Your lead guide will explain the split before you come down, and nobody will be difficult about it if you tip differently.",
  },
  {
    q: "How do I pay, and what if I cancel?",
    a: "A 30% deposit confirms your dates and your crew; the balance is due 45 days before you walk in. Cancel more than 60 days out and the deposit transfers to another date within a year. Inside 45 days the balance is non-refundable, which is precisely what your travel insurance is for.",
  },
];

export const safariFaqs: Faq[] = [
  {
    q: "What is the northern circuit?",
    a: "The Serengeti, the Ngorongoro Crater, Tarangire and Lake Manyara — four parks within driving distance of Arusha and Moshi, holding the Great Migration, the Big Five and the crater floor. It is where a first Tanzanian safari should go, and every safari on this site is built from it.",
  },
  {
    q: "When should I come?",
    a: "It depends what you want to see. The migration river crossings are June to September; calving on the southern Serengeti plains is January to March. June to October is dry across the whole circuit and the game concentrates around water, which makes it the easiest time to see a lot. Each park's page states its own best months.",
  },
  {
    q: "Will I see the Big Five?",
    a: "Lion, elephant, buffalo and rhino are all realistic on the northern circuit; leopard is the one nobody can promise. Rhino means the Ngorongoro Crater specifically. Any operator guaranteeing all five is guaranteeing something they do not control.",
  },
  {
    q: "Private vehicle or shared?",
    a: "Both. A shared seat-in-vehicle safari is cheaper and sociable; a private vehicle means you stop when you want and stay as long as you want at a sighting, which matters a great deal if you are photographing. Every itinerary states which it is, and we will quote the other on request.",
  },
  {
    q: "What is the vehicle like?",
    a: "A custom-built 4x4 with a pop-up roof for standing game viewing, never more than six people to a vehicle so nobody sits in the middle, and drinking water on board throughout. Your driver-guide stays with you for the whole trip rather than changing at each park.",
  },
  {
    q: "Where do we sleep?",
    a: "Lodges and tented camps, full board, with the standard set with you before you pay a deposit rather than after. Our itineraries move camp with the route rather than driving out and back from a single base — on the northern circuit where you sleep decides what you see the next morning.",
  },
  {
    q: "Is it safe?",
    a: "Yes, with the ordinary conditions: you stay in the vehicle unless your guide says otherwise, you do not walk in the parks outside designated areas, and you follow the camp's instructions after dark. Our guides are licensed and have worked these parks for years.",
  },
  {
    q: "Can I combine a safari with a climb or with Zanzibar?",
    a: "That is the most-booked shape of trip we run. The usual order is the mountain first while you are fresh, then the parks while your legs recover, then the coast. Our combo trips do exactly that as a single booking with one deposit — or build your own in the planner and see the total.",
  },
  {
    q: "What about the balloon, walking safaris and night drives?",
    a: "All available and all bookable with the itinerary rather than at the gate, because each needs a permit, a dawn start or both. They are priced separately — tell us which you want when you enquire and they go into the quote.",
  },
  {
    q: "How much does a safari cost?",
    a: "Our three northern-circuit itineraries start at $1,800 per person for five days and run to $2,620 for seven. Park fees are most of it, which is why the per-person rate falls as the group grows and why a one-day extension costs more than you might expect.",
  },
];
