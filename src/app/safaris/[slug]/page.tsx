import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { safaris } from "@/lib/trips";
import { parks } from "@/lib/parks";
import { reviews } from "@/lib/reviews";
import { site } from "@/lib/site";
import { photo } from "@/lib/photos";
import { money, list } from "@/lib/format";
import { Section, SectionTitle, PageHero, Photo, Pill, Button, Eyebrow, TripCard } from "@/components/primitives";
import { ReviewBand, Terms, BookBar } from "@/components/blocks";
import { EnquiryForm } from "@/components/enquiry-form";

export function generateStaticParams() {
  return safaris.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = safaris.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: `${s.name} — ${s.days} days`,
    description: `${s.summary} ${s.days} days across ${list(s.parks)}, from ${money(s.price)} per person.`,
    alternates: { canonical: `/safaris/${s.slug}` },
    openGraph: { images: [photo(s.photoKey)?.src ?? "/photos/hero-safaris.jpg"] },
  };
}

/** Per-person, covering the whole party's vehicle, guide and park fees. */
const included = [
  { text: "Custom 4x4 with an open roof and a window seat each", detail: "Never more than six to a vehicle, so nobody is in the middle." },
  { text: "Professional driver-guide throughout", detail: "The same guide for the whole trip, not one per park." },
  { text: "All park entry and concession fees" },
  { text: "Full board accommodation", detail: "Lodges and tented camps, standard set with you before you pay." },
  { text: "All meals and drinking water in the vehicle" },
  { text: "Airport transfers on arrival and departure" },
  { text: "Government taxes and VAT" },
];
const excluded = [
  { text: "International flights and visa" },
  { text: "Travel insurance", detail: "A condition of travelling with us. We ask to see the policy." },
  { text: "Hot air balloon, night drives and walking safaris", detail: "Bookable with the itinerary — they need permits and dawn starts." },
  { text: "Tips for your guide and camp staff" },
  { text: "Drinks other than water, and anything personal" },
];

export default async function SafariPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = safaris.find((x) => x.slug === slug);
  if (!s) notFound();

  const inTrip = parks.filter((p) => s.parks.some((n) => p.name.startsWith(n)));
  const others = safaris.filter((o) => o.slug !== s.slug);
  const rel = reviews.filter((r) => /safari|circuit|migration/i.test(r.trip ?? "")).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Trip", name: s.name, description: s.summary,
    url: `${site.url}/safaris/${s.slug}`,
    provider: { "@type": "TravelAgency", name: site.name, url: site.url },
    itinerary: { "@type": "ItemList", numberOfItems: s.days },
    offers: { "@type": "Offer", price: String(s.price), priceCurrency: "USD", availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow={`Safari · ${s.days} days / ${s.nights} nights`} title={s.name} lead={s.summary}
        photoKey={s.photoKey}
        crumbs={[{ label: "Home", href: "/" }, { label: "Safari", href: "/safaris" }, { label: s.name, href: `/safaris/${s.slug}` }]} />

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          <div>
            <Eyebrow>{s.days} days, {s.nights} nights · {s.style}</Eyebrow>
            <h2 className="mb-4 text-[33px] leading-[1.22]">{s.name}</h2>
            <p className="prose-lead text-lg">{s.summary}</p>
            <p className="mt-3 text-[17px] leading-[1.75] text-slate">{s.highlight}</p>
          </div>
          <div className="rounded bg-paper p-7">
            <p className="label text-muted">From</p>
            <p className="metric text-[40px] font-bold leading-none text-olive-deep">{money(s.price)}</p>
            <p className="mb-[18px] text-sm text-muted">per person, sharing</p>
            <p className="label mb-2 text-muted">Parks visited</p>
            <div className="flex flex-wrap gap-1.5">{s.parks.map((p) => <Pill key={p}>{p}</Pill>)}</div>
            <div className="mt-[22px]"><Button href="#enquire" className="w-full text-center">Enquire about these dates</Button></div>
          </div>
        </div>
      </Section>

      <Section tone="sand" id="itinerary">
        <div className="grid gap-12 lg:grid-cols-[4fr_8fr]">
          <div>
            <Eyebrow>Day by day</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">{s.days} days, and where each night is</h2>
            <p className="prose-lead mt-3.5">
              The driving is broken up rather than done in two long hauls, and camp moves with the
              itinerary — on the northern circuit, where you sleep decides what you see the next morning.
            </p>
          </div>
          <div>
            {s.itinerary.map((d) => (
              <div key={d.day} className="grid grid-cols-[62px_1fr] gap-[22px] border-b border-line py-6 last:border-b-0">
                <span className="flex size-[54px] items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white">D{d.day}</span>
                <div>
                  <h3 className="mb-1.5 text-[18px]">{d.title}</h3>
                  {d.sleeps && <p className="metric mb-2 inline-block rounded-full border border-line bg-white px-3 py-1 text-xs text-slate">Sleeps: {d.sleeps}</p>}
                  <p className="text-[15px] text-muted">{d.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {inTrip.length > 0 && (
        <Section tone="cream">
          <SectionTitle eyebrow="On this trip" title="The parks you spend those days in" />
          <div className="mt-9 grid gap-8 lg:grid-cols-2">
            {inTrip.map((p) => (
              <article key={p.name} className="overflow-hidden rounded border border-line bg-white">
                <Photo photoKey={p.photoKey} alt={p.name} className="h-[200px]" sizes="(max-width:1024px) 100vw, 50vw" />
                <div className="p-6">
                  <Pill>{p.headline}</Pill>
                  <h3 className="mb-2 mt-2.5 text-[21px]">{p.name}</h3>
                  <p className="mb-2 text-[15px] leading-[1.75] text-muted">{p.note}</p>
                  <p className="text-sm font-semibold text-olive-deep">When to go: <span className="font-normal text-slate">{p.when}</span></p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      <Section tone="sand" id="included">
        <SectionTitle eyebrow="The small print" title="What the price covers" />
        <div className="mt-9"><Terms included={included} excluded={excluded} /></div>
        <div className="mt-3 rounded border border-line bg-white p-7">
          <h3 className="mb-2.5 text-[18px]">Paying for it</h3>
          <p className="leading-[1.75] text-muted">
            A 30% deposit confirms the vehicle, the guide and the camps. The balance is due 45 days
            before you land. Lodge standard, private vehicle and any experience add-ons are agreed
            with you before the deposit, not after.
          </p>
        </div>
      </Section>

      <Section tone="cream" id="enquire">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Ask us</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Tell us your dates</h2>
            <p className="prose-lead mt-3.5">
              Migration timing, a private vehicle, a particular lodge, a birthday in the middle of it
              — all of that changes the trip and we would rather know now than on day one.
            </p>
            <div className="mt-6"><Button href="/plan" variant="ghost">Build the whole trip</Button></div>
          </div>
          <EnquiryForm kind="safari" subject={`${s.name} — ${s.days} days`} />
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="sand">
          <SectionTitle eyebrow="Also on the northern circuit" title="The other itineraries" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {others.map((o) => (
              <TripCard key={o.slug} href={`/safaris/${o.slug}`} photoKey={o.photoKey} title={o.name}
                excerpt={o.summary} price={o.price} cta="See the day by day" meta={[`${o.days} days`, o.style]} />
            ))}
          </div>
        </Section>
      )}

      {rel.length > 0 && <ReviewBand items={rel} title="From people who went" />}

      <BookBar name={`${s.name} — ${s.days} days, ${s.style}`} price={s.price} addId={`safari-${s.slug}`} />
    </>
  );
}
