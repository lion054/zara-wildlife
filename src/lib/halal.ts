/**
 * Halal travel.
 *
 * ⚠️ READ BEFORE EDITING. This file is the reason the page is safe to publish.
 *
 * A halal page is unlike every other page on this site. A wrong price costs
 * money and an apology. A wrong halal claim breaks a religious obligation on
 * somebody's behalf, thousands of miles from home, with no way for them to
 * undo it — being served non-halal meat on day four of a climb is not a
 * service failure, it is a violation of something that matters far more to
 * that traveller than the holiday does.
 *
 * Two Tanzanian competitors already sell this. One substantiates it properly
 * and charges $3,500–$10,000. The other claims "the first and only halal
 * travel agent in Tanzania" and, on inspection, publishes almost no detail on
 * how any of it actually works — no named certifier, no prayer arrangements,
 * no alcohol policy, no gender provisions. That gap is the opportunity, and
 * copying either of them would waste it.
 *
 * So every commitment below carries `verified`. `true` means somebody can
 * point at a fact — a document, a booking condition, or a property of the
 * destination itself. `false` renders the same amber marker the rate cards
 * use, states plainly that it is not yet confirmed, and names exactly what
 * the Moshi office has to supply. Nothing here is aspirational copy.
 *
 * The page ships honest at 40% confirmed and tightens as answers arrive. It
 * must never ship at 100% by assertion.
 */

export type HalalCommitment = {
  id: string;
  /** The heading a traveller scans for. */
  title: string;
  /** What we can say today, stated exactly as far as it is true. */
  detail: string;
  /**
   * True only where the claim rests on something checkable. Where it rests on
   * an operational promise nobody has yet confirmed, this is false and the
   * page says so rather than implying otherwise.
   */
  verified: boolean;
  /** The precise question the Moshi office must answer. Rendered when unverified. */
  toConfirm?: string;
};

export const halalCommitments: HalalCommitment[] = [
  {
    id: "zanzibar",
    title: "Zanzibar, where halal is the default",
    detail:
      "Zanzibar is roughly 99% Muslim. In Stone Town and along the coast, halal food and daily prayer are not a special arrangement anybody has to make for you — they are how the island already runs. Every one of our Zanzibar packages is based there.",
    /* A fact about the destination, not a promise about us. */
    verified: true,
  },
  {
    id: "private",
    title: "A private trip, on your own timing",
    detail:
      "Every climb and safari we run can be private rather than shared. Private means your own vehicle and your own crew, which is what makes prayer stops, a modest dress code and a women-only party straightforward rather than a negotiation with strangers. Private climbs run any day of the year.",
    /* Already true and already published on the route and departure pages. */
    verified: true,
  },
  {
    id: "party",
    title: "Priced for a family or a group travelling together",
    detail:
      "The per-person rate falls as the party grows, and the full ladder is published on each route and day-trip page. A family of six pays materially less a head than two people do, and you can see that before you speak to anyone.",
    /* The ladders are in the dataset and render on the pages. */
    verified: true,
  },
  {
    id: "catering",
    title: "Halal catering on the mountain and on safari",
    detail:
      "Climb food is cooked by our own crew, so the kitchen is ours to direct rather than a lodge's. What we cannot yet publish is who certifies the meat.",
    verified: false,
    toConfirm:
      "Which supplier the Moshi office buys mountain and safari meat from, and whether that supplier holds a certificate from TZ Halal Certification or another recognised body. We will publish the certifier's name, not the word 'halal' on its own.",
  },
  {
    id: "prayer",
    title: "Prayer stops and qibla direction",
    detail:
      "Safari days are long drives between parks and climb days run to a fixed camp schedule, so prayer has to be planned into the itinerary rather than fitted around it.",
    verified: false,
    toConfirm:
      "Whether guides will hold the vehicle for salah on game drives, how that affects park gate timings, and whether crews can give reliable qibla direction and prayer times at each camp.",
  },
  {
    id: "alcohol",
    title: "Alcohol-free arrangements",
    detail:
      "Two nights at a Moshi hotel are included in every climb price, and our current base hotel has a bar.",
    verified: false,
    toConfirm:
      "Which hotels on the operator's list are alcohol-free, or will serve a table without alcohol on request — and whether an alcohol-free property can be substituted at the same rate.",
  },
  {
    id: "guides",
    title: "A Muslim guide, if you would prefer one",
    detail:
      "Several of the guides named on this site by guests in their own reviews are long-serving members of the crew.",
    /* Deliberately unstated. We are not inferring a real person's religion
       from their name and publishing it — that is a claim about someone else's
       faith, and it needs their word, not our guess. */
    verified: false,
    toConfirm:
      "Which guides are Muslim AND willing to be listed that way. This is their decision to give, not ours to assume, and the page will name nobody until they have said yes.",
  },
  {
    id: "women",
    title: "Women-only parties and female guides",
    detail:
      "A private trip already means a party of your own choosing. Crew is the open question.",
    verified: false,
    toConfirm:
      "Whether a female guide, and female porters or camp crew, can be staffed — and from what party size and notice period that becomes possible.",
  },
  {
    id: "ramadan",
    title: "Travelling during Ramadan",
    detail:
      "Fasting through a summit night is a serious undertaking and we would rather talk it through than sell it blind.",
    verified: false,
    toConfirm:
      "Whether crews can serve suhoor before dawn and iftar at camp on a climb, and what the office's honest advice is on attempting a summit push while fasting.",
  },
];

/** How much of the offer is confirmed. Rendered on the page, not hidden. */
export const halalConfidence = () => {
  const total = halalCommitments.length;
  const confirmed = halalCommitments.filter((c) => c.verified).length;
  return { total, confirmed, pending: total - confirmed };
};
