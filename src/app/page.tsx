import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HeroSlider } from "@/components/hero-slider";
import { withSeo } from "@/lib/seo";
import { DepartureCard } from "@/components/departure-card";
import { Button, Section } from "@/components/primitives";
import { SectionTitle, TripCard } from "@/components/tsoka";
import { Tabs } from "@/components/ui";
import { photo } from "@/lib/photos";
import { reviews } from "@/lib/reviews";
import { upcomingGroupDepartures } from "@/lib/departures";
import { crewSize, site } from "@/lib/site";
import { displayTitle, excerpt, getTour, tourPath, toursOfKind, type Tour, type TourKind } from "@/lib/tours";

/**
 * Homepage, kept short: a hero, four doors, a tabbed shelf of trips, the next
 * group dates, three reasons to trust us, a few answers, one call to action.
 * Everything else lives one click away on its own page.
 */

const DOORS = [
  { label: "Climb Kilimanjaro", sub: "Meru and group dates", href: "/kilimanjaro", img: "hero-home", kinds: ["kili", "meru", "group"] },
  { label: "Safari", sub: "Serengeti and the north", href: "/safaris", img: "hero-safaris", kinds: ["safari"] },
  { label: "Zanzibar", sub: "Beach and Stone Town", href: "/zanzibar", img: "hero-zanzibar", kinds: ["zanzibar"] },
  { label: "Day trips", sub: "Waterfalls, parks, culture", href: "/day-trips", img: "hero-daytrips", kinds: ["daytrip"] },
] as const;

const SHELF: { id: string; label: string; all: string; keys: [TourKind, string][] }[] = [
  {
    id: "climb",
    label: "Climbs",
    all: "/kilimanjaro#packages",
    keys: [["kili", "machame-route-6"], ["kili", "lemosho-route-8"], ["kili", "marangu-route-6"]],
  },
  {
    id: "safari",
    label: "Safaris",
    all: "/safaris",
    keys: [["safari", "lion-safari-adventure"], ["safari", "northern-circuit-tanzania-safari"], ["safari", "serengeti-wildebeest-migration-experience"]],
  },
  {
    id: "combo",
    label: "Combos",
    all: "/combos",
    keys: [["combo", "climbing-kilimanjaro-and-safari-comb"], ["combo", "kilimanjaro-climb-and-serengeti-adventure"], ["combo", "ultimate-kilimanjaro-trek-tanzania-safari-adventure"]],
  },
  {
    id: "zanzibar",
    label: "Zanzibar",
    all: "/zanzibar",
    keys: [
      ["zanzibar", "zanzibar-stone-town-exploration-2-days"],
      ["zanzibar", "5-days-zanzibar-escape-snorkeling-adventures-at-mnemba-island"],
      ["zanzibar", "zanzibar-beach-tour-8-day-luxury-at-emerald-zanzibar-resort-spa"],
    ],
  },
];

function Card({ t }: { t: Tour }) {
  return (
    <TripCard
      href={tourPath(t)}
      image={t.hero ? { src: t.hero.src, alt: "" } : undefined}
      title={displayTitle(t)}
      excerpt={excerpt(t, 110)}
      meta={t.duration ? [{ k: "Duration", v: t.duration.replace(/\s*\|\s*/g, " · ") }] : []}
      price={t.from}
      cta="View tour"
    />
  );
}

/** Fisher-Yates: a new random order each time. */
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Served ready-made and refreshed every minute: the departures stay live and the banner order changes, without
   rebuilding the page for every visitor (which made it the slowest page to start loading). */
export const revalidate = 60;

export const metadata: Metadata = withSeo("/", {});

