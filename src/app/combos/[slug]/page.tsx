import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { combos, comboNotes } from "@/lib/combos";
import { site } from "@/lib/site";
import { photo } from "@/lib/photos";
import { money, list } from "@/lib/format";
import { Section, SectionTitle, PageHero, TripCard, Button, Eyebrow } from "@/components/primitives";
import { FaqList, BookBar } from "@/components/blocks";
import { EnquiryForm } from "@/components/enquiry-form";

export function generateStaticParams() {
  return combos.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = combos.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.name} — ${c.days} days`,
    description: `${c.summary} ${c.days} days combining ${list(c.legs)}${c.price == null ? ", quoted to your dates." : `, from ${money(c.price)} per person.`}`,
    alternates: { canonical: `/combos/${c.slug}` },
    openGraph: { images: [photo(c.photoKey)?.src ?? "/photos/hero-combos.jpg"] },
  };
}

const legLink = (leg: string) =>
  /kilimanjaro|lemosho|machame|marangu|rongai|climb/i.test(leg) ? "/kilimanjaro"
  : /zanzibar|beach/i.test(leg) ? "/zanzibar" : "/safaris";

export default async function ComboPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = combos.find((x) => x.slug === slug);
  if (!c) notFound();

  const others = combos.filter((o) => o.slug !== c.slug).slice(0, 3);
  const quoted = c.price == null;

  return (
    <>
      <PageHero eyebrow={`Combination · ${c.days} days / ${c.nights} nights`} title={c.name} lead={c.summary}
        photoKey={c.photoKey}
        crumbs={[{ label: "Home", href: "/" }, { label: "Climb & Safari", href: "/combos" }, { label: c.name, href: `/combos/${c.slug}` }]} />

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          <div>
            <Eyebrow>{c.days} days, {c.nights} nights · {c.legs.length} legs</Eyebrow>
            <h2 className="mb-4 text-[33px] leading-[1.22]">{c.name}</h2>
            <p className="prose-lead text-lg">{c.summary}</p>
          </div>
          <div className="rounded bg-paper p-7">
            {quoted ? (
              <>
                <p className="label text-muted">Price</p>
                <p className="mb-2.5 mt-1.5 text-2xl font-bold leading-tight text-ink">Quoted to your dates</p>
                <p className="mb-[18px] text-sm leading-[1.7] text-muted">
                  The beach half of this trip is in Zanzibar, and the island moves with the hotel
                  standard and the season by more than an honest &ldquo;from&rdquo; would survive.
                  Tell us your dates and the standard you want and we will price the whole thing in one go.
                </p>
              </>
            ) : (
              <>
                <p className="label text-muted">From</p>
                <p className="metric text-[40px] font-bold leading-none text-olive-deep">{money(c.price)}</p>
                <p className="mb-[18px] text-sm text-muted">per person, whole trip</p>
              </>
            )}
            <Button href="#enquire" className="w-full text-center">
              {quoted ? "Ask for a price" : "Ask about this combination"}
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="sand" id="legs">
        <SectionTitle eyebrow="How it fits together" title={`${c.legs.length} legs, one booking, one deposit`}
          lead="The mountain first while you are fresh, then the parks while your legs recover. One crew hands you to the next and one operator is answerable for all of it." />
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {c.legs.map((leg, i) => (
            <div key={leg} className="rounded border border-line bg-white p-[30px]">
              <span className="mb-4 flex size-[46px] items-center justify-center rounded-full bg-ink font-bold text-white">{i + 1}</span>
              <h3 className="mb-2.5 text-[22px]">{leg}</h3>
              <Button href={legLink(leg)} variant="ghost">See what this leg involves</Button>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" id="faq">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Before you ask</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">The things everyone wants to know</h2>
            <p className="prose-lead mt-3.5">
              The climb is fixed by the route. Everything after it is decided with you before the deposit.
            </p>
          </div>
          <FaqList items={comboNotes} />
        </div>
      </Section>

      <Section tone="sand" id="enquire">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Ask us</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Tell us your dates</h2>
            <p className="prose-lead mt-3.5">
              Which route you want for the climb, how long you want on the beach, whether the safari
              half should chase the migration. All of it is decided before you pay anything.
            </p>
            <div className="mt-6"><Button href="/plan" variant="ghost">Or build it yourself and see the total</Button></div>
          </div>
          <EnquiryForm kind="combo"
            subject={`${quoted ? "Price request: " : ""}${c.name} — ${c.days} days`}
            quoteKind={quoted ? "combo" : null}
            quoteLabel={`${c.name} — ${c.days} days`} />
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="cream">
          <SectionTitle eyebrow="Other combinations" title="If the shape is not quite right" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <TripCard key={o.slug} href={`/combos/${o.slug}`} photoKey={o.photoKey} title={o.name}
                excerpt={o.summary} price={o.price} cta="See how it fits together"
                meta={[`${o.days} days`, list(o.legs)]} />
            ))}
          </div>
        </Section>
      )}

      {!quoted && <BookBar name={`${c.name} — ${c.days} days`} price={c.price as number} addId={`combo-${c.slug}`} />}
    </>
  );
}
