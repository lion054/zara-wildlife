"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RouteProfile } from "./route-profile";
import { photo } from "@/lib/photos";
import { kilimanjaroRoutes } from "@/lib/routes";

/**
 * The hero. Pick a route, see it — then see its shape.
 *
 * The altitude profile is still the argument for why an eight-day Lemosho
 * costs more than a five-day Marangu. But a chart is what you look at once you
 * are already interested, and nobody arrives interested. So the photograph
 * leads and the chart is one click away, rather than the other way round.
 *
 * The stats sit on glass over the image so the two views share a frame and
 * the panel does not jump when you switch between them.
 */
export function RoutePicker() {
  const [slug, setSlug] = useState(kilimanjaroRoutes[0].slug);
  const [view, setView] = useState<"photo" | "profile">("photo");
  const route = kilimanjaroRoutes.find((r) => r.slug === slug)!;
  const img = photo(route.photoKey);

  return (
    <div>
      {/* Route tabs */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a Kilimanjaro route">
        {kilimanjaroRoutes.map((r) => (
          <button
            key={r.slug}
            aria-pressed={r.slug === slug}
            onClick={() => setSlug(r.slug)}
            className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
              r.slug === slug
                ? "border-tanzanite bg-tanzanite text-glacier shadow-[0_8px_20px_-6px_rgba(86,106,27,0.6)]"
                : "border-mist text-basalt hover:border-tanzanite hover:text-tanzanite"
            }`}
          >
            {r.name}{" "}
            <span className="metric ml-1 text-xs opacity-70">{r.days}d</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-10">
        {/* ---- Stage: photograph, or the profile on request ---- */}
        <div className="min-w-0">
          <div className="relative isolate overflow-hidden rounded-[14px] border border-mist bg-basalt">
            {view === "photo" ? (
              <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
                {img && (
                  <Image
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 62vw, 100vw"
                    className="object-cover"
                  />
                )}

                {/* Scrim, so the readouts below clear contrast on any frame. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/40 to-transparent"
                />

                {/* Instrument grid — a faint survey lattice, which is what the
                    profile chart is drawn on. It ties the two views together
                    rather than being decoration for its own sake. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                  }}
                />

                {/* Altitude flag, top right — the one number that matters */}
                <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-basalt/55 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="metric text-xs text-glacier">
                    {route.summit} · {route.summitAltitude.toLocaleString()} m
                  </span>
                </div>

                {/* Glass readout, bottom — the same figures the profile shows,
                    so switching view never loses information. */}
                <dl className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-white/15 bg-white/10 backdrop-blur-md sm:grid-cols-4">
                  {[
                    { k: "Days", v: String(route.days) },
                    { k: "Summit rate", v: `${route.successRate}%` },
                    { k: "Traffic", v: route.traffic },
                    { k: "From", v: `$${route.price.toLocaleString()}` },
                  ].map((s) => (
                    <div key={s.k} className="bg-basalt/35 px-3 py-2.5">
                      <dt className="label text-glacier/60">{s.k}</dt>
                      <dd className="metric mt-0.5 text-base text-glacier">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div className="bg-glacier p-4 sm:p-6">
                <RouteProfile route={route} />
              </div>
            )}
          </div>

          {/* View switch. Two real states, labelled for what they show. */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div
              className="inline-flex rounded-full border border-mist bg-frost p-1"
              role="group"
              aria-label="How to view this route"
            >
              {(["photo", "profile"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                    view === v
                      ? "bg-brand text-basalt"
                      : "text-scree hover:text-tanzanite"
                  }`}
                >
                  {v === "photo" ? "Photo" : "Altitude profile"}
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-scree">
              {view === "photo"
                ? "Switch to the profile to see where the acclimatisation days are."
                : "Hover or tab through the days to see each camp and the altitude gained."}
            </p>
          </div>
        </div>

        {/* ---- Sidebar ---- */}
        <aside className="lg:pt-1">
          <p className="label text-tanzanite">
            {route.days} days · {route.difficulty}
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight">{route.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-scree">{route.strapline}</p>

          <dl className="mt-6 space-y-4 border-t border-mist pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="label text-scree">Summit rate</dt>
              <dd className="metric text-lg">{route.successRate}%</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="label text-scree">Traffic</dt>
              <dd className="text-sm font-medium text-basalt">{route.traffic}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="label text-scree">From</dt>
              <dd className="metric text-lg text-tanzanite">
                ${route.price.toLocaleString()}
              </dd>
            </div>
          </dl>

          <Link
            href={`/kilimanjaro/${route.slug}`}
            className="mt-6 block rounded-full bg-brand px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright hover:shadow-[0_2px_20px_0_rgba(157,171,31,0.5)]"
          >
            Full itinerary and price
          </Link>
          <Link
            href="/departures"
            className="mt-2 block rounded-full border border-mist bg-glacier px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite shadow-[0_10px_25px_0_rgba(74,85,104,0.15)] transition-all hover:border-brand hover:bg-brand hover:text-basalt"
          >
            Join a group departure
          </Link>
        </aside>
      </div>
    </div>
  );
}
