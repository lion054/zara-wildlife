/**
 * What a booking actually covers.
 *
 * These are the operator's own published Included / Excluded lists, taken
 * from the per-route pages on tanzaniawildlifeadventures.com (30 July 2026).
 * The same two lists appear identically on every Kilimanjaro route page, so
 * they are held once here rather than restated per route.
 *
 * ⚠️ Two things worth an argument with the operator before launch:
 *
 *  1. EMERGENCY OXYGEN is on their excluded list. An earlier draft of this
 *     rebuild promised "a bottled-oxygen cylinder per group" as included.
 *     That was wrong and has been corrected. Most reputable Kilimanjaro
 *     operators carry oxygen as standard — if this one does, it belongs in
 *     `climbIncluded` and the operator should say so; if it does not, that is
 *     a safety conversation, not a copy conversation.
 *
 *  2. PORTER WAGES. They list "salaries for guides, porters, cook, and
 *     waiter" but name no wage floor and no KPAP membership number. The
 *     about page claims KPAP membership. One of the two needs evidence.
 */

export type Term = {
  text: string;
  /** Detail the operator publishes underneath the line item. */
  detail?: string;
};

/** Verbatim from the operator's published climb terms. */
export const climbIncluded: Term[] = [
  {
    text: "Two nights' hotel in Moshi, before and after the climb",
    detail: "First night includes breakfast; last night includes dinner and breakfast.",
  },
  { text: "Qualified guides and mountain crew" },
  { text: "Kilimanjaro National Park fees" },
  { text: "Hut or camping fees" },
  {
    text: "Tents, foam sleeping pads, cooking equipment and eating utensils",
  },
  { text: "Rescue fees", detail: "Required by the National Park." },
  { text: "Pulse oximeters" },
  { text: "First aid kit" },
  { text: "Salaries for guides, porters, cook and waiter" },
  {
    text: "Airport transfers",
    detail: "To and from Kilimanjaro International Airport (JRO).",
  },
  { text: "All meals on the mountain — breakfast, lunch and dinner" },
  {
    text: "Accommodation and park entry for the crew",
    detail: "Guides, porters, waiter and cook, for the whole climb.",
  },
];

/** Verbatim from the operator's published climb terms. */
export const climbExcluded: Term[] = [
  { text: "International flights" },
  { text: "Visa fees and travel insurance" },
  {
    text: "Emergency oxygen",
    detail:
      "Not carried as standard. Ask before you book, and ask what the evacuation plan is above Barafu.",
  },
  {
    text: "Tips for guides, porters, cook and waiter",
    detail: "Envelopes are provided at the hotel at the end of the climb.",
  },
  {
    text: "Personal mountain equipment such as sleeping bags",
    detail: "Most of it can be rented in Moshi — ask for the rental price list.",
  },
  { text: "Single room supplement at the hotel" },
  { text: "Nights beyond the two hotel nights included" },
  {
    text: "Extra activities",
    detail: "Waterfall tours, cultural village visits and the like — see day trips.",
  },
  { text: "Personal expenses" },
];

/** Verbatim from the operator's published day-trip terms. */
export const dayTripIncluded: Term[] = [
  { text: "Transfers from your hotel and back" },
  { text: "Professional guide services" },
  { text: "Packed lunch" },
  { text: "Entrance fees to the attractions on the itinerary" },
];

export const dayTripExcluded: Term[] = [
  { text: "Tips for your guide and driver" },
  { text: "Drinks and personal expenses" },
  { text: "Anything not named on the itinerary" },
];
