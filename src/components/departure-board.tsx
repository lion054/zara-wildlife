"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { HighlightIcon } from "@/components/highlight-icon";
import { ReserveButton } from "@/components/reserve-dialog";
import type { Highlight } from "@/lib/route-facts";
import { seatState } from "@/lib/seats";

/** One route as the board shows it. */
export type BoardRoute = {
  key: string;
  name: string; // "Lemosho Route"
  /** "Kilimanjaro via Lemosho route – 7 days" */
  title: string;
  days: number | null;
  color: string; // a CSS colour for the route's dot and accents
  highlights: Highlight[];
  /** The tour's key for booking ("group:lemosho-route-7"). */
  tourKey: string;
};

/** One departure, already resolved to its route. */
export type BoardDeparture = {
  routeKey: string;
  href: string;
  start: string;
  end: string | null;
  price: number | null;
  /** A promotional price the office set in Tanova, lower than `price`. */
  promo: number | null;
  promoLabel: string | null;
  capacity: number | null;
  seatsLeft: number | null;
  open: boolean;
  /** What one person puts down to hold a seat (the group's deposit), when there is one. */
  hold: number | null;
};

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", o);
const monthOf = (iso: string) => iso.slice(0, 7);
/** Kilimanjaro's wet months: the long rains (April, May) and the short rains (November). */
const RAINY = new Set([4, 5, 11]);
const isRainy = (iso: string) => RAINY.has(Number(iso.slice(5, 7)));

/**
 * The group departures board, laid out the way climbers compare dates: the route chips; "When would you like to climb?"
 * with this year and the next two, every month shown (months with departures in green, the others muted, past months
 * faded, rainy months marked); then "Choose your departure" with one row per date.
 */
