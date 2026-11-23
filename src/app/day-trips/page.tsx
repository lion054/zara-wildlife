import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { PageIntro, tourItems } from "@/components/listing";
import { PhotoHero, Section } from "@/components/primitives";
import { Collapse, FilterGrid } from "@/components/ui";
import { content } from "@/lib/content";
import { toursOfKind } from "@/lib/tours";
import { withSeo } from "@/lib/seo";
import { photo } from "@/lib/photos";

export const metadata: Metadata = withSeo("/day-trips", {
  title: "Day trips from Moshi and Arusha",
  description: "Waterfalls, hot springs, coffee farms, national parks and a Maasai boma: bookable on their own or added to any climb or safari.",
}, photo("hero-daytrips"));

export default function DayTripsPage() {
  return (
    <>
      <PhotoHero imageKey="hero-daytrips" height="min-h-[16rem] md:min-h-[21rem]">
        <PageIntro eyebrow="Day trips" title="The day before. The day after.">
          Priced per person on a sliding scale: the more of you, the less each pays.
        </PageIntro>
      </PhotoHero>
      <Section>
        <FilterGrid heading="Day trips" items={tourItems(toursOfKind("daytrip"))} filters={[]} initial={6} />
      </Section>
      <Section tone="frost">
        <div className="mx-auto max-w-4xl">
          <Collapse title="Day trip questions" meta="What is offered and how it works">
            <Faq flush items={content.faqs.daytrips} />
          </Collapse>
        </div>
      </Section>
    </>
  );
}
