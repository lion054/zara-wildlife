"use client";

import { useMemo, useState } from "react";
import { zones, type Route } from "@/lib/routes";
import { metres } from "@/lib/format";

/**
 * SIGNATURE ELEMENT — the altitude profile.
 *
 * A Kilimanjaro climb is a vertical journey through four stacked climate zones,
 * and the shape of that journey is what decides whether a climber summits. The
 * live site does not publish it in any form — not a chart, not a table, not a
 * single altitude figure — on a purchase of two thousand dollars and up.
 *
 * So it leads every route page. The bands behind the curve are the mountain's
 * real climate zones. Climb-high-sleep-low days are drawn as explicit dashed
 * spikes, because that is the entire acclimatisation argument and it is what
 * justifies an eight-day Lemosho at $2,250 against a six-day Marangu at $1,680.
 * The summit is the one thing drawn in gold.
 *
 * The SVG is fully rendered on the server; this component only adds the hover
 * and keyboard readout on top of markup that is already complete, so the chart
 * is there with JavaScript off and prints correctly.
 */

const W = 860;
const H = 320;
const PAD = { top: 30, right: 18, bottom: 36, left: 50 };
const MIN_M = 1400;
const MAX_M = 6100;

const BANDS = [
  { from: 1400, to: 2800, zone: "forest" },
  { from: 2800, to: 4000, zone: "moorland" },
  { from: 4000, to: 5000, zone: "desert" },
  { from: 5000, to: 6100, zone: "arctic" },
] as const;

