import type { Metadata } from "next";
import Link from "next/link";
import { halalCommitments, halalConfidence } from "@/lib/halal";
import { zanzibarPackages } from "@/lib/zanzibar";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";
import { money } from "@/lib/format";
import {
  Section,
  SectionTitle,
  PageHero,
  TripCard,
  Button,
  Eyebrow,
  Unverified,
} from "@/components/primitives";
import { EnquiryForm } from "@/components/enquiry-form";

/**
 * Halal travel.
 *
 * Built to the opposite spec from the two Tanzanian competitors selling this.
 * One of them claims to be the country's first and only halal travel agent and
 * publishes almost nothing about how it works; the other substantiates it well
 * and charges three to ten thousand dollars. The open lane is a specific,
 * checkable, mid-priced offer — which is the same discipline every other page
 * here already runs on.
 *
 * So the page leads with what is confirmed, states plainly how much is not,
 * and names the question behind every open item. See lib/halal.ts for why that
 * is not excessive caution: a wrong price costs an apology, a wrong halal
 * claim breaks an obligation on somebody's behalf.
 */

export const metadata: Metadata = {
  title: "Halal travel in Tanzania — Kilimanjaro, safari and Zanzibar",
  description:
    "Halal-conscious Kilimanjaro climbs, private safaris and Zanzibar stays from a Moshi operator. What we can confirm today, what we are still confirming, and no claim we cannot back.",
  alternates: { canonical: "/halal" },
};

