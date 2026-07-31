import type { Metadata } from "next";
import { safaris } from "@/lib/trips";
import { parks, circuits, safariExperiences } from "@/lib/parks";
import { reviews } from "@/lib/reviews";
import { safariFaqs } from "@/lib/faqs";
import { list } from "@/lib/format";
import { Section, SectionTitle, PageHero, TripCard, Tile, Pill, Button, Eyebrow } from "@/components/primitives";
import { ReviewBand, FaqList, faqJsonLd } from "@/components/blocks";

export const metadata: Metadata = {
  title: "Tanzania safaris — Serengeti, Ngorongoro, Tarangire, Manyara",
  description:
    "Three fully costed northern-circuit safari itineraries from $1,800, ten national parks across three circuits, and the experiences you can add to any of them.",
  alternates: { canonical: "/safaris" },
};

export default function SafarisPage() {
  const rel = reviews.filter((r) => /safari|circuit|migration/i.test(r.trip ?? "")).slice(0, 3);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(safariFaqs)) }} />
      <PageHero eyebrow="Safaris" title="The Serengeti and the crater, from $1,800"
        lead="Three itineraries, every one of them fully costed on this page. Open-roofed 4x4, a window seat each, and the same guide from the first park to the last."
        photoKey="hero-safaris"
        crumbs={[{ label: "Home", href: "/" }, { label: "Safari", href: "/safaris" }]} />

      <Section tone="cream" id="safaris">
        <SectionTitle eyebrow="Northern circuit" title="Three itineraries, all fully costed"
          lead="Custom-built 4x4s with an open roof, a guide who knows the parks rather than the road to them, and camps that move with you rather than a base you drive out from every morning." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safaris.map((s) => (
            <TripCard key={s.slug} href={`/safaris/${s.slug}`} photoKey={s.photoKey} title={s.name}
              excerpt={s.summary} price={s.price} cta="See the day by day"
              meta={[`${s.days} days / ${s.nights} nights`, s.style, list(s.parks)]} />
          ))}
        </div>
      </Section>

      <Section tone="sand" id="parks">
        <SectionTitle eyebrow="Where you go" title="Ten parks across three circuits"
          lead="Everything the northern circuit holds is drivable from Arusha. The southern and western parks are flown into, quieter, and worth it once you have done the north." />
        {Object.entries(circuits).map(([key, c]) => {
          const inCircuit = parks.filter((p) => p.circuit === key);
          if (!inCircuit.length) return null;
          return (
            <div key={key} className="mt-12">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="mb-1.5 text-[26px]">{c.label}</h3>
                  <p className="text-base text-muted">{c.note}</p>
                </div>
                <Pill>{c.access}</Pill>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {inCircuit.map((p) => (
                  <Tile key={p.name} photoKey={p.photoKey} name={p.name.replace(" National Park", "")} note={p.headline} />
                ))}
              </div>
            </div>
          );
        })}
        <p className="mt-12 text-center"><Button href="/destinations" variant="ghost">Read about each park and when to visit</Button></p>
      </Section>

      <Section tone="cream" id="experiences">
        <SectionTitle eyebrow="Experiences" title="Things you can add to any safari"
          lead="Booked with the itinerary rather than sold at the gate, because most of these need a permit or a dawn start." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safariExperiences.map((e) => (
            <div key={e.name} className="rounded border border-line bg-white p-[26px]">
              <h3 className="mb-1.5 text-xl">{e.name}</h3>
              <p className="mb-2.5 text-[13px] font-semibold text-olive-deep">{e.where}</p>
              <p className="text-[15px] leading-[1.75] text-muted">{e.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sand" id="faqs">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Before you book</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Tanzania safaris, answered</h2>
            <p className="prose-lead mt-3.5">
              The questions the Moshi office actually gets, answered from the same data the
              itineraries are priced from.
            </p>
            <div className="mt-6"><Button href="/contact" variant="ghost">Ask us something else</Button></div>
          </div>
          <FaqList items={safariFaqs} />
        </div>
      </Section>

      <ReviewBand items={rel} title="From people who went" />
    </>
  );
}
