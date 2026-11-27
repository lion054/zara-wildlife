import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatedItinerary } from "@/components/dated-itinerary";
import { DepartureTags, PriceTag, type BoardDeparture } from "@/components/departure-board";
import { DepositSteps, IncludesList } from "@/components/group-sections";
import { HighlightIcon } from "@/components/highlight-icon";
import { ItineraryOverview } from "@/components/itinerary-overview";
import { Section } from "@/components/primitives";
import { ReserveButton } from "@/components/reserve-dialog";
import { RevealBar } from "@/components/reveal-bar";
import { TrustStrip } from "@/components/trust-strip";
import { departuresFor } from "@/lib/departures";
import { depositPerPerson, groupTerms, promoPrice } from "@/lib/group-terms";
import { trekDays } from "@/lib/itinerary";
import { groupTitle, routeHighlights } from "@/lib/route-facts";
import { withSeo } from "@/lib/seo";
import { seatState } from "@/lib/seats";
import { site } from "@/lib/site";
import { getTour, tourPath } from "@/lib/tours";

export const revalidate = 60;
type Props = { params: Promise<{ key: string; date: string }> };

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", o);
const span = (a: string, b: string | null) =>
  !b
    ? fmt(a, { day: "numeric", month: "long", year: "numeric" })
    : a.slice(0, 7) === b.slice(0, 7)
      ? `${fmt(a, { day: "numeric" })} – ${fmt(b, { day: "numeric", month: "long", year: "numeric" })}`
      : `${fmt(a, { day: "numeric", month: "long" })} – ${fmt(b, { day: "numeric", month: "long", year: "numeric" })}`;

