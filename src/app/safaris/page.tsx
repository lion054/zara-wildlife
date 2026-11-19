import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { PageIntro, daysOf, tourItems } from "@/components/listing";
import { PhotoHero, Section } from "@/components/primitives";
import { Collapse, FilterGrid } from "@/components/ui";
import { content } from "@/lib/content";
import { circuits, parks, safariExperiences } from "@/lib/parks";
import { toursOfKind } from "@/lib/tours";

export const metadata: Metadata = {
  title: "Safaris",
  description: "Northern circuit safaris from Moshi and Arusha: Serengeti, Ngorongoro, Tarangire and Manyara, with day-by-day itineraries and prices.",
};

export default function SafarisPage() {
  const items = tourItems(toursOfKind("safari"), (t) => [daysOf(t) <= 5 ? "short" : daysOf(t) <= 7 ? "week" : "long"]);

  return (
    <>
      <PhotoHero imageKey="hero-safaris" height="min-h-[16rem] md:min-h-[21rem]">
        <PageIntro eyebrow="Safaris" title="The northern circuit, day by day." />
      </PhotoHero>

      <Section>
        <FilterGrid
          label="Filter safaris"
          items={items}
          initial={8}
          filters={[
            { label: "Up to 5 days", tag: "short" },
            { label: "6–7 days", tag: "week" },
            { label: "8+ days", tag: "long" },
          ]}
        />
      </Section>

      <Section tone="frost" id="parks">
        <div className="mx-auto max-w-4xl space-y-3">
          {(Object.keys(circuits) as (keyof typeof circuits)[]).map((key, i) => (
            <Collapse key={key} defaultOpen={i === 0} title={circuits[key].label} meta={circuits[key].access}>
              <p className="mb-5 text-sm text-scree">{circuits[key].note}</p>
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {parks.filter((p) => p.circuit === key).map((p) => (
                  <li key={p.name}>
                    <p className="font-display text-lg">{p.name}</p>
                    <p className="label text-tanzanite">{p.headline}</p>
                    <p className="mt-1 text-sm text-scree">{p.note}</p>
                    {p.when && <p className="metric mt-1 text-xs text-scree">Best: {p.when}</p>}
                  </li>
                ))}
              </ul>
            </Collapse>
          ))}

          <div id="experiences" className="scroll-mt-28">
            <Collapse title="Things to add" meta="Balloon flights, walking safaris, birding">
              <ul className="space-y-4">
                {safariExperiences.map((e) => (
                  <li key={e.name}>
                    <p className="font-display text-lg">{e.name} <span className="label ml-2 text-scree">{e.where}</span></p>
                    <p className="text-sm text-scree">{e.note}</p>
                  </li>
                ))}
              </ul>
            </Collapse>
          </div>

          <Collapse title="Safari questions" meta="Parks, seasons and how it works">
            <Faq flush items={content.faqs.destinations.map((q) => ({ q: q.q, a: q.a }))} />
            <p className="mt-5 text-sm text-scree">
              More in the <Link href="/faqs/safari" className="text-tanzanite underline underline-offset-4">safari FAQ</Link>.
            </p>
          </Collapse>
        </div>
      </Section>
    </>
  );
}
