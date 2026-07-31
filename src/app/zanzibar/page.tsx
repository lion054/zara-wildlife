import type { Metadata } from "next";
import { zanzibarPackages, zanzibarAttractions, zanzibarSeasons } from "@/lib/zanzibar";
import { Section, SectionTitle, PageHero, TripCard, Pill, Button } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Zanzibar beach holidays — Stone Town, Jozani, Matemwe, Mnemba",
  description: `${zanzibarPackages.length} Zanzibar packages from two nights to a week, the island's attractions, and an honest month-by-month guide including the ones we would avoid.`,
  alternates: { canonical: "/zanzibar" },
};

const TONE: Record<string, "moderate" | "challenging" | "hard" | "plain"> = {
  Peak: "moderate", "Short dry": "moderate", "Short rains": "challenging", "Long rains": "hard",
};

export default function ZanzibarPage() {
  return (
    <>
      <PageHero eyebrow="Zanzibar" title="Stone Town, spice and the east coast"
        lead="Forty minutes in the air from the mainland: a UNESCO old town, a forest full of red colobus, the Mnemba reef and forty kilometres of white sand. Most people come straight off the mountain."
        photoKey="hero-zanzibar"
        crumbs={[{ label: "Home", href: "/" }, { label: "Beach Vibes", href: "/zanzibar" }]} />

      <Section tone="cream" id="zanzibarsafaripackages">
        <SectionTitle eyebrow={`${zanzibarPackages.length} packages`} title="Two nights in Stone Town, or a week on the east coast"
          lead="Most people come here straight off the mountain or the parks — forty minutes in the air from Arusha, or a ferry from Dar. Every package below is a shape, not a fixed product: the hotel standard is yours to set." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {zanzibarPackages.map((z) => (
            <TripCard key={z.slug} href={`/zanzibar/${z.slug}`} photoKey={z.photoKey} tag={`${z.days} days`}
              title={z.name} excerpt={z.summary} cta="What is included"
              meta={[`${z.nights} nights`, `Based at ${z.base}`]} />
          ))}
        </div>
        <p className="mx-auto mt-9 max-w-[760px] text-center text-sm leading-[1.75] text-muted">
          Zanzibar is the one thing on this site we quote rather than list. The price moves with the
          hotel standard and the season by more than any honest &ldquo;from&rdquo; figure would
          survive, and a number we had to walk back later would cost more than the enquiry it won.
        </p>
      </Section>

      <Section tone="sand" id="seasons">
        <SectionTitle eyebrow="When to come" title="Including the months we would tell you not to"
          lead="March to May the rain is heavy, the humidity is high and some lodges close. It is the cheapest time to come and we will say plainly whether it is worth it for what you want to do." />
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {zanzibarSeasons.map((s) => (
            <div key={s.label} className="rounded border border-line bg-white p-[26px]">
              <Pill tone={TONE[s.kind] ?? "plain"}>{s.kind}</Pill>
              <h3 className="mb-2 mt-3.5 text-xl">{s.label}</h3>
              <p className="text-[15px] leading-[1.75] text-muted">{s.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" id="zanzibarfaqs">
        <SectionTitle eyebrow="On the island" title="What there is to do" />
        <div className="mt-9 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {zanzibarAttractions.map((a) => (
            <div key={a.name}>
              <h3 className="mb-2 text-xl">{a.name}</h3>
              <p className="text-[15px] leading-[1.75] text-muted">{a.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center"><Button href="/contact" variant="ghost">Get a price for your dates</Button></p>
      </Section>
    </>
  );
}
