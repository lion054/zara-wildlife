"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/** One departure as the calendar needs it. `title`/`href` are only used on the all-departures page. */
export type CalDeparture = {
  start: string;
  end?: string | null;
  seatsLeft: number | null;
  open: boolean;
  price: number | null;
  title?: string;
  href?: string;
};

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const monthKey = (iso: string) => iso.slice(0, 7);
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", o);
const FEW = 4;

function seatsText(d: CalDeparture) {
  if (!d.open) return "Full";
  if (d.seatsLeft === null) return "Open";
  return d.seatsLeft <= FEW ? `${d.seatsLeft} left` : `${d.seatsLeft} seats`;
}

/**
 * A month calendar of group departures. Departure days are marked with what is left; days in between are quiet.
 *  - `pick` (a tour's booking form): choosing a day selects that departure and shades the whole trip, start to end.
 *  - `browse` (all departures): choosing a day lists the climbs that leave that day, each linking to its page.
 * Months with no departure are skipped by the arrows, so the visitor never pages through empty months.
 */
export function DepartureCalendar({
  departures,
  selected,
  onSelect,
  mode = "pick",
}: {
  departures: CalDeparture[];
  selected?: string;
  onSelect?: (start: string) => void;
  mode?: "pick" | "browse";
}) {
  const byDay = useMemo(() => {
    const m = new Map<string, CalDeparture[]>();
    for (const d of departures) m.set(d.start, [...(m.get(d.start) ?? []), d]);
    return m;
  }, [departures]);
  const months = useMemo(() => [...new Set(departures.map((d) => monthKey(d.start)))].sort(), [departures]);
  const firstOpen = departures.find((d) => d.open)?.start;
  const [month, setMonth] = useState(() => monthKey(selected ?? firstOpen ?? departures[0]?.start ?? new Date().toISOString()));
  const [browseDay, setBrowseDay] = useState<string | null>(null);

  if (departures.length === 0) return null;

  const [y, m] = month.split("-").map(Number);
  const monthIndex = m - 1;
  const first = new Date(Date.UTC(y, monthIndex, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const daysIn = new Date(Date.UTC(y, monthIndex + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const at = months.indexOf(month);
  const prev = at > 0 ? months[at - 1] : null;
  const next = at >= 0 && at < months.length - 1 ? months[at + 1] : null;
  const today = new Date().toISOString().slice(0, 10);

  const chosen = mode === "pick" ? departures.find((d) => d.start === selected) : undefined;
  const inTrip = (iso: string) => !!chosen?.end && iso > chosen.start && iso <= chosen.end;
  const listDay = mode === "browse" ? browseDay : null;

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-mist sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => prev && setMonth(prev)}
          disabled={!prev}
          aria-label="Previous month with departures"
          className="grid h-9 w-9 place-items-center rounded-full bg-frost text-tanzanite transition hover:bg-tanzanite hover:text-glacier disabled:opacity-30 disabled:hover:bg-frost disabled:hover:text-tanzanite"
        >
          ‹
        </button>
        <p className="font-display text-lg text-basalt" aria-live="polite">
          {fmt(`${month}-01`, { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => next && setMonth(next)}
          disabled={!next}
          aria-label="Next month with departures"
          className="grid h-9 w-9 place-items-center rounded-full bg-frost text-tanzanite transition hover:bg-tanzanite hover:text-glacier disabled:opacity-30 disabled:hover:bg-frost disabled:hover:text-tanzanite"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`Departures in ${fmt(`${month}-01`, { month: "long", year: "numeric" })}`}>
        {WEEK.map((w) => (
          <span key={w} className="label pb-1 text-[0.65rem] text-scree" role="columnheader">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} aria-hidden="true" />;
          const iso = isoOf(y, monthIndex, d);
          const deps = byDay.get(iso) ?? [];
          const has = deps.length > 0;
          const anyOpen = deps.some((x) => x.open);
          const few = anyOpen && deps.some((x) => x.open && x.seatsLeft !== null && x.seatsLeft <= FEW);
          const isSel = mode === "pick" ? selected === iso : browseDay === iso;
          const trip = inTrip(iso);
          const past = iso < today;
          const tone = !has
            ? trip
              ? "bg-frost text-basalt ring-1 ring-tanzanite/15"
              : past
                ? "text-scree/40"
                : "text-scree/70"
            : isSel
              ? "bg-tanzanite text-glacier ring-2 ring-tanzanite ring-offset-2"
              : anyOpen
                ? few
                  ? "bg-brand/20 text-basalt ring-1 ring-brand/70 hover:bg-brand/35"
                  : "bg-tanzanite/10 text-tanzanite ring-1 ring-tanzanite/35 hover:bg-tanzanite/20"
                : "bg-mist/60 text-scree line-through decoration-scree/50 hover:bg-mist";
          const sub = has ? (mode === "browse" && deps.length > 1 ? `${deps.length} trips` : seatsText(deps[0])) : "";
          const label = has
            ? `${fmt(iso, { weekday: "long", day: "numeric", month: "long" })}: ${deps.map((x) => `${x.title ? `${x.title}, ` : ""}${seatsText(x)}`).join("; ")}`
            : undefined;
          return has ? (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-label={label}
              aria-pressed={isSel}
              onClick={() => (mode === "pick" ? onSelect?.(iso) : setBrowseDay(isSel ? null : iso))}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl font-mono text-sm font-semibold transition ${tone}`}
            >
              <span>{d}</span>
              {/* On a narrow phone the colour says it (the legend and the summary below spell it out). */}
              <span className={`mt-1 hidden font-body text-[0.6rem] font-medium leading-none no-underline min-[420px]:block ${isSel ? "text-glacier/85" : "text-scree"}`}>{sub}</span>
            </button>
          ) : (
            <span key={iso} role="gridcell" className={`flex aspect-square items-center justify-center rounded-xl font-mono text-sm ${tone}`}>
              {d}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] text-scree">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-tanzanite/10 ring-1 ring-tanzanite/35" /> Seats open</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-brand/20 ring-1 ring-brand/70" /> Few left</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-mist/60" /> Full · waitlist</span>
        {mode === "pick" && <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-frost ring-1 ring-tanzanite/15" /> Your trip</span>}
      </div>

      {chosen && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-frost px-4 py-3" aria-live="polite">
          <div>
            <p className="label text-scree">Your departure</p>
            <p className="mt-0.5 text-sm font-semibold text-basalt">
              {fmt(chosen.start, { weekday: "short", day: "numeric", month: "short" })}
              {chosen.end ? ` – ${fmt(chosen.end, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}` : `, ${fmt(chosen.start, { year: "numeric" })}`}
            </p>
          </div>
          <span className={`label shrink-0 rounded-full px-3 py-1 ${chosen.open ? "bg-tanzanite/10 text-tanzanite" : "bg-mist text-scree"}`}>{seatsText(chosen)}</span>
        </div>
      )}

      {listDay && (
        <ul className="mt-4 divide-y divide-mist rounded-xl bg-frost" aria-label={`Departures on ${fmt(listDay, { day: "numeric", month: "long" })}`}>
          {(byDay.get(listDay) ?? []).map((x) => (
            <li key={`${x.href}-${x.start}`} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-basalt">{(x.title ?? "").replace(/\s*·\s*Group$/, "")}</p>
                <p className="text-xs text-scree">
                  {fmt(x.start, { day: "numeric", month: "short" })}
                  {x.end ? ` – ${fmt(x.end, { day: "numeric", month: "short" })}` : ""} · {seatsText(x)}
                  {x.price ? ` · $${x.price.toLocaleString()} pp` : ""}
                </p>
              </div>
              {x.href && (
                <Link
                  href={`${x.href}?date=${x.start}#enquire`}
                  className={`shrink-0 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${
                    x.open ? "bg-brand text-basalt hover:bg-brand-bright" : "border border-tanzanite/30 text-tanzanite"
                  }`}
                >
                  {x.open ? "Reserve" : "Waitlist"}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
