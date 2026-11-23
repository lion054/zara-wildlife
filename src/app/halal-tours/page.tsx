import type { Metadata } from "next";
import Link from "next/link";
import { IslamicCalendar } from "@/components/islamic-calendar";
import { EnquiryForm } from "@/components/enquiry-form";
import { Button, Eyebrow, PhotoHero, Section, Unverified } from "@/components/primitives";
import { PageIntro, tourItems } from "@/components/listing";
import { SectionTitle } from "@/components/tsoka";
import { Collapse, FilterGrid } from "@/components/ui";
import { islamicEvents } from "@/lib/islamic-calendar";
import { getTour, type Tour } from "@/lib/tours";
import { withSeo } from "@/lib/seo";
import { photo } from "@/lib/photos";

export const metadata: Metadata = withSeo("/halal-tours", {
  title: "Halal tours",
  description:
    "Muslim-friendly safaris, Kilimanjaro climbs and Zanzibar holidays from Moshi, with a calendar of Islamic dates to plan around: Ramadan, Eid and more.",
}, photo("hero-zanzibar"));

/* What a Muslim traveller actually has to ask about. Each is something to
   arrange per booking, so none of it claims a certification the operator has
   not confirmed. */
const arrangements = [
  {
    title: "Halal food",
    body: "Tell us when you book and meals on safari, at camp and on the mountain are planned around it, including packed lunches on long drive days.",
  },
  {
    title: "Prayer on the road",
    body: "Drive times are planned around the five prayers where we can, with a stop for each. Your guide carries a prayer direction and knows the mosques on the route.",
  },
  {
    title: "Friday prayer",
    body: "Jumu’ah is built into the itinerary, so you are not stuck in the middle of the park at midday on a Friday.",
  },
  {
    title: "Ramadan travel",
    body: "Early starts, a suhoor and iftar at camp, and shorter days. See the calendar below for when Ramadan falls and what it does to the season.",
  },
  {
    title: "Family and modesty",
    body: "Private vehicles for families, and private rooms where the property allows. Tell us what you need and we will say plainly what we can and cannot do.",
  },
  {
    title: "Zanzibar",
    body: "Stone Town is a Muslim city with centuries-old mosques and a call to prayer you can hear from the rooftop. We can choose stays that suit you.",
  },
];

export default function HalalToursPage() {
  const next = islamicEvents[0];
  return (
    <>
      <PhotoHero imageKey="hero-zanzibar" height="min-h-[18rem] md:min-h-[24rem]">
        <PageIntro eyebrow="Halal tours" title="Safari, summit and sea, planned around your prayers.">
          Halal food, prayer stops and the Islamic calendar built into your itinerary.
        </PageIntro>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="#calendar">See the calendar</Button>
          <Button href="/contact?interest=halal" variant="light">
            Ask about a halal trip
          </Button>
        </div>
      </PhotoHero>

      <Section>
        <SectionTitle eyebrow="What we arrange" title="Planned in, not added on." lead="Tell us at booking and it goes into your itinerary." />
        <ul className="mx-auto mt-10 grid max-w-5xl gap-3 md:grid-cols-2">
          {arrangements.map((a) => (
            <li key={a.title}>
              <Collapse title={a.title}>
                <p className="text-sm leading-relaxed text-scree">{a.body}</p>
              </Collapse>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center">
          <Unverified what="Halal certification and prayer-stop details" />
        </p>
      </Section>

      <Section tone="frost" id="calendar">
        <SectionTitle
          eyebrow="Islamic calendar"
          title="When to go, and what each date does to a trip."
          lead={`From ${new Date(next.start).toLocaleDateString("en-GB", { month: "long", year: "numeric" })} through Ramadan and Eid. Tap a marked day for the travel notes.`}
        />
        <div className="mt-14">
          <IslamicCalendar />
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-scree">
          Dates are calculated, so they are expected dates. The real ones
          follow the moon and can fall a day either side. Confirm before you
          book flights, and we will tell you if the announcement moves your
          Eid.
        </p>
      </Section>

      <Section>
        <SectionTitle eyebrow="Trips to plan around it" title="Where families usually go." lead="Every one can be arranged halal. Pick one, then pick your dates from the calendar." />
        <div className="mx-auto mt-10 max-w-6xl">
          <FilterGrid
            filters={[]}
            items={tourItems(
              [
                getTour("safari", "lion-safari-adventure"),
                getTour("safari", "serengeti-wildebeest-migration-experience"),
                getTour("zanzibar", "zanzibar-stone-town-exploration-2-days"),
              ].filter((t): t is Tour => !!t),
            )}
          />
        </div>
      </Section>

      <Section tone="basalt" bgKey="hero-zanzibar">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionTitle
              eyebrow="Tell us your dates"
              title="Planning around Ramadan or Eid?"
              lead="Say when you want to travel, who is coming and anything we should know. We reply with a route that fits, and with an honest view if the dates you picked are the busy ones."
              align="left"
              tone="light"
            />
            <p className="mt-6 text-sm text-glacier/80">
              Prefer to talk it through?{" "}
              <Link href="/contact" className="font-semibold text-brand underline underline-offset-4">
                See all the ways to reach us
              </Link>
              .
            </p>
          </div>
          <div className="rounded-[24px] bg-glacier p-6 text-scree md:p-8">
            <EnquiryForm
              kind="contact"
              hidden={{ interest: "halal" }}
              submitLabel="Ask about a halal trip"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
