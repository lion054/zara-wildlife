"use client";

import { useMemo, useState } from "react";
import type { Route } from "@/lib/routes";
import { zoneFor } from "@/lib/routes";

/**
 * SIGNATURE ELEMENT — the altitude profile.
 *
 * A Kilimanjaro climb is a vertical journey through four stacked climate
 * zones, and the shape of that journey is what decides whether a climber
 * summits. It is the single most persuasive thing this operator can publish
 * and the current site does not have it in any form.
 *
 * So it is the hero. Bands behind the curve are the real climate zones.
 * "Climb high, sleep low" days — where the day's high point is above the
 * night's camp — are drawn explicitly, because that is the acclimatisation
 * argument that justifies charging $2,250 against a $1,200 undercutter.
 *
 * Selecting a day pulls up that day's detail. Keyboard accessible throughout.
 */

const W = 820;
const H = 300;
const PAD = { top: 28, right: 16, bottom: 34, left: 46 };
const MIN_M = 1400;
const MAX_M = 6100;

const zoneFill: Record<string, string> = {
  forest: "var(--color-zone-forest)",
  moorland: "var(--color-zone-moor)",
  desert: "var(--color-zone-desert)",
  arctic: "var(--color-zone-arctic)",
};

const bands = [
  { from: 1400, to: 2800, zone: "forest", label: "Rainforest" },
  { from: 2800, to: 4000, zone: "moorland", label: "Moorland" },
  { from: 4000, to: 5000, zone: "desert", label: "Alpine desert" },
  { from: 5000, to: 6100, zone: "arctic", label: "Arctic" },
];

