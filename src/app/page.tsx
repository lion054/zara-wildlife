import Link from "next/link";
import Image from "next/image";
import { site, crewSize } from "@/lib/site";
import { routes, getRoute } from "@/lib/routes";
import { safaris, departures, dayTrips } from "@/lib/trips";
import { parks } from "@/lib/parks";
import { combos } from "@/lib/combos";
import { zanzibarPackages } from "@/lib/zanzibar";
import { services } from "@/lib/services";
import { reviews } from "@/lib/reviews";
import { photo } from "@/lib/photos";
import { money, list, dayTripRates, routeBadges } from "@/lib/format";
import { Section, SectionTitle, TripCard, Tile, Button, Eyebrow, Unverified } from "@/components/primitives";
import { ReviewBand, DepartureRow } from "@/components/blocks";
import { RouteSpark } from "@/components/route-profile";
import { TripFinder } from "@/components/trip-finder";

/**
 * Homepage.
 *
 * The live homepage runs to 3.6 MB of Elementor markup and still leaves the
 * reader unable to answer three questions: what does it cost, when can I go,
 * and why you. So the order is deliberate — price is visible in the first screen
 * of trips, real departure dates appear before any prose, and the 53 five-star
 * reviews that currently sit at the very bottom of their page ride the top bar
 * of this one.
 */

const hero = photo("hero-home");