export default async function HomePage() {
  /* Live from Tanova: dates and seats left are never typed into this repo. */
  const nextDepartures = await upcomingGroupDepartures(3);

  const shelf = SHELF.map((g) => ({
    id: g.id,
    label: g.label,
    content: (
      <div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {g.keys
            .map(([k, key]) => getTour(k, key))
            .filter((t): t is Tour => !!t)
            .map((t) => (
              <Card key={t.key} t={t} />
            ))}
        </div>
        <div className="mt-8 text-center">
          <Button href={g.all} variant="outline">
            See all {g.label.toLowerCase()}
          </Button>
        </div>
      </div>
    ),
  }));

  return (
    <>
      <HeroSlider
        slides={shuffle([
          {
            key: "kili",
            imageKey: "hero-home",
            eyebrow: `Climb · Kilimanjaro, since ${site.established}`,
            title: "Kilimanjaro, on the route that fits you.",
            text: `Real prices and the summit-rate maths up front. A Moshi crew of ${crewSize}+ guides and ${site.reviews.count} five-star reviews behind every climb.`,
            ctas: [
              { label: "Plan my climb", href: "/plan" },
              { label: "Join a group climb", href: "/departures", variant: "light" },
            ],
          },
          {
            key: "safari",
            imageKey: "hero-safaris",
            eyebrow: "Safari · Northern circuit",
            title: "The Serengeti, when the herds are there.",
            text: "Private or shared 4x4s, built around where the animals actually are when you travel.",
            ctas: [
              { label: "See the safaris", href: "/safaris" },
              { label: "Combine with a climb", href: "/combos", variant: "light" },
            ],
          },
          {
            key: "zanzibar",
            imageKey: "hero-zanzibar",
            eyebrow: "Zanzibar · Beach and Stone Town",
            title: "Then the island, to stop moving.",
            text: "Two nights or a week, an hour's flight from Kilimanjaro, with halal arrangements on request.",
            ctas: [
              { label: "See Zanzibar", href: "/zanzibar" },
              { label: "Halal tours", href: "/halal-tours", variant: "light" },
            ],
          },
        ])}
      />

      {/* ---- Four doors, overlapping the hero ---- */}
      <section aria-label="What we offer" className="relative z-10 -mt-20 px-4 md:-mt-24 md:px-6">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {DOORS.map((d) => {
            const img = photo(d.img);
            const n = toursOfKind(...(d.kinds as unknown as TourKind[])).length;
            return (
              <li key={d.label}>
                <Link
                  href={d.href}
                  className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-basalt p-5 text-glacier shadow-[0_24px_50px_-24px_rgba(43,44,16,0.55)] md:aspect-[3/4]"
                >
                  {img && (
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-basalt/90 via-basalt/25 to-transparent" />
                  <span className="font-display text-xl leading-tight md:text-2xl">{d.label}</span>
                  <span className="mt-1 text-xs text-glacier/85">
                    {n} {n === 1 ? "trip" : "trips"} · {d.sub}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---- Popular trips, tabbed ---- */}
      <Section>
        <SectionTitle eyebrow="Popular trips" title="Pick a trip, see the price." lead="Every one has a day-by-day itinerary and a price for your group size." />
        <div className="mx-auto mt-10 max-w-6xl">
          <Tabs tabs={shelf} label="Popular trips" />
        </div>
      </Section>

      {/* ---- Next group dates ---- */}
      <Section tone="basalt" bgKey="hero-kilimanjaro">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow="Group climbs" title="Next dates. Keep a seat." align="left" tone="light" />
          <Button href="/departures" variant="light">
            Full calendar
          </Button>
        </div>
        {nextDepartures.length > 0 ? (
          <ol className="mt-10 grid gap-4 md:grid-cols-3" aria-label="Upcoming group departures">
            {nextDepartures.map((d) => (
              <li key={`${d.tourId}-${d.start}`}>
                <DepartureCard d={d} tone="dark" />
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-10 rounded-3xl border border-glacier/15 bg-basalt/55 p-8 text-center backdrop-blur-md">
            <p className="font-display text-2xl text-glacier">New group dates are being added.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-glacier/80">
              Join a route&rsquo;s list and we email you the moment a date opens.
            </p>
            <div className="mt-5 flex justify-center">
              <Button href="/departures">See group climbs</Button>
            </div>
          </div>
        )}
      </Section>

      {/* ---- Why us, with three reviews ---- */}
      <Section tone="frost">
        <SectionTitle
          eyebrow="Why Tanzania Wildlife Adventures"
          title={`${site.reviews.count} five-star reviews, and they keep naming the guide.`}
        />
        <ul className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
          {reviews.slice(0, 3).map((r) => (
            <li key={r.author}>
              <figure className="flex h-full flex-col rounded-3xl bg-glacier p-6 ring-1 ring-mist">
                <div className="text-sunrise-ink" role="img" aria-label="Five out of five stars">
                  ★★★★★
                </div>
                <h3 className="mt-2 font-display text-lg">{r.title}</h3>
                <blockquote className="mt-2 line-clamp-5 flex-1 text-sm leading-relaxed text-scree">&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 border-t border-mist pt-3 text-sm">
                  <span className="metric">{r.author}</span>
                  {r.guide && <span className="label ml-2 text-tanzanite">guided by {r.guide}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <ul className="mx-auto mt-10 grid max-w-4xl gap-6 text-center sm:grid-cols-3">
          {[
            ["Locally run", `A Moshi company since 2020, with a crew of ${crewSize}+.`],
            ["Tailored to you", "Every itinerary can be changed to fit your dates and pace."],
            ["Safety first", "Pulse oximeters, rescue cover and fair porter wages on every climb."],
          ].map(([t, d]) => (
            <li key={t}>
              <p className="font-display text-xl">{t}</p>
              <p className="mt-1 text-sm text-scree">{d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/about#whychooseus" variant="outline">
            Why choose us
          </Button>
          <Button href={site.reviews.url} variant="outline">
            Read reviews on TripAdvisor
          </Button>
        </div>
      </Section>

      {/* ---- One call to action ---- */}
      <Section tone="basalt" bgKey="hero-combos" id="contact-us">
        <div className="mx-auto max-w-3xl text-center">
          <p className="label text-brand">Tailor-made trips</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Ready to book your next African adventure?</h2>
          <p className="mt-5 text-lg leading-relaxed text-glacier/90">Tell us what you have in mind. The Moshi office replies within one working day.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/plan">Plan my trip</Button>
            <Button href={site.whatsappUrl} variant="light">
              WhatsApp us
            </Button>
            <Button href="/contact" variant="light">
              Send a message
            </Button>
          </div>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4" aria-label="Memberships">
            {site.members.map((m) => (
              <li key={m.name}>
                <Image src={m.logo} alt={m.full} width={m.w} height={m.h} sizes="120px" className="h-12 w-auto object-contain opacity-90" />
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
