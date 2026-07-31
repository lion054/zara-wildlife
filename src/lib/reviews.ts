/**
 * Reviews.
 *
 * Verbatim from the operator's TripAdvisor feed as reproduced on their own
 * homepage (30 July 2026), lightly trimmed for length only — no wording is
 * changed and nothing is invented.
 *
 * These are the most persuasive material the company owns and the rebuild was
 * showing only a count. Nearly every one names a guide, which is why the
 * about page lists guides by name in the first place: `guide` links the two,
 * so a visitor who reads a review can go and ask for that person.
 */

export type Review = {
  author: string;
  title: string;
  /** Trimmed for length; never reworded. */
  quote: string;
  /** Matches a name in `guides` where the review names one. */
  guide?: string;
  /** What they booked, where the review makes it clear. */
  trip?: string;
};

export const reviews: Review[] = [
  {
    author: "Milena",
    title: "Best safari experience",
    quote:
      "We went to four different parks with Mansoul who knew them all very well and worked hard to show us all the animals that we had hoped to see, and many more. This trip gave me the first close up experience with a leopard and with cubs. If you are not sure of the company to pick, go with TWA.",
    guide: "Mansoul",
    trip: "Northern circuit safari",
  },
  {
    author: "Aarne864",
    title: "Highly rewarding",
    quote:
      "It all came together because of the excellent planning and preparation by Patrick at the office, coupled with an excellent guide — Mustapha. He made our trip a great adventure with his mastery in finding animals, captivating lessons about conservation, history and culture.",
    guide: "Mustapha",
    trip: "Safari with cultural visits",
  },
  {
    author: "Daris",
    title: "Unforgettable family safari",
    quote:
      "Patmos was really tuned in during the trip, nothing could go past his keen eyes. He found wildlife in places where we could not find any and that enriched our experience in a big way. Back in camp Patmos would keep us company in the evenings at the campfire with his lively stories.",
    guide: "Patmos",
    trip: "Family safari",
  },
  {
    author: "Katarina B",
    title: "The most incredible vacation",
    quote:
      "From the moment Baraka collected us from our hotel in Moshi we immediately got to like him. He is easygoing, charming and a very experienced guide. He knew where to find the animals, their routes, and translated a lot of Swahili and Maasai between us and the locals.",
    guide: "Baraka",
    trip: "Family of six, northern circuit",
  },
  {
    author: "Lonut",
    title: "Super adventure in Tanzania",
    quote:
      "We spent the entire tour with guide Kihori, he is the reason our trip was so fabulous. His knowledge of the circuit animals, birds, history, tribes and migration routes was second to none. We managed to see some of the best sunsets in Serengeti.",
    guide: "Kihori",
    trip: "Serengeti and the crater",
  },
  {
    author: "Oskar Bamble",
    title: "Our favourite holiday destination",
    quote:
      "This was our second safari with Tanzania Wildlife Adventures and that must count for something. We were ecstatic to have Jason as our guide again — they had honoured our request to have him with us on tour again. His service is a cut above the rest.",
    guide: "Jason",
    trip: "Returning guests",
  },
  {
    author: "Daydream",
    title: "Amazing encounter",
    quote:
      "Rafael was really entertaining, patient and informed. Communication was easy because he spoke French and English well. At Ngorongoro we had the good fortune to witness a rhino up close. Zanzibar was similarly breathtaking — visiting a local spice farm was one of our favourite experiences.",
    guide: "Rafael",
    trip: "Safari and Zanzibar",
  },
  {
    author: "John W",
    title: "Best experience ever",
    quote:
      "Amazing trip, amazing guide, nice hotel and food as well. Thank you so much Yusuph for organising us this amazing trip.",
    guide: "Yusuph",
    trip: "Kilimanjaro",
  },
];

/** Reviews that name a given guide, for their entry on the about page. */
export const reviewsFor = (guide: string) =>
  reviews.filter((r) => r.guide === guide);
