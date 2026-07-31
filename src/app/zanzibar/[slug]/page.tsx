import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { zanzibarPackages, zanzibarSeasons } from "@/lib/zanzibar";
import { photo } from "@/lib/photos";
import { Section, SectionTitle, PageHero, TripCard, Pill, Button, Eyebrow } from "@/components/primitives";
import { EnquiryForm } from "@/components/enquiry-form";
import { QuoteBar } from "@/components/blocks";

export function generateStaticParams() {
  return zanzibarPackages.map((z) => ({ slug: z.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const z = zanzibarPackages.find((x) => x.slug === slug);
  if (!z) return {};
  return {
    title: `${z.name} — ${z.days} days in Zanzibar`,
    description: `${z.summary} ${z.days} days based at ${z.base}. Quoted to your dates and your hotel standard.`,
    alternates: { canonical: `/zanzibar/${z.slug}` },
    openGraph: { images: [photo(z.photoKey)?.src ?? "/photos/hero-zanzibar.jpg"] },
  };
}

export default async function ZanzibarPackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const z = zanzibarPackages.find((x) => x.slug === slug);
  if (!z) notFound();
  const others = zanzibarPackages.filter((o) => o.slug !== z.slug).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={`Zanzibar · ${z.days} days / ${z.nights} nights`} title={z.name} lead={z.summary}
        photoKey={z.photoKey}
        crumbs={[{ label: "Home", href: "/" }, { label: "Beach Vibes", href: "/zanzibar" }, { label: z.name, href: `/zanzibar/${z.slug}` }]} />

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          <div>
            <Eyebrow>{z.days} days, {z.nights} night{z.nights === 1 ? "" : "s"} · based at {z.base}</Eyebrow>
            <h2 className="mb-4 text-[33px] leading-[1.22]">{z.name}</h2>
            <p className="prose-lead text-lg">{z.summary}</p>
            <h3 className="mb-3.5 mt-9 text-[21px]">What you do</h3>
            <ul>
              {z.highlights.map((h) => (
                <li key={h} className="relative border-b border-line py-2.5 pl-8 text-[15px] text-slate last:border-b-0">
                  <span aria-hidden className="absolute left-0 top-2.5 text-olive-deep">✓</span>{h}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded bg-paper p-7">
            <p className="label text-muted">Price</p>
            <p className="mb-2.5 mt-1.5 text-2xl font-bold leading-tight text-ink">Quoted to your dates</p>
            <p className="mb-[18px] text-sm leading-[1.7] text-muted">
              Zanzibar is the one thing we quote rather than list. The price moves with the hotel
              standard you pick and the season by more than any honest &ldquo;from&rdquo; figure would
              survive — and a number we had to walk back later would cost more than the enquiry it won.
            </p>
            <Button href="#enquire" className="w-full text-center">Get a price for these dates</Button>
          </div>
        </div>
      </Section>

      <Section tone="sand" id="seasons">
        <SectionTitle eyebrow="When to come" title="Including the months we would tell you not to"
          lead="March to May is heavy rain, high humidity, and some lodges shut. It is the cheapest time to come and we will say plainly whether it is worth it for what you want to do." />
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {zanzibarSeasons.map((s) => (
            <div key={s.label} className="rounded border border-line bg-white p-[26px]">
              <Pill>{s.kind}</Pill>
              <h3 className="mb-2 mt-3.5 text-xl">{s.label}</h3>
              <p className="text-[15px] leading-[1.75] text-muted">{s.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" id="enquire">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Ask us</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Tell us your dates and your standard</h2>
            <p className="prose-lead mt-3.5">
              Beachfront or in Stone Town, half board or all inclusive, and whether this follows a
              climb or a safari — those three answers are most of the price. We come back within a
              working day.
            </p>
          </div>
          <EnquiryForm kind="zanzibar" subject={`Price request: ${z.name} — ${z.days} days`}
            quoteKind="beach" quoteLabel={`${z.name} — ${z.days} days`} />
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="sand">
          <SectionTitle eyebrow="Other packages" title="More or less time on the island" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <TripCard key={o.slug} href={`/zanzibar/${o.slug}`} photoKey={o.photoKey} tag={`${o.days} days`}
                title={o.name} excerpt={o.summary} cta="What is included"
                meta={[`${o.nights} nights`, `Based at ${o.base}`]} />
            ))}
          </div>
        </Section>
      )}

      <QuoteBar
        name={`${z.name} — ${z.days} days, based at ${z.base}`}
        note="Zanzibar moves with hotel standard and season by more than an honest 'from' would survive"
        href={`/zanzibar/${z.slug}#enquire`}
      />
    </>
  );
}
