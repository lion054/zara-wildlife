import type { Metadata } from "next";
import Link from "next/link";
import { DepartureBoard, type BoardDeparture, type BoardRoute } from "@/components/departure-board";
import { PageIntro, tourItems } from "@/components/listing";
import { PhotoHero, Section } from "@/components/primitives";
import { SectionTitle } from "@/components/tsoka";
import { FilterGrid } from "@/components/ui";
import { upcomingGroupDepartures } from "@/lib/departures";
import { balanceDue, depositLabel, depositPerPerson, groupTerms } from "@/lib/group-terms";
import { toursOfKind } from "@/lib/tours";
import { withSeo } from "@/lib/seo";
import { photo } from "@/lib/photos";

export const revalidate = 60;

export const metadata: Metadata = withSeo("/departures", {
  title: "Group departures",
  description:
    "Fixed-date Kilimanjaro climbs with real prices and seats left. Join a group and pay less than a private climb.",
}, photo("hero-departures"));

/** Each route's colour on the board: distinct, and from the site's own palette. */
const ROUTE_COLORS: Record<string, string> = {
  "lemosho-route-7": "#3f7d2a",
  "lemosho-route-8": "#566a1b",
  "machame-route-7": "#01b2e0",
  "marangu-route-6": "#e8751a",
  "rongai-route-7": "#c9a14a",
  "shira-route-7": "#9dab1f",
};
const FALLBACK = ["#3f7d2a", "#01b2e0", "#e8751a", "#c9a14a", "#9dab1f", "#566a1b"];

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", o);

