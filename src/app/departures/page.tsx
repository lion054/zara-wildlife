import type { Metadata } from "next";
import Link from "next/link";
import { DepartureCalendar } from "@/components/departure-calendar";
import { DepartureCard } from "@/components/departure-card";
import { PageIntro, tourItems } from "@/components/listing";
import { PhotoHero, Section } from "@/components/primitives";
import { SectionTitle } from "@/components/tsoka";
import { FilterGrid } from "@/components/ui";
import { upcomingGroupDepartures } from "@/lib/departures";
import { toursOfKind } from "@/lib/tours";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Group departures",
  description:
    "Fixed-date Kilimanjaro climbs with real prices and seats left. Join a group and pay less than a private climb.",
};

export default async function DeparturesPage() {
  const list = await upcomingGroupDepartures(30);

  return (
    <>
      <PhotoHero imageKey="hero-departures" height="min-h-[16rem] md:min-h-[21rem]">
        <PageIntro eyebrow="Group departures" title="Fixed dates. Real seats.">
          Join a group and pay less than a private climb.
        </PageIntro>
      </PhotoHero>

      <Section>
        {list.length > 0 ? (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28">
              <h2 className="mb-3 font-display text-xl">Departure calendar</h2>
              <DepartureCalendar
                mode="browse"
                departures={list.map((d) => ({ start: d.start, end: d.end, seatsLeft: d.seatsLeft, open: d.open, price: d.price, title: d.title, href: d.href }))}
              />
            </aside>
            <ol className="grid gap-5 md:grid-cols-2" aria-label="Upcoming group departures">
              {list.map((d) => (
                <li key={`${d.tourId}-${d.start}`}>
                  <DepartureCard d={d} />
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-3xl bg-frost p-8 text-center">
            <h2 className="font-display text-2xl">New dates are being added.</h2>
            <p className="mt-3 text-sm leading-relaxed text-scree">
              Pick a route below and join its list: we email you the moment a date opens. Or plan a private climb on any dates.
            </p>
            <Link
              href="/plan"
              className="mt-5 inline-block rounded-full bg-brand px-7 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt"
            >
              Plan a private climb
            </Link>
          </div>
        )}

        <div className="mt-14 grid gap-8 border-t border-mist pt-10 md:grid-cols-3">
          <div>
            <h2 className="font-display text-xl">How a group climb works</h2>
            <p className="mt-3 text-sm leading-relaxed text-scree">
              Eight to twelve climbers, two lead guides and a full crew. You share the crew cost, which is why it comes in below a
              private climb.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl">Solo travellers</h2>
            <p className="mt-3 text-sm leading-relaxed text-scree">
              No single supplement on a group departure. You get your own tent; share only if you want to.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl">If it does not fill</h2>
            <p className="mt-3 text-sm leading-relaxed text-scree">
              Departures run from four climbers. Below that we will offer you the next date or a full refund, decided 45 days out.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="frost">
        <SectionTitle
          eyebrow="Group packages"
          title="Climbing Kilimanjaro: group departure tours."
          lead="The itinerary, inclusions and group rate for each route we run on fixed dates."
        />
        <div className="mx-auto mt-12 max-w-6xl">
          <FilterGrid items={tourItems(toursOfKind("group"))} filters={[]} initial={6} />
        </div>
      </Section>
    </>
  );
}
