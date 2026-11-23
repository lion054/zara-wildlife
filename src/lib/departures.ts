import "server-only";
import { tanova, tanovaConfigured } from "@/lib/tanova";
import { tourPath, tours, type Tour } from "@/lib/tours";

/**
 * Dates and seats come live from Tanova, never from this repo. The office adds a
 * group departure in Tanova (/vendor/departures) and it appears here within a
 * minute, with the seats left kept in step with bookings as they are made.
 */
export type Departure = {
  tourKey: string;
  tourId: number;
  title: string;
  href: string;
  /** ISO date the group sets off. */
  start: string;
  /** ISO date it ends, from the tour's length. */
  end: string | null;
  days: number | null;
  price: number | null;
  capacity: number | null;
  seatsLeft: number | null;
  open: boolean;
};

type Day = { date: string; status: string; capacity: number | null; seats_left: number | null; price: number | null };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};

/** Bookable days of one tour over the next `horizon` days. */
export async function departuresFor(tour: Tour, horizon = 365): Promise<Departure[]> {
  if (!tanovaConfigured || !tour.tanovaId) return [];
  const from = iso(new Date());
  try {
    // The API answers at most 120 days at a time: walk the horizon in windows.
    const windows: [string, string][] = [];
    for (let s = from; s <= addDays(from, horizon); s = addDays(s, 121)) windows.push([s, addDays(s, 120)]);
    // One retry: a single slow answer from Tanova must not show a group climb as having no dates for a whole minute.
    const get = (a: string, b: string) =>
      tanova<{ data: { days: Day[] } }>(`/services/tours/${tour.tanovaId}/departures?from=${a}&to=${b}`, { revalidate: 60 });
    const pages = await Promise.all(windows.map(([a, b]) => get(a, b).catch(() => get(a, b))));
    const nights = parseInt(tour.duration ?? "", 10) || null;
    return pages
      .flatMap((p) => p.data.days)
      .map((d) => ({
        tourKey: tour.key,
        tourId: tour.tanovaId!,
        title: tour.title,
        href: tourPath(tour),
        start: d.date,
        end: nights ? addDays(d.date, nights - 1) : null,
        days: nights,
        price: d.price ?? tour.from,
        capacity: d.capacity,
        seatsLeft: d.seats_left,
        open: (d.status === "open" || d.status === "filling") && (d.seats_left === null || d.seats_left > 0),
      }));
  } catch {
    return [];
  }
}

/** Every upcoming group departure across all group tours, soonest first. */
export async function upcomingGroupDepartures(limit = 12): Promise<Departure[]> {
  const group = tours.filter((t) => t.kind === "group" && t.tanovaId);
  const all = (await Promise.all(group.map((t) => departuresFor(t)))).flat();
  return all.sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title)).slice(0, limit);
}
