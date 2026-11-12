import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTour, tourPath } from "@/lib/tours";
import { BookBar } from "@/components/book-bar";
import {
  Contour,
  Eyebrow,
  Photo,
  SeatBar,
} from "@/components/primitives";
import { RouteProfile } from "@/components/route-profile";
import { climbExcluded, climbIncluded } from "@/lib/inclusions";
import { getRoute, routes, zones } from "@/lib/routes";
import { photo } from "@/lib/photos";
import { site } from "@/lib/site";
import { upcomingGroupDepartures } from "@/lib/departures";

export function generateStaticParams() {
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) return { title: "Route not found" };
  return {
    title: `${route.name} — ${route.days} days`,
    description: route.summary,
  };
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) notFound();

  const totalGain = route.itinerary.reduce((sum, d, i) => {
    const prev = i === 0 ? route.itinerary[0].altitude : route.itinerary[i - 1].altitude;
    const top = d.high ?? d.altitude;
    return sum + Math.max(0, top - prev);
  }, 0);

  const LIVE: Record<string, string> = {
    "lemosho-8-day": "lemosho-route-8",
    "machame-7-day": "machame-route-7",
    "marangu-6-day": "marangu-route-6",
    "rongai-7-day": "rongai-route-7",
    "northern-circuit-9-day": "northern-circuit-route-9",
    "mount-meru-4-day": "mount-meru-4",
  };
  const live = getTour(["kili", "meru"], LIVE[route.slug] ?? "");
  const liveRates = live && live.ladder.length > 0 ? live.ladder : null;

  /* The group departures of this route, live from Tanova. */
  const GROUP: Record<string, string> = {
    "lemosho-8-day": "lemosho-route-8",
    "machame-7-day": "machame-route-7",
    "marangu-6-day": "marangu-route-6",
    "rongai-7-day": "rongai-route-7",
  };
  const routeDepartures = GROUP[route.slug]
    ? (await upcomingGroupDepartures(40)).filter((d) => d.tourKey === GROUP[route.slug] && d.open).slice(0, 4)
    : [];

  /* Per-trip structured data. The site-level TravelAgency block says who we
     are; this says what this page sells, which is what earns a price and a
     duration in search results. */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${route.name} — ${route.days}-day Kilimanjaro climb`,
    description: route.summary,
    image: photo(route.photoKey)?.src,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: route.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${site.url}/kilimanjaro/${route.slug}`,
    },
  };

  return (
    <>
      <section className="border-b border-mist px-6 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="label text-tanzanite">
            {route.mountain === "meru" ? "Mount Meru" : "Kilimanjaro"} ·{" "}
            {route.days} days · {route.difficulty}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-5xl md:text-6xl">{route.name}</h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-scree">
                {route.strapline}
              </p>
            </div>
            <div className="text-right">
              <p className="metric text-4xl text-tanzanite">
                ${route.price.toLocaleString()}
              </p>
              <p className="label text-scree">per person, two climbers</p>
              <Link
                href={`/plan?route=${route.slug}`}
                className="mt-4 inline-flex rounded-full bg-brand px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright hover:shadow-[0_2px_20px_0_rgba(157,171,31,0.5)]"
              >
                Book this climb
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <RouteProfile route={route} />
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section className="border-b border-mist bg-frost px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="metric text-3xl">{route.successRate}%</p>
            <p className="label mt-1 text-scree">Summit rate</p>
            {!route.successVerified && (
              <p className="mt-2 text-xs text-scree">Industry figure for this route</p>
            )}
          </div>
          <div>
            <p className="metric text-3xl">{route.summitAltitude.toLocaleString()} m</p>
            <p className="label mt-1 text-scree">{route.summit}</p>
          </div>
          <div>
            <p className="metric text-3xl">{totalGain.toLocaleString()} m</p>
            <p className="label mt-1 text-scree">Total ascent</p>
          </div>
          <div>
            <p className="metric text-3xl">{route.days}</p>
            <p className="label mt-1 text-scree">Days on the mountain</p>
          </div>
          <div>
            <p className="metric text-3xl">{route.scenery}/5</p>
            <p className="label mt-1 text-scree">Scenery · {route.traffic.toLowerCase()}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          <div>
            <Contour className="mb-5" />
            <h2 className="font-display text-3xl md:text-4xl">Day by day</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-scree">
              {route.character}
            </p>

            <ol className="mt-10 divide-y divide-mist border-y border-mist">
              {route.itinerary.map((d) => {
                const gainKey = d.zone === "moorland" ? "moor" : d.zone;
                return (
                  <li key={d.day} className="grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-8">
                    <div className="sm:w-28">
                      <p className="metric text-2xl">D{d.day}</p>
                      <p
                        className="label mt-1"
                        style={{ color: `var(--color-zone-${gainKey})` }}
                      >
                        {zones[d.zone].label}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-xl tracking-tight">
                        {d.from} → {d.to}
                      </h3>
                      <p className="metric mt-1.5 text-sm text-tanzanite">
                        {d.altitude.toLocaleString()} m
                        {d.high && d.high > d.altitude
                          ? ` · high point ${d.high.toLocaleString()} m`
                          : ""}{" "}
                        · {d.distance} · {d.hours}
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed text-scree">{d.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-14 grid gap-10 sm:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl">What is included</h2>
                <ul className="mt-4 space-y-3">
                  {climbIncluded.map((i) => (
                    <li key={i.text} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-0.5 text-tanzanite" aria-hidden="true">
                        +
                      </span>
                      <span>
                        <span className="text-scree">{i.text}</span>
                        {i.detail && (
                          <span className="mt-0.5 block text-xs text-scree/75">
                            {i.detail}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-l-2 border-mist pl-4 text-xs leading-relaxed text-scree">
                  The two hotel nights are at {site.baseHotel.name} in{" "}
                  {site.baseHotel.town} or similar. {site.baseHotel.note}
                </p>
              </div>
              <div>
                <h2 className="font-display text-2xl">What is not</h2>
                <ul className="mt-4 space-y-3">
                  {climbExcluded.map((i) => (
                    <li key={i.text} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-0.5 text-scree/60" aria-hidden="true">
                        −
                      </span>
                      <span>
                        <span className="text-scree">{i.text}</span>
                        {i.detail && (
                          <span className="mt-0.5 block text-xs text-scree/75">
                            {i.detail}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside>
            <div className="rounded-[10px] border border-mist bg-frost p-6 shadow-[0_10px_25px_0_rgba(74,85,104,0.10)]">
              <h2 className="font-display text-xl">Price by group size</h2>
              <dl className="mt-5 divide-y divide-mist">
                {(liveRates ? liveRates.map((r) => ({ size: r.size, price: r.price ?? 0 })) : route.groupPricing).map((g) => (
                  <div key={g.size} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-sm">{g.size}</dt>
                    <dd className="metric text-lg text-tanzanite">
                      ${g.price.toLocaleString()}
                    </dd>
                  </div>
                ))}
              </dl>
              {live ? (
                <p className="mt-4 text-xs leading-relaxed text-scree">
                  This is the {live.duration?.replace(/\s*\|\s*/g, ", ")} package.{" "}
                  <Link href={tourPath(live)} className="text-tanzanite underline underline-offset-4">
                    Full itinerary, price table and inclusions
                  </Link>
                  .
                </p>
              ) : (
                <p className="mt-4 text-xs leading-relaxed text-scree">Per person, US dollars.</p>
              )}

              {route.published && !route.published.sameLength && (
                <p className="mt-4 border-t border-mist pt-4 text-xs leading-relaxed text-scree">
                  A shorter <strong>{route.published.hikingDays}-day</strong>{" "}
                  version of this route is also sold, from{" "}
                  <span className="metric text-tanzanite">
                    ${route.published.from.toLocaleString()}
                  </span>
                  . It is cheaper because it skips a day of acclimatisation,
                  and it summits less often. Ask us for it by name if you want
                  it — we will not quietly sell it to you as this climb.
                </p>
              )}

              <Link
                href={`/plan?route=${route.slug}`}
                className="mt-6 block rounded-full bg-brand px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright hover:shadow-[0_2px_20px_0_rgba(157,171,31,0.5)]"
              >
                Book this climb
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-scree">
                30% deposit to confirm. Balance due 45 days before you fly.
              </p>
            </div>

            {routeDepartures.length > 0 && (
              <div className="mt-8 rounded-[10px] border border-mist p-6">
                <h2 className="font-display text-xl">Group departures</h2>
                <p className="mt-2 text-sm leading-relaxed text-scree">
                  Cheaper than a private climb, and you meet people.
                </p>
                <div className="mt-5 space-y-3">
                  {routeDepartures.map((d) => (
                    <Link
                      key={d.start}
                      href={`${d.href}?date=${d.start}#enquire`}
                      className="flex items-baseline justify-between gap-3 rounded-lg px-1 py-1 hover:bg-frost"
                    >
                      <span className="metric text-sm">
                        {new Date(`${d.start}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="label text-scree">
                        {d.seatsLeft !== null && d.seatsLeft <= 4 ? `${d.seatsLeft} left` : "Open"}
                        {d.price ? <span className="metric ml-3 text-base text-tanzanite">${d.price.toLocaleString()}</span> : null}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/departures"
                  className="mt-5 block rounded-full border border-mist bg-glacier px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite shadow-[0_10px_25px_0_rgba(74,85,104,0.15)] transition-all hover:border-brand hover:bg-brand hover:text-basalt"
                >
                  Full calendar
                </Link>
              </div>
            )}

            <div className="mt-8">
              <Photo imageKey={route.photoKey} ratio="4/5" tone="light" brief={route.photoBrief} sizes="(min-width: 1024px) 30vw, 100vw" />
            </div>
          </aside>
        </div>
      </div>

      <BookBar
        price={route.price}
        qualifier="per person, two climbers"
        href={`/plan?route=${route.slug}`}
        label="Book this climb"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
