import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { PageIntro, tourItems } from "@/components/listing";
import { PhotoHero, Section } from "@/components/primitives";
import { Collapse, FilterGrid } from "@/components/ui";
import { comboNotes } from "@/lib/combos";
import { content } from "@/lib/content";
import { toursOfKind } from "@/lib/tours";
import { withSeo } from "@/lib/seo";
import { photo } from "@/lib/photos";

export const metadata: Metadata = withSeo("/combos", {
  title: "Combo trips",
  description: "Kilimanjaro, the northern circuit and Zanzibar on one booking, with the mountain first.",
}, photo("hero-combos"));

export default function CombosPage() {
  return (
    <>
      <PhotoHero imageKey="hero-combos" height="min-h-[16rem] md:min-h-[21rem]">
        <PageIntro eyebrow="Combo trips" title="Climb it, then drive it, then lie down.">
          The mountain first, then the wildlife, then the beach, on one booking.
        </PageIntro>
      </PhotoHero>
      <Section>
        <FilterGrid heading="Combo trips" items={tourItems(toursOfKind("combo"))} filters={[]} initial={6} />
      </Section>
      <Section tone="frost" id="faq">
        <div className="mx-auto max-w-4xl">
          <Collapse title="Combo questions" meta="What is included and how it fits together" defaultOpen>
            <Faq flush items={[...content.faqs.combo, ...comboNotes.map((n) => ({ q: n.q, a: n.a }))]} />
          </Collapse>
        </div>
      </Section>
    </>
  );
}