export function RouteProfile({
  route,
  compact = false,
}: {
  route: Route;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const { x, y, linePoints, areaPath, peakDay } = useMemo(() => {
    const n = route.itinerary.length;
    const x = (i: number) =>
      PAD.left + (i / Math.max(1, n - 1)) * (W - PAD.left - PAD.right);
    const y = (m: number) =>
      PAD.top + (1 - (m - MIN_M) / (MAX_M - MIN_M)) * (H - PAD.top - PAD.bottom);

    const linePoints = route.itinerary
      .map((d, i) => `${x(i)},${y(d.altitude)}`)
      .join(" ");

    const areaPath =
      `M ${x(0)},${y(MIN_M)} ` +
      route.itinerary.map((d, i) => `L ${x(i)},${y(d.altitude)}`).join(" ") +
      ` L ${x(n - 1)},${y(MIN_M)} Z`;

    const peakDay = route.itinerary.findIndex(
      (d) => (d.high ?? d.altitude) === route.summitAltitude,
    );

    return { x, y, linePoints, areaPath, peakDay };
  }, [route]);

  const day = selected !== null ? route.itinerary[selected] : null;

  return (
    /* `min-w-0` is load-bearing. The SVG below carries min-w-[640px] so the
       chart stays readable, and the wrapper scrolls it. But a grid or flex
       item defaults to `min-width: auto` — its content-based minimum — so
       when this profile sits in the homepage picker's grid, that 640px
       propagated up and pushed the whole PAGE past the viewport on mobile.
       Resetting it here keeps the scroll inside the chart where it belongs. */
    <div className="w-full min-w-0">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px]"
          role="img"
          aria-label={`Altitude profile for the ${route.name} route: ${route.days} days, summit ${route.summitAltitude} metres`}
        >
          {/* Climate zones — the bands are the mountain's own structure */}
          {bands.map((b) => (
            <g key={b.zone}>
              <rect
                x={PAD.left}
                y={y(b.to)}
                width={W - PAD.left - PAD.right}
                height={Math.max(0, y(b.from) - y(b.to))}
                fill={zoneFill[b.zone]}
                opacity={0.13}
              />
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(b.from)}
                y2={y(b.from)}
                stroke="currentColor"
                strokeOpacity={0.14}
                strokeDasharray="2 4"
              />
              <text
                x={PAD.left + 8}
                y={y(b.to) + 14}
                className="metric"
                fontSize="9"
                fill="currentColor"
                opacity={0.5}
                letterSpacing="0.1em"
              >
                {b.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Altitude axis */}
          {[2000, 3000, 4000, 5000, 6000].map((m) => (
            <text
              key={m}
              x={PAD.left - 8}
              y={y(m) + 3}
              textAnchor="end"
              className="metric"
              fontSize="9"
              fill="currentColor"
              opacity={0.55}
            >
              {(m / 1000).toFixed(0)}k
            </text>
          ))}

          {/* Filled area under the sleeping-altitude curve */}
          <path d={areaPath} fill="var(--color-tanzanite)" opacity={0.16} />
          <polyline
            points={linePoints}
            fill="none"
            stroke="var(--color-tanzanite)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* Climb high, sleep low — drawn, because it is the whole argument */}
          {route.itinerary.map((d, i) =>
            d.high && d.high > d.altitude ? (
              <g key={`high-${i}`}>
                <line
                  x1={x(i)}
                  x2={x(i)}
                  y1={y(d.high)}
                  y2={y(d.altitude)}
                  stroke={
                    d.high === route.summitAltitude
                      ? "var(--color-sunrise)"
                      : "currentColor"
                  }
                  strokeOpacity={d.high === route.summitAltitude ? 1 : 0.4}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <circle
                  cx={x(i)}
                  cy={y(d.high)}
                  r={d.high === route.summitAltitude ? 5 : 3}
                  fill={
                    d.high === route.summitAltitude
                      ? "var(--color-sunrise)"
                      : "currentColor"
                  }
                  fillOpacity={d.high === route.summitAltitude ? 1 : 0.45}
                />
                {d.high === route.summitAltitude && (
                  <text
                    x={x(i)}
                    y={y(d.high) - 12}
                    textAnchor="middle"
                    className="metric"
                    fontSize="10"
                    fill="var(--color-sunrise-ink)"
                  >
                    {route.summit} {route.summitAltitude.toLocaleString()} m
                  </text>
                )}
              </g>
            ) : null,
          )}

          {/* Camps — one hit target per day */}
          {route.itinerary.map((d, i) => (
            <g
              key={d.day}
              onMouseEnter={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              onClick={() => setSelected(i)}
              tabIndex={0}
              role="button"
              aria-label={`Day ${d.day}: ${d.to}, ${d.altitude} metres`}
              className="cursor-pointer outline-none"
            >
              <rect
                x={x(i) - 18}
                y={PAD.top}
                width={36}
                height={H - PAD.top - PAD.bottom}
                fill="transparent"
              />
              <circle
                cx={x(i)}
                cy={y(d.altitude)}
                r={selected === i ? 6 : 4}
                fill="var(--color-tanzanite)"
                stroke="var(--color-glacier)"
                strokeWidth={2}
              />
              <text
                x={x(i)}
                y={H - 12}
                textAnchor="middle"
                className="metric"
                fontSize="10"
                fill="currentColor"
                opacity={selected === i ? 1 : 0.55}
              >
                D{d.day}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Day detail */}
      <div
        className={`mt-4 border-t-2 border-tanzanite pt-4 ${
          compact ? "min-h-[92px]" : "min-h-[104px]"
        }`}
        aria-live="polite"
      >
        {day ? (
          <div>
            <p className="label text-tanzanite">
              Day {day.day} · {day.distance} · {day.hours}
              {day.high && day.high > day.altitude
                ? ` · high point ${day.high.toLocaleString()} m`
                : ""}
            </p>
            <p className="mt-1.5 font-display text-lg tracking-tight">
              {day.from} → {day.to}{" "}
              <span className="metric text-tanzanite">
                {day.altitude.toLocaleString()} m
              </span>
            </p>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed opacity-70">
              {day.note}
            </p>
          </div>
        ) : (
          <p className="text-sm opacity-60">
            Hover or tab through the days to see each camp, the distance walked
            and how much altitude you gain.{" "}
            <span className="text-sunrise-ink">Orange marks the summit.</span> Dashed
            lines are climb-high-sleep-low days — the ones that get you up.
          </p>
        )}
      </div>
    </div>
  );
}
