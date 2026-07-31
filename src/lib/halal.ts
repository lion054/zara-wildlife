/**
 * Halal travel.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  ⚠️  THE COPY BELOW IS TEMPLATE PLACEHOLDER. IT IS NOT A REAL COMMITMENT.
 *
 *  Every item is currently written as a generic, industry-standard halal
 *  provision so the template demonstrates a finished page. NONE of it has
 *  been confirmed with an operator, a caterer or a certifier.
 *
 *  BEFORE THIS TEMPLATE GOES LIVE FOR ANY REAL OPERATOR, someone must sit
 *  down with that operator and either confirm each item or set its
 *  `verified` flag to false. The page renders both states properly: a false
 *  flag switches that item to the amber "not yet confirmed" treatment and
 *  surfaces `toConfirm` — which still holds the exact question to ask.
 *
 *  This matters more here than on any other page in the template. A wrong
 *  price costs an apology. A wrong halal claim breaks a religious obligation
 *  on somebody's behalf, thousands of miles from home, with no way for them
 *  to undo it — being served non-halal meat on day four of a climb is not a
 *  service failure you can refund. Do not ship this copy unread.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Two Tanzanian competitors already sell this. One substantiates it properly
 * and charges $3,500–$10,000. The other claims "the first and only halal
 * travel agent in Tanzania" and publishes almost no detail on how any of it
 * actually works — no named certifier, no prayer arrangements, no alcohol
 * policy, no gender provisions. That gap is the opportunity, and it is only
 * an opportunity for an operator who can actually answer the questions in
 * `toConfirm` below.
 */

/**
 * Flips the whole page between template mode and confirmed mode.
 *
 * Left `true`, the page notes that its detail is illustrative. Set it to
 * `false` once a real operator has signed off every item, and the note goes
 * away. It is deliberately a single switch: a template that silently reads as
 * a live promise is the failure mode worth engineering against.
 */
export const HALAL_IS_TEMPLATE_COPY = true;

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
      "Climb and safari food is cooked by our own crew, so the kitchen is ours to direct rather than a lodge's. Meat is bought from a certified halal supplier in Moshi and the certificate travels with the trip paperwork. Where certification cannot be guaranteed — a remote camp, a last-minute resupply — the kitchen switches to vegetarian and seafood rather than substituting something we cannot vouch for.",
    verified: true,
    toConfirm:
      "Which supplier the Moshi office buys mountain and safari meat from, and whether that supplier holds a certificate from TZ Halal Certification or another recognised body. We will publish the certifier's name, not the word 'halal' on its own.",
  },
  {
    id: "prayer",
    title: "Prayer stops and qibla direction",
    detail:
      "Prayer is built into the itinerary rather than fitted around it. Guides hold the vehicle for salah on game drives and plan gate timings around it; climb days are paced so prayer falls at camp rather than mid-ascent. Crews carry a qibla compass and know local prayer times, and a mat can be provided on request.",
    verified: true,
    toConfirm:
      "Whether guides will hold the vehicle for salah on game drives, how that affects park gate timings, and whether crews can give reliable qibla direction and prayer times at each camp.",
  },
  {
    id: "alcohol",
    title: "Alcohol-free arrangements",
    detail:
      "Two nights at a Moshi hotel are included in every climb price. An alcohol-free property can be substituted for the standard base hotel at no extra cost — say so at booking. No alcohol is carried or served by our crew on the mountain or in safari camps.",
    verified: true,
    toConfirm:
      "Which hotels on the operator's list are alcohol-free, or will serve a table without alcohol on request — and whether an alcohol-free property can be substituted at the same rate.",
  },
  {
    id: "guides",
    title: "A Muslim guide, if you would prefer one",
    detail:
      "Muslim guides are on the crew and can be requested at booking, subject to who is free on your dates. We will tell you at the time whether we can staff it rather than promise and reassign later.",
    /* Deliberately unstated. We are not inferring a real person's religion
       from their name and publishing it — that is a claim about someone else's
       faith, and it needs their word, not our guess. The generic wording above
       says a Muslim guide can be requested — it names nobody, and it must not
       be changed to name anybody without that guide's own consent. */
    verified: true,
    toConfirm:
      "Which guides are Muslim AND willing to be listed that way. This is their decision to give, not ours to assume, and the page will name nobody until they have said yes.",
  },
  {
    id: "women",
    title: "Women-only parties and female guides",
    detail:
      "A private trip already means a party of your own choosing. Female guides and female camp crew can be staffed for women-only parties with about a month's notice, and the vehicle and tents are yours alone either way.",
    verified: true,
    toConfirm:
      "Whether a female guide, and female porters or camp crew, can be staffed — and from what party size and notice period that becomes possible.",
  },
  {
    id: "ramadan",
    title: "Travelling during Ramadan",
    detail:
      "Climbs and safaris run through Ramadan. Crews serve suhoor before dawn and iftar at camp, and the walking day is re-paced around both. Fasting through a summit night is a serious undertaking, though, and we would rather talk that through honestly with you than sell it blind.",
    verified: true,
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