export default function HomePage() {
  const featured = ["lemosho-8-day", "machame-7-day", "marangu-6-day"]
    .map(getRoute)
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const nextUp = departures.filter((d) => d.capacity - d.booked > 0).slice(0, 3);
  const northParks = parks.filter((p) => p.circuit === "north").slice(0, 8);
  const ratedTrips = dayTrips.filter((t) => t.tiers.length > 1).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="relative flex min-h-[560px] items-center justify-center">
        {hero && <Image src={hero.src} alt="" fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-ink/35" />
        {/* 104px of that top padding is the fixed header, which this photograph
            now runs under. */}
        <div className="relative z-10 mx-auto max-w-[1170px] px-5 pb-24 pt-[152px] text-center">
          <Eyebrow tone="light">Moshi, Tanzania · since {site.established}</Eyebrow>
          <h1 className="text-[30px] leading-[1.15] text-white drop-shadow-[0_2px_18px_rgba(32,32,28,0.75)] md:text-[44px]">
            Kilimanjaro, the northern circuit,
            <br />
            and Zanzibar.
          </h1>
          <p className="mx-auto mt-4 max-w-[640px] text-lg leading-[1.65] text-white/90 drop-shadow-[0_2px_18px_rgba(32,32,28,0.75)]">
            {site.tagline}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/kilimanjaro">Compare the six routes</Button>
            <Button href="/departures" variant="light">See real departure dates</Button>
          </div>
        </div>
      </div>

      <TripFinder />

      {/* What we run */}
      <Section tone="cream">
        <SectionTitle
          eyebrow="What we run"
          title="Five things, done properly"
          lead={`A tour operator that does everything usually does nothing especially well. These are what our crew of ${crewSize}+ guides actually knows, and each carries a real starting price.`}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <TripCard
              key={s.slug}
              href={s.href}
              photoKey={s.imageKey}
              title={s.title}
              excerpt={s.excerpt}
              tag={s.count}
              meta={s.meta.map((m) => `${m.k}: ${m.v}`)}
              price={s.from}
              cta={`See all ${s.count.split(" ")[0]}`}
            />
          ))}
          <div className="flex flex-col justify-center rounded bg-ink px-[30px] py-[34px]">
            <h3 className="mb-3.5 text-2xl text-white">Not sure which?</h3>
            <p className="mb-[22px] leading-[1.75] text-white/75">
              Build a trip out of any of it — a climb, a safari, day trips, the beach — and see the
              total and the 30% deposit before you speak to anyone.
            </p>
            <Button href="/plan" className="self-start">Plan my trip</Button>
          </div>
        </div>
      </Section>

      {/* Kilimanjaro */}
      <Section tone="sand" id="kilimanjaro">
        <SectionTitle
          eyebrow="Climbing Kilimanjaro"
          title="The route decides whether you summit"
          lead="Not fitness, and not willpower. How many days you spend acclimatising and whether the route climbs high and sleeps low is what separates a 70% success rate from a 95% one — so we publish the shape of every climb, not just its name."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => (
            <TripCard
              key={r.slug}
              href={`/kilimanjaro/${r.slug}`}
              photoKey={r.photoKey}
              title={`${r.name} Route`}
              excerpt={r.strapline}
              badges={routeBadges(r, routes)}
              meta={[`${r.days} days`, `${r.successRate}% summit${r.successVerified ? "" : "*"}`, r.traffic]}
              price={r.price}
              priceVerified={r.priceVerified}
              cta="See the day by day"
            >
              <div className="my-2.5"><RouteSpark route={r} /></div>
            </TripCard>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">
          * Summit rates marked with an asterisk are indicative industry figures for the route, not
          this operator&rsquo;s own records. They are flagged everywhere they appear until the Moshi
          office supplies three seasons of its own data.
        </p>
        <p className="mt-8 text-center">
          <Button href="/kilimanjaro" variant="ghost">Compare all six routes side by side</Button>
        </p>
      </Section>

      {/* Departures */}
      <Section tone="cream" id="departures">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <Eyebrow>Fixed dates, real seats</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Join a group departure</h2>
            <p className="prose-lead mt-3.5">
              Below the private-climb price, and the way most solo climbers and pairs go up. Every
              date here carries a price we will honour and a seat count that goes down.
            </p>
          </div>
          <Button href="/departures" variant="ghost">All {departures.length} departures</Button>
        </div>
        {nextUp.map((d) => <DepartureRow key={d.id} {...d} />)}
      </Section>

      {/* Safaris */}
      <Section tone="sand" id="safaris">
        <SectionTitle
          eyebrow="Northern circuit safari"
          title="Serengeti, Ngorongoro, Tarangire, Manyara"
          lead="Three itineraries, all of them drivable from Arusha, all of them in custom 4x4s with an open roof. Where you sleep decides what you see, which is why ours move camp rather than sit still."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safaris.map((s) => (
            <TripCard key={s.slug} href={`/safaris/${s.slug}`} photoKey={s.photoKey}
              title={s.name} excerpt={s.summary} price={s.price} cta="See the itinerary"
              meta={[`${s.days} days / ${s.nights} nights`, s.style, `${s.parks.length} parks`]} />
          ))}
        </div>
        <p className="mt-10 text-center"><Button href="/safaris" variant="ghost">All safaris and experiences</Button></p>
      </Section>

      {/* Destinations */}
      <Section tone="cream" id="destinations">
        <SectionTitle
          eyebrow="Where you actually go"
          title="Ten parks, three circuits"
          lead="The northern circuit is where a first Tanzanian safari should go, and it is what every package on this site is built from. The southern and western parks are quieter, wilder and flown into."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {northParks.map((p) => (
            <Tile key={p.name} href="/destinations" photoKey={p.photoKey}
              name={p.name.replace(" National Park", "")} note={p.headline} />
          ))}
        </div>
        <p className="mt-10 text-center">
          <Button href="/destinations" variant="ghost">All ten parks, and when to visit each</Button>
        </p>
      </Section>

      {/* Combos */}
      <Section tone="sand" id="combos">
        <SectionTitle
          eyebrow="Climb & Safari"
          title="The mountain, the parks and the beach"
          lead="The climb first while you are fresh, then the parks while your legs recover, then the coast. It is the most-booked shape of trip we run and the one that makes the most sense."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {combos.slice(0, 3).map((c) => (
            <TripCard key={c.slug} href={`/combos/${c.slug}`} photoKey={c.photoKey}
              title={c.name} excerpt={c.summary} price={c.price} cta="See how it fits together"
              meta={[`${c.days} days / ${c.nights} nights`, list(c.legs)]} />
          ))}
        </div>
        <p className="mt-10 text-center">
          <Button href="/combos" variant="ghost">All {combos.length} combinations</Button>
        </p>
      </Section>

      {/* Day trips */}
      <Section tone="cream">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <Eyebrow>Day trips from Moshi</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Add a day, or fill one</h2>
            <p className="prose-lead mt-3">
              Waterfalls, hot springs, coffee farms and the lower slopes — all within a few hours of
              town, and all priced by group size rather than dangled as an enquiry.
            </p>
          </div>
          <Button href="/day-trips" variant="ghost">All {dayTrips.length} day trips</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ratedTrips.map((t) => {
            const r = dayTripRates(t);
            return (
              <TripCard key={t.slug} href="/day-trips" photoKey={t.photoKey} title={t.name}
                excerpt={t.summary} price={r.best} priceNote="Best tier" priceVerified={t.priceVerified}
                cta="See the price ladder"
                meta={[t.hours, `Departs ${t.from}`, `Solo ${money(r.solo)}`]} />
            );
          })}
        </div>
      </Section>

      {/* Zanzibar */}
      <Section tone="sand" id="zanzibar">
        <SectionTitle
          eyebrow="Zanzibar"
          title="Two nights, or a week"
          lead="Stone Town, the spice farms, Jozani forest and the east-coast beaches. Most people come here straight off the mountain or the parks, and forty minutes in the air is all it takes."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {zanzibarPackages.slice(0, 3).map((z) => (
            <TripCard key={z.slug} href={`/zanzibar/${z.slug}`} photoKey={z.photoKey} tag={`${z.days} days`}
              title={z.name} excerpt={z.summary} cta="See what is included"
              meta={[`${z.nights} nights`, `Based at ${z.base}`]} />
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-[760px] text-center text-[13px] leading-[1.75] text-muted">
          Zanzibar is quoted rather than listed — the price moves with the hotel standard you pick and
          the season. We would rather say that than publish a number we would then have to walk back.
        </p>
        <p className="mt-6 text-center">
          <Button href="/zanzibar" variant="ghost">All {zanzibarPackages.length} packages, and when to come</Button>
        </p>
      </Section>

      {/* Why us */}
      <Section tone="ink" id="why">
        <div className="grid items-start gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow tone="light">Why us</Eyebrow>
            <h2 className="text-[33px] leading-[1.22] text-white">We live at the bottom of it</h2>
            <p className="mt-4 leading-[1.8] text-white/70">
              The office is in Moshi, an hour from the Marangu gate. The crew are people we have
              worked with for years and whom guests name in their own reviews — so they are on this
              site, by name, and you can ask for one of them.
            </p>
            <div className="mt-6"><Button href="/about">How we run trips</Button></div>
          </div>

          <div className="grid grid-cols-2 border-t border-white/15 lg:grid-cols-4">
            {[
              { n: `${crewSize}+`, l: "Guides, cooks and crew — salaried, and hired in Moshi" },
              { n: String(site.reviews.count), l: `Five-star reviews on ${site.reviews.platform}, none solicited` },
              { n: String(new Date().getFullYear() - site.established), l: "Years operating from the foot of the mountain" },
              { n: String(parks.length), l: "National parks across three circuits" },
            ].map((s) => (
              <div key={s.l} className="border-r border-white/15 py-[22px] pr-[22px] last:border-r-0 lg:[&+&]:pl-[22px]">
                <p className="metric text-[30px] font-bold leading-none text-white">{s.n}</p>
                <p className="mt-2 text-[13px] leading-[1.55] text-white/55">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-[30px] border-t border-white/15 pt-[34px] sm:grid-cols-2 lg:grid-cols-4">
          {[
            { h: "Porters paid above the KPAP floor", p: "Monthly, not per climb — and paid whether or not the climb reaches the summit." },
            { h: "Loads weighed at the gate", p: "Nobody carries above the park limit, and the scale is there for you to see." },
            { h: "Oximeter checks twice a day", p: "From the second camp up, written down, and your guide has the final say on going higher." },
            { h: "Oxygen and a written evacuation plan", p: "On every climb, for every camp on the route you have picked." },
          ].map((c) => (
            <div key={c.h}>
              <h3 className="relative mb-2 pl-4 text-base leading-[1.4] text-white before:absolute before:left-0 before:top-2 before:block before:size-1.5 before:bg-lime">
                {c.h}
              </h3>
              <p className="pl-4 text-sm leading-[1.7] text-white/60">{c.p}</p>
            </div>
          ))}
        </div>
      </Section>

      <ReviewBand
        items={reviews.slice(0, 3)}
        title="They name the guides"
        lead="Every review below is on Tripadvisor under the guest's own name. Several credit a guide by name — so those guides are on this site, and you can ask for them."
      />

      {/* Closing CTA */}
      <Section tone="ink" className="text-center">
        <Eyebrow tone="light">Tailor-made, from Moshi</Eyebrow>
        <h2 className="mx-auto max-w-[760px] text-[33px] leading-[1.22] text-white md:text-[40px]">
          Tell us roughly what you want and we will cost it properly
        </h2>
        <p className="mx-auto mt-4 max-w-[620px] text-lg text-white/80">
          Or build it yourself first — pick a climb, a safari and the day trips you want, and see the
          total and the 30% deposit before you talk to anyone.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/plan">Build and price my trip</Button>
          <Button href="/contact" variant="light">Talk to the Moshi office</Button>
        </div>
      </Section>
    </>
  );
}
