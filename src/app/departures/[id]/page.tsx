import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { departures } from "@/lib/trips";
import { getRoute } from "@/lib/routes";
import { climbIncluded, climbExcluded } from "@/lib/inclusions";
import { site } from "@/lib/site";
import { photo } from "@/lib/photos";
import { money, longDate, metres, totalAscent } from "@/lib/format";
import {
  Section,
  SectionTitle,
  PageHero,
  Pill,
  Button,
  Eyebrow,
  Unverified,
  SeatBar,
  difficultyTone,
} from "@/components/primitives";
import { Terms, BookBar } from "@/components/blocks";
import { EnquiryForm } from "@/components/enquiry-form";

/**
 * One group departure, with its own page.
 *
 * This was the biggest hole in the site. A dated departure is the most
 * bookable thing the operator sells — a real date, a confirmed price, a seat
 * count that goes down — and it had the weakest path of anything here: an
 * anchored row on a list, and a button that threw the reader into a contact
 * form. A private climb got a full page, an altitude profile and a sticky
 * price bar. The dated version of that same climb got a table row.
 *
 * It also cost nothing in SEO terms and everything in trust: "Lemosho, 6
 * September 2026, 6 of 10 seats left, $2,272" is a far more specific thing to
 * rank for and to send someone than the route page it was collapsed into.
 *
 * The one thing this page must not do is add itself to the planner. The
 * basket holds one climb, keyed by route — adding this would silently discard
 * the date, the fixed price and the seat count, which are the only reasons
 * somebody is on this page rather than the route page.
 */

export function generateStaticParams() {
  return departures.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = departures.find((x) => x.id === id);
  const r = d && getRoute(d.routeSlug);
  if (!d || !r) return {};
  const left = d.capacity - d.booked;
  return {
    title: `${r.name} Route, ${longDate(d.start)} — group departure`,
    description: left
      ? `A fixed-date ${r.days}-day ${r.name} climb leaving ${longDate(d.start)}. ${money(d.price)} per person, ${left} of ${d.capacity} seats left. Deposit 30%, balance at 45 days.`
      : `The ${r.name} departure on ${longDate(d.start)} is full. Join the waitlist, or see the other dates.`,
    alternates: { canonical: `/departures/${d.id}` },
    openGraph: { images: [photo(r.photoKey)?.src ?? "/photos/hero-departures.jpg"] },
  };
}

