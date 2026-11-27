import Image from "next/image";
import Link from "next/link";
import { EnquiryForm } from "@/components/enquiry-form";
import { BookingForm } from "@/components/booking-form";
import { Collapse, MobileBookBar, PhotoGrid, Tabs } from "@/components/ui";
import { departuresFor } from "@/lib/departures";
import { balanceDue, depositLabel, depositPerPerson, groupTerms, promoPrice } from "@/lib/group-terms";
import { groupTitle } from "@/lib/route-facts";
import { trekDays } from "@/lib/itinerary";
import { ItineraryOverview } from "@/components/itinerary-overview";
import { tanovaConfigured } from "@/lib/tanova";
import { Button, Eyebrow, Section } from "@/components/primitives";
import { SectionTitle, TripCard } from "@/components/tsoka";
import { displayTitle, excerpt, tourPath, tours, type Img, type Tour, type TourKind } from "@/lib/tours";
import { withSeo } from "@/lib/seo";
import { site } from "@/lib/site";

const KIND: Record<TourKind, { label: string; back: { href: string; label: string }; bg: string }> = {
  kili: { label: "Kilimanjaro climb", back: { href: "/kilimanjaro", label: "Kilimanjaro" }, bg: "hero-kilimanjaro" },
  meru: { label: "Mount Meru climb", back: { href: "/kilimanjaro", label: "Kilimanjaro and Meru" }, bg: "hero-kilimanjaro" },
  group: { label: "Group departure", back: { href: "/departures", label: "Group departures" }, bg: "hero-departures" },
  safari: { label: "Wildlife safari", back: { href: "/safaris", label: "Safaris" }, bg: "hero-safaris" },
  combo: { label: "Combo trip", back: { href: "/combos", label: "Combo trips" }, bg: "hero-combos" },
  zanzibar: { label: "Zanzibar", back: { href: "/zanzibar", label: "Zanzibar" }, bg: "hero-zanzibar" },
  daytrip: { label: "Day trip", back: { href: "/day-trips", label: "Day trips" }, bg: "hero-daytrips" },
};

/** Short, unpunctuated lines in the source are sub-headings. */
const isHeading = (s: string) => s.length < 60 && !/[.!?]$/.test(s.trim());

function Text({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) =>
        isHeading(l) ? (
          <h3 key={i} className="mt-6 font-display text-xl text-basalt first:mt-0">
            {l.replace(/:$/, "")}
          </h3>
        ) : (
          <p key={i} className="mt-3 first:mt-0">
            {l}
          </p>
        ),
      )}
    </>
  );
}

function Pic({ img, alt, className = "", sizes = "(min-width: 1024px) 40vw, 100vw" }: { img: Img; alt: string; className?: string; sizes?: string }) {
  return (
    <Image
      src={img.src}
      alt={alt}
      width={img.width}
      height={img.height}
      sizes={sizes}
      className={`h-auto w-full rounded-[20px] object-cover ${className}`}
    />
  );
}

