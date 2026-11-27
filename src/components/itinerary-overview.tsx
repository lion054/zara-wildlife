"use client";

import { useEffect, useMemo, useState } from "react";
import { type TrekDay, zoneOf } from "@/lib/itinerary";

const FT = 3.28084;
const ZONE_FILL: Record<string, string> = {
  forest: "var(--color-zone-forest)",
  moor: "var(--color-zone-moor)",
  desert: "var(--color-zone-desert)",
  arctic: "var(--color-zone-arctic)",
};
const BANDS = [
  { key: "forest", name: "Rainforest", from: 0, to: 2800 },
  { key: "moor", name: "Heath & moorland", from: 2800, to: 4000 },
  { key: "desert", name: "Alpine desert", from: 4000, to: 5000 },
  { key: "arctic", name: "Arctic summit", from: 5000, to: 6200 },
];

/* Chart box (SVG units). The plot sits inside the padding. */
const W = 740; // about the itinerary column's width on a laptop, so labels draw at their real size
const H = 340;
const PAD = { l: 46, r: 16, t: 48, b: 44 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;
const Y_MIN = 500;
const Y_MAX = 6200;

const y = (m: number) => PAD.t + PH - ((m - Y_MIN) / (Y_MAX - Y_MIN)) * PH;

/**
 * Itinerary at a glance: an elevation profile from the gate to Uhuru Peak and back, on Kilimanjaro's climate zones,
 * and a card per trekking day (route, distance, time, height gained, the night's altitude). Picking a day on either
 * highlights it on both; "Read the day" opens that day's full description further down the page.
 */
export function ItineraryOverview({ days, startDate }: { days: TrekDay[]; startDate?: string | null }) {
  const [sel, setSel] = useState(days[0]?.n ?? 0);
  const [feet, setFeet] = useState(false);
  // A date in the address (?date=…, from the calendar) dates each day.
  const [start, setStart] = useState<string | null>(startDate ?? null);
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("date");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setStart(d);
  }, []);

  const unit = (m: number) => (feet ? `${Math.round(m * FT).toLocaleString()} ft` : `${m.toLocaleString()} m`);
  const col = PW / Math.max(1, days.length);

  /* The line: each day starts where the last ended, passes its high point mid-day, and ends at the night's camp. */
  const pts = useMemo(() => {
    const out: { x: number; m: number; day: number; kind: "start" | "via" | "end" }[] = [];
    days.forEach((d, i) => {
      const x0 = PAD.l + i * col;
      if (i === 0) out.push({ x: x0, m: d.start, day: d.n, kind: "start" });
      if (d.via) out.push({ x: x0 + col / 2, m: d.via, day: d.n, kind: "via" });
      out.push({ x: x0 + col, m: d.end, day: d.n, kind: "end" });
    });
    return out;
  }, [days, col]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${y(p.m).toFixed(1)}`).join(" ");
  const area = `${line} L${(PAD.l + PW).toFixed(1)},${y(Y_MIN)} L${PAD.l},${y(Y_MIN)} Z`;
  const summit = pts.reduce((a, b) => (b.m > a.m ? b : a), pts[0]);

  const dateOf = (n: number) => {
    if (!start) return null;
    const d = new Date(`${start}T00:00:00`);
    d.setDate(d.getDate() + n - 1);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  };

  const openDay = (n: number) => {
    const li = document.getElementById(`day-${n}`);
    const det = li?.querySelector("details");
    if (det) det.open = true;
    li?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (days.length < 2) return null;

  return (
    // contain:inline-size: the wide chart and the row of cards scroll inside the section, never widening the page.
    <section aria-labelledby="itinerary-overview" className="mb-10 w-full min-w-0 [contain:inline-size]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 id="itinerary-overview" className="font-display text-2xl md:text-3xl">Itinerary at a glance</h3>
          <p className="mt-1 text-sm text-scree">Gate to Uhuru Peak and back: each day&rsquo;s walk, height and night stop.</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-frost p-1 text-xs font-semibold" role="group" aria-label="Units">
          {(["m", "ft"] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={(u === "ft") === feet}
              onClick={() => setFeet(u === "ft")}
              className={`rounded-full px-3 py-1.5 transition ${(u === "ft") === feet ? "bg-basalt text-glacier" : "text-scree hover:text-basalt"}`}
            >
              {u === "m" ? "Metres" : "Feet"}
            </button>
          ))}
        </div>
      </div>

      {/* Elevation profile */}
      <div className="mt-5 overflow-x-auto rounded-3xl bg-white p-3 ring-1 ring-mist [scrollbar-width:thin] md:p-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[600px]" role="img" aria-label={`Elevation profile, highest point ${unit(summit.m)}`}>
          <defs>
            <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-tanzanite)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--color-tanzanite)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Climate zones */}
          {BANDS.map((b) => (
            <rect key={b.key} x={PAD.l} width={PW} y={y(Math.min(b.to, Y_MAX))} height={y(Math.max(b.from, Y_MIN)) - y(Math.min(b.to, Y_MAX))} fill={ZONE_FILL[b.key]} opacity="0.08" />
          ))}

          {/* Altitude grid */}
          {[1000, 2000, 3000, 4000, 5000, 6000].map((m) => (
            <g key={m}>
              <line x1={PAD.l} x2={PAD.l + PW} y1={y(m)} y2={y(m)} stroke="var(--color-mist)" strokeDasharray="3 4" />
              <text x={PAD.l - 8} y={y(m) + 4} textAnchor="end" className="fill-scree" style={{ fontSize: 11 }}>
                {feet ? `${Math.round((m * FT) / 1000)}k` : m.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Selected day */}
          {days.map((d, i) =>
            d.n === sel ? (
              <rect key={d.n} x={PAD.l + i * col} y={PAD.t} width={col} height={PH} fill="var(--color-tanzanite)" opacity="0.08" rx="8" />
            ) : null,
          )}

          <path d={area} fill="url(#elev-fill)" />
          <path d={line} fill="none" stroke="var(--color-tanzanite)" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Camps: the night's altitude and name, above or below the line so neighbours do not collide */}
          {pts.map((p, i) => {
            const top = p === summit;
            const d = days.find((x) => x.n === p.day)!;
            // A rest day stays at the same camp: its point needs no second name.
            const name = p.kind === "via" ? (top ? "Uhuru Peak" : "") : p.kind === "start" || d.start === d.end ? "" : d.to;
            // On the way up the label sits above the line, on the way down below it, so it never crosses the line.
            const prev = pts[i - 1];
            const above = top || !prev || p.m >= prev.m;
            // The first and last labels lean inward so the chart edge never cuts them.
            const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
            const lx = i === 0 ? p.x - 6 : i === pts.length - 1 ? p.x + 6 : p.x;
            return (
              <g key={`${p.day}-${p.kind}`}>
                <circle cx={p.x} cy={y(p.m)} r={top ? 5.5 : 4} fill={top ? "var(--color-sunrise)" : "white"} stroke={top ? "var(--color-sunrise)" : "var(--color-tanzanite)"} strokeWidth="2" />
                <text x={lx} y={y(p.m) + (above ? -12 : 20)} textAnchor={anchor} style={{ fontSize: 12, fontWeight: 600 }} fill={top ? "var(--color-sunrise-ink)" : "var(--color-basalt)"}>
                  {unit(p.m)}
                </text>
                {name && (
                  <text x={lx} y={y(p.m) + (above ? -26 : 34)} textAnchor={anchor} className="fill-scree" style={{ fontSize: 10.5 }}>
                    {name.length > 22 ? `${name.slice(0, 21)}…` : name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Day pills along the bottom */}
          {days.map((d, i) => {
            const cx = PAD.l + i * col + col / 2;
            const on = d.n === sel;
            return (
              <g key={d.n} onClick={() => setSel(d.n)} className="cursor-pointer">
                <rect x={cx - 30} y={H - 30} width="60" height="22" rx="11" fill={on ? "var(--color-tanzanite)" : "transparent"} />
                <text x={cx} y={H - 15} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }} fill={on ? "white" : "var(--color-scree)"}>
                  DAY {d.n}
                </text>
              </g>
            );
          })}
        </svg>
        {/* Climate zones key */}
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 px-2 text-[0.7rem] text-scree" aria-label="Climate zones">
          {BANDS.map((z) => (
            <li key={z.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ZONE_FILL[z.key], opacity: 0.55 }} aria-hidden="true" />
              {z.name} <span className="opacity-70">{z.from ? `${(feet ? Math.round(z.from * FT) : z.from).toLocaleString()}${feet ? " ft" : " m"}+` : `below ${(feet ? Math.round(2800 * FT) : 2800).toLocaleString()}${feet ? " ft" : " m"}`}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Day cards */}
      <ol className="-mx-1.5 mt-3 flex snap-x snap-mandatory scroll-px-1.5 gap-3 overflow-x-auto px-1.5 pb-3 pt-1.5 [scrollbar-width:thin]" aria-label="Trekking days">
        {days.map((d) => {
          const on = d.n === sel;
          const z = zoneOf(d.end);
          const gain = d.end - d.start;
          return (
            <li key={d.n} className="w-[15.5rem] shrink-0 snap-start">
              <article
                onClick={() => setSel(d.n)}
                className={`flex h-full cursor-pointer flex-col rounded-2xl p-4 transition ${
                  on ? "bg-tanzanite/[0.07] ring-2 ring-tanzanite" : "bg-white ring-1 ring-mist hover:ring-basalt/20"
                }`}
              >
                <p className="flex items-center justify-between gap-2">
                  <span className="label text-tanzanite">Day {d.n}</span>
                  {dateOf(d.n) && <span className="text-xs text-scree">{dateOf(d.n)}</span>}
                </p>
                <h4 className="mt-2 font-display text-lg leading-snug text-basalt">{d.route}</h4>
                <ul className="mt-3 space-y-1.5 text-sm text-scree">
                  {d.km && (
                    <li className="flex items-center gap-2">
                      <Dot /> {d.km}
                    </li>
                  )}
                  {d.time && (
                    <li className="flex items-center gap-2">
                      <Dot /> {d.time}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Dot />
                    {gain === 0 ? "Rest and acclimatise" : `${gain > 0 ? "+" : "−"}${unit(Math.abs(gain))} net`}
                    {d.via ? <span className="text-xs">· via {unit(d.via)}</span> : null}
                  </li>
                </ul>
                <div className="mt-auto pt-4">
                  <div className="rounded-xl bg-frost px-3 py-2.5">
                    <p className="label text-[0.6rem] text-scree">Night at</p>
                    <p className="mt-0.5 flex items-baseline justify-between gap-2">
                      <span className="metric text-base text-basalt">{unit(d.end)}</span>
                      <span className="flex items-center gap-1.5 text-[0.7rem] text-scree">
                        <span className="h-2 w-2 rounded-full" style={{ background: ZONE_FILL[z.key] }} aria-hidden="true" />
                        {z.name}
                      </span>
                    </p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); openDay(d.n); }} className="mt-3 text-xs font-semibold text-tanzanite underline underline-offset-4">
                    Read the day
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-tanzanite/60" aria-hidden="true" />;
}