export default async function DeparturesPage() {
  const list = await upcomingGroupDepartures(200);
  const groupTours = toursOfKind("group");
  const routes: BoardRoute[] = groupTours.map((t, i) => ({
    key: t.key,
    name: t.title.split(/\s+Group Departure/)[0],
    days: parseInt(t.duration ?? "", 10) || null,
    startsAt: t.places?.[0] ?? null,
    color: ROUTE_COLORS[t.key] ?? FALLBACK[i % FALLBACK.length],
    photo: t.hero ?? null,
  }));
  // Each climb's payment terms, live from Tanova: what holds a seat, and when the rest is due.
  const termsByKey = new Map(await Promise.all(groupTours.map(async (t) => [t.key, await groupTerms(t.tanovaId)] as const)));
  const terms = [...termsByKey.values()].find(Boolean) ?? null;
  const departures: BoardDeparture[] = list.map((d) => ({
    routeKey: d.tourKey,
    href: d.href,
    start: d.start,
    end: d.end,
    price: d.price,
    capacity: d.capacity,
    seatsLeft: d.seatsLeft,
    open: d.open,
    hold: depositPerPerson(termsByKey.get(d.tourKey) ?? null, d.price),
  }));
  const next = list.find((d) => d.open);
  const nextRoute = next ? routes.find((r) => r.key === next.tourKey) : undefined;
  const lowest = Math.min(...list.filter((d) => d.price).map((d) => d.price as number));
  const lowestHold = depositPerPerson(terms, Number.isFinite(lowest) ? lowest : null);
  const stats = [
    { k: "Next group leaves", v: next ? fmt(next.start, { weekday: "short", day: "numeric", month: "short" }) : "Soon", s: nextRoute?.name },
    { k: "Routes", v: String(new Set(list.map((d) => d.tourKey)).size), s: "on fixed dates" },
    { k: "Open dates", v: String(list.filter((d) => d.open).length), s: "12 seats each" },
    terms && lowestHold
      ? { k: "Hold a seat from", v: `$${lowestHold.toLocaleString()}`, s: `a ${depositLabel(terms)} deposit, the rest later` }
      : { k: "From", v: Number.isFinite(lowest) ? `$${lowest.toLocaleString()}` : "On request", s: "per person" },
  ];
  const steps = terms
    ? [
        { n: "01", t: "Pick your date", b: "Choose a route and a departure with seats. You see the price per person and the seats left before you commit." },
        {
          n: "02",
          t: `Hold your seat with ${depositLabel(terms)}`,
          b: `Pay a ${depositLabel(terms)} deposit online and your seat is yours, with a booking code straight away. Prefer to pay in full? You can.`,
        },
        {
          n: "03",
          t: "Pay the rest your way",
          b: terms.topups
            ? `Top up any amount, whenever it suits you, from your booking's payment link. The balance is due ${balanceDue(terms)}.`
            : `The balance is due ${balanceDue(terms)}, from your booking's payment link.`,
        },
      ]
    : null;

  return (
    <>
      <PhotoHero imageKey="hero-departures" height="min-h-[20rem] md:min-h-[26rem]">
        <PageIntro eyebrow="Group departures" title="Fixed dates. Real seats.">
          Join a small group on Kilimanjaro and pay less than a private climb. Pick a date, see the seats left, and hold your seat with a small deposit.
        </PageIntro>
      </PhotoHero>

      {list.length > 0 && (
        <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-5 md:-mt-16 md:px-8">
          <dl className="grid grid-cols-2 divide-mist overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-30px_rgba(20,19,12,0.45)] ring-1 ring-mist md:grid-cols-4 md:divide-x">
            {stats.map((x) => (
              <div key={x.k} className="px-5 py-5 md:px-7 md:py-6">
                <dt className="label text-[0.65rem] text-scree">{x.k}</dt>
                <dd className="mt-1.5 font-display text-2xl leading-tight text-basalt md:text-3xl">{x.v}</dd>
                {x.s && <dd className="mt-0.5 truncate text-xs text-scree">{x.s}</dd>}
              </div>
            ))}
          </dl>
        </div>
      )}

      <Section>
        {list.length > 0 ? (
          <DepartureBoard routes={routes} departures={departures} />
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

        {steps && (
          <section className="mt-20 overflow-hidden rounded-[28px] bg-basalt text-glacier on-dark" aria-labelledby="how-booking">
            <div className="grid gap-10 p-8 md:p-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-14">
              <div>
                <p className="label text-brand">How booking works</p>
                <h2 id="how-booking" className="mt-3 font-display text-3xl md:text-4xl">
                  {terms ? `${depositLabel(terms)} today.` : ""} The rest when it suits you.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-glacier/75">
                  Your booking code arrives by email the moment your seat is held. The full details are in our{" "}
                  <Link href="/terms" className="underline underline-offset-4">booking terms</Link>.
                </p>
              </div>
              <ol className="grid gap-4 md:grid-cols-3">
                {steps.map((s) => (
                  <li key={s.n} className="rounded-2xl border border-glacier/10 bg-glacier/[0.04] p-6">
                    <span className="font-mono text-sm text-brand">{s.n}</span>
                    <h3 className="mt-3 font-display text-xl">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-glacier/75">{s.b}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {list.length > 0 && (
          <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-frost p-8 ring-1 ring-mist md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Can&rsquo;t find a date that fits?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-scree">
                Tell us when you can travel. We can open a new group date, or plan a private climb on exactly your dates.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/plan" className="rounded-full bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt hover:bg-brand-bright">
                Request dates
              </Link>
              <Link href="/kilimanjaro" className="rounded-full border border-tanzanite/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite hover:bg-tanzanite/5">
                Private climbs
              </Link>
            </div>
          </div>
        )}

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { big: "8–12", unit: "climbers", t: "How a group climb works", b: "Two lead guides and a full crew for every group. You share the crew cost, which is why it comes in below a private climb." },
            { big: "$0", unit: "single supplement", t: "Solo travellers welcome", b: "Your own tent at no extra cost; share only if you want to." },
            { big: "4", unit: "climbers to run", t: "If it does not fill", b: "Departures run from four climbers. Below that we offer you the next date or a full refund, decided 45 days out." },
          ].map((c) => (
            <article key={c.t} className="rounded-3xl bg-frost p-7 ring-1 ring-mist">
              <p className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-tanzanite">{c.big}</span>
                <span className="label text-scree">{c.unit}</span>
              </p>
              <h2 className="mt-5 font-display text-xl">{c.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-scree">{c.b}</p>
            </article>
          ))}
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
