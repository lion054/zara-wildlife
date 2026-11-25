"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

/** One route as the board shows it: a short name, its colour, a photo and where it starts. */
export type BoardRoute = {
  key: string;
  name: string; // "Lemosho Route"
  days: number | null;
  startsAt: string | null; // first camp or gate
  color: string; // a CSS colour for the route's dot and accents
  photo: { src: string; width: number; height: number } | null;
};

/** One departure, already resolved to its route. */
export type BoardDeparture = {
  routeKey: string;
  href: string;
  start: string;
  end: string | null;
  price: number | null;
  capacity: number | null;
  seatsLeft: number | null;
  open: boolean;
  /** What one person puts down to hold a seat (the group's deposit), when there is one. */
  hold: number | null;
};

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", o);
const monthOf = (iso: string) => iso.slice(0, 7);
const FEW = 4;

/**
 * The group departures board: route chips on top; "When would you like to climb?" with the years and the months that have
 * every month (rainy months marked); "Choose your departure" with how many are climbing, then the departures by month.
 */
/** Kilimanjaro's wet months: the long rains (April, May) and the short rains (November). */
const RAINY = new Set([4, 5, 11]);
const isRainy = (monthKey: string) => RAINY.has(Number(monthKey.slice(5, 7)));

export function DepartureBoard({ routes, departures }: { routes: BoardRoute[]; departures: BoardDeparture[] }) {
  const byKey = useMemo(() => new Map(routes.map((r) => [r.key, r])), [routes]);
  const [route, setRoute] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null); // "2027-01", or null for every month of the year
  const [climbers, setClimbers] = useState(2);

  const forRoute = useMemo(() => departures.filter((d) => !route || d.routeKey === route), [departures, route]);
  // Show every month in the upcoming calendar range, including months without published departures.
  const years = useMemo(() => {
    const firstYear = new Date().getFullYear();
    const lastTripYear = Math.max(firstYear, ...forRoute.map((d) => Number(d.start.slice(0, 4))));
    return Array.from({ length: lastTripYear - firstYear + 1 }, (_, i) => String(firstYear + i));
  }, [forRoute]);
  const [yearPick, setYearPick] = useState<string | null>(null);
  const year = yearPick && years.includes(yearPick) ? yearPick : (years[0] ?? null);
  const months = useMemo(() => {
    const c = new Map<string, number>();
    for (const d of forRoute) if (d.start.startsWith(year ?? "")) c.set(monthOf(d.start), (c.get(monthOf(d.start)) ?? 0) + 1);
    return Array.from({ length: 12 }, (_, i) => {
      const m = `${year}-${String(i + 1).padStart(2, "0")}`;
      return [m, c.get(m) ?? 0] as [string, number];
    });
  }, [forRoute, year]);
  const shownMonth = month && months.some(([m]) => m === month) ? month : null;

  const shown = forRoute.filter((d) => d.start.startsWith(year ?? "") && (!shownMonth || monthOf(d.start) === shownMonth));
  const groups = useMemo(() => {
    const g = new Map<string, BoardDeparture[]>();
    for (const d of shown) g.set(monthOf(d.start), [...(g.get(monthOf(d.start)) ?? []), d]);
    return [...g.entries()];
  }, [shown]);

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
      active ? "bg-basalt text-glacier shadow-[0_8px_20px_-10px_rgba(20,19,12,0.6)]" : "bg-white text-basalt ring-1 ring-mist hover:ring-basalt/30"
    }`;

  return (
    <div>
      {/* Routes: sticky under the header so they stay at hand while scrolling the list. */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-mist/70 bg-glacier/85 px-6 py-4 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by route">
          <button type="button" onClick={() => setRoute(null)} aria-pressed={!route} className={chip(!route)}>
            All routes <span className="text-[0.7rem] tabular-nums opacity-60">{departures.length}</span>
          </button>
          {routes.map((r) => {
            const n = departures.filter((d) => d.routeKey === r.key).length;
            if (!n) return null;
            return (
              <button key={r.key} type="button" onClick={() => setRoute(route === r.key ? null : r.key)} aria-pressed={route === r.key} className={chip(route === r.key)}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} aria-hidden="true" />
                {r.name.replace(/ Route$/, "")}
                {r.days && <span className="opacity-60">{r.days}d</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* When would you like to climb? The year, then its months that have trips. */}
      <section aria-labelledby="when-climb" className="mt-8">
        <h2 id="when-climb" className="font-display text-2xl md:text-3xl">When would you like to climb?</h2>
        {years.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Year">
            {years.map((y) => {
              const on = y === year;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setYearPick(y);
                    setMonth(null);
                  }}
                  aria-pressed={on}
                  className={`min-w-24 rounded-full px-6 py-3 text-base font-semibold tabular-nums transition ${
                    on ? "bg-frost text-basalt ring-2 ring-basalt" : "bg-frost/60 text-scree ring-1 ring-mist hover:text-basalt"
                  }`}
                >
                  {y}
                </button>
              );
            })}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={`Months of ${year}`}>
          {months.map(([m, n]) => {
            const on = shownMonth === m;
            const wet = isRainy(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMonth(on ? null : m)}
                aria-pressed={on}
                aria-label={`${fmt(`${m}-01`, { month: "long", year: "numeric" })}: ${n} ${n === 1 ? "departure" : "departures"}${wet ? ", rainy season" : ""}`}
                className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded-full px-5 py-3 text-base font-semibold transition ${
                  on
                    ? "bg-tanzanite text-glacier ring-2 ring-tanzanite ring-offset-2"
                    : "bg-tanzanite/90 text-glacier hover:bg-tanzanite"
                }`}
              >
                {fmt(`${m}-01`, { month: "short" }).replace("Sept", "Sep")}
                {n === 0 && <span className="ml-1 text-[0.65rem] font-medium opacity-75">No trips</span>}
                {wet && <RainIcon />}
              </button>
            );
          })}
          {shownMonth && (
            <button type="button" onClick={() => setMonth(null)} className="rounded-full px-4 py-3 text-sm font-semibold text-tanzanite underline underline-offset-4">
              Show all of {year}
            </button>
          )}
        </div>
      </section>

      {/* Choose your departure: how many are coming, then the departures. */}
      <section aria-labelledby="choose-departure" className="mt-10">
        <h2 id="choose-departure" className="font-display text-2xl md:text-3xl">Choose your departure</h2>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-mist">
          <span className="text-base font-semibold text-basalt">Climbers</span>
          <div className="flex items-center rounded-xl ring-1 ring-mist">
            <button type="button" onClick={() => setClimbers(Math.max(1, climbers - 1))} disabled={climbers <= 1} aria-label="Fewer climbers" className="grid h-11 w-11 place-items-center text-xl text-tanzanite disabled:opacity-30">
              −
            </button>
            <span className="w-10 text-center text-lg font-semibold tabular-nums text-basalt" aria-live="polite">
              {climbers}
            </span>
            <button type="button" onClick={() => setClimbers(Math.min(12, climbers + 1))} disabled={climbers >= 12} aria-label="More climbers" className="grid h-11 w-11 place-items-center text-xl text-tanzanite disabled:opacity-30">
              +
            </button>
          </div>
          <span className="text-sm text-tanzanite">Same price per person whatever your group size. Solo travellers pay no supplement.</span>
        </div>

        <div className="mt-6" aria-live="polite">
          {groups.length === 0 && shownMonth && (
            <div className="relative overflow-hidden rounded-3xl bg-frost px-6 py-12 text-center ring-1 ring-mist sm:px-10">
              <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-2xl text-tanzanite ring-1 ring-mist">⌁</span>
              <h3 className="mt-5 font-display text-2xl text-basalt">No trips available for these dates</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-scree">We don’t have group departures listed for {fmt(`${shownMonth}-01`, { month: "long", year: "numeric" })}. Try another month to find an open trip.</p>
              <button type="button" onClick={() => setMonth(null)} className="mt-6 rounded-full bg-tanzanite px-5 py-3 text-sm font-semibold text-glacier transition hover:bg-basalt">Try another month</button>
            </div>
          )}
          {groups.map(([m, list]) => (
            <section key={m} className="mb-10 last:mb-0" aria-label={fmt(`${m}-01`, { month: "long", year: "numeric" })}>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl md:text-2xl">{fmt(`${m}-01`, { month: "long", year: "numeric" })}</h3>
                <p className="label text-scree">
                  {list.length} {list.length === 1 ? "departure" : "departures"}
                </p>
              </div>
              <ol className="space-y-3">
                {list.map((d) => (
                  <li key={`${d.routeKey}-${d.start}`}>
                    <Row d={d} r={byKey.get(d.routeKey)} climbers={climbers} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

function RainIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M6 12a4 4 0 0 1-.4-7.98A5 5 0 0 1 15.5 6.1 3 3 0 0 1 15 12H6z" opacity="0.9" />
      <path d="M7 14.5l-.8 2M10.5 14.5l-.8 2M14 14.5l-.8 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Row({ d, r, climbers = 1 }: { d: BoardDeparture; r?: BoardRoute; climbers?: number }) {
  const taken = d.capacity !== null && d.seatsLeft !== null ? d.capacity - d.seatsLeft : null;
  const pct = d.capacity && taken !== null ? Math.round((taken / d.capacity) * 100) : 0;
  const few = d.open && d.seatsLeft !== null && d.seatsLeft <= FEW;
  const href = `${d.href}?date=${d.start}#enquire`;
  const color = r?.color ?? "var(--color-tanzanite)";
  return (
    <article className="group/row relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-4 rounded-2xl bg-white p-3 pr-4 ring-1 ring-mist transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(43,44,16,0.45)] hover:ring-basalt/15 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:gap-y-2 sm:p-3.5 sm:pr-5">
      {/* Date */}
      <div className="flex w-16 flex-col items-center justify-center rounded-xl bg-frost py-2.5 text-center sm:row-span-2 sm:w-[4.5rem]">
        <span className="label text-[0.6rem] text-scree">{fmt(d.start, { weekday: "short" })}</span>
        <span className="text-2xl font-semibold leading-tight tabular-nums text-basalt">{fmt(d.start, { day: "numeric" })}</span>
        <span className="label text-[0.6rem] text-scree">{fmt(d.start, { month: "short" })}</span>
      </div>

      {/* Photo (from small tablets up) */}
      {r?.photo ? (
        <div className="relative hidden h-[4.5rem] w-[4.5rem] overflow-hidden rounded-xl sm:row-span-2 sm:block">
          <Image src={r.photo.src} alt="" fill sizes="72px" className="object-cover transition duration-500 group-hover/row:scale-105" />
        </div>
      ) : (
        <span className="hidden sm:row-span-2 sm:block" />
      )}

      {/* Route */}
      <div className="min-w-0 sm:self-end">
        <p className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
          <span className="truncate font-display text-lg leading-tight text-basalt md:text-xl">{(r?.name ?? "Group climb").replace(/ Route$/, "")}</span>
          {r?.days ? <span className="label shrink-0 rounded-full bg-frost px-2 py-0.5 text-[0.6rem] text-scree">{r.days} days</span> : null}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-scree">
          {d.end ? `${fmt(d.start, { weekday: "short", day: "numeric", month: "short" })} – ${fmt(d.end, { weekday: "short", day: "numeric", month: "short" })}` : fmt(d.start, { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Seats */}
      <div className="col-span-2 sm:col-span-1 sm:col-start-3 sm:max-w-xs">
        {d.capacity !== null && d.seatsLeft !== null ? (
          <>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className={`font-semibold ${!d.open ? "text-scree" : few ? "text-sunrise-ink" : "text-tanzanite"}`}>
                {!d.open ? "Full" : few ? `Only ${d.seatsLeft} left` : taken === 0 ? `All ${d.capacity} seats open` : `${d.seatsLeft} of ${d.capacity} seats left`}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist" role="img" aria-label={`${taken} of ${d.capacity} seats booked`}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 4)}%`, background: !d.open ? "var(--color-scree)" : few ? "var(--color-sunrise)" : color }} />
            </div>
          </>
        ) : (
          <span className="text-xs font-semibold text-tanzanite">{d.open ? "Seats open" : "Full"}</span>
        )}
      </div>

      {/* Price + action */}
      <div className="col-span-2 flex items-center justify-between gap-4 border-t border-mist pt-3 sm:col-span-1 sm:col-start-4 sm:row-span-2 sm:row-start-1 sm:border-0 sm:pt-0 md:gap-6">
        <p className="text-right leading-none">
          <span className="metric block text-xl text-basalt">{d.price ? `$${d.price.toLocaleString()}` : "On request"}</span>
          {d.price ? <span className="label text-[0.6rem] text-scree">per person</span> : null}
          {d.open && d.hold ? (
            <span className="mt-1.5 block whitespace-nowrap text-[0.7rem] font-semibold text-tanzanite">{climbers === 1 ? "Hold your seat" : `Hold ${climbers} seats`} for ${(d.hold * climbers).toLocaleString()}</span>
          ) : null}
        </p>
        <Link
          href={href}
          className={`rounded-full px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition after:absolute after:inset-0 after:rounded-2xl ${
            d.open ? "bg-brand text-basalt hover:bg-brand-bright" : "border border-tanzanite/30 text-tanzanite hover:bg-tanzanite/5"
          }`}
        >
          {d.open ? "Reserve" : "Waitlist"}
          <span className="sr-only">
            {" "}
            {r?.name} on {fmt(d.start, { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </Link>
      </div>
    </article>
  );
}
