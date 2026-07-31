import type { Metadata } from "next";
import Link from "next/link";
import { dayTrips } from "@/lib/trips";
import { dayTripIncluded, dayTripExcluded } from "@/lib/inclusions";
import { money, dayTripRates } from "@/lib/format";
import { Section, SectionTitle, PageHero, Photo, Unverified, Button } from "@/components/primitives";
import { Terms } from "@/components/blocks";

export const metadata: Metadata = {
  title: "Day trips from Moshi — waterfalls, hot springs and parks",
  description: `${dayTrips.length} day trips from Moshi and Arusha with full published price ladders: Materuni, Chemka, Marangu, Shira Plateau, Arusha, Tarangire, Mkomazi and more.`,
  alternates: { canonical: "/day-trips" },
};

export default function DayTripsPage() {
  return (
    <>
      <PageHero eyebrow="Day Trips" title="One day, out of Moshi"
        lead="Waterfalls, hot springs, coffee farms and the lower slopes — from $60 a head. Every one priced for the group you are actually bringing, not for a coach party."
        photoKey="hero-daytrips"
        crumbs={[{ label: "Home", href: "/" }, { label: "Tours", href: "/day-trips" }]} />

      <Section tone="cream">
        <SectionTitle eyebrow={`${dayTrips.length} trips`} title="Priced by the size of your group"
          lead="The live site lists most of these and sells none of them. Every trip below carries the operator's own rate ladder — one person pays one price, six people pay another, and both are published." />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {dayTrips.map((t, i) => {
            const r = dayTripRates(t);
            return (
              <article key={t.slug} className="overflow-hidden rounded border border-line bg-white">
                <Photo photoKey={t.photoKey} alt={t.name} subject={`${t.name}, ${t.hours} from ${t.from}`}
                  className="h-[220px]" sizes="(max-width:1024px) 100vw, 50vw" priority={i < 2} />
                <div className="p-7">
                  <ul className="mb-3 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] text-muted">
                    {[t.hours, `Departs ${t.from}`].map((m) => (
                      <li key={m} className="flex items-center gap-1.5 before:block before:size-[5px] before:rounded-full before:bg-lime">{m}</li>
                    ))}
                  </ul>
                  <h2 className="mb-2.5 text-[23px]">
                    <Link href={`/day-trips/${t.slug}` as never} className="hover:text-olive-deep">
                      {t.name}
                    </Link>
                  </h2>
                  <p className="mb-3 text-[15px] leading-[1.75] text-muted">{t.summary}</p>

                  {r.onRequest ? (
                    <>
                      <p className="mb-3 text-[15px] leading-[1.75] text-muted">
                        <Unverified>No rate card published</Unverified> This is one we quote rather
                        than list — the operator publishes no table for it, and a number invented
                        here would be one you could hold us to.
                      </p>
                      <Link
                        href={`/day-trips/${t.slug}` as never}
                        className="inline-block rounded-[3px] border border-olive-deep px-[22px] py-2.5 text-sm font-semibold text-olive-deep transition-colors hover:bg-olive-deep hover:text-white">
                        See the day and ask a price
                      </Link>
                    </>
                  ) : r.single ? (
                    <p className="text-[15px] text-slate">
                      <strong className="metric text-[21px] text-olive-deep">{money(r.single)}</strong>{" "}
                      per person, any party size. {!t.priceVerified && <Unverified>Rate sheet to confirm</Unverified>}
                    </p>
                  ) : (
                    <>
                      <p className="mb-3.5 text-sm text-slate">
                        On your own it is <strong className="metric">{money(r.solo)}</strong>; in a
                        full group it comes down to <strong className="metric">{money(r.best)}</strong>. The whole ladder:
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {r.tiers.map((tier) => (
                          <div key={tier.size} className="rounded border border-line px-3 py-3.5 text-center">
                            <p className="label text-muted">{tier.size}</p>
                            <p className="metric mt-1 text-[21px] font-bold text-olive-deep">{money(tier.price)}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[13px] text-muted">
                        Per person, in US dollars.{" "}
                        {t.priceVerified ? "Taken from the operator's own published rate card." : <><Unverified>Rate sheet to confirm</Unverified> This is an estimate.</>}
                      </p>
                    </>
                  )}

                  {!r.onRequest && (
                    <p className="mt-4">
                      <Link href={`/day-trips/${t.slug}` as never} className="text-sm font-semibold text-olive-deep underline-offset-4 hover:underline">
                        See the day and book it
                      </Link>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="sand">
        <SectionTitle eyebrow="The small print" title="What a day trip price covers" />
        <div className="mt-9"><Terms included={dayTripIncluded} excluded={dayTripExcluded} /></div>
        <p className="mt-8 text-center"><Button href="/plan">Add day trips to a climb or safari</Button></p>
      </Section>
    </>
  );
}
