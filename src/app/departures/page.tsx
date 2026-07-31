import type { Metadata } from "next";
import { departures } from "@/lib/trips";
import { kilimanjaroRoutes } from "@/lib/routes";
import { site } from "@/lib/site";
import { Section, SectionTitle, PageHero, Button, Eyebrow } from "@/components/primitives";
import { DepartureRow, RouteTable } from "@/components/blocks";

export const metadata: Metadata = {
  title: "Kilimanjaro group departures — fixed dates and real seats",
  description: `${departures.length} fixed-date Kilimanjaro group departures, each with a confirmed price and a live seat count. Deposit 30%, balance at 45 days.`,
  alternates: { canonical: "/departures" },
};

export default function DeparturesPage() {
  const open = departures.filter((d) => d.capacity - d.booked > 0);
  const full = departures.filter((d) => d.capacity - d.booked <= 0);
  const biggest = Math.max(...departures.map((d) => d.capacity));

  return (
    <>
      <PageHero eyebrow="Group departures" title="Fixed dates, real seats"
        lead="Join a group and pay less than a private climb. Each date below carries a price we will honour and a seat count that goes down as people book."
        photoKey="hero-departures"
        crumbs={[{ label: "Home", href: "/" }, { label: "Climb", href: "/kilimanjaro" }, { label: "Group departures", href: "/departures" }]} />

      <Section tone="cream">
        <SectionTitle eyebrow={`${open.length} dates open, ${full.length} sold out`}
          title="Every date, with the seats that are actually left"
          lead="Nothing appears on this page without both a confirmed price and a confirmed capacity. A departure that is full says so, and the waitlist is real — we call it when someone cancels." />
        <div className="mt-11">{open.map((d) => <DepartureRow key={d.id} {...d} />)}</div>

        {full.length > 0 && (
          <>
            <h2 className="mb-[18px] mt-11 text-[22px]">Sold out</h2>
            {full.map((d) => <DepartureRow key={d.id} {...d} />)}
          </>
        )}

        <div className="mt-11 rounded bg-paper p-[30px]">
          <h2 className="mb-3.5 text-[21px]">What a group departure includes</h2>
          <p className="leading-[1.75] text-muted">
            The same crew, the same food, the same equipment and the same route as a private climb —
            you simply share the guide and the gate fees with up to {biggest} others. Two nights at
            the {site.baseHotel.name} in {site.baseHotel.town}
            {site.baseHotel.orSimilar ? " or similar" : ""} are included, one before the climb and one
            after. {site.baseHotel.note}
          </p>
          <p className="mt-3 leading-[1.75] text-muted">
            A 30% deposit confirms your seat. The balance is due 45 days before you walk in. Single
            climbers are paired in a tent by default; a single supplement is available on request.
          </p>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-[62ch]">
            <Eyebrow>No date works?</Eyebrow>
            <h2 className="text-[33px] leading-[1.22]">Private climbs run any day of the year</h2>
            <p className="prose-lead mt-3.5">
              Pick the route, tell us the month, and we build the climb around you. Two of you costs
              less per head than one; six costs less again. The whole ladder is on each route page.
            </p>
          </div>
          <Button href="/kilimanjaro">Compare the routes</Button>
        </div>
        <div className="mt-10"><RouteTable routes={kilimanjaroRoutes} /></div>
      </Section>
    </>
  );
}
