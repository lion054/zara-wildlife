"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  eventsOn,
  islamicEvents,
  outlookStyle,
  parseISO,
  toISO,
  type IslamicEvent,
} from "@/lib/islamic-calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  parseISO(iso).toLocaleDateString("en-GB", opts);

const range = (e: IslamicEvent) =>
  e.start === e.end
    ? fmt(e.start, { weekday: "short", day: "numeric", month: "long", year: "numeric" })
    : `${fmt(e.start, { day: "numeric", month: "long" })} to ${fmt(e.end, { day: "numeric", month: "long", year: "numeric" })}`;

/**
 * Month-grid calendar of Islamic dates, with the travel outlook for each.
 *
 * Built as a real table so a screen reader can walk it by row and column.
 * Colour is never the only signal: every marked day also has its event name
 * in the cell and in the list underneath.
 */
export function IslamicCalendar() {
  const today = new Date();
  const first = parseISO(islamicEvents[0].start);
  const last = parseISO(islamicEvents[islamicEvents.length - 1].end);

  /* Start on the next event, not on an empty month. */
  const upcoming =
    islamicEvents.find((e) => parseISO(e.end) >= today) ?? islamicEvents[0];
  const startMonth = parseISO(upcoming.start);
  const [cursor, setCursor] = useState(
    new Date(startMonth.getFullYear(), startMonth.getMonth(), 1),
  );
  const [picked, setPicked] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const weeks = useMemo(() => {
    const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
    const days = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array(offset).fill(null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [year, month]);

  const monthStart = toISO(new Date(year, month, 1));
  const monthEnd = toISO(new Date(year, month + 1, 0));
  const inMonth = islamicEvents.filter((e) => e.start <= monthEnd && e.end >= monthStart);

  const canPrev = cursor > new Date(first.getFullYear(), first.getMonth() - 1, 1);
  const canNext = cursor < new Date(last.getFullYear(), last.getMonth() + 1, 1);
  const shift = (n: number) => {
    setPicked(null);
    setCursor(new Date(year, month + n, 1));
  };

  const shown = picked ? inMonth.filter((e) => eventsOn(picked).includes(e)) : inMonth;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      {/* ---- Month grid ---- */}
      <div className="rounded-[24px] bg-glacier p-5 shadow-[var(--shadow-card)] md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canPrev}
            className="grid h-11 w-11 place-items-center rounded-full border border-scree/40 text-basalt hover:bg-frost disabled:opacity-30"
          >
            <span className="sr-only">Previous month</span>
            <span aria-hidden="true">←</span>
          </button>
          <h3 className="font-display text-2xl" aria-live="polite">
            {monthLabel}
          </h3>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={!canNext}
            className="grid h-11 w-11 place-items-center rounded-full border border-scree/40 text-basalt hover:bg-frost disabled:opacity-30"
          >
            <span className="sr-only">Next month</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <table className="w-full table-fixed border-separate border-spacing-1">
          <caption className="sr-only">
            {monthLabel}. Days with an Islamic holiday are marked with its name.
          </caption>
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d} scope="col" className="label pb-1 text-center font-medium text-scree">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, wi) => (
              <tr key={wi}>
                {w.map((day, di) => {
                  if (!day) return <td key={di} />;
                  const iso = toISO(new Date(year, month, day));
                  const evs = eventsOn(iso);
                  const ev = evs[0];
                  const isToday = iso === toISO(today);
                  const base =
                    "relative flex h-14 w-full flex-col items-center justify-start rounded-xl pt-1.5 text-sm md:h-[4.5rem]";
                  if (!ev) {
                    return (
                      <td key={di}>
                        <div
                          className={`${base} ${isToday ? "ring-2 ring-basalt" : ""} text-scree`}
                        >
                          {day}
                        </div>
                      </td>
                    );
                  }
                  const isRamadan = ev.kind === "ramadan";
                  return (
                    <td key={di}>
                      <button
                        type="button"
                        onClick={() => setPicked(picked === iso ? null : iso)}
                        aria-pressed={picked === iso}
                        aria-label={`${day} ${monthLabel.split(" ")[0]}: ${evs.map((e) => e.name).join(", ")}`}
                        className={`${base} transition-transform hover:-translate-y-0.5 ${
                          isRamadan
                            ? "bg-sand text-basalt"
                            : ev.kind === "eid"
                              ? "bg-brand text-basalt"
                              : "bg-tanzanite text-glacier"
                        } ${picked === iso ? "outline outline-[3px] outline-offset-2 outline-basalt" : ""} ${
                          isToday ? "ring-2 ring-basalt" : ""
                        } font-semibold`}
                      >
                        {day}
                        <span className="mt-0.5 hidden w-full truncate px-1 text-[10px] font-medium leading-tight md:block">
                          {ev.name.replace(" (expected)", "")}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-scree">
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-brand" aria-hidden="true" />Eid</li>
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-sand ring-1 ring-mist" aria-hidden="true" />Ramadan</li>
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-tanzanite" aria-hidden="true" />Other observances</li>
        </ul>
      </div>

      {/* ---- What it means for a trip ---- */}
      <div>
        <p className="label mb-3 text-tanzanite">
          {picked ? "Selected day" : `In ${monthLabel}`}
        </p>
        {shown.length === 0 ? (
          <p className="rounded-[20px] bg-glacier p-6 text-scree shadow-[var(--shadow-card)]">
            No Islamic holidays this month, so there is nothing special to plan around.
            Use the arrows to see the months ahead.
          </p>
        ) : (
          <ul className="space-y-4" aria-live="polite">
            {shown.map((e) => (
              <li key={e.id} className="rounded-[20px] bg-glacier p-6 shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-display text-xl">{e.name}</h4>
                  <span className={`label rounded-full px-3 py-1 ${outlookStyle[e.outlook]}`}>
                    {e.outlookLabel}
                  </span>
                </div>
                <p className="metric mt-2 text-xs">
                  {range(e)} · {e.hijri}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-scree">{e.note}</p>
                <p className="mt-3 text-sm leading-relaxed text-basalt">
                  <span className="font-semibold">For your trip: </span>
                  {e.travel}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/contact?interest=halal"
          className="mt-6 inline-flex rounded-full bg-brand px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-basalt hover:bg-brand-bright"
        >
          Plan a trip around these dates
        </Link>
      </div>
    </div>
  );
}