export function DepartureBoard({ routes, departures, minimum = 4 }: { routes: BoardRoute[]; departures: BoardDeparture[]; minimum?: number }) {
  const byKey = useMemo(() => new Map(routes.map((r) => [r.key, r])), [routes]);
  const [route, setRoute] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null); // "2027-01", or null for the whole year
  const [climbers, setClimbers] = useState(2);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const firstYear = Number(thisMonth.slice(0, 4));
  const years = [firstYear, firstYear + 1, firstYear + 2].map(String);

  const forRoute = useMemo(() => departures.filter((d) => !route || d.routeKey === route), [departures, route]);
  const count = useMemo(() => {
    const c = new Map<string, number>();
    for (const d of forRoute) c.set(monthOf(d.start), (c.get(monthOf(d.start)) ?? 0) + 1);
    return c;
  }, [forRoute]);
  const yearCount = (y: string) => [...count.entries()].filter(([m]) => m.startsWith(y)).reduce((a, [, n]) => a + n, 0);

  // The year opens on the first one with departures.
  const [yearPick, setYearPick] = useState<string | null>(null);
  const year = yearPick ?? years.find((y) => yearCount(y) > 0) ?? years[0];
  const shownMonth = month && month.startsWith(year) && count.get(month) ? month : null;

  // Phones: the months scroll sideways, so bring the first month with departures into view (not the faded past ones).
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = strip.current;
    const first = el?.querySelector<HTMLElement>("button:not([disabled])");
    if (el && first && el.scrollWidth > el.clientWidth) el.scrollTo({ left: Math.max(0, first.offsetLeft - el.offsetLeft - 20) });
  }, [year, route]);

  const groups = useMemo(() => {
    const g = new Map<string, BoardDeparture[]>();
    for (const d of forRoute) {
      if (!d.start.startsWith(year) || (shownMonth && monthOf(d.start) !== shownMonth)) continue;
      g.set(monthOf(d.start), [...(g.get(monthOf(d.start)) ?? []), d]);
    }
    return [...g.entries()];
  }, [forRoute, year, shownMonth]);

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
      active ? "bg-basalt text-glacier shadow-[0_8px_20px_-10px_rgba(20,19,12,0.6)]" : "bg-white text-basalt ring-1 ring-mist hover:ring-basalt/30"
    }`;

  return (
    <div>
      {/* Routes: sticky so they stay at hand while scrolling the list. */}
      <div className="sticky top-0 z-20 -mx-5 border-b border-mist/70 bg-glacier/90 px-5 py-3 backdrop-blur-md md:-mx-6 md:px-6 md:py-4">
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by route">
          <button type="button" onClick={() => setRoute(null)} aria-pressed={!route} className={chip(!route)}>
            All routes <span className="text-[0.7rem] tabular-nums opacity-60">{departures.length}</span>
          </button>
          {routes.map((r) => {
            const n = departures.filter((d) => d.routeKey === r.key).length;
            if (!n) return null;
            return (
              <button key={r.key} type="button" onClick={() => setRoute(route === r.key ? null : r.key)} aria-pressed={route === r.key} className={`${chip(route === r.key)} snap-start`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} aria-hidden="true" />
                {r.name.replace(/ Route$/, "")}
                {r.days && <span className="opacity-60">{r.days}d</span>}
              </button>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="when-climb" className="mt-8">
        <h2 id="when-climb" className="font-display text-2xl md:text-3xl">When would you like to climb?</h2>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:flex" role="group" aria-label="Year">
          {years.map((y) => {
            const on = y === year;
            const n = yearCount(y);
            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setYearPick(y);
                  setMonth(null);
                }}
                aria-pressed={on}
                className={`rounded-2xl px-4 py-2.5 text-center transition sm:min-w-32 sm:px-6 ${
                  on ? "bg-basalt text-glacier" : "bg-white text-basalt ring-1 ring-mist hover:ring-basalt/30"
                }`}
              >
                <span className="block text-base font-semibold tabular-nums">{y}</span>
                <span className={`block text-[0.7rem] ${on ? "text-glacier/70" : "text-scree"}`}>{n ? `${n} ${n === 1 ? "date" : "dates"}` : "Dates soon"}</span>
              </button>
            );
          })}
        </div>

        {/* Twelve months in one row on wide screens; a sideways scroll on phones. */}
        <div
          ref={strip}
          className="-mx-5 mt-4 flex snap-x gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 lg:grid lg:grid-cols-12 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label={`Months of ${year}`}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const m = `${year}-${String(i + 1).padStart(2, "0")}`;
            const n = count.get(m) ?? 0;
            const past = m < thisMonth;
            const on = shownMonth === m;
            const wet = isRainy(`${m}-01`);
            const label = fmt(`${m}-01`, { month: "short" }).replace("Sept", "Sep");
            return (
              <button
                key={m}
                type="button"
                disabled={!n}
                onClick={() => setMonth(on ? null : m)}
                aria-pressed={on}
                aria-label={`${fmt(`${m}-01`, { month: "long", year: "numeric" })}: ${past ? "past" : n ? `${n} ${n === 1 ? "departure" : "departures"}` : "no departures"}${wet ? ", rainy season" : ""}`}
                className={`relative flex min-w-[4.25rem] shrink-0 snap-start flex-col items-center rounded-2xl px-2 py-2.5 transition lg:min-w-0 ${
                  on
                    ? "bg-tanzanite text-glacier ring-2 ring-tanzanite ring-offset-2 ring-offset-glacier"
                    : n
                      ? "bg-tanzanite/90 text-glacier hover:bg-tanzanite"
                      : past
                        ? "cursor-not-allowed bg-transparent text-scree/40 ring-1 ring-mist/60"
                        : "cursor-not-allowed bg-frost text-scree/70 ring-1 ring-mist"
                }`}
              >
                <span className="flex items-center gap-1 text-sm font-semibold">
                  {label}
                  {wet && <RainIcon />}
                </span>
                <span className={`text-[0.65rem] tabular-nums ${n ? "opacity-80" : "opacity-70"}`}>{past ? "—" : n ? `${n} ${n === 1 ? "date" : "dates"}` : "none"}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-scree">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-tanzanite" /> Departures</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-frost ring-1 ring-mist" /> No group yet</span>
          <span className="inline-flex items-center gap-1.5"><RainIcon /> Rainy season</span>
          {shownMonth && (
            <button type="button" onClick={() => setMonth(null)} className="font-semibold text-tanzanite underline underline-offset-4">
              Show all of {year}
            </button>
          )}
        </p>
      </section>

      <section aria-labelledby="choose-departure" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="choose-departure" className="font-display text-2xl md:text-3xl">Choose your departure</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-basalt">Climbers</span>
            <div className="flex items-center rounded-xl bg-white ring-1 ring-mist">
              <button type="button" onClick={() => setClimbers(Math.max(1, climbers - 1))} disabled={climbers <= 1} aria-label="Fewer climbers" className="grid h-11 w-11 place-items-center text-xl text-tanzanite disabled:opacity-30">
                −
              </button>
              <span className="w-8 text-center text-lg font-semibold tabular-nums text-basalt" aria-live="polite">
                {climbers}
              </span>
              <button type="button" onClick={() => setClimbers(Math.min(12, climbers + 1))} disabled={climbers >= 12} aria-label="More climbers" className="grid h-11 w-11 place-items-center text-xl text-tanzanite disabled:opacity-30">
                +
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-tanzanite">Same price per person whatever your group size. Solo travellers pay no supplement.</p>

        <div className="mt-6" aria-live="polite">
          {groups.length === 0 && (
            <div className="rounded-3xl bg-frost px-6 py-12 text-center ring-1 ring-mist sm:px-10">
              <h3 className="font-display text-2xl text-basalt">No group dates in {year} yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-scree">
                New departures are added through the year. Tell us when you want to climb and we can open a date, or plan a private climb on exactly your dates.
              </p>
              <Link href="/plan" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt hover:bg-brand-bright">
                Request dates
              </Link>
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
              <ol className="space-y-4">
                {list.map((d) => {
                  const r = byKey.get(d.routeKey);
                  return r ? (
                    <li key={`${d.routeKey}-${d.start}`}>
                      <DepartureRow d={d} r={r} climbers={climbers} minimum={minimum} />
                    </li>
                  ) : null;
                })}
              </ol>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

export function RainIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6 12a4 4 0 0 1-.4-7.98A5 5 0 0 1 15.5 6.1 3 3 0 0 1 15 12H6z" opacity="0.9" />
      <path d="M7 14.5l-.8 2M10.5 14.5l-.8 2M14 14.5l-.8 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Small status pills for a date: guaranteed, filling fast, full, rainy season. */
export function DepartureTags({ d, minimum }: { d: BoardDeparture; minimum: number }) {
  const s = seatState(d, minimum);
  return (
    <span className="flex flex-wrap gap-1.5">
      {!d.open ? (
        <span className="rounded-full bg-mist px-2.5 py-1 text-[0.7rem] font-semibold text-scree">Full</span>
      ) : s.guaranteed ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-tanzanite/10 px-2.5 py-1 text-[0.7rem] font-semibold text-tanzanite">
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
          Guaranteed departure
        </span>
      ) : null}
      {s.few && <span className="rounded-full bg-sunrise/15 px-2.5 py-1 text-[0.7rem] font-semibold text-sunrise-ink">Filling fast</span>}
      {isRainy(d.start) && (
        <span className="inline-flex items-center gap-1 rounded-full bg-frost px-2.5 py-1 text-[0.7rem] font-semibold text-scree">
          <RainIcon className="h-3 w-3" /> Rainy season
        </span>
      )}
      {d.promo && d.promoLabel && <span className="rounded-full bg-brand/20 px-2.5 py-1 text-[0.7rem] font-semibold text-basalt">{d.promoLabel}</span>}
    </span>
  );
}

/** A price, with the regular one struck through when the office set a promotional price. */
export function PriceTag({ d, className = "" }: { d: Pick<BoardDeparture, "price" | "promo">; className?: string }) {
  if (!d.price) return <span className={`metric text-xl text-basalt ${className}`}>On request</span>;
  return (
    <span className={className}>
      {d.promo && (
        <>
          <s className="mr-2 text-sm text-scree">${d.price.toLocaleString()}</s>
          <span className="mr-2 rounded bg-sunrise/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-sunrise-ink">−{Math.round((1 - d.promo / d.price) * 100)}%</span>
        </>
      )}
      <span className="metric text-2xl text-basalt">${(d.promo ?? d.price).toLocaleString()}</span>
    </span>
  );
}

function DepartureRow({ d, r, climbers, minimum }: { d: BoardDeparture; r: BoardRoute; climbers: number; minimum: number }) {
  const s = seatState(d, minimum);
  const pct = d.capacity && s.taken !== null ? Math.round((s.taken / d.capacity) * 100) : 0;
  const detail = `${d.href}/${d.start}`;
  const dates = d.end
    ? `From ${fmt(d.start, { day: "numeric", month: "long" })} – ${fmt(d.end, { day: "numeric", month: "long" })}`
    : `From ${fmt(d.start, { day: "numeric", month: "long" })}`;
  return (
    <article className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-mist transition hover:shadow-[0_18px_40px_-24px_rgba(43,44,16,0.45)] hover:ring-basalt/15">
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: r.color }} aria-hidden="true" />
      <div className="grid gap-5 p-5 pl-6 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-8 md:p-6 md:pl-8">
        <div className="min-w-0">
          <h4 className="font-display text-xl leading-snug text-basalt md:text-2xl">
            <Link href={detail} className="hover:text-tanzanite">
              {r.title}
            </Link>
          </h4>
          <p className="mt-1 text-sm font-semibold text-scree">{dates}</p>
          <div className="mt-3">
            <DepartureTags d={d} minimum={minimum} />
          </div>

          {d.capacity !== null && s.taken !== null && (
            <div className="mt-4 max-w-sm">
              <p className="flex items-baseline justify-between text-sm">
                <span className="text-scree">Places reserved</span>
                <span className="font-semibold tabular-nums text-basalt">
                  {s.taken} / {d.capacity}
                </span>
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: !d.open ? "var(--color-scree)" : s.few ? "var(--color-sunrise)" : r.color }} />
              </div>
            </div>
          )}

          {r.highlights.length > 0 && (
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-3 sm:gap-4">
              {r.highlights.map((h) => (
                <li key={h.text} className="flex items-start gap-2.5 text-sm leading-snug text-basalt">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-frost text-tanzanite">
                    <HighlightIcon icon={h.icon} className="h-4.5 w-4.5" />
                  </span>
                  <span className="pt-1.5">{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-mist pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <p className="flex items-baseline justify-between gap-3 md:block">
            <span className="label text-[0.65rem] text-scree md:mb-1 md:block">Per person</span>
            <PriceTag d={d} />
          </p>
          <div className="space-y-2.5">
            {d.open ? (
              <ReserveButton
                tourKey={r.tourKey}
                title={r.title}
                start={d.start}
                end={d.end}
                price={d.promo ?? d.price}
                deposit={d.hold}
                seatsLeft={d.seatsLeft}
                climbers={climbers}
                label={
                  <>
                    <span className="block">Join group</span>
                    {d.hold ? <span className="block text-[0.7rem] font-normal normal-case tracking-normal">${d.hold} deposit per person</span> : null}
                  </>
                }
                className="w-full rounded-full bg-brand px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition hover:bg-brand-bright"
              />
            ) : (
              <Link href={`${d.href}?date=${d.start}#enquire`} className="block w-full rounded-full border border-tanzanite/30 px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite hover:bg-tanzanite/5">
                Join the waitlist
              </Link>
            )}
            <Link href={detail} className="block text-center text-sm font-semibold text-tanzanite underline-offset-4 hover:underline">
              View itinerary →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
