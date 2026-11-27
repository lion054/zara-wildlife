"use client";

import { useState } from "react";

export type TimelineDay = {
  n: number;
  label: string;
  overnight: string | null;
  stats: Record<string, string>;
  text: string[];
};

const dateOf = (start: string, n: number) => {
  // In UTC throughout, so the server and a browser in any time zone print the same day.
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n - 1);
  return d;
};

/**
 * The itinerary as dated days ("05 Dec · Day 1"), for one departure. "Short" lists each day's route and numbers;
 * "Full" adds the day's description. Days keep their #day-N anchors, so the elevation chart's "Read the day" lands here.
 */
export function DatedItinerary({ start, days }: { start: string; days: TimelineDay[] }) {
  const [full, setFull] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl md:text-4xl">Day by day</h2>
        <div className="flex rounded-full bg-frost p-1 ring-1 ring-mist" role="group" aria-label="Itinerary detail">
          {(["Short", "Full"] as const).map((v) => {
            const on = (v === "Full") === full;
            return (
              <button key={v} type="button" aria-pressed={on} onClick={() => setFull(v === "Full")} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${on ? "bg-basalt text-glacier" : "text-scree hover:text-basalt"}`}>
                {v}
              </button>
            );
          })}
        </div>
      </div>
      <ol className="relative mt-8 space-y-0 border-l-2 border-mist pl-6 md:ml-24 md:pl-8">
        {days.map((d) => {
          const date = dateOf(start, d.n);
          // Short labels so a day's facts sit on one or two lines on a phone; "5, 895 m" in the source reads "5,895 m".
          const stats = Object.entries(d.stats)
            .filter(([, v]) => v)
            .map(([k, v]) => [/distance/i.test(k) ? "Distance" : /time/i.test(k) ? "Time" : /altitude|elevation/i.test(k) ? "Altitude" : k, v.replace(/(\d),\s+(\d{3})/g, "$1,$2")] as const);
          return (
            <li key={d.n} id={`day-${d.n}`} className="relative scroll-mt-28 pb-8 last:pb-0">
              <span className="absolute -left-[calc(1.5rem+7px)] top-1.5 h-3 w-3 rounded-full bg-tanzanite ring-4 ring-glacier md:-left-[calc(2rem+7px)]" aria-hidden="true" />
              <p className="label text-tanzanite md:absolute md:-left-[8.5rem] md:top-1 md:w-24 md:text-right">
                <time dateTime={date.toISOString().slice(0, 10)} className="md:block md:text-sm">
                  {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })}
                </time>
                <span className="text-scree md:hidden"> · </span>
                <span className="text-scree">Day {d.n}</span>
                <span className="block text-[0.65rem] font-normal normal-case tracking-normal text-scree max-md:hidden">
                  {date.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" })}
                </span>
              </p>
              <h3 className="mt-1 font-display text-xl leading-snug text-basalt md:mt-0">{d.label.replace(/\s*\|\s*/g, " → ")}</h3>
              {(stats.length > 0 || d.overnight) && (
                <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  {stats.map(([k, v]) => (
                    <div key={k} className="flex gap-1.5">
                      <dt className="text-scree">{k}:</dt>
                      <dd className="metric text-basalt">{v}</dd>
                    </div>
                  ))}
                  {d.overnight && (
                    <div className="flex gap-1.5">
                      <dt className="text-scree">Night:</dt>
                      <dd className="text-basalt">{d.overnight}</dd>
                    </div>
                  )}
                </dl>
              )}
              {full && (
                <div className="mt-3 max-w-3xl space-y-3 text-base leading-relaxed text-scree">
                  {d.text.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
