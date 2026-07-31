import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { routes, getRoute, zones } from "@/lib/routes";
import { departures } from "@/lib/trips";
import { climbIncluded, climbExcluded } from "@/lib/inclusions";
import { reviews } from "@/lib/reviews";
import { site, guides, crewSize } from "@/lib/site";
import { photo } from "@/lib/photos";
import { money, metres, totalAscent, longDate, dateParts } from "@/lib/format";
import { Section, SectionTitle, PageHero, Pill, Unverified, Eyebrow, difficultyTone } from "@/components/primitives";
import { RouteProfile } from "@/components/route-profile";
import { RouteTable, Terms, ReviewBand, GuideCard, BookBar, NextDeparture, SeatBarRow } from "@/components/blocks";

/** All routes prerender — there are six, and they are the highest-value pages. */
export function generateStaticParams() {
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRoute(slug);
  if (!r) return {};
  const mountain = r.mountain === "meru" ? "Mount Meru" : "Kilimanjaro";
  return {
    title: `${r.name} Route — ${r.days} days on ${mountain}`,
    description: `${r.strapline} ${r.days} days, ${r.difficulty.toLowerCase()}, from ${money(r.price)} per person. Full altitude profile, day-by-day itinerary and published rate card.`,
    alternates: { canonical: `/kilimanjaro/${r.slug}` },
    openGraph: { images: [photo(r.photoKey)?.src ?? "/photos/hero-kilimanjaro.webp"] },
  };
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) notFound();

  const mountain = route.mountain === "meru" ? "Mount Meru" : "Kilimanjaro";
  const others = routes.filter((r) => r.slug !== route.slug && r.mountain === route.mountain);
  const mine = departures.filter((d) => d.routeSlug === route.slug);
  const rel = reviews.filter((r) => /climb|kilimanjaro|trek|route|summit|meru/i.test(r.trip ?? "")).slice(0, 3);
  const highDays = route.itinerary.filter((d) => d.high && d.high > d.altitude).length;

  const facts = [
    { k: "Days on the mountain", v: String(route.days) },
    { k: "Summit", v: `${route.summit}, ${metres(route.summitAltitude)}` },
    { k: "Difficulty", v: route.difficulty, pill: true },
    { k: "Summit rate", v: `${route.successRate}%`, mark: route.successVerified ? null : "Own data to confirm" },
    { k: "Trail traffic", v: route.traffic },
    { k: "Total ascent", v: `about ${metres(totalAscent(route))}` },
    { k: "Climb-high days", v: String(highDays) },
    { k: "Scenery", v: `${route.scenery} of 5` },
  ];

  const tripJsonLd = {
    "@context": "https://schema.org",
    "@type": "Trip",
    name: `${route.name} Route, ${route.days} days`,
    description: route.summary,
    url: `${site.url}/kilimanjaro/${route.slug}`,
    provider: { "@type": "TravelAgency", name: site.name, url: site.url },
    itinerary: { "@type": "ItemList", numberOfItems: route.days },
    offers: {
      "@type": "Offer", price: String(route.price), priceCurrency: "USD",
      availability: "https://schema.org/InStock", url: `${site.url}/kilimanjaro/${route.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }} />

      <PageHero
        eyebrow={`${mountain} · ${route.days} days`}
        title={`${route.name} Route`}
        lead={route.strapline}
        photoKey={route.photoKey}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Climb", href: "/kilimanjaro" },
          { label: `${route.name} Route`, href: `/kilimanjaro/${route.slug}` },
        ]}
      />

      <Section tone="cream" className="!pb-[60px]">
        <div className="grid gap-10 lg:grid-cols-[8fr_4fr]">
          <div>
            <Eyebrow>The shape of the climb</Eyebrow>
            <h2 className="mb-3.5 text-[33px] leading-[1.22]">
              {route.days} days, {metres(route.itinerary[0].altitude)} to {metres(route.summitAltitude)}
            </h2>
            <p className="prose-lead">{route.summary}</p>
          </div>
          <div className="rounded bg-paper p-6">
            <p className="label text-muted">Best for</p>
            <p className="mt-2 text-base leading-[1.7] text-ink">{route.bestFor}</p>
          </div>
        </div>

        <NextDeparture route={route} />

        <div className="mt-10"><RouteProfile route={route} /></div>

        <div className="mt-[50px] grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.k}>
              <p className="label mb-1.5 text-muted">{f.k}</p>
              {f.pill ? (
                <Pill tone={difficultyTone(f.v)}>{f.v}</Pill>
              ) : (
                <p className="metric text-[19px] font-bold text-ink">{f.v}</p>
              )}
              {f.mark && <p className="mt-1.5"><Unverified>{f.mark}</Unverified></p>}
            </div>
          ))}
        </div>

        {route.published && !route.published.sameLength && (
          <div className="mt-[34px] rounded border border-[#e0d4a6] bg-[#f6efd6] px-[26px] py-6">
            <h3 className="mb-2.5 text-[17px] text-[#7a5a12]">A note on length and price</h3>
            <p className="text-[15px] leading-[1.75] text-slate">
              We currently also sell this route as <strong>{route.published.name}</strong> —{" "}
              {route.published.hikingDays} hiking days, from{" "}
              <strong className="metric">{money(route.published.from)}</strong>. The {route.days}-day
              version described on this page adds extra acclimatisation, which is why its summit rate
              is higher and its price is not the same. The rate shown here is an estimate for the
              longer climb until the office confirms it. Do not quote the shorter product&rsquo;s
              price for this climb.
            </p>
          </div>
        )}
      </Section>

      {/* Day by day */}
      <Section tone="sand" id="itinerary">
        <div className="grid gap-12 lg:grid-cols-[4fr_8fr]">
          <div>
            <Eyebrow>Day by day</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">What each day is</h2>
            <p className="prose-lead mt-3.5">{route.character}</p>
            <p className="prose-lead">
              Distances are approximate and depend on the exact camp allocation on the day. Walking
              hours are what a normal group takes, not a target.
            </p>
            <div className="mt-5 rounded border border-line bg-white p-5">
              <p className="label mb-2 text-muted">Before and after</p>
              <p className="text-[15px] leading-[1.7] text-slate">
                Two nights at the <strong>{site.baseHotel.name}</strong> in {site.baseHotel.town}
                {site.baseHotel.orSimilar ? " or similar" : ""} are in the price — one before you walk
                in, one after you come down. {site.baseHotel.note}
              </p>
            </div>
          </div>

          <div>
            {route.itinerary.map((d) => {
              const gained = d.high && d.high > d.altitude ? d.high - d.altitude : 0;
              return (
                <div key={d.day} className="grid grid-cols-[62px_1fr] gap-[22px] border-b border-line py-6 last:border-b-0">
                  <span className="flex size-[54px] items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white">
                    D{d.day}
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-[18px]">{d.from} → {d.to}</h3>
                    <ul className="my-2.5 flex flex-wrap gap-1.5">
                      <li className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ background: `var(--color-zone-${d.zone})` }}>
                        {zones[d.zone].label}
                      </li>
                      {[`Sleep at ${metres(d.altitude)}`, d.high ? `High point ${metres(d.high)}` : null, d.distance, `${d.hours} walking`]
                        .filter(Boolean)
                        .map((t) => (
                          <li key={String(t)} className="metric rounded-full border border-line bg-white px-3 py-1 text-xs text-slate">{t}</li>
                        ))}
                    </ul>
                    <p className="text-[15px] text-muted">{d.note}</p>
                    {gained > 0 && (
                      <p className="mt-2 text-[13px] font-semibold text-olive-deep">
                        Climb high, sleep low — you top out {metres(gained)} above where you sleep.
                        This is the day that builds your acclimatisation.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Price */}
      <Section tone="cream" id="price">
        <SectionTitle
          eyebrow="The rate card"
          title="What it costs, by how many of you there are"
          lead="Park fees, crew and vehicles do not scale with party size, so the per-person rate falls sharply as the group grows. The whole ladder is published rather than a single figure only a large group could get."
        />
        <div className="mt-10 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {route.groupPricing.map((g) => (
            <div key={g.size} className="rounded border border-line px-3 py-3.5 text-center">
              <p className="label text-muted">{g.size}</p>
              <p className="metric mt-1 text-[21px] font-bold text-olive-deep">{money(g.price)}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-muted">
          Per person, in US dollars.{" "}
          {route.priceVerified
            ? "Taken from the operator's own published rate card."
            : <><Unverified>Rate sheet to confirm</Unverified> These are estimates for this route length.</>}
        </p>

        <div className="mt-[50px]"><Terms included={climbIncluded} excluded={climbExcluded} /></div>

        <div className="mt-5 rounded bg-paper p-[30px]">
          <h3 className="mb-3 text-[19px]">Paying for it</h3>
          <p className="mb-2 leading-[1.75] text-muted">
            A 30% deposit confirms your dates and your crew. The balance is due 45 days before you
            walk in. Cancel more than 60 days out and the deposit transfers to another date within a
            year; inside 45 days the balance is non-refundable, which is what your travel insurance
            is for.
          </p>
          <p className="leading-[1.75] text-muted">
            Comprehensive travel insurance covering trekking to {metres(route.summitAltitude)} and
            helicopter evacuation is a condition of climbing with us. We check the policy before you
            go up.
          </p>
        </div>
      </Section>

      {mine.length > 0 && (
        <Section tone="sand">
          <SectionTitle
            eyebrow="Or join a group"
            title={`${mine.length} fixed date${mine.length === 1 ? "" : "s"} on the ${route.name} route`}
            lead="Below the private-climb price. Each date carries a price we will honour and a seat count that goes down as people book."
          />
          <div className="mt-10">
            {mine.map((d) => {
              const p = dateParts(d.start);
              const left = d.capacity - d.booked;
              return (
                <div key={d.id} className={`mb-3.5 grid items-center gap-6 rounded border border-line p-[22px] md:grid-cols-[150px_1fr_190px_170px] ${left ? "bg-white" : "bg-paper"}`}>
                  <p className="text-xl font-bold leading-tight text-ink">
                    {p.day} {p.month}<span className="block text-[13px] font-normal text-muted">{p.year}</span>
                  </p>
                  <p className="text-[15px] text-ink">
                    {longDate(d.start)} to {longDate(d.end)}
                    <span className="mt-0.5 block text-[13px] text-muted">{route.days} days, {route.difficulty}</span>
                  </p>
                  <SeatBarRow capacity={d.capacity} booked={d.booked} />
                  <div>
                    <p className={`metric text-2xl font-bold ${left ? "text-olive-deep" : "text-muted"}`}>
                      {money(d.price)}<span className="block text-xs font-normal text-muted">per person</span>
                    </p>
                    <Link href={`/departures#${d.id}`}
                      className={`mt-2 inline-block rounded-[3px] px-[22px] py-2.5 text-sm font-semibold transition-colors ${left ? "bg-brick-text text-white hover:bg-brick-dark" : "border border-olive-deep text-olive-deep"}`}>
                      {left ? "Join this group" : "Waitlist"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Crew */}
      <Section tone="cream" id="crew">
        <SectionTitle
          eyebrow="Who takes you up"
          title={`A crew of ${crewSize}+, and you can ask for one by name`}
          lead="Guests name these guides in their own Tripadvisor reviews. On the live site not one of them appears anywhere, which means the reviews credit people the reader is never introduced to."
        />
        <div className="mt-10 grid grid-cols-2 justify-center gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {guides.slice(0, 6).map((g) => <GuideCard key={g.name} guide={g} />)}
        </div>
        <div className="mt-[50px] rounded border border-line bg-white p-[30px]">
          <h3 className="mb-3 text-[19px]">Porter welfare and safety</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <p className="text-[15px] leading-[1.75] text-muted">
              Porters are paid above the KPAP wage floor, loads are weighed at the gate, and every
              porter has proper boots and a sleeping bag rated for the camps they sleep in. This is
              not a courtesy; underpaid and underequipped crew is how people get hurt on this mountain.
            </p>
            <p className="text-[15px] leading-[1.75] text-muted">
              Every climb carries a pulse oximeter with twice-daily checks, a first-aid kit, bottled
              oxygen, and a written evacuation plan for each camp on this route. Your guide has the
              final say on whether you go higher.
            </p>
          </div>
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="sand">
          <SectionTitle eyebrow="Not sure this is the one"
            title={`The other ${others.length} route${others.length === 1 ? "" : "s"} on ${mountain}`} />
          <div className="mt-10"><RouteTable routes={others} /></div>
        </Section>
      )}

      {rel.length > 0 && <ReviewBand items={rel} title="From people who did it" />}

      <BookBar
        name={`${route.name} Route — ${route.days} days, ${route.difficulty.toLowerCase()}`}
        price={route.price}
        note="per person, from"
        verified={route.priceVerified}
        addId={`route-${route.slug}`}
        extra={
          <Link href="/departures"
            className="rounded-[3px] border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20">
            Group dates
          </Link>
        }
      />
    </>
  );
}
