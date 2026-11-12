/**
 * Islamic dates that matter when planning a trip to Tanzania.
 *
 * ⚠️ These are CALCULATED from the tabular Islamic calendar, not announced.
 * The real dates follow the moon and can land a day either side of what is
 * shown, so the page says "expected" everywhere and tells people to confirm
 * before booking flights. Hijri year 1448 runs June 2026 – June 2027.
 *
 * `travel` is a planning note, not a promise about what the operator runs.
 */

export type Outlook = "busy" | "quiet" | "special" | "plan";

export type IslamicEvent = {
  id: string;
  name: string;
  /** ISO, inclusive. A single day has start === end. */
  start: string;
  end: string;
  hijri: string;
  kind: "eid" | "ramadan" | "night" | "new-year" | "other";
  outlook: Outlook;
  outlookLabel: string;
  note: string;
  travel: string;
};

export const outlookStyle: Record<Outlook, string> = {
  busy: "bg-sunrise text-basalt",
  quiet: "bg-tanzanite text-glacier",
  special: "bg-brand text-basalt",
  plan: "bg-basalt text-glacier",
};

export const islamicEvents: IslamicEvent[] = [
  {
    id: "mawlid-1448",
    name: "Mawlid al-Nabi",
    start: "2026-08-26",
    end: "2026-08-26",
    hijri: "12 Rabi’ al-Awwal 1448",
    kind: "other",
    outlook: "special",
    outlookLabel: "Good time to travel",
    note: "The Prophet’s birthday. Observed in Zanzibar and along the coast.",
    travel:
      "Peak migration season in the Serengeti, so book early. Stone Town is lively, and some businesses there close for the day.",
  },
  {
    id: "isra-1448",
    name: "Isra and Mi’raj",
    start: "2027-01-06",
    end: "2027-01-06",
    hijri: "27 Rajab 1448",
    kind: "night",
    outlook: "quiet",
    outlookLabel: "Easy to travel",
    note: "The night journey. A day of prayer rather than a public holiday.",
    travel:
      "Calving season in the southern Serengeti follows. Travel is unaffected and mosques welcome visitors at prayer times.",
  },
  {
    id: "ramadan-1448",
    name: "Ramadan",
    start: "2027-02-08",
    end: "2027-03-09",
    hijri: "Ramadan 1448",
    kind: "ramadan",
    outlook: "plan",
    outlookLabel: "Plan around fasting",
    note: "A month of fasting from dawn to sunset. Many Muslim travellers choose to travel in it, many do not.",
    travel:
      "Fasting on a safari or a climb is a personal decision. Ask us early about early starts, a suhoor and iftar at camp, and shorter driving days. Coastal restaurants may open late in the day. It is also a quiet month, with fewer visitors and lower prices.",
  },
  {
    id: "qadr-1448",
    name: "Laylat al-Qadr (expected)",
    start: "2027-03-06",
    end: "2027-03-06",
    hijri: "27 Ramadan 1448",
    kind: "night",
    outlook: "plan",
    outlookLabel: "Plan around fasting",
    note: "The Night of Power, traditionally sought in the last ten nights of Ramadan.",
    travel:
      "Many travellers prefer to be near a mosque for the last ten nights. Tell us and we will build the route around it.",
  },
  {
    id: "fitr-1448",
    name: "Eid al-Fitr",
    start: "2027-03-10",
    end: "2027-03-12",
    hijri: "1 Shawwal 1448",
    kind: "eid",
    outlook: "busy",
    outlookLabel: "Book early",
    note: "The end of Ramadan, and a public holiday in Tanzania.",
    travel:
      "Flights, ferries to Zanzibar and beach hotels fill up around Eid, and local families travel too. Book at least two months ahead. Eid prayers are in the morning, so we plan a late start on the day.",
  },
  {
    id: "adha-1448",
    name: "Eid al-Adha",
    start: "2027-05-17",
    end: "2027-05-19",
    hijri: "10 Dhul Hijjah 1448",
    kind: "eid",
    outlook: "busy",
    outlookLabel: "Book early",
    note: "The Feast of Sacrifice, and a public holiday in Tanzania. It follows the Hajj.",
    travel:
      "Another busy window for flights and Zanzibar. It falls in the long rains, so the parks are green, quiet and cheaper, and Kilimanjaro is wet but climbable. Many families spend it on the coast.",
  },
  {
    id: "new-year-1449",
    name: "Islamic New Year",
    start: "2027-06-06",
    end: "2027-06-06",
    hijri: "1 Muharram 1449",
    kind: "new-year",
    outlook: "special",
    outlookLabel: "Good time to travel",
    note: "The start of Hijri year 1449.",
    travel:
      "The dry season is beginning, which is the best time for both the Serengeti and Kilimanjaro. A good moment to book before prices rise for July.",
  },
  {
    id: "ashura-1449",
    name: "Ashura",
    start: "2027-06-15",
    end: "2027-06-15",
    hijri: "10 Muharram 1449",
    kind: "other",
    outlook: "quiet",
    outlookLabel: "Easy to travel",
    note: "A day of fasting and remembrance. Not a public holiday.",
    travel: "Travel is unaffected. Good weather on the mountain and in the parks.",
  },
  {
    id: "mawlid-1449",
    name: "Mawlid al-Nabi",
    start: "2027-08-15",
    end: "2027-08-15",
    hijri: "12 Rabi’ al-Awwal 1449",
    kind: "other",
    outlook: "special",
    outlookLabel: "Good time to travel",
    note: "The Prophet’s birthday.",
    travel: "Peak safari season. Book early.",
  },
  {
    id: "ramadan-1449",
    name: "Ramadan",
    start: "2028-01-28",
    end: "2028-02-26",
    hijri: "Ramadan 1449",
    kind: "ramadan",
    outlook: "plan",
    outlookLabel: "Plan around fasting",
    note: "Ramadan moves about eleven days earlier each year, so it falls in the Tanzanian summer.",
    travel:
      "January and February are warm and dry, and good for Kilimanjaro. Short days of fasting are still long ones at altitude. Talk to us before choosing a route.",
  },
  {
    id: "fitr-1449",
    name: "Eid al-Fitr",
    start: "2028-02-27",
    end: "2028-02-29",
    hijri: "1 Shawwal 1449",
    kind: "eid",
    outlook: "busy",
    outlookLabel: "Book early",
    note: "The end of Ramadan, and a public holiday in Tanzania.",
    travel: "Book flights and Zanzibar at least two months ahead.",
  },
];

export const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const eventsOn = (iso: string) =>
  islamicEvents.filter((e) => iso >= e.start && iso <= e.end);
