/**
 * Combo packages — climb, then safari, then beach.
 *
 * This is the operator's highest-value product line and this rebuild carried
 * none of it. Names, lengths and prices below are from the Tanzania Combo
 * Tours page (30 July 2026).
 *
 * ⚠️ The 10-day safari-and-Zanzibar package shows "From $2,000" on the live
 * site. That is the same CMS placeholder that appears on a day trip, a Meru
 * climb and a 2-day Zanzibar package — so it is recorded as unpriced here,
 * not as $2,000. The three prices that are clearly real ($3,378, $3,382 and
 * $3,820) are carried through.
 */

export type Combo = {
  slug: string;
  name: string;
  days: number;
  nights: number;
  /** Null where the operator publishes no trustworthy price. */
  price: number | null;
  legs: string[];
  summary: string;
  photoBrief: string;
  photoKey: string;
};

export const combos: Combo[] = [
  {
    slug: "kilimanjaro-and-safari",
    name: "Kilimanjaro Climb and Safari",
    days: 15,
    nights: 14,
    price: 3378,
    legs: ["Kilimanjaro", "Northern circuit safari"],
    summary:
      "Two weeks: the mountain first, while you are fresh, then the parks while your legs recover. The most-booked combination and the one that makes the most sense.",
    photoBrief:
      "A split frame — summit sign and a crater-floor lion — or the two shots side by side.",
    photoKey: "combo-kili-safari",
  },
  {
    slug: "machame-and-serengeti",
    name: "Kilimanjaro Climb and Serengeti Adventure",
    days: 14,
    nights: 13,
    price: 3382,
    legs: ["Machame route", "Serengeti", "Ngorongoro"],
    summary:
      "Machame up the mountain, then straight into the Serengeti and the crater. Tighter than the 15-day and priced within four dollars of it — ask us which one actually fits your dates.",
    photoBrief: "The Barranco Wall and the Serengeti plains in one spread.",
    photoKey: "combo-machame-serengeti",
  },
  {
    slug: "lemosho-and-safari",
    name: "Ultimate Kilimanjaro Trek & Safari",
    days: 15,
    nights: 14,
    price: 3820,
    legs: ["Lemosho route", "Serengeti", "Ngorongoro", "Tarangire"],
    summary:
      "The Lemosho approach — the best summit odds short of the Northern Circuit — followed by three parks. The most expensive combo, and the one with the highest chance of both halves going right.",
    photoBrief: "Shira Plateau camp at dawn, paired with a Tarangire baobab.",
    photoKey: "combo-lemosho-safari",
  },
  {
    slug: "safari-and-zanzibar-10-day",
    name: "Tanzania Safari and Zanzibar",
    days: 10,
    nights: 9,
    price: null,
    legs: ["Northern circuit safari", "Zanzibar"],
    summary:
      "No mountain. Parks for the first half, the island for the second — the right trip if you are not climbing, or are bringing people who are not.",
    photoBrief: "A dhow at sunset, to make clear this one is not a climb.",
    photoKey: "combo-safari-zanzibar",
  },
  {
    slug: "safari-and-zanzibar-12-day",
    name: "Tanzania Safari Tours & Zanzibar Escape",
    days: 12,
    nights: 11,
    price: null,
    legs: ["Northern circuit safari", "Zanzibar"],
    summary:
      "The same shape as the 10-day with two more nights, which in practice means a third park and an unhurried last day on the coast.",
    photoBrief: "Wide beach, nobody on it, late light.",
    photoKey: "combo-safari-zanzibar-12",
  },
];

/** What the operator says every combo covers, from the combo page FAQs. */
export const comboNotes = [
  {
    q: "How long does a combo run?",
    a: "The climb takes 6 to 8 days, safari another 3 to 4 in the Serengeti and Ngorongoro, and Zanzibar 4 to 5. Most people land between 10 and 15 days in total.",
  },
  {
    q: "Where do you sleep?",
    a: "Tents or mountain huts on Kilimanjaro, lodges and tented camps on safari, and beachfront hotels or resorts in Zanzibar. The standard is yours to set on the safari and beach legs.",
  },
  {
    q: "When should I come?",
    a: "June to October and December to February. Both are dry, which matters more for the climb than for the beach — and June to October is also when the migration is at its most dramatic.",
  },
  {
    q: "Can I change the safari half?",
    a: "Yes. The climb is fixed by the route you pick; the safari is not. Big Five focus, migration timing or a private vehicle are all decided with you before you pay.",
  },
];
