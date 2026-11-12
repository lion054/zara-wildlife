import data from "@/data/tours.json";

/**
 * Every tour page from the previous site, as data: day-by-day itineraries,
 * per-person price ladders, inclusions, accommodation and the day-trip tab
 * text. Generated once from the live pages, then owned here — edit
 * `src/data/tours.json` directly. Prices the operator has not set (the live
 * site shows a flat $2,000 placeholder) are left empty and render as
 * "On request".
 */
export type Img = { src: string; width: number; height: number; alt?: string | null };

export type TourDay = {
  n: number;
  label: string;
  stats: Record<string, string>;
  text: string[];
  overnight: string | null;
  images: Img[];
};

export type TourKind = "kili" | "meru" | "group" | "safari" | "combo" | "zanzibar" | "daytrip";

export type Tour = {
  key: string;
  kind: TourKind;
  oldSlug: string;
  title: string;
  metaDescription: string | null;
  duration: string | null;
  places: string[];
  from: number | null;
  overview: string[];
  days: TourDay[];
  accommodation: { name?: string; location?: string | null; description: string[]; amenities: string[]; images: Img[] }[];
  sections: { label: string; text: string[] }[];
  ladder: { size: string; price: number | null }[];
  included: { text: string; sub: boolean }[];
  excluded: { text: string; sub: boolean }[];
  hero: Img | null;
  map: Img | null;
  gallery: Img[];
  hasGroupNote: boolean;
  /** Tanova tour id: what bookings, departures and waitlist entries refer to. */
  tanovaId?: number;
  /** True for group departures: they run only on dates listed in Tanova. */
  fixedDate?: boolean;
};

export const tours = data as unknown as Tour[];

export const toursOfKind = (...kinds: TourKind[]) => tours.filter((t) => kinds.includes(t.kind));
export const getTour = (kind: TourKind | TourKind[], key: string) => {
  const kinds = Array.isArray(kind) ? kind : [kind];
  return tours.find((t) => kinds.includes(t.kind) && t.key === key);
};

/** Where each kind lives on this site. */
export const tourPath = (t: Pick<Tour, "kind" | "key">) =>
  ({
    kili: `/kilimanjaro/packages/${t.key}`,
    meru: `/kilimanjaro/packages/${t.key}`,
    group: `/departures/${t.key}`,
    safari: `/safaris/packages/${t.key}`,
    combo: `/combos/${t.key}`,
    zanzibar: `/zanzibar/${t.key}`,
    daytrip: `/day-trips/${t.key}`,
  })[t.kind];

/** Summary for cards: as much of the overview as fits, cut at a word. */
export const excerpt = (t: Tour, n = 190) => {
  const s = t.overview.join(" ").replace(/\s+/g, " ").trim();
  return s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s;
};

/** Title with what tells similar trips apart: "Lemosho Route · 8 days · Group". */
export const displayTitle = (t: Tour) => {
  if (t.title.includes(" · ")) return t.title.replace(/\s*·\s*Group$/, ""); // Tanova already stores the full title
  if (t.kind !== "kili" && t.kind !== "meru" && t.kind !== "group") return t.title;
  const d = parseInt(t.duration ?? "", 10);
  const days = d && !/\d/.test(t.title) ? ` · ${d} days` : "";
  return `${t.title}${days}${t.kind === "group" ? " · Group" : ""}`;
};