const ZONE_VAR: Record<string, string> = {
  forest: "var(--color-zone-forest)",
  moorland: "var(--color-zone-moorland)",
  desert: "var(--color-zone-desert)",
  arctic: "var(--color-zone-arctic)",
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function RouteProfile({ route }: { route: Route }) {
  const [active, setActive] = useState<number | null>(null);
  const it = route.itinerary;

  const geom = useMemo(() => {
    const n = it.length;
    const x = (i: number) => r2(PAD.left + (i / Math.max(1, n - 1)) * (W - PAD.left - PAD.right));
    const y = (m: number) => r2(PAD.top + (1 - (m - MIN_M) / (MAX_M - MIN_M)) * (H - PAD.top - PAD.bottom));
    const line = it.map((d, i) => `${x(i)},${y(d.altitude)}`).join(" ");
    const area =
      `M ${x(0)},${y(MIN_M)} ` +
      it.map((d, i) => `L ${x(i)},${y(d.altitude)}`).join(" ") +
      ` L ${x(n - 1)},${y(MIN_M)} Z`;
    return { x, y, line, area };
  }, [it]);

  const { x, y, line, area } = geom;
  const day = active !== null ? it[active] : null;
  const spikeDays = it.filter((d) => d.high && d.high > d.altitude && d.high !== route.summitAltitude).length;

  return (
    <div className="rounded border border-line bg-white p-6 pb-4">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px]"
          role="img"
          aria-label={`Altitude profile for the ${route.name} route: ${route.days} days, camps from ${metres(it[0].altitude)} to the ${route.summit} summit at ${metres(route.summitAltitude)}`}
        >
          {/* Climate zones — the mountain's own structure, behind everything */}
          {BANDS.map((b) => (
            <g key={b.zone}>
              <rect
                x={PAD.left}
                y={y(b.to)}
                width={W - PAD.left - PAD.right}
                height={Math.max(0, y(b.from) - y(b.to))}
                fill={ZONE_VAR[b.zone]}
                opacity={0.14}
              />
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(b.from)}
                y2={y(b.from)}
                stroke="#20201c"
                strokeOpacity={0.12}
                strokeDasharray="2 4"
              />
              <text
                x={PAD.left + 9}
                y={y(b.to) + 15}
                fill={ZONE_VAR[b.zone]}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {zones[b.zone].label}
              </text>
            </g>
          ))}

          {[2000, 3000, 4000, 5000, 6000].map((m) => (
            <text key={m} x={PAD.left - 9} y={y(m) + 3} textAnchor="end" className="metric fill-muted text-[11px]">
              {m / 1000}k
            </text>
          ))}

          <path d={area} fill="var(--color-olive-deep)" opacity={0.14} />
          <polyline points={line} fill="none" stroke="var(--color-olive-deep)" strokeWidth={2.5} strokeLinejoin="round" />

          {/* Climb high, sleep low — drawn, because it is the whole argument */}
          {it.map((d, i) => {
            if (!d.high || d.high <= d.altitude) return null;
            const summit = d.high === route.summitAltitude;
            const col = summit ? "var(--color-gold)" : "#20201c";
            return (
              <g key={`spike-${d.day}`}>
                <line
                  x1={x(i)} x2={x(i)} y1={y(d.high)} y2={y(d.altitude)}
                  stroke={col} strokeOpacity={summit ? 1 : 0.4} strokeWidth={1.6} strokeDasharray="3 3"
                />
                <circle cx={x(i)} cy={y(d.high)} r={summit ? 5.5 : 3} fill={col} fillOpacity={summit ? 1 : 0.45} />
                {summit && (
                  <text x={x(i)} y={y(d.high) - 13} textAnchor="middle" className="metric fill-[#7a5a12] text-[11px] font-bold">
                    {route.summit} {metres(route.summitAltitude)}
                  </text>
                )}
              </g>
            );
          })}

          {/* One focusable hit target per day. The chart stays a single labelled
              image; the detail panel below is the live region, which is what a
              screen reader can usefully do with a line chart. */}
          {it.map((d, i) => (
            <g
              key={d.day}
              tabIndex={0}
              role="button"
              aria-label={`Day ${d.day}, ${d.to}, ${metres(d.altitude)}`}
              className="cursor-pointer outline-none [&:focus-visible_circle]:stroke-brick-text [&:focus-visible_circle]:stroke-[4]"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(i); }
              }}
            >
              <rect x={x(i) - 19} y={PAD.top} width={38} height={H - PAD.top - PAD.bottom} fill="transparent" />
              <circle
                cx={x(i)} cy={y(d.altitude)} r={active === i ? 8 : 4.5}
                fill="var(--color-olive-deep)" stroke="#fff" strokeWidth={2}
                className="transition-all"
              />
              <text x={x(i)} y={H - 12} textAnchor="middle" className="metric fill-slate text-[11px] font-bold">
                D{d.day}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="mt-2 text-xs text-muted md:hidden">Scroll the chart sideways to reach the later days.</p>

      <div aria-live="polite" className="mt-[18px] min-h-[92px] border-t border-line pt-[18px]">
        {day ? (
          <div>
            <h4 className="text-[17px]">
              Day {day.day} — {day.from} to {day.to}
            </h4>
            <div className="my-2.5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-slate">
              <span className="metric">Camp <strong className="text-[15px] text-ink">{metres(day.altitude)}</strong></span>
              {day.high && day.high > day.altitude && (
                <span className="metric">High point <strong className="text-[15px] text-ink">{metres(day.high)}</strong></span>
              )}
              <span className="metric">Distance <strong className="text-[15px] text-ink">{day.distance}</strong></span>
              <span className="metric">Walking <strong className="text-[15px] text-ink">{day.hours}</strong></span>
              <span>Zone <strong className="text-[15px] text-ink">{zones[day.zone].label}</strong></span>
            </div>
            <p className="text-sm text-muted">
              {day.note}
              {day.high && day.high > day.altitude && (
                <em>
                  {" "}Climb high, sleep low: you top out {metres(day.high - day.altitude)} above where you sleep,
                  which is what builds the acclimatisation.
                </em>
              )}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {/* The 640px minimum stays: scaled to a 430px screen the day and
                altitude labels would render at about 7px. A chart is the one
                thing on the site worth scrolling sideways — but only if the
                reader knows it scrolls, hence the hint. */}
            <span className="mb-1 block font-semibold text-slate md:hidden">
              Swipe the chart sideways to see the whole climb.
            </span>
            Hover or tab through the days to see each camp, the distance walked and the altitude gained.{" "}
            <strong className="text-[#7a5a12]">Gold marks the summit.</strong> Dashed spikes are
            climb-high-sleep-low days{spikeDays ? ` — this route has ${spikeDays}` : ""} — the ones that get you up.
          </p>
        )}
      </div>

      <ul className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        {BANDS.map((b) => (
          <li key={b.zone} className="flex items-center gap-2">
            <span aria-hidden className="inline-block size-3 rounded-sm" style={{ background: ZONE_VAR[b.zone] }} />
            {zones[b.zone].label} <span className="opacity-65">{zones[b.zone].range}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A compact, non-interactive version for list pages — the shape at a glance. */
export function RouteSpark({ route, width = 300, height = 60 }: { route: Route; width?: number; height?: number }) {
  const it = route.itinerary;
  const n = it.length;
  const x = (i: number) => r2((i / Math.max(1, n - 1)) * (width - 4) + 2);
  const y = (m: number) => r2(height - 3 - ((m - MIN_M) / (MAX_M - MIN_M)) * (height - 6));
  const line = it.map((d, i) => `${x(i)},${y(d.altitude)}`).join(" ");
  const area = `M ${x(0)},${height} ${it.map((d, i) => `L ${x(i)},${y(d.altitude)}`).join(" ")} L ${x(n - 1)},${height} Z`;
  const peak = it.findIndex((d) => (d.high ?? d.altitude) === route.summitAltitude);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img"
      aria-label={`Altitude profile, ${route.days} days, ${route.name} route`}>
      <path d={area} fill="var(--color-olive-deep)" opacity={0.12} />
      <polyline points={line} fill="none" stroke="var(--color-olive-deep)" strokeWidth={2} strokeLinejoin="round" />
      {peak >= 0 && (
        <circle cx={x(peak)} cy={y(it[peak].high ?? it[peak].altitude)} r={3.5} fill="var(--color-gold)" />
      )}
    </svg>
  );
}