export async function TourPage({ tour }: { tour: Tour }) {
  /* What Tanova offers for this tour decides what the page lets you do. */
  const bookable = tanovaConfigured && Boolean(tour.tanovaId) && Boolean(tour.from || tour.fixedDate);
  const departures = tour.fixedDate && bookable ? await departuresFor(tour) : [];
  // A group climb's own payment terms (the deposit that holds a seat, when the rest is due), live from Tanova.
  const terms = tour.fixedDate && bookable ? await groupTerms(tour.tanovaId) : null;
  const nextOpen = departures.filter((d) => d.open).slice(0, 3);
  const hold = depositPerPerson(terms, tour.from);
  const promo = promoPrice(terms, tour.from);
  // Group climbs say what holds a seat today ("Book now · Pay $130"), like the price bar on every group date.
  const cta = tour.fixedDate ? (hold ? `Book now · Pay $${hold}` : "Reserve a seat") : bookable ? "Book now" : "Ask for a quote";
  // Group climbs are titled the way climbers search: "Kilimanjaro via Lemosho route – 7 days".
  const heading = tour.kind === "group" ? groupTitle(tour) : displayTitle(tour);
  const meta = KIND[tour.kind];
  const related = tours.filter((t) => t.kind === tour.kind && t.key !== tour.key).slice(0, 3);
  const duration = tour.duration?.replace(/\s*\|\s*/g, " · ");
  const isTrek = tour.kind === "kili" || tour.kind === "meru" || tour.kind === "group";
  const hidden = (l: string) => /pric/i.test(l) || /includes/i.test(l);
  const sections = tour.sections.filter((s) => !hidden(s.label));
  const summary = ((tour.overview[0] ?? "").replace(/\s+/g, " ").match(/^.*?[.!?](?=\s|$)/) ?? [""])[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.metaDescription ?? tour.overview[0],
    provider: { "@type": "TravelAgency", name: site.name, url: site.url },
    ...(tour.from
      ? { offers: { "@type": "Offer", priceCurrency: "USD", price: tour.from, url: `${site.url}${tourPath(tour)}` } }
      : {}),
    ...(tour.hero ? { image: `${site.url}${tour.hero.src}` } : {}),
  };

  /* ---- Tab panels ---- */
  const overview = (
    <div className="space-y-8">
      <div className="max-w-3xl text-base leading-relaxed text-scree md:text-lg">
        <Text lines={tour.overview} />
      </div>
      {tour.map && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tour.map.src} alt={`Map of the ${tour.title} route`} className="h-auto w-full max-w-xl rounded-2xl bg-frost p-4" />
      )}
      {sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <Collapse key={s.label} title={s.label} defaultOpen={i === 0}>
              <div className="max-w-3xl text-base leading-relaxed text-scree">
                <Text lines={s.text} />
              </div>
            </Collapse>
          ))}
        </div>
      )}
    </div>
  );

  const trek = trekDays(tour.days);
  const itinerary = (
    <>
    {trek.length >= 3 && <ItineraryOverview days={trek} startDate={departures.find((d) => d.open)?.start ?? null} />}
    <ol className="space-y-3">
      {tour.days.map((d, i) => {
        const stats = Object.values(d.stats).filter(Boolean);
        return (
          <li key={d.n} id={`day-${d.n}`} className="scroll-mt-28">
            <Collapse
              defaultOpen={i === 0}
              badge={<span className="metric shrink-0 rounded-full bg-tanzanite px-3 py-1 text-xs text-glacier">Day {d.n}</span>}
              title={d.label}
              meta={d.overnight ? `Overnight: ${d.overnight}` : undefined}
            >
              {stats.length > 0 && (
                <dl className="mb-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-frost px-4 py-3">
                  {Object.entries(d.stats).map(([k, v]) => (
                    <div key={k}>
                      <dt className="label text-scree">{k}</dt>
                      <dd className="metric text-sm text-basalt">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="text-base leading-relaxed text-scree">
                <Text lines={d.text} />
              </div>
              {d.images.length > 0 && (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {d.images.slice(0, 2).map((im) => (
                    <li key={im.src}>
                      <Pic img={im} alt="" className="aspect-[3/2]" sizes="(min-width: 1024px) 30vw, 100vw" />
                    </li>
                  ))}
                </ul>
              )}
            </Collapse>
          </li>
        );
      })}
    </ol>
    </>
  );

  const included = (
    <div className="grid gap-5 md:grid-cols-2">
      {([
        ["Included", tour.included, "text-tanzanite", "✓"],
        ["Not included", tour.excluded, "text-sunrise-ink", "–"],
      ] as const)
        .filter(([, items]) => items.length > 0)
        .map(([title, items, tint, mark]) => (
          <div key={title} className="rounded-2xl bg-frost p-6">
            <h3 className="font-display text-xl">{title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-scree">
              {items.map((it) => (
                <li key={it.text} className={`flex gap-3 ${it.sub ? "ml-7 text-xs" : ""}`}>
                  {!it.sub && (
                    <span aria-hidden="true" className={`font-bold ${tint}`}>
                      {mark}
                    </span>
                  )}
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );

  const place = (a: Tour["accommodation"][number], i: number) => (
    <article key={`${a.name}-${i}`} className="grid gap-5 rounded-2xl bg-frost p-5 md:grid-cols-[260px_1fr]">
      <div>
        {a.images[0] && <Pic img={a.images[0]} alt={a.name ?? ""} className="aspect-[4/3]" sizes="(min-width: 768px) 260px, 100vw" />}
        {a.images.length > 1 && (
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {a.images.slice(1, 4).map((im) => (
              <li key={im.src}>
                <Pic img={im} alt="" className="aspect-[4/3] !rounded-xl" sizes="90px" />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="font-display text-xl text-basalt">{a.name ?? `Stay ${i + 1}`}</h3>
        {a.location && <p className="label mt-1 text-tanzanite">{a.location}</p>}
        <div className="mt-3 text-sm leading-relaxed text-scree">
          {a.description.filter((p) => !p.startsWith("##")).slice(0, 2).map((p) => (
            <p key={p} className="mt-2 first:mt-0">
              {p}
            </p>
          ))}
        </div>
        {a.amenities.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {a.amenities.slice(0, 8).map((x) => (
              <li key={x} className="rounded-full bg-glacier px-2.5 py-1 text-[11px] text-basalt ring-1 ring-mist">
                {x}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );

  const stay = (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-scree">
        Where you sleep on this trip, in order. We use these places or similar ones of the same standard.
      </p>
      {tour.accommodation.slice(0, 3).map(place)}
      {tour.accommodation.length > 3 && (
        <details className="group/more">
          <summary className="mx-auto w-fit cursor-pointer list-none rounded-full border border-tanzanite/25 bg-glacier px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite hover:bg-tanzanite hover:text-glacier group-open/more:hidden [&::-webkit-details-marker]:hidden">
            See more ({tour.accommodation.length - 3})
          </summary>
          <div className="space-y-4">{tour.accommodation.slice(3).map((a, i) => place(a, i + 3))}</div>
        </details>
      )}
    </div>
  );

  const gallery = <PhotoGrid items={tour.gallery} initial={4} />;

  const tabs = [
    { id: "overview", label: "Overview", content: overview },
    ...(tour.days.length > 0 ? [{ id: "itinerary", label: trek.length >= 3 ? `Itinerary · ${trek.length} days on the mountain` : "Itinerary", content: itinerary }] : []),
    ...(tour.included.length + tour.excluded.length > 0 ? [{ id: "included", label: "Included", content: included }] : []),
    ...(tour.accommodation.length > 0 ? [{ id: "stay", label: `Accommodation · ${tour.accommodation.length}`, content: stay }] : []),
    ...(tour.gallery.length > 0 ? [{ id: "photos", label: "Photos", content: gallery }] : []),
  ];

  return (
    <>
      {/* ---- Header ---- */}
      <div className="bg-frost px-6 pb-10 pt-12 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs uppercase tracking-[0.12em] text-scree">
            <Link href={meta.back.href} className="text-tanzanite hover:underline">
              {meta.back.label}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{tour.kind === "group" ? heading.replace(/^Kilimanjaro via /, "") : tour.title}</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <div>
              <Eyebrow>{meta.label}</Eyebrow>
              <h1 className="font-display text-4xl leading-[1.05] md:text-5xl">{heading}</h1>
              {summary && <p className="mt-4 line-clamp-3 max-w-xl text-base leading-relaxed text-scree">{summary}</p>}
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {duration && <li className="metric rounded-full bg-glacier px-4 py-1.5 ring-1 ring-mist">{duration}</li>}
                {tour.places.length > 0 && (
                  <li className="rounded-full bg-glacier px-4 py-1.5 ring-1 ring-mist">
                    {tour.places.length} {isTrek ? "camps" : tour.places.length === 1 ? "destination" : "destinations"}
                  </li>
                )}
                <li className="metric rounded-full bg-tanzanite px-4 py-1.5 text-glacier">
                  {tour.from ? `From $${(promo ?? tour.from).toLocaleString()}` : "Price on request"}
                </li>
                {hold ? <li className="rounded-full bg-brand px-4 py-1.5 font-semibold text-basalt">Reserve for ${hold} pp</li> : null}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="#enquire">{cta}</Button>
                <Button href="/plan" variant="outline">
                  Plan my trip
                </Button>
              </div>
            </div>
            {tour.hero && <Pic img={tour.hero} alt="" className="aspect-[16/11] shadow-[0_30px_60px_-30px_rgba(43,44,16,0.45)]" />}
          </div>
        </div>
      </div>

      {/* ---- Body: tabs + sticky booking card ---- */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 pb-28 md:py-14 lg:grid-cols-[1fr_340px] lg:pb-14">
        <Tabs tabs={tabs} label={`${tour.title} details`} className="min-w-0" />

        <aside className="h-fit lg:sticky lg:top-6">
          <div className="rounded-3xl bg-glacier p-6 shadow-[0_24px_60px_-28px_rgba(43,44,16,0.4)] ring-1 ring-mist">
            <p className="label text-scree">{tour.ladder.length > 1 ? "From, per person" : "Price per person"}</p>
            <p className="mt-1">
              {promo && tour.from ? <s className="mr-2 text-lg text-scree">${tour.from.toLocaleString()}</s> : null}
              <span className="metric text-4xl text-tanzanite">{tour.from ? `$${(promo ?? tour.from).toLocaleString()}` : "On request"}</span>
            </p>
            {hold ? (
              <p className="mt-2 rounded-xl bg-brand/15 px-3 py-2 text-sm text-basalt">
                <span className="font-semibold">${hold} per person</span> reserves your seat. The rest later, in any amounts.
              </p>
            ) : null}
            {tour.ladder.length > 1 && (
              <table className="mt-4 w-full text-sm">
                <caption className="sr-only">Price per person by group size, US dollars</caption>
                <tbody>
                  {tour.ladder.map((r) => (
                    <tr key={r.size} className="border-t border-mist">
                      <th scope="row" className="py-2 text-left font-normal text-scree">{r.size}</th>
                      <td className="metric py-2 text-right text-basalt">{r.price ? `$${r.price.toLocaleString()}` : "On request"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tour.hasGroupNote && tour.ladder.length > 0 && (
              <p className="mt-3 text-xs text-scree">Group rate: the same whatever the size of the party.</p>
            )}
            {tour.fixedDate && (
              <div className="mt-4 border-t border-mist pt-3">
                <p className="label text-scree">Next departures</p>
                {nextOpen.length ? (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {nextOpen.map((d) => (
                      <li key={d.start} className="flex items-center justify-between gap-3">
                        <a href={`${tourPath(tour)}/${d.start}`} className="text-basalt hover:text-tanzanite">
                          {new Date(`${d.start}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </a>
                        <span className="label text-scree">{d.seatsLeft !== null && d.seatsLeft <= 4 ? `${d.seatsLeft} left` : d.capacity !== null && d.seatsLeft !== null ? `${d.capacity - d.seatsLeft}/${d.capacity} reserved` : "Open"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-scree">New dates are being added. Join the list and we will email you first.</p>
                )}
              </div>
            )}
            <Link
              href="#enquire"
              className="mt-5 block rounded-full bg-brand px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright"
            >
              {cta}
            </Link>
            <a
              href={site.whatsappUrl}
              rel="noopener noreferrer"
              className="mt-3 block rounded-full border border-tanzanite/25 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite hover:bg-tanzanite hover:text-glacier"
            >
              Ask on WhatsApp
            </a>
            <p className="mt-4 text-center text-xs text-scree">Reply within one working day.</p>
          </div>
        </aside>
      </div>

      {/* ---- Booking (live in Tanova) or enquiry ---- */}
      <Section tone="basalt" bgKey={meta.bg} id="enquire">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="label text-brand">{tour.fixedDate ? "Group departure" : bookable ? "Book online" : "Ask us"}</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              {tour.fixedDate ? "Reserve your seats" : bookable ? "Book this trip" : "Tell us your dates"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-glacier/90">
              {bookable
                ? tour.fixedDate
                  ? "Pick a departure, tell us who is coming and hold your seats. You get a booking code straight away."
                  : "Choose a date and your party size. You get a booking code straight away, and the office confirms within one working day."
                : "Tell us when and who. The Moshi office replies within one working day with dates and a firm price."}
            </p>
            <p className="mt-5 text-sm text-glacier/85">
              Prefer to talk?{" "}
              <a href={site.whatsappUrl} rel="noopener noreferrer" className="font-semibold underline decoration-brand underline-offset-4">
                WhatsApp {site.contact.phone}
              </a>
            </p>
          </div>
          <div className="rounded-3xl bg-glacier p-6 text-scree md:p-8">
            {bookable ? (
              <BookingForm
                tourKey={`${tour.kind}:${tour.key}`}
                title={tour.title}
                fixedDate={Boolean(tour.fixedDate)}
                departures={departures.map((d) => ({ start: d.start, end: d.end, seatsLeft: d.seatsLeft, open: d.open, price: d.price }))}
                ladder={tour.ladder}
                deposit={
                  terms
                    ? { type: terms.depositType, amount: terms.depositAmount, label: depositLabel(terms), due: balanceDue(terms), topups: terms.topups }
                    : undefined
                }
              />
            ) : (
              <EnquiryForm kind="trip" hidden={{ tour: tour.title, tourKey: `${tour.kind}:${tour.key}`, type: tour.kind }} submitLabel="Send enquiry" />
            )}
          </div>
        </div>
      </Section>

      {/* ---- Related ---- */}
      {related.length > 0 && (
        <Section>
          <SectionTitle eyebrow="Keep looking" title={`More ${meta.label.toLowerCase()}s`} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <TripCard
                key={t.key}
                href={tourPath(t)}
                image={t.hero ? { src: t.hero.src, alt: "" } : undefined}
                title={displayTitle(t)}
                excerpt={excerpt(t, 110)}
                meta={t.duration ? [{ k: "Duration", v: t.duration.replace(/\s*\|\s*/g, " · ") }] : []}
                price={t.from}
                cta="View tour"
              />
            ))}
          </div>
        </Section>
      )}

      <MobileBookBar price={promo ?? tour.from} label={hold ? "Per person" : undefined} cta={cta} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}

export function tourMetadata(t: Tour | undefined) {
  if (!t) return {};
  return withSeo(tourPath(t), { title: displayTitle(t), description: snippet(t.metaDescription ?? t.overview[0] ?? "") }, t.hero);
}

/** A description that ends on a whole word, near the ~155 characters a search result shows. */
function snippet(s: string, max = 158): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}
