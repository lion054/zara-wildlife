import type { Metadata } from "next";
import { combos, comboNotes } from "@/lib/combos";
import { money, list } from "@/lib/format";
import { Section, SectionTitle, PageHero, TripCard, Button, Eyebrow } from "@/components/primitives";
import { FaqList, faqJsonLd } from "@/components/blocks";

const lowest = Math.min(...combos.filter((c) => c.price != null).map((c) => c.price as number));

export const metadata: Metadata = {
  title: "Tanzania combo tours — Kilimanjaro, safari and Zanzibar",
  description: `${combos.length} combination trips pairing a Kilimanjaro climb with the northern circuit and Zanzibar, from ${money(lowest)} per person.`,
  alternates: { canonical: "/combos" },
};

export default function CombosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(comboNotes)) }} />
      <PageHero eyebrow="Climb & Safari" title="The mountain, the migration and the ocean — one booking"
        lead="Two to three weeks, one deposit, and one operator answerable for all of it. Climb first while you are fresh, then the parks while your legs recover, then the coast."
        photoKey="hero-combos"
        crumbs={[{ label: "Home", href: "/" }, { label: "Climb & Safari", href: "/combos" }]} />

      <Section tone="cream" id="tanzaniacombopackages">
        <SectionTitle eyebrow={`${combos.length} combinations`} title="The mountain, the parks, the beach"
          lead="Do the climb first while you are fresh, then the parks while your legs recover, then Zanzibar. Every one of these is a single booking, one deposit, one crew handing you to the next." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {combos.map((c) => (
            <TripCard key={c.slug} href={`/combos/${c.slug}`} photoKey={c.photoKey} title={c.name}
              excerpt={c.summary} price={c.price} cta="See how it fits together"
              meta={[`${c.days} days / ${c.nights} nights`, list(c.legs)]} />
          ))}
        </div>
      </Section>

      <Section tone="sand" id="faq">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 id="faqs" className="text-[33px] leading-[1.22]">How a combo actually works</h2>
            <p className="prose-lead mt-3.5">
              The climb is fixed by the route you pick. Everything after it is decided with you before
              you pay a deposit — the safari focus, the hotel standard, whether the beach half is four
              nights or a week.
            </p>
            <div className="mt-6"><Button href="/plan">Build one and price it</Button></div>
          </div>
          <FaqList items={comboNotes} />
        </div>
      </Section>
    </>
  );
}