export default async function DeparturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = departures.find((x) => x.id === id);
  if (!d) notFound();
  const r = getRoute(d.routeSlug);
  if (!r) notFound();

  const left = d.capacity - d.booked;
  const soldOut = left <= 0;
  const others = departures
    .filter((x) => x.id !== d.id && x.capacity - x.booked > 0)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3);

  const bookingHref = `/departures/${d.id}#book`;

  /* Only a departure with seats left is an offer. A full one advertises
     nothing — it takes waitlist names. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Trip",
    name: `${r.name} Route group departure, ${longDate(d.start)}`,
    description: r.summary,
    url: `${site.url}/departures/${d.id}`,
    provider: { "@type": "TravelAgency", name: site.name, url: site.url },
    itinerary: { "@type": "ItemList", numberOfItems: r.days },
    ...(soldOut
      ? {}
      : {
          offers: {
            "@type": "Offer",
            price: String(d.price),
            priceCurrency: "USD",
            availability: "https://schema.org/LimitedAvailability",
            validThrough: d.start,
            url: `${site.url}/departures/${d.id}`,
          },
        }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow={`Group departure · ${r.days} days · ${soldOut ? "sold out" : `${left} of ${d.capacity} seats left`}`}
        title={`${r.name} Route, ${longDate(d.start)}`}
        lead={`${r.strapline} Walking in on ${longDate(d.start)} and down on ${longDate(d.end)}, at a price we will honour.`}
        photoKey={r.photoKey}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Group departures", href: "/departures" },
          { label: longDate(d.start), href: `/departures/${d.id}` },
        ]}
      />

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          <div>
            <Eyebrow>This date, specifically</Eyebrow>
            <h2 className="mb-4 text-[33px] leading-[1.22]">
              {soldOut ? "This one is full" : `${left} ${left === 1 ? "seat" : "seats"} left on this climb`}
            </h2>
            <p className="prose-lead text-lg">{r.summary}</p>
            <p className="prose-lead mt-3.5">
              A group departure is the same mountain, the same crew and the same food as a private
              climb — you share the guide and the gate fees with up to {d.capacity - 1} others, which
              is why it costs less. Two nights at the {site.baseHotel.name} in {site.baseHotel.town}
              {site.baseHotel.orSimilar ? " or similar" : ""} are in the price, one before you walk in
              and one after.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="#book">{soldOut ? "Join the waitlist" : "Request this departure"}</Button>
              <Button href={`/kilimanjaro/${r.slug}`} variant="ghost">
                The full route, day by day
              </Button>
            </div>
          </div>

          <div className="rounded bg-paper p-7">
            <p className="label text-muted">Per person, all in</p>
            <p className="metric mb-1 mt-1.5 text-[34px] font-bold leading-none text-olive-deep">
              {money(d.price)}
            </p>
            <p className="mb-4 text-sm text-muted">
              Fixed for this date. A 30% deposit ({money(Math.round(d.price * 0.3))} a head) confirms
              your seat; the balance is due 45 days before you walk in.
            </p>
            <SeatBar capacity={d.capacity} booked={d.booked} />
            <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-[15px]">
              {[
                ["Walk in", longDate(d.start)],
                ["Down", longDate(d.end)],
                ["Days on the mountain", String(r.days)],
                ["Summit", `${r.summit}, ${metres(r.summitAltitude)}`],
                ["Total ascent", `about ${metres(totalAscent(r))}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="metric text-right font-semibold text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Difficulty</dt>
                <dd><Pill tone={difficultyTone(r.difficulty)}>{r.difficulty}</Pill></dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">Summit rate</dt>
                <dd className="text-right">
                  <span className="metric font-semibold text-ink">{r.successRate}%</span>
                  {!r.successVerified && (
                    <span className="mt-1 block"><Unverified>Own data to confirm</Unverified></span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionTitle eyebrow="Day by day" title={`The ${r.name} route, one day at a time`}
          lead={r.character} />
        <div className="mt-9">
          {r.itinerary.map((day) => (
            <div key={day.day} className="grid grid-cols-[52px_1fr] gap-5 border-b border-line py-5 last:border-b-0">
              <span className="flex size-[46px] items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                D{day.day}
              </span>
              <div>
                <p className="text-base font-semibold text-ink">
                  {day.from} → {day.to}
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  Sleep at {metres(day.altitude)}
                  {day.hours ? ` · ${day.hours}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center">
          <Button href={`/kilimanjaro/${r.slug}`} variant="ghost">
            Altitude profile and the full detail
          </Button>
        </p>
      </Section>

      <Section tone="cream">
        <SectionTitle eyebrow="The small print" title="What this price covers" />
        <div className="mt-9"><Terms included={climbIncluded} excluded={climbExcluded} /></div>
      </Section>

      <Section tone="sand" id="book">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>{soldOut ? "Waitlist" : "Request this departure"}</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">
              {soldOut ? "We will call you when a seat opens" : "Nothing is charged until we confirm"}
            </h2>
            <p className="prose-lead mt-3.5">
              {soldOut
                ? "The waitlist is real — we call it in order when somebody cancels, and cancellations on a date this far out are common. You are not committing to anything by joining it."
                : "We confirm in writing that the seat, the crew and the permits are actually there — usually within one working day. Only then do you get a deposit link. The price above is the one we will honour."}
            </p>
            <p className="prose-lead">
              Cancel more than 60 days out and the deposit moves to another date within a year.
              Inside 45 days the balance is non-refundable, which is what travel insurance is for.
            </p>
          </div>
          <EnquiryForm
            kind={`departure-${d.id}`}
            subject={`${soldOut ? "Waitlist" : "Group departure"}: ${r.name} Route, ${longDate(d.start)}`}
            booking={!soldOut}
            context={`${r.name} Route · ${longDate(d.start)} · ${money(d.price)} per person`}
            submitLabel={soldOut ? "Join the waitlist" : `Request this seat — ${money(Math.round(d.price * 0.3))} deposit`}
            hidden={{
              departureId: d.id,
              route: `${r.name} Route`,
              startDate: d.start,
              endDate: d.end,
              pricePerPerson: String(d.price),
              seatsLeft: String(Math.max(0, left)),
            }}
          />
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="cream">
          <SectionTitle eyebrow="Other dates" title="If this one does not fit" />
          <ul className="mt-9 space-y-3">
            {others.map((o) => {
              const or = getRoute(o.routeSlug);
              if (!or) return null;
              const oLeft = o.capacity - o.booked;
              return (
                <li key={o.id}>
                  <Link
                    href={`/departures/${o.id}` as never}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded border border-line bg-white p-[22px] transition-colors hover:border-olive"
                  >
                    <span>
                      <span className="block text-base font-bold text-ink">
                        {or.name} Route · {or.days} days
                      </span>
                      <span className="mt-0.5 block text-[13px] text-muted">
                        {longDate(o.start)} — {oLeft} of {o.capacity} seats left
                      </span>
                    </span>
                    <span className="metric text-lg font-bold text-olive-deep">{money(o.price)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-center">
            <Button href="/departures" variant="ghost">All {departures.length} departures</Button>
          </p>
        </Section>
      )}

      <BookBar
        name={`${r.name} Route · ${longDate(d.start)}${soldOut ? " · sold out" : ` · ${left} of ${d.capacity} seats left`}`}
        price={d.price}
        note="per person, all in"
        addId={`route-${r.slug}`}
        primary={{ label: soldOut ? "Join the waitlist" : "Request this seat", href: bookingHref }}
      />
    </>
  );
}
