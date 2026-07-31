import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { dayTrips } from "@/lib/trips";
import { dayTripIncluded, dayTripExcluded } from "@/lib/inclusions";
import { site } from "@/lib/site";
import { photo } from "@/lib/photos";
import { money, dayTripRates } from "@/lib/format";
import { Section, SectionTitle, PageHero, TripCard, Button, Eyebrow, Unverified } from "@/components/primitives";
import { Terms, BookBar } from "@/components/blocks";
import { EnquiryForm } from "@/components/enquiry-form";

/**
 * The day trip detail page.
 *
 * Day trips were the one product on the site with no page of their own. Every
 * climb, safari, combination and Zanzibar package had one; a day trip had a
 * card on a list and a link straight into a contact form. That is the wrong
 * order — it asked somebody to enquire about a thing they had not yet been
 * shown, and it left ten sellable products with no URL to rank, no structured
 * data and nothing to link to.
 *
 * The content here is only what the dataset actually holds: the summary, the
 * hours, where it leaves from, the operator's own rate ladder and the shared
 * day-trip inclusions. There is no invented itinerary and no invented
 * highlights list, because a day trip page that describes a day nobody has
 * described to us is worse than no page at all.
 */

export function generateStaticParams() {
  return dayTrips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = dayTrips.find((x) => x.slug === slug);
  if (!t) return {};
  const r = dayTripRates(t);
  return {
    title: `${t.name} — a day trip from ${t.from}`,
    description: r.onRequest
      ? `${t.summary} ${t.hours} from ${t.from}, priced to your group and your date.`
      : `${t.summary} ${t.hours} from ${t.from}, from ${money(r.best)} per person with the full rate ladder published.`,
    alternates: { canonical: `/day-trips/${t.slug}` },
    openGraph: { images: [(t.photoKey ? photo(t.photoKey)?.src : null) ?? "/photos/hero-daytrips.jpg"] },
  };
}