async function load(key: string, date: string) {
  const tour = getTour(["group"], key);
  if (!tour || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [all, terms] = await Promise.all([departuresFor(tour), groupTerms(tour.tanovaId)]);
  const dep = all.find((d) => d.start === date);
  if (!dep) return null;
  return { tour, dep, all, terms };
}

/* One group date: its own page to share and to land on, but the route page stays the one search engines index. */
export async function generateMetadata({ params }: Props) {
  const { key, date } = await params;
  const x = await load(key, date);
  if (!x) return {};
  const title = `${groupTitle(x.tour)}, ${fmt(date, { day: "numeric", month: "short", year: "numeric" })}`;
  const left = x.dep.seatsLeft !== null ? ` ${x.dep.seatsLeft} of ${x.dep.capacity} places left.` : "";
  return withSeo(tourPath(x.tour), { title, description: `Group climb ${span(x.dep.start, x.dep.end)}.${left} Reserve your seat online.` }, x.tour.hero);
}

export default async function Page({ params }: Props) {
  const { key, date } = await params;
  const x = await load(key, date);
  if (!x) notFound();
  const { tour, dep, all, terms } = x;
  const title = groupTitle(tour);
  const hold = depositPerPerson(terms, dep.price);
  const promo = promoPrice(terms, dep.price);
  const minimum = terms?.minimum ?? 4;
  const d: BoardDeparture = {
    routeKey: tour.key,
    href: tourPath(tour),
    start: dep.start,
    end: dep.end,
    price: dep.price,
    promo,
    promoLabel: terms?.promo?.label ?? null,
    capacity: dep.capacity,
    seatsLeft: dep.seatsLeft,
    open: dep.open,
    hold,
  };
  const s = seatState(d, minimum);
  const highlights = routeHighlights(tour);
  const trek = trekDays(tour.days);
  const others = all.filter((o) => o.start !== dep.start && o.open).slice(0, 6);
  const reserve = (cls: string, label?: string) =>
    dep.open ? (
      <ReserveButton
        tourKey={`group:${tour.key}`}
        title={title}
        start={dep.start}
        end={dep.end}
        price={promo ?? dep.price}
        deposit={hold}
        seatsLeft={dep.seatsLeft}
        label={label ?? (hold ? `Book now · Pay $${hold}` : "Reserve my seats")}
        className={cls}
      />
    ) : (
      <Link href={`${tourPath(tour)}?date=${dep.start}#enquire`} className={cls}>
        Join the waitlist
      </Link>
    );

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${title} (group climb)`,
    startDate: dep.start,
    endDate: dep.end ?? dep.start,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: "Mount Kilimanjaro", address: "Kilimanjaro Region, Tanzania" },
    organizer: { "@type": "TravelAgency", name: site.name, url: site.url },
    ...(dep.price
      ? {
          offers: {
            "@type": "Offer",
            price: promo ?? dep.price,
            priceCurrency: "USD",
            availability: dep.open ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            url: `${site.url}${tourPath(tour)}/${dep.start}`,
          },
        }
      : {}),
    ...(tour.hero ? { image: `${site.url}${tour.hero.src}` } : {}),
  };

  return (
    <>
      <div className="bg-frost px-5 pb-10 pt-6 md:px-6 md:pb-14 md:pt-12">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap gap-x-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-scree md:mb-5 md:text-xs">
            <Link href="/departures" className="text-tanzanite hover:underline">Group climbs</Link>
            <span aria-hidden="true">/</span>
            <Link href={tourPath(tour)} className="hidden text-tanzanite hover:underline sm:inline">{title.replace(/^Kilimanjaro via /, "")}</Link>
            <span aria-hidden="true" className="hidden sm:inline">/</span>
            <span aria-current="page">{fmt(dep.start, { day: "numeric", month: "short", year: "numeric" })}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
            <div className="min-w-0">
              <p className="label text-tanzanite">Group climb</p>
              <h1 className="mt-2 font-display text-[2rem] leading-[1.05] text-basalt sm:text-[2.5rem] md:text-5xl">{title}</h1>
              <p className="mt-3 text-lg font-semibold text-basalt">{span(dep.start, dep.end)}</p>
              <div className="mt-4">
                <DepartureTags d={d} minimum={minimum} />
              </div>
              {tour.hero && (
                <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-3xl lg:hidden">
                  <Image src={tour.hero.src} alt="" fill priority sizes="(min-width: 1024px) 1px, 100vw" className="object-cover" />
                </div>
              )}

              {highlights.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {highlights.map((h) => (
                    <li key={h.text} className="flex items-center gap-3 text-[0.95rem] text-basalt md:text-base">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-glacier text-tanzanite ring-1 ring-mist">
                        <HighlightIcon icon={h.icon} />
                      </span>
                      {h.text}
                    </li>
                  ))}
                </ul>
              )}

              <div id="book-card" className="mt-7 rounded-3xl bg-glacier p-5 ring-1 ring-mist md:p-6">
                {dep.capacity !== null && s.taken !== null && (
                  <div>
                    <p className="flex items-baseline justify-between text-sm">
                      <span className="text-scree">Places already reserved</span>
                      <span className="text-lg font-semibold tabular-nums text-basalt">
                        {s.taken} / {dep.capacity}
                      </span>
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist" aria-hidden="true">
                      <div className="h-full rounded-full bg-tanzanite" style={{ width: `${Math.max(3, Math.round((s.taken / dep.capacity) * 100))}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-scree">
                      {s.guaranteed
                        ? "Guaranteed: enough climbers have booked for this date to run."
                        : `Runs from ${minimum} climbers. If it does not fill, you choose the next date or a full refund, decided 45 days out.`}
                    </p>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-mist pt-5">
                  <p>
                    <span className="label block text-[0.65rem] text-scree">Per person</span>
                    <PriceTag d={d} />
                  </p>
                  {hold ? (
                    <p className="text-right text-sm text-scree">
                      <span className="block font-semibold text-tanzanite">${hold} per person today</span>
                      the rest later, in any amounts
                    </p>
                  ) : null}
                </div>
                <div className="mt-5">
                  {reserve("block w-full rounded-full bg-brand px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.1em] text-basalt transition hover:bg-brand-bright")}
                </div>
                <p className="mt-3 text-center text-sm text-scree">
                  Questions first?{" "}
                  <a href={site.whatsappUrl} rel="noopener noreferrer" className="font-semibold text-tanzanite underline underline-offset-4">
                    WhatsApp us
                  </a>
                </p>
              </div>
              <TrustStrip className="mt-6" />
            </div>

            {tour.hero && (
              <div className="relative hidden overflow-hidden rounded-[28px] lg:block">
                <Image src={tour.hero.src} alt="" fill sizes="(min-width: 1024px) 45vw, 1px" className="object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      <Section>
        <div className="mx-auto max-w-5xl space-y-14 md:space-y-20">
          {trek.length >= 3 && (
            <ItineraryOverview days={trek} startDate={dep.start} />
          )}
          <DatedItinerary start={dep.start} days={tour.days.map((x) => ({ n: x.n, label: x.label, overnight: x.overnight ?? null, stats: x.stats, text: x.text }))} />
          <IncludesList tour={tour} />
          {terms && <DepositSteps terms={terms} />}

          {others.length > 0 && (
            <section aria-labelledby="other-dates">
              <h2 id="other-dates" className="font-display text-3xl md:text-4xl">Other dates on this route</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((o) => (
                  <li key={o.start}>
                    <Link href={`${tourPath(tour)}/${o.start}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-mist transition hover:ring-tanzanite/40">
                      <span>
                        <span className="block font-semibold text-basalt">{span(o.start, o.end)}</span>
                        {o.capacity !== null && o.seatsLeft !== null && (
                          <span className="text-xs text-scree">
                            {o.capacity - o.seatsLeft} / {o.capacity} reserved
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true" className="text-tanzanite">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/departures" className="mt-5 inline-block text-sm font-semibold text-tanzanite underline underline-offset-4">
                All group dates
              </Link>
            </section>
          )}
        </div>
      </Section>

      {/* The price bar: at hand on every screen size once the booking card has scrolled away. */}
      <RevealBar after="book-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="hidden truncate text-sm font-semibold text-basalt md:block">
              {title} · {span(dep.start, dep.end)}
            </p>
            <p className="text-sm text-scree">
              <span className="metric text-lg text-basalt">{dep.price ? `$${(promo ?? dep.price).toLocaleString()}` : "On request"}</span> per person
            </p>
          </div>
          {reserve("shrink-0 rounded-full bg-brand px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-basalt transition hover:bg-brand-bright md:px-7")}
        </div>
      </RevealBar>
      <div className="h-20" aria-hidden="true" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