export default function HalalPage() {
  const { total, confirmed, pending } = halalConfidence();
  const cheapestClimb = Math.min(...routes.map((r) => r.price));
  const beach = zanzibarPackages.slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Muslim travellers"
        title="Halal travel, without the claims we cannot back"
        lead="Kilimanjaro, the northern circuit and Zanzibar, arranged around prayer, catering and privacy. Below is what we can confirm today and what we are still confirming — in that order, and clearly marked."
        photoKey="hero-zanzibar"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Halal travel", href: "/halal" },
        ]}
      />

      {/* The honest frame, first — before anything is sold. */}
      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          <div>
            <Eyebrow>Where this page stands</Eyebrow>
            <h2 className="mb-4 text-[33px] leading-[1.22]">
              {confirmed} of {total} confirmed, and we will not pretend otherwise
            </h2>
            <p className="prose-lead text-lg">
              Other operators sell halal Tanzania with a certificate badge and a stock photograph.
              We would rather tell you which parts of this we can stand behind today and which parts
              our Moshi office is still nailing down — because being served the wrong meat on day
              four of a climb is not a service failure you can shrug off.
            </p>
            <p className="prose-lead mt-3.5">
              Everything marked below as still to confirm is a real question with a real person
              waiting to answer it, not a hedge. Ask us and we will tell you where it has got to.
            </p>
          </div>
          <div className="rounded bg-paper p-7">
            <p className="label text-muted">Confirmed today</p>
            <p className="metric mb-1 mt-1.5 text-[34px] font-bold leading-none text-olive-deep">
              {confirmed} of {total}
            </p>
            <p className="mb-4 text-sm leading-[1.7] text-muted">
              The other {pending} are operational promises we have not yet had confirmed in writing.
              They are listed with the exact question behind each one.
            </p>
            <Button href="#ask" className="w-full text-center">
              Ask about your trip
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionTitle
          eyebrow="Point by point"
          title="What we can say, and what we are still asking"
          lead="Confirmed items rest on something checkable — a published ladder, a booking condition, or a fact about the destination. The rest carry the same marker as an unconfirmed rate card, and name the question."
        />
        <ul className="mt-10 space-y-3">
          {halalCommitments.map((c) => (
            <li
              key={c.id}
              className={`rounded border p-[22px] md:p-[26px] ${
                c.verified ? "border-line bg-white" : "border-[#e6dcbb] bg-[#fbf7ea]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="text-[19px] leading-[1.3]">{c.title}</h3>
                {c.verified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef0e2] px-2.5 py-1 text-[11.5px] font-medium leading-none text-olive-deep">
                    <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-olive" />
                    Confirmed
                  </span>
                ) : (
                  <Unverified>Not yet confirmed</Unverified>
                )}
              </div>
              <p className="mt-2.5 text-[15px] leading-[1.75] text-muted">{c.detail}</p>
              {c.toConfirm && (
                <p className="mt-3 border-l-2 border-[#d9c98f] pl-3.5 text-[13.5px] leading-[1.65] text-slate">
                  <strong className="font-semibold">What we are asking the office:</strong>{" "}
                  {c.toConfirm}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* Zanzibar first, because it is the part that needs the fewest promises. */}
      <Section tone="cream">
        <SectionTitle
          eyebrow="The easiest place to start"
          title="Zanzibar, where none of this has to be arranged"
          lead="Roughly 99% of the island is Muslim. Halal food, prayer and modest dress are the local default rather than a request you have to make, which makes it the part of a Tanzania trip that needs the fewest assurances from us."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {beach.map((z) => (
            <TripCard
              key={z.slug}
              href={`/zanzibar/${z.slug}`}
              photoKey={z.photoKey}
              tag={`${z.days} days`}
              title={z.name}
              excerpt={z.summary}
              cta="What is included"
              meta={[`${z.nights} nights`, `Based at ${z.base}`]}
            />
          ))}
        </div>
        <p className="mt-8 text-center">
          <Button href="/zanzibar" variant="ghost">
            All {zanzibarPackages.length} Zanzibar packages
          </Button>
        </p>
      </Section>

      <Section tone="sand">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>The mountain</Eyebrow>
            <h2 className="mb-3.5 text-[33px] leading-[1.22]">A private climb, on your own schedule</h2>
            <p className="prose-lead">
              A private climb means our crew and your party, nobody else. That is what makes prayer
              stops, your own catering instructions and a women-only group straightforward rather
              than something to negotiate with strangers at 4,000 m. Private climbs run any day of
              the year, from {money(cheapestClimb)} per person, and the party-size ladder is
              published on every route page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/kilimanjaro">Compare the routes</Button>
              <Button href="/safaris" variant="ghost">
                Private safaris
              </Button>
            </div>
          </div>
          <div className="rounded border border-line bg-white p-7">
            <h3 className="mb-3.5 text-[21px]">Before you book anything</h3>
            <p className="mb-4 text-[15px] leading-[1.75] text-muted">
              If catering certification or prayer arrangements are the deciding factor for you — and
              they should be — do not book on the strength of this page. Ask us those questions
              first and hold us to the answers in writing.
            </p>
            <p className="text-[15px] leading-[1.75] text-muted">
              WhatsApp reaches the Moshi office directly on{" "}
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener"
                className="font-semibold text-olive-deep underline-offset-2 hover:underline"
              >
                {site.contact.whatsapp}
              </a>
              , usually inside a working day.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="cream" id="ask">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <Eyebrow>Ask us</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Tell us what matters and we will answer straight</h2>
            <p className="prose-lead mt-3.5">
              How strict your catering needs to be, whether you are travelling in Ramadan, and
              whether you need a women-only party — those three answers decide whether we can do
              what you need, and we would rather say no than guess.
            </p>
            <p className="prose-lead">
              If we cannot arrange something to the standard you keep, we will tell you that and
              point you at an operator who can.{" "}
              <Link href="/plan" className="text-olive-deep underline-offset-2 hover:underline">
                Or build and price a trip first
              </Link>{" "}
              and send it over with your questions attached.
            </p>
          </div>
          <EnquiryForm
            kind="halal"
            subject="Halal travel enquiry"
            quoteKind="halal"
            quoteLabel="Halal travel — Kilimanjaro, safari and Zanzibar"
            hidden={{ enquiry: "halal travel", confirmedItems: `${confirmed} of ${total}` }}
          />
        </div>
      </Section>
    </>
  );
}
