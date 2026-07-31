import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { departures } from "@/lib/trips";
import { Section, SectionTitle, PageHero, Eyebrow } from "@/components/primitives";
import { EnquiryForm, type QuoteKind } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Contact the Moshi office",
  description: `Talk to Tanzania Wildlife Adventures directly: ${site.contact.phone}, ${site.contact.email}, or WhatsApp. Based in Moshi, Kilimanjaro Region.`,
  alternates: { canonical: "/contact" },
};

const KINDS = new Set(["beach", "daytrip", "combo"]);

/**
 * The contact page reads its own context from the URL.
 *
 * `?trip=` / `?waitlist=` come from a departure; `?quote=&kind=&label=` from an
 * "ask for a price" link. Before this, every such link dropped the visitor onto
 * a generic form with a raw slug — clicking it on the Marangu Waterfalls day
 * trip produced a banner reading "Group departure marangu-waterfalls".
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) ?? "";

  const quote = one("quote");
  const kindParam = one("kind");
  const quoteKind = (KINDS.has(kindParam) ? kindParam : null) as QuoteKind;
  const label = one("label");
  const trip = one("trip");
  const waitlist = one("waitlist");
  const context = trip || waitlist ? label || trip || waitlist : "";

  const subject = quote
    ? `Price request: ${label || quote}`
    : waitlist
      ? `Waitlist: ${label || waitlist}`
      : trip
        ? `Group departure: ${label || trip}`
        : "General enquiry";

  const openDates = departures.filter((d) => d.capacity > d.booked).length;

  return (
    <>
      <PageHero eyebrow="Talk to us" title="Talk to the Moshi office"
        lead="Not a call centre and not a reseller — the person who answers has been up the mountain. Tell us roughly what you want and we will cost it, not sell at you."
        photoKey="hero-home"
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]} />

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>The Moshi office</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Talk to the people who run the trip</h2>
            <p className="prose-lead mt-3.5">
              Not a call centre and not a reseller. The person who answers is in {site.contact.address}{" "}
              and has been up the mountain.
            </p>

            <div className="mt-6 rounded bg-paper p-7">
              <Field label="Phone and WhatsApp">
                <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="text-[21px] font-bold text-ink hover:text-olive-deep">
                  {site.contact.phone}
                </a>
              </Field>
              <Field label="Email">
                <a href={`mailto:${site.contact.email}`} className="text-[17px] font-semibold text-olive-deep hover:underline">
                  {site.contact.email}
                </a>
              </Field>
              <Field label="Office"><p className="text-base text-slate">{site.contact.address}</p></Field>
              <Field label="Spoken here"><p className="text-base text-slate">{site.languages.join(", ")}</p></Field>
              <a href={site.whatsappUrl} target="_blank" rel="noopener"
                className="mt-5 inline-block rounded-[3px] bg-olive-text px-[22px] py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-olive-deep">
                Message us on WhatsApp
              </a>
            </div>

            <p className="mt-5 text-sm leading-[1.7] text-muted">
              Tanzania is UTC+3. We read messages from about 08:00 to 19:00 East Africa Time and
              reply to everything within one working day.
            </p>
          </div>

          <div className="rounded border border-line bg-white p-8">
            <h2 className="mb-2 text-2xl">Send us a request</h2>
            <p className="mb-6 text-[15px] leading-[1.7] text-muted">
              Roughly what you want to do and roughly when is enough to start. We will come back with
              a costed itinerary rather than a brochure.
            </p>
            <EnquiryForm kind="contact" subject={subject} context={context}
              quoteKind={quoteKind} quoteLabel={label || quote} />
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionTitle eyebrow="Faster than a form" title="Or start from something concrete"
          lead="Pick a route, a date or a whole trip and we will have something specific to answer." />
        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {[
            { h: "Compare the six routes", p: "Days, difficulty, summit rate and price side by side, each with its altitude profile.", href: "/kilimanjaro", cta: "Compare routes" },
            { h: `${openDates} departures with seats`, p: "Fixed dates below the private-climb price, each with a live seat count.", href: "/departures", cta: "See the dates" },
            { h: "Build and price a trip", p: "Climb, safari and day trips in one basket, with the total and the 30% deposit.", href: "/plan", cta: "Open the planner" },
          ].map((c) => (
            <div key={c.href} className="rounded border border-line bg-white p-[30px]">
              <h3 className="mb-2.5 text-xl">{c.h}</h3>
              <p className="mb-3 text-[15px] leading-[1.75] text-muted">{c.p}</p>
              <Link href={c.href as never} className="text-sm font-semibold text-olive-deep hover:underline">{c.cta}</Link>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="label mb-1 text-muted">{label}</p>
      {children}
    </div>
  );
}
