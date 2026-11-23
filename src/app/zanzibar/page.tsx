import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { PageIntro, daysOf, tourItems } from "@/components/listing";
import { PhotoHero, Section } from "@/components/primitives";
import { Collapse, FilterGrid } from "@/components/ui";
import { content } from "@/lib/content";
import { toursOfKind } from "@/lib/tours";
import { zanzibarAttractions, zanzibarSeasons } from "@/lib/zanzibar";
import { withSeo } from "@/lib/seo";
import { photo } from "@/lib/photos";

export const metadata: Metadata = withSeo("/zanzibar", {
  title: "Zanzibar",
  description: "Stone Town, the spice farms, Jozani Forest and the Mnemba reef: two nights to a week, on their own or after a climb.",
}, photo("hero-zanzibar"));

export default function ZanzibarPage() {
  const items = tourItems(toursOfKind("zanzibar"), (t) => [daysOf(t) <= 3 ? "short" : daysOf(t) <= 5 ? "mid" : "long"]);
  const sections = Array.from(new Set(content.faqs.zanzibar.map((q) => q.section)));

  return (
    <>
      <PhotoHero imageKey="hero-zanzibar" height="min-h-[16rem] md:min-h-[21rem]">
        <PageIntro eyebrow="Zanzibar" title="Where you go to stop moving.">
          An hour's flight from Kilimanjaro. Each package is priced to your dates.
        </PageIntro>
      </PhotoHero>

      <Section>
        <FilterGrid heading="Zanzibar trips"
          label="Filter packages"
          items={items}
          filters={[
            { label: "2–3 days", tag: "short" },
            { label: "4–5 days", tag: "mid" },
            { label: "6+ days", tag: "long" },
          ]}
        />
      </Section>

      <Section tone="frost">
        <div className="mx-auto max-w-4xl space-y-3">
          <Collapse title="What is actually there" meta="Stone Town, spice farms, Jozani, Mnemba">
            <ul className="grid gap-5 sm:grid-cols-2">
              {zanzibarAttractions.map((a) => (
                <li key={a.name}>
                  <p className="font-display text-lg">{a.name}</p>
                  <p className="mt-1 text-sm text-scree">{a.note}</p>
                </li>
              ))}
            </ul>
          </Collapse>
          <Collapse title="When to come" meta="Including the months we would talk you out of">
            <ul className="space-y-4">
              {zanzibarSeasons.map((s) => (
                <li key={s.label}>
                  <p className="font-display text-lg">{s.label} <span className="label ml-2 text-tanzanite">{s.kind}</span></p>
                  <p className="text-sm text-scree">{s.note}</p>
                </li>
              ))}
            </ul>
          </Collapse>
          {sections.map((sec) => (
            <Collapse key={sec} title={sec ?? "Zanzibar"} meta="Questions and answers">
              <Faq flush items={content.faqs.zanzibar.filter((q) => q.section === sec)} />
            </Collapse>
          ))}
        </div>
      </Section>
    </>
  );
}
