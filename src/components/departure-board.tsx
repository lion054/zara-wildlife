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
 * The group departures board: route chips on top, a month-and-year picker beside the list (each month shows how many
 * groups leave in it), and the departures as compact rows grouped by month.
 */
export function DepartureBoard({ routes, departures }: { routes: BoardRoute[]; departures: BoardDeparture[] }) {
  const byKey = useMemo(() => new Map(routes.map((r) => [r.key, r])), [routes]);
  const [route, setRoute] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null); // "2027-01", or null for every month

  const forRoute = useMemo(() => departures.filter((d) => !route || d.routeKey === route), [departures, route]);
  const shown = forRoute.filter((d) => !month || monthOf(d.start) === month);
  const groups = useMemo(() => {
    const g = new Map<string, BoardDeparture[]>();
    for (const d of shown) g.set(monthOf(d.start), [...(g.get(monthOf(d.start)) ?? []), d]);
    return [...g.entries()];
  }, [shown]);

  const pickRoute = (k: string | null) => {
    setRoute(k);
    // A month the new route does not run in would show nothing: go back to every month.
    if (month && !departures.some((d) => (!k || d.routeKey === k) && monthOf(d.start) === month)) setMonth(null);
  };

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
      active ? "bg-basalt text-glacier shadow-[0_8px_20px_-10px_rgba(20,19,12,0.6)]" : "bg-white text-basalt ring-1 ring-mist hover:ring-basalt/30"
    }`;

  return (
    <div>
      {/* Routes: sticky under the header so they stay at hand while scrolling the list. */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-mist/70 bg-glacier/85 px-6 py-4 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by route">
          <button type="button" onClick={() => pickRoute(null)} aria-pressed={!route} className={chip(!route)}>
            All routes <span className="text-[0.7rem] tabular-nums opacity-60">{departures.length}</span>
          </button>
          {routes.map((r) => {
            const n = departures.filter((d) => d.routeKey === r.key).length;
            if (!n) return null;
            return (
              <button key={r.key} type="button" onClick={() => pickRoute(route === r.key ? null : r.key)} aria-pressed={route === r.key} className={chip(route === r.key)}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} aria-hidden="true" />
                {r.name.replace(/ Route$/, "")}
                {r.days && <span className="opacity-60">{r.days}d</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-28">
          <MonthPicker departures={forRoute} month={month} onPick={setMonth} />
          <p className="mt-3 px-1 text-xs leading-relaxed text-scree">Every group has 12 seats. Pick a month to see who leaves then.</p>
        </aside>

        <div aria-live="polite">
          {groups.length === 0 && (
            <p className="rounded-2xl bg-frost px-6 py-10 text-center text-sm text-scree">No departures match. Try another route or month.</p>
          )}

          {groups.map(([m, list]) => (
            <section key={m} className="mb-10 last:mb-0" aria-label={fmt(`${m}-01`, { month: "long", year: "numeric" })}>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl md:text-3xl">{fmt(`${m}-01`, { month: "long", year: "numeric" })}</h2>
                <p className="label text-scree">
                  {list.length} {list.length === 1 ? "departure" : "departures"}
                </p>
              </div>
              <ol className="space-y-3">
                {list.map((d) => (
                  <li key={`${d.routeKey}-${d.start}`}>
                    <Row d={d} r={byKey.get(d.routeKey)} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The months that have departures, each with its year and how many groups leave in it. Picking one narrows the list to
 * it; picking it again (or "All months") shows them all. Grows by itself as the office adds dates in Tanova.
 */
function MonthPicker({ departures, month, onPick }: { departures: BoardDeparture[]; month: string | null; onPick: (m: string | null) => void }) {
  const months = useMemo(() => {
    const c = new Map<string, number>();
    for (const d of departures) c.set(monthOf(d.start), (c.get(monthOf(d.start)) ?? 0) + 1);
    return [...c.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [departures]);

  const tile = (on: boolean) =>
    `flex flex-col items-start justify-center rounded-xl px-4 py-3 text-left transition ${
      on ? "bg-tanzanite text-glacier shadow-[0_10px_24px_-14px_rgba(86,106,27,0.9)]" : "bg-frost text-basalt ring-1 ring-mist hover:ring-tanzanite/40"
    }`;

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-mist sm:p-5">
      <p className="label mb-3 text-scree">When do you want to go?</p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Filter by month">
        <button type="button" onClick={() => onPick(null)} aria-pressed={!month} className={`${tile(!month)} col-span-2`}>
          <span className="text-sm font-semibold">All months</span>
          <span className={`text-xs tabular-nums ${!month ? "text-glacier/80" : "text-scree"}`}>
            {departures.length} {departures.length === 1 ? "group" : "groups"}
          </span>
        </button>
        {months.map(([key, n]) => {
          const on = month === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(on ? null : key)}
              aria-pressed={on}
              aria-label={`${fmt(`${key}-01`, { month: "long", year: "numeric" })}: ${n} ${n === 1 ? "departure" : "departures"}`}
              className={tile(on)}
            >
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-xl leading-tight">{fmt(`${key}-01`, { month: "short" })}</span>
                <span className={`text-sm tabular-nums ${on ? "text-glacier/80" : "text-scree"}`}>{key.slice(0, 4)}</span>
              </span>
              <span className={`text-xs tabular-nums ${on ? "text-glacier/80" : "text-scree"}`}>
                {n} {n === 1 ? "group" : "groups"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Row({ d, r }: { d: BoardDeparture; r?: BoardRoute }) {
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
        <p className="mt-1 text-sm text-scree">
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
            <span className="mt-1.5 block whitespace-nowrap text-[0.7rem] font-semibold text-tanzanite">Hold a seat for ${d.hold.toLocaleString()}</span>
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
