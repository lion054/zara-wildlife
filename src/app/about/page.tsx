import type { Metadata } from "next";
import { site, guides, crewSize } from "@/lib/site";
import { reviews } from "@/lib/reviews";
import { climbIncluded, climbExcluded } from "@/lib/inclusions";
import { Section, SectionTitle, PageHero, Photo, Unverified, Button, Eyebrow } from "@/components/primitives";
import { ReviewBand, GuideCard, Terms } from "@/components/blocks";

export const metadata: Metadata = {
  title: "About us — a Moshi tour operator since 2020",
  description: `Tanzania Wildlife Adventures: ${crewSize}+ guides and crew operating out of Moshi since ${site.established}. Accreditations, named guides, porter welfare and safety protocol, published in full.`,
  alternates: { canonical: "/about" },
};

const COMMITMENTS = [
  { h: "Porter pay", p: "Above the KPAP wage floor, paid monthly rather than per climb, and paid whether or not the climb reaches the summit." },
  { h: "Loads weighed", p: "Every porter's load is weighed at the gate. Nobody carries above the park limit, and the scale is available for you to see." },
  { h: "Proper kit", p: "Boots, jacket and a sleeping bag rated for the camp they sleep in — issued by us, not bought by them out of a tip." },
  { h: "Oximeter twice daily", p: "Blood oxygen and pulse checked morning and evening from the second camp up, and the readings written down." },
  { h: "Oxygen and evacuation", p: "Bottled oxygen on every climb and a written evacuation plan for each camp on each route. Your guide has the final say on going higher." },
  { h: "Insurance required", p: "Cover for trekking to 5,895 m and helicopter evacuation is a condition of climbing with us. We check the policy before you walk in." },
];

export default function AboutPage() {
  const years = new Date().getFullYear() - site.established;
  return (
    <>
      <PageHero eyebrow="Why us" title="An operator, not an agency"
        lead={`Based in Moshi since ${site.established}, with our own crew, our own vehicles and ${site.reviews.count} five-star reviews from people who name their guide.`}
        photoKey="hero-about"
        crumbs={[{ label: "Home", href: "/" }, { label: "Why us", href: "/about" }]} />

      <Section tone="cream">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Moshi, Kilimanjaro Region</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">We live at the bottom of it</h2>
            <p className="prose-lead mt-4">
              The office is in Moshi town, an hour from the Marangu gate and in sight of the mountain
              on a clear morning. We have been running climbs and safaris from here since{" "}
              {site.established} — {years} years — with a crew of {crewSize}+ guides, cooks and
              porters who are hired locally and paid monthly rather than assembled per climb.
            </p>
            <p className="prose-lead">
              That is the whole difference. An operator who books a crew per trip cannot tell you who
              will be leading you, and cannot answer for how they are treated. We can do both, which
              is why the guides are on this site by name and you can ask for one.
            </p>
          </div>
          <Photo photoKey="hero-about" alt="A Kilimanjaro high camp at dusk" className="h-[420px] rounded" sizes="(max-width:1024px) 100vw, 50vw" priority />
        </div>
      </Section>

      <Section tone="ink" id="credentials">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow tone="light">Licensed and accredited</Eyebrow>
            <h2 className="text-[33px] leading-[1.22] text-white">Who we answer to</h2>
            <p className="mt-3.5 leading-[1.8] text-white/75">
              Every one of these bodies can be checked independently, which is the point of listing
              them. Each entry carries a marker until its real membership number is published here —
              a claimed accreditation with no number attached is not a credential, it is a logo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {site.credentials.map((c) => (
              <div key={c.name} className="min-w-[128px] rounded border border-white/20 px-[18px] py-3">
                <p className="text-base font-bold tracking-wider text-white">{c.name}</p>
                <p className="mt-0.5 text-xs text-white/60">{c.full}</p>
                <p className="metric mt-1 text-xs text-lime">
                  {c.number || <Unverified>Number to confirm</Unverified>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="cream" id="guides">
        <SectionTitle eyebrow="The crew" title="Guests name them in their own reviews"
          lead="So they are here, by name, with their role and their years. Ask for one of them when you book and we will put them on your trip if they are free." />
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {guides.map((g) => <GuideCard key={g.name} guide={g} />)}
        </div>
        <p className="mt-10 text-center text-sm text-muted">
          A crew of {crewSize}+ in total. <Unverified>Guide photographs and confirmed years to supply</Unverified>
        </p>
      </Section>

      <Section tone="sand" id="porters">
        <SectionTitle eyebrow="Crew welfare and safety" title="The part of a climb nobody advertises"
          lead="Underpaid, underfed and underequipped crew is how people get hurt on this mountain — climbers as well as porters. So here is what we actually do, in terms you can hold us to." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COMMITMENTS.map((c) => (
            <div key={c.h} className="rounded border border-line bg-white p-7">
              <h3 className="mb-2.5 text-[19px]">{c.h}</h3>
              <p className="text-[15px] leading-[1.75] text-muted">{c.p}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" id="group">
        <SectionTitle eyebrow="The wider group" title="Where you sleep, and what your climb funds"
          lead="Safari itineraries book into our sister company's properties by default, and climbers can carry a fundraising page for the group's charity." />
        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          {site.sisterBrands.map((b) => (
            <div key={b.url} className="rounded bg-paper p-[30px]">
              <h3 className="mb-2 text-[23px]">{b.name}</h3>
              <p className="mb-3 text-base leading-[1.75] text-muted">{b.role}</p>
              <a href={b.url} target="_blank" rel="noopener" className="text-sm font-semibold text-olive-deep hover:underline">
                Visit {b.name}
              </a>
            </div>
          ))}
        </div>
      </Section>

      <ReviewBand items={reviews.slice(0, 6)} title="What guests actually wrote"
        lead="Every one of these is on Tripadvisor under the guest's own name and none were solicited." />

      <Section tone="cream" id="whychooseus">
        <SectionTitle eyebrow="The small print" title="What a climb price covers" />
        <div className="mt-9"><Terms included={climbIncluded} excluded={climbExcluded} /></div>
        <p className="mt-10 text-center"><Button href="/plan">Build and price a trip</Button></p>
      </Section>
    </>
  );
}
