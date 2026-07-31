import type { Metadata } from "next";
import { routes, kilimanjaroRoutes, zones } from "@/lib/routes";
import { departures } from "@/lib/trips";
import { reviews } from "@/lib/reviews";
import { kilimanjaroFaqs } from "@/lib/faqs";
import { money, routeBadges } from "@/lib/format";
import { Section, SectionTitle, PageHero, TripCard, Button, Eyebrow } from "@/components/primitives";
import { RouteTable, ReviewBand, FaqList, faqJsonLd, DepartureRow } from "@/components/blocks";
import { RouteSpark } from "@/components/route-profile";

export const metadata: Metadata = {
  title: "Climbing Kilimanjaro — six routes compared",
  description:
    "All six Kilimanjaro and Meru routes side by side: days, difficulty, summit rate, traffic and price, each with its own altitude profile and full day-by-day itinerary.",
  alternates: { canonical: "/kilimanjaro" },
};

export default function KilimanjaroPage() {
  const meru = routes.filter((r) => r.mountain === "meru");
  const open = departures.filter((d) => d.capacity - d.booked > 0).slice(0, 2);
  const climbReviews = reviews.filter((r) => /climb|kilimanjaro|trek|route|summit/i.test(r.trip ?? "")).slice(0, 3);

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(kilimanjaroFaqs)) }} />

      <PageHero
        eyebrow="Climbing Kilimanjaro"
        title="Six routes up. Only one of them is right for you."
        lead="Which route you pick decides whether you summit — more than fitness, more than willpower. So every one is here with its altitude profile drawn, its real summit rate, and its price."
        photoKey="hero-kilimanjaro"
        crumbs={[{ label: "Home", href: "/" }, { label: "Climb", href: "/kilimanjaro" }]}
      />

      <Section tone="cream">
        <SectionTitle
          eyebrow="All six routes"
          title="Compare them on the things that decide it"
          lead="Days on the mountain, how the profile is shaped, how many other people are on it, and what it costs. This table is the reason this page exists — the live site sells all six and gives you no way to hold them up against each other."
        />
        <div className="mt-10"><RouteTable routes={routes} /></div>
        <p className="mt-4 max-w-[820px] text-[13px] leading-[1.7] text-muted">
          Summit rates carrying a marker are indicative industry figures for the route rather than
          this operator&rsquo;s own records, and prices carrying one are estimates for a route length
          the live site does not currently sell. Both are flagged everywhere they appear rather than
          quietly rounded off.
        </p>
      </Section>

      <Section tone="sand" id="zones">
        <SectionTitle
          eyebrow="What you walk through"
          title="Four climate zones, stacked"
          lead="You leave the gate in rainforest at about 1,800 m and top out on glacier at 5,895 m. It is the equivalent of walking from the equator to the arctic in under a week, and it is why the number of days matters more than how fit you are."
        />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(zones).map(([k, z]) => (
            <div key={k} className="border-l-4 pl-[18px]" style={{ borderColor: `var(--color-zone-${k})` }}>
              <h3 className="mb-1 text-[19px]">{z.label}</h3>
              <p className="metric mb-2 text-[13px] font-semibold text-olive-deep">{z.range}</p>
              <p className="text-[15px] leading-[1.7] text-muted">{z.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" id="kilimanjaropackages">
        <SectionTitle
          eyebrow="Kilimanjaro"
          title="Five routes up Uhuru Peak"
          lead="Each one carries its own altitude profile, its full day-by-day, and the operator's own party-size rate card."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kilimanjaroRoutes.map((r) => (
            <TripCard key={r.slug} href={`/kilimanjaro/${r.slug}`} photoKey={r.photoKey}
              title={`${r.name} Route`} excerpt={r.strapline} tag={`${r.days} days`}
              badges={routeBadges(r, routes)} price={r.price} priceVerified={r.priceVerified}
              cta="Day by day"
              meta={[`${r.successRate}% summit${r.successVerified ? "" : "*"}`, r.difficulty, r.traffic]}>
              <div className="my-2.5"><RouteSpark route={r} /></div>
            </TripCard>
          ))}
        </div>
      </Section>

      <Section tone="sand" id="meru">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Mount Meru</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">The best acclimatisation on the continent</h2>
            {meru.map((r) => (
              <div key={r.slug}>
                <p className="prose-lead mt-4">{r.summary}</p>
                <p className="prose-lead">{r.character}</p>
                <ul className="my-[18px] flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] text-muted">
                  {[`${r.days} days`, `${r.summitAltitude.toLocaleString()} m`, r.difficulty, `From ${money(r.price)}`].map((m) => (
                    <li key={m} className="flex items-center gap-1.5 before:block before:size-[5px] before:rounded-full before:bg-lime">{m}</li>
                  ))}
                </ul>
                <Button href={`/kilimanjaro/${r.slug}`}>See the Meru itinerary</Button>
              </div>
            ))}
          </div>
          <div>
            {meru.map((r) => (
              <div key={r.slug} className="rounded border border-line bg-white p-6">
                <RouteSpark route={r} width={520} height={150} />
                <p className="mt-3 text-[13px] text-muted">
                  Meru&rsquo;s profile, on the same altitude scale as Kilimanjaro. Climbed a week
                  before, it does most of the acclimatisation work for you.
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Or go on a fixed date</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">{departures.length} group departures, with real seats</h2>
            <p className="prose-lead mt-3.5">
              Below the private-climb price, and the way most solo climbers and pairs go up. Every
              date carries a price we will honour and a seat count that goes down as people book.
            </p>
            <div className="mt-6"><Button href="/departures">See the dates</Button></div>
          </div>
          <div>{open.map((d) => <DepartureRow key={d.id} {...d} />)}</div>
        </div>
      </Section>

      <Section tone="sand" id="faqs">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Before you book</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Climbing Kilimanjaro, answered</h2>
            <p className="prose-lead mt-3.5">
              Every answer here is grounded in something stated elsewhere on this site — the
              inclusions, the deposit terms, the zone table, the published rates. An FAQ that
              contradicts the product page is worse than no FAQ.
            </p>
            <div className="mt-6"><Button href="/contact" variant="ghost">Ask us something else</Button></div>
          </div>
          <FaqList items={kilimanjaroFaqs} />
        </div>
      </Section>

      <ReviewBand items={climbReviews} title="From people who got up it" />
    </>
  );
}