export default async function DayTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = dayTrips.find((x) => x.slug === slug);
  if (!t) notFound();

  const r = dayTripRates(t);
  const others = dayTrips.filter((o) => o.slug !== t.slug).slice(0, 3);

  /* Only a trip with a published rate can carry a price in structured data.
     The two without one advertise no offer rather than a made-up figure. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: t.name,
    description: t.summary,
    url: `${site.url}/day-trips/${t.slug}`,
    ...(r.onRequest
      ? {}
      : {
          isAccessibleForFree: false,
          publicAccess: true,
        }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow={`Day trip · ${t.hours} · departs ${t.from}`}
        title={t.name}
        lead={t.summary}
        photoKey={t.photoKey}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Day trips", href: "/day-trips" },
          { label: t.name, href: `/day-trips/${t.slug}` },
        ]}
      />

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          <div>
            <Eyebrow>{t.hours} · departs {t.from}</Eyebrow>
            <h2 className="mb-4 text-[33px] leading-[1.22]">One day, and back the same evening</h2>
            <p className="prose-lead text-lg">{t.summary}</p>
            <p className="prose-lead mt-3.5">
              It runs on any date you like — there is no fixed departure to wait for. Pickup is from
              your hotel in {t.from} and you are back that evening, which is what makes these work
              either side of a climb or a safari.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="#enquire">
                {r.onRequest ? "Ask for a price" : "Book this day"}
              </Button>
              <Button href="/day-trips" variant="ghost">All {dayTrips.length} day trips</Button>
            </div>
          </div>

          {/* The price, or the honest absence of one. */}
          <div className="rounded bg-paper p-7">
            <p className="label text-muted">Price</p>
            {r.onRequest ? (
              <>
                <p className="mb-2.5 mt-1.5 text-2xl font-bold leading-tight text-ink">
                  Quoted to your group
                </p>
                <p className="mb-4"><Unverified>No rate card published</Unverified></p>
                <p className="text-sm leading-[1.7] text-muted">
                  The operator publishes no rate table for this one, so we price it to your group
                  size and your date rather than guess at it. A number invented here would be one
                  you could hold us to.
                </p>
              </>
            ) : r.single ? (
              <>
                <p className="metric mb-1 mt-1.5 text-[34px] font-bold leading-none text-olive-deep">
                  {money(r.single)}
                </p>
                <p className="mb-4 text-sm text-muted">per person, any party size</p>
                {!t.priceVerified && <p className="mb-4"><Unverified>Rate sheet to confirm</Unverified></p>}
                <p className="text-sm leading-[1.7] text-muted">
                  One rate whatever the size of the group — this is the only day trip on the site
                  that does not get cheaper as more of you come.
                </p>
              </>
            ) : (
              <>
                <p className="metric mb-1 mt-1.5 text-[34px] font-bold leading-none text-olive-deep">
                  {money(r.best)}
                </p>
                <p className="mb-4 text-sm text-muted">
                  per person at the best tier · {money(r.solo)} on your own
                </p>
                {!t.priceVerified && <p className="mb-4"><Unverified>Rate sheet to confirm</Unverified></p>}
                <p className="text-sm leading-[1.7] text-muted">
                  The whole ladder is below. Party size is what moves this price, so it is worth
                  knowing before you ask.
                </p>
              </>
            )}
          </div>
        </div>
      </Section>

      {!r.onRequest && r.tiers.length > 1 && (
        <Section tone="sand">
          <SectionTitle
            eyebrow="The rate ladder"
            title="What it costs, at every group size"
            lead="Published in full rather than as a single “from” figure. One person pays one price and six people pay another, and both are on this page before you ask us anything."
          />
          {/* One row on desktop whatever the ladder's length — these run to
              three, four or five tiers, and a fixed four-column grid left the
              fifth stranded on a row of its own. */}
          <div
            className="mt-9 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:[grid-template-columns:repeat(var(--tiers),minmax(0,1fr))]"
            style={{ "--tiers": r.tiers.length } as React.CSSProperties}
          >
            {r.tiers.map((tier) => {
              const best = tier.price === r.best;
              return (
                <div
                  key={tier.size}
                  className={`rounded border px-5 py-6 text-center ${
                    best ? "border-olive bg-white" : "border-line bg-white"
                  }`}
                >
                  <p className="label text-muted">{tier.size}</p>
                  <p className="metric mt-2 text-[27px] font-bold text-olive-deep">{money(tier.price)}</p>
                  <p className="mt-1 text-xs text-muted">per person</p>
                  {best && <p className="label mt-2 text-olive-deep">Best rate</p>}
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-center text-[13px] text-muted">
            Per person, in US dollars.{" "}
            {t.priceVerified ? (
              "Taken from the operator's own published rate card."
            ) : (
              <>
                <Unverified>Rate sheet to confirm</Unverified> This ladder is an estimate until the
                Moshi office supplies its own.
              </>
            )}
          </p>
        </Section>
      )}

      <Section tone={!r.onRequest && r.tiers.length > 1 ? "cream" : "sand"}>
        <SectionTitle eyebrow="The small print" title="What the day covers" />
        <div className="mt-9"><Terms included={dayTripIncluded} excluded={dayTripExcluded} /></div>
      </Section>

      <Section tone={!r.onRequest && r.tiers.length > 1 ? "sand" : "cream"} id="enquire">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>{r.onRequest ? "Ask us" : "Book it"}</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">
              {r.onRequest ? "Tell us your date and your group" : "Pick a date and we confirm it"}
            </h2>
            <p className="prose-lead mt-3.5">
              {r.onRequest
                ? "Which day, how many of you and where we are picking up from — those three answers set the price. We come back within a working day."
                : `The rate above is the published one and we hold it. Tell us the date and how many of you there are, and we confirm the vehicle and the guide in writing before anything is charged.`}
            </p>
            <p className="prose-lead">
              Doing this either side of a climb or a safari?{" "}
              <Link href="/plan" className="text-olive-deep underline-offset-2 hover:underline">
                Build the whole trip in the planner
              </Link>{" "}
              and it prices as one.
            </p>
          </div>
          <EnquiryForm
            kind={`daytrip-${t.slug}`}
            subject={`${r.onRequest ? "Price request" : "Day trip"}: ${t.name}`}
            quoteKind="daytrip"
            quoteLabel={`${t.name} — ${t.hours} from ${t.from}`}
            hidden={{
              dayTrip: t.name,
              departsFrom: t.from,
              duration: t.hours,
              publishedRate: r.onRequest ? "none published" : String(r.best),
            }}
          />
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone={!r.onRequest && r.tiers.length > 1 ? "cream" : "sand"}>
          <SectionTitle eyebrow="Other days out" title="More from the same base" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => {
              const or = dayTripRates(o);
              return (
                <TripCard
                  key={o.slug}
                  href={`/day-trips/${o.slug}`}
                  photoKey={o.photoKey}
                  title={o.name}
                  excerpt={o.summary}
                  tag={o.hours}
                  meta={[`Departs ${o.from}`]}
                  price={or.onRequest ? null : or.best}
                  priceNote="From"
                  priceVerified={o.priceVerified}
                  cta="See the day"
                />
              );
            })}
          </div>
        </Section>
      )}

      {/* Only a trip with a published rate gets a book bar — the bar's whole
          job is to carry a price, and two of these have none. */}
      {!r.onRequest && r.best != null && (
        <BookBar
          name={`${t.name} — ${t.hours} from ${t.from}`}
          price={r.best}
          note="per person, best group rate"
          verified={t.priceVerified}
          addId={`day-${t.slug}`}
        />
      )}
    </>
  );
}
