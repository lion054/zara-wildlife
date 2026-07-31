import Link from "next/link";
import { site, guides } from "@/lib/site";
import { reviews } from "@/lib/reviews";
import { getRoute } from "@/lib/routes";
import { departures } from "@/lib/trips";
import type { Route } from "@/lib/routes";
import type { Faq } from "@/lib/faqs";
import type { Term } from "@/lib/inclusions";
import { money, metres, dateParts, longDate, routeBadges } from "@/lib/format";
import { Section, SectionTitle, Pill, Badge, SeatBar, Unverified, Button, difficultyTone } from "@/components/primitives";
import { TripadvisorLockup, TripadvisorOwl } from "@/components/tripadvisor";
import { AskTwaCell } from "@/components/ask-twa";

/* ------------------------------------------------------------------ *
 * Reviews
 * ------------------------------------------------------------------ */

export function ReviewBand({
  items = reviews.slice(0, 3),
  title = "What guests say",
  lead,
  id = "reviews",
}: {
  items?: typeof reviews;
  title?: string;
  lead?: string;
  id?: string;
}) {
  if (!items.length) return null;
  return (
    <Section tone="sand" id={id}>
      {/* The lockup, not the word. This band is the site's evidence, and the
          evidence is somebody else's — the mark is what says so. Sand is light
          enough to carry the black wordmark unplated. */}
      <div className="mb-5 flex justify-center">
        <a
          href={site.reviews.url}
          target="_blank"
          rel="noopener"
          aria-label={`Read all ${site.reviews.count} Tripadvisor reviews. Opens in a new tab.`}
          className="inline-block opacity-90 transition-opacity hover:opacity-100"
        >
          <TripadvisorLockup width={132} />
        </a>
      </div>
      <SectionTitle
        eyebrow={`${site.reviews.rating}.0 from ${site.reviews.count} reviews`}
        title={title}
        lead={lead}
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((r) => (
          <blockquote key={r.author + r.title} className="rounded border border-line bg-white p-[26px]">
            <span aria-hidden className="tracking-[2px] text-amber">{"★★★★★"}</span>
            <span className="sr-only">Rated 5 out of 5</span>
            <h3 className="mb-2 mt-3 text-[17px]">{r.title}</h3>
            <p className="mb-4 text-[15px] leading-[1.75] text-muted">&ldquo;{r.quote}&rdquo;</p>
            <footer className="flex items-start gap-2.5 text-[13px] font-semibold text-slate">
              <TripadvisorOwl size={16} className="mt-0.5" />
              <span>
                {r.author}
                <span className="mt-0.5 block font-normal text-muted">
                  {r.trip}
                  {r.guide && ` · guided by ${r.guide}`}
                </span>
              </span>
            </footer>
          </blockquote>
        ))}
      </div>
      <p className="mt-10 text-center">
        <Button href={site.reviews.url} variant="ghost" external className="inline-flex items-center gap-2.5">
          <TripadvisorOwl size={18} />
          Read all {site.reviews.count} reviews on {site.reviews.platform}
        </Button>
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * FAQ — native <details>, so it works with no JavaScript and is
 * keyboard-operable for free.
 * ------------------------------------------------------------------ */

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.q} className="group border-b border-line">
          <summary className="cursor-pointer list-none py-5 pr-10 text-[17px] font-semibold text-ink hover:text-olive-deep [&::-webkit-details-marker]:hidden">
            <span className="relative block">
              {f.q}
              {/* One glyph rotated, rather than two swapped — a + that turns
                  into a – is the transition; a + that vanishes is not. */}
              <span
                aria-hidden
                className="absolute right-[-30px] top-0 text-2xl font-normal leading-none text-olive-deep transition-transform duration-[var(--dur-base)] ease-[var(--ease-soft)] group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <div className="pb-[22px] pr-10 text-[15px] leading-[1.75] text-muted">{f.a}</div>
        </details>
      ))}
    </div>
  );
}

export const faqJsonLd = (items: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({
    "@type": "Question",
    name: i.q,
    acceptedAnswer: { "@type": "Answer", text: i.a },
  })),
});

/* ------------------------------------------------------------------ *
 * Route comparison table
 * ------------------------------------------------------------------ */

/**
 * All routes side by side. The live site sells every one of these and gives the
 * reader no way to compare them — which is the single decision that most
 * affects whether somebody summits and what they pay.
 */
export function RouteTable({ routes: rs }: { routes: readonly Route[] }) {
  return (
    <div>
      {/* ---------------------------------------------------------------- *
       * Below md: cards, not a scrolled table.
       *
       * A seven-column comparison does not survive a 430px screen. Kept as a
       * table it needed 760px, so the reader had to swipe sideways to reach
       * the two columns they came for — price and summit rate — while the
       * "best for" sentence wrapped to one or two words a line and pushed
       * every row past 200px tall. The comparison the page exists to make
       * was the thing you could not do on a phone.
       *
       * Same data, same order, same flags. What changes is that each route
       * becomes a self-contained card with its figures in a fixed two-column
       * grid, so they still line up down the page and nothing is off-screen.
       * ---------------------------------------------------------------- */}
      <ul className="space-y-3 md:hidden">
        {rs.map((r) => (
          <li key={r.slug} className="rounded border border-line bg-white">
            <Link href={`/kilimanjaro/${r.slug}`} className="block px-[18px] pb-4 pt-[18px]">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[17px] font-bold text-ink">{r.name}</span>
                {routeBadges(r, rs).map((b) => <Badge key={b.kind} {...b} />)}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted">
                <span className="metric font-semibold text-slate">{r.days} days</span>
                <span aria-hidden>·</span>
                <Pill tone={difficultyTone(r.difficulty)}>{r.difficulty}</Pill>
                <span aria-hidden>·</span>
                <span>{r.traffic}</span>
              </span>
              <span className="mt-2 block text-[13.5px] leading-[1.55] text-muted">{r.bestFor}</span>
            </Link>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line px-[18px] py-3.5">
              <div>
                <dt className="label text-muted">Summit rate</dt>
                <dd className="metric mt-0.5 text-[17px] font-bold text-ink">
                  {r.successRate}%
                  {!r.successVerified && (
                    <span className="mt-1 block"><Unverified>Own data to confirm</Unverified></span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="label text-muted">From</dt>
                <dd className="metric mt-0.5 text-[17px] font-bold text-olive-deep">
                  {money(r.price)}
                  {!r.priceVerified && (
                    <span className="mt-1 block"><Unverified>To confirm</Unverified></span>
                  )}
                </dd>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-3">
                <div>
                  <dt className="label text-muted">Scenery</dt>
                  <dd className="mt-0.5">
                    <span aria-hidden className="whitespace-nowrap tracking-[0.12em]">
                      <span className="text-olive-deep">{"●".repeat(r.scenery)}</span>
                      <span className="text-line">{"●".repeat(5 - r.scenery)}</span>
                    </span>
                    <span className="sr-only">{r.scenery} out of 5</span>
                  </dd>
                </div>
                <Link
                  href={`/kilimanjaro/${r.slug}`}
                  className="shrink-0 rounded-[3px] border border-olive-deep px-4 py-2.5 text-sm font-semibold text-olive-deep transition-colors hover:bg-olive-deep hover:text-white"
                >
                  See this route
                </Link>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded border border-line md:block">
        <table className="w-full min-w-[760px] border-collapse bg-white text-[15px]">
          <caption className="sr-only">
            Kilimanjaro and Meru routes compared by length, difficulty, summit rate, traffic and price
          </caption>
          <thead className="bg-ink text-white">
            <tr>
              {[
                { h: "Route", w: "w-[30%]" },
                { h: "Days", w: "w-[6%]" },
                { h: "Difficulty", w: "w-[13%]" },
                { h: "Summit rate", w: "w-[16%]" },
                { h: "Traffic", w: "w-[10%]" },
                { h: "Scenery", w: "w-[11%]" },
                { h: "From", w: "w-[10%]" },
                { h: "", w: "w-[4%]" },
              ].map(({ h, w }, i) => (
                <th key={h || i} scope="col" className={`label px-[18px] py-4 text-left align-bottom ${w}`}>
                  {h ? <span className="whitespace-nowrap">{h}</span> : <span className="sr-only">Link</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rs.map((r) => (
              <tr key={r.slug} className="border-b border-line transition-colors duration-[var(--dur-fast)] last:border-b-0 hover:bg-cream">
                <th scope="row" className="px-[18px] py-4 text-left align-top">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link href={`/kilimanjaro/${r.slug}`} className="text-base font-bold text-ink hover:text-olive-deep">
                      {r.name}
                    </Link>
                    {routeBadges(r, rs).map((b) => <Badge key={b.kind} {...b} />)}
                  </span>
                  <span className="mt-1 block text-[13px] font-normal leading-[1.5] text-muted">{r.bestFor}</span>
                </th>
                <td className="metric px-[18px] py-4 align-top">{r.days}</td>
                <td className="px-[18px] py-4 align-top"><Pill tone={difficultyTone(r.difficulty)}>{r.difficulty}</Pill></td>
                <td className="metric px-[18px] py-4 align-top">
                  {r.successRate}%
                  {!r.successVerified && <span className="mt-1 block"><Unverified>Own data to confirm</Unverified></span>}
                </td>
                <td className="px-[18px] py-4 align-top">{r.traffic}</td>
                <td className="px-[18px] py-4 align-top">
                  <span aria-hidden className="whitespace-nowrap tracking-[0.12em]">
                    <span className="text-olive-deep">{"●".repeat(r.scenery)}</span>
                    <span className="text-line">{"●".repeat(5 - r.scenery)}</span>
                  </span>
                  <span className="sr-only">{r.scenery} out of 5</span>
                </td>
                <td className="metric whitespace-nowrap px-[18px] py-4 align-top font-bold text-olive-deep">
                  {money(r.price)}
                  {!r.priceVerified && <span className="mt-1 block"><Unverified>To confirm</Unverified></span>}
                </td>
                <td className="px-[18px] py-4 align-top">
                  <Link href={`/kilimanjaro/${r.slug}`} className="whitespace-nowrap text-sm font-semibold text-olive-deep hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Only for the narrow band where the table is shown but has not yet
          reached its 760px minimum. Below md there is nothing to scroll. */}
      <p className="mt-2 hidden text-xs text-muted md:block min-[820px]:hidden">
        Scroll the table sideways to see price and summit rate.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Inclusions
 * ------------------------------------------------------------------ */

export function Terms({ included, excluded }: { included: readonly Term[]; excluded: readonly Term[] }) {
  const item = (t: Term, kind: "in" | "out") => (
    <li key={t.text} className="border-b border-line py-2.5 pl-8 last:border-b-0 relative text-[15px] text-slate">
      <span aria-hidden className={`absolute left-0 top-2.5 ${kind === "in" ? "text-olive-deep" : "text-brick-dark"}`}>
        {kind === "in" ? "✓" : "✕"}
      </span>
      {t.text}
      {t.detail && <span className="mt-0.5 block text-[13px] text-muted">{t.detail}</span>}
    </li>
  );
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h3 className="mb-4 text-[21px]">What the price includes</h3>
        <ul>{included.map((t) => item(t, "in"))}</ul>
      </div>
      <div>
        <h3 className="mb-4 text-[21px]">What it does not</h3>
        <ul>{excluded.map((t) => item(t, "out"))}</ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Departures
 * ------------------------------------------------------------------ */

export function DepartureRow({ id, routeSlug, start, end, price, capacity, booked }: (typeof departures)[number]) {
  const r = getRoute(routeSlug);
  if (!r) return null;
  const p = dateParts(start);
  const left = capacity - booked;
  return (
    <div
      id={id}
      className={`mb-3.5 grid scroll-mt-[124px] items-center gap-6 rounded border border-line p-[22px] md:grid-cols-[150px_1fr_190px_170px] ${
        left ? "bg-white" : "bg-paper"
      }`}
    >
      <p className="text-xl font-bold leading-tight text-ink">
        {p.day} {p.month}
        <span className="block text-[13px] font-normal text-muted">{p.year}</span>
      </p>
      <p className="text-lg font-semibold text-ink">
        <Link href={`/kilimanjaro/${r.slug}`} className="hover:text-olive-deep">{r.name} Route</Link> · {r.days} days
        <span className="mt-0.5 block text-[13px] font-normal text-muted">
          {longDate(start)} to {longDate(end)}
        </span>
        <span className="block text-[13px] font-normal text-muted">
          {r.difficulty} · {r.successRate}% summit rate{r.successVerified ? "" : " (indicative)"} · {r.traffic} trail
        </span>
      </p>
      <SeatBar capacity={capacity} booked={booked} />
      <div>
        <p className={`metric text-2xl font-bold ${left ? "text-olive-deep" : "text-muted"}`}>
          {money(price)}
          <span className="block text-xs font-normal text-muted">per person, all in</span>
        </p>
        <Link
          href={`/contact?trip=${id}&label=${encodeURIComponent(`${r.name} Route, ${longDate(start)}, ${money(price)} pp`)}`}
          className={`mt-2 inline-block rounded-[3px] px-[22px] py-2.5 text-sm font-semibold ${
            left ? "bg-brick-text text-white hover:bg-brick-dark" : "border border-olive-deep text-olive-deep hover:bg-olive-deep hover:text-white"
          }`}
        >
          {left ? "Join this group" : "Join the waitlist"}
        </Link>
      </div>
    </div>
  );
}

/**
 * The nearest open departure on a route, at the top of its page.
 *
 * The full calendar is further down, but a reader deciding between six routes
 * wants to know now whether this one has a date they can take. Counts are the
 * real ones — the strip simply does not render if there is no open date, so
 * nothing here manufactures urgency that is not in the data.
 */
export function NextDeparture({ route }: { route: Route }) {
  const open = departures
    .filter((d) => d.routeSlug === route.slug && d.capacity - d.booked > 0)
    .sort((a, b) => a.start.localeCompare(b.start))[0];
  if (!open) return null;
  const left = open.capacity - open.booked;
  return (
    <div className="mt-[30px] flex flex-wrap items-center gap-x-[26px] gap-y-3 rounded-r border-l-[3px] border-olive bg-sand px-[22px] py-4">
      <span className="label text-olive-deep">Next group departure</span>
      <span className="text-base font-bold text-ink">{longDate(open.start)}</span>
      <span className={`text-sm font-semibold ${left <= 3 ? "text-alert" : "text-slate"}`}>
        {left} of {open.capacity} seats left
      </span>
      <span className="metric text-base font-bold text-olive-deep">
        {money(open.price)} <span className="text-[13px] font-normal text-muted">per person</span>
      </span>
      <Link href={`/departures#${open.id}`}
        className="ml-auto rounded-[3px] bg-brick-text px-[22px] py-2.5 text-sm font-semibold text-white hover:bg-brick-dark max-md:ml-0">
        Join this group
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Guides
 * ------------------------------------------------------------------ */

const TINTS = [
  { bg: "#e7eee9", fg: "#0a7024", ink: "#0a7024" },
  { bg: "#e6e8ef", fg: "#3a4463", ink: "#020a2c" },
  { bg: "#eaecee", fg: "#5b6672", ink: "#313d4d" },
  { bg: "#eff0e3", fg: "#7c8724", ink: "#5c6414" },
  { bg: "#f0ece5", fg: "#8a7a5e", ink: "#6b5d45" },
];

const hashOf = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/**
 * Portrait placeholder.
 *
 * These are real people, named by guests in their own reviews, so a stock
 * photograph of a stranger under one of their names would be a small lie on a
 * page whose whole argument is that we tell you the truth. Each gets a drawn
 * stand-in at the exact size the real portrait will occupy, with the tint
 * hashed from the name so it stays the same across pages and rebuilds.
 */
export function GuideCard({ guide }: { guide: (typeof guides)[number] }) {
  const t = TINTS[hashOf(guide.name) % TINTS.length];
  const initial = guide.name.slice(0, 1).toUpperCase();
  const id = `gp-${guide.name.toLowerCase().replace(/[^a-z]/g, "")}`;
  return (
    <div className="text-center">
      <svg viewBox="0 0 120 120" className="mx-auto mb-4 block w-full max-w-[132px] rounded-full"
        role="img" aria-label={`${guide.name} — photograph to come`}>
        <defs><clipPath id={id}><circle cx="60" cy="60" r="60" /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          <rect width="120" height="120" fill={t.bg} />
          <circle cx="60" cy="47" r="20" fill={t.fg} opacity={0.26} />
          <path d="M60 71c-21 0-36 13-38 33h76c-2-20-17-33-38-33z" fill={t.fg} opacity={0.26} />
          <text x="60" y="70" textAnchor="middle" fontSize="34" fontWeight="700" fill={t.ink} opacity={0.62}>
            {initial}
          </text>
        </g>
        <circle cx="60" cy="60" r="59.5" fill="none" stroke={t.fg} strokeOpacity={0.22} />
      </svg>
      <h3 className="mb-1 text-base">{guide.name}</h3>
      <p className="text-[13px] leading-[1.5] text-slate">{guide.role}</p>
      <p className="text-xs leading-[1.5] text-muted">
        <span className="metric">{guide.years} yrs</span> · {guide.languages}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sticky book bar
 * ------------------------------------------------------------------ */

/**
 * Price, and a way to act on it, pinned to every sellable page.
 *
 * `addId` is load-bearing: without it the button said "Add to my trip" and then
 * navigated to an empty planner, which is the worst thing a commit button can
 * do. The id travels in the URL and the planner adds it on arrival.
 */
export function BookBar({
  name,
  price,
  note = "per person",
  verified = true,
  addId,
  extra,
}: {
  name: string;
  price: number;
  note?: string;
  verified?: boolean;
  addId: string;
  extra?: React.ReactNode;
}) {
  /* The strongest case for glass on the whole site: this bar is pinned to the
     bottom of a long sell page, so the itinerary, the map and the FAQ all pass
     behind it. Opaque, it read as a floor cutting the page short; blurred, the
     page continues under it. */
  return (
    <div data-actionbar className="glass-ink sticky bottom-0 z-[90] border-t py-3.5">
      <div className="mx-auto flex max-w-[1170px] flex-col gap-3 px-5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5">
        <div>
          <p className="metric text-[26px] font-bold leading-none text-white">
            {money(price)}
            <span className="mt-1 block text-xs font-normal text-white/60">
              {note}{verified ? "" : " — rate sheet to confirm"}
            </span>
          </p>
          <p className="text-[15px] text-white/80">{name}</p>
        </div>
        <ActionBarButtons addId={addId} extra={extra} />
      </div>
    </div>
  );
}

/**
 * The buttons, as an even grid on a phone and a row on a desktop.
 *
 * Wrapped in `flex-wrap` they came out ragged on a 430px screen — two buttons
 * on one line, the primary orphaned on the next at a different width, and the
 * floating assistant launcher parked in the gap beside it, reading as a fourth
 * button nobody had aligned. Every action now occupies the same cell.
 *
 * The assistant is IN the grid on mobile rather than floating over it. Its
 * launcher is a fixed element and this bar is sticky, so on a phone the two
 * always end up in the same 60px of screen; making it a peer of the other
 * actions is the only arrangement where that isn't an accident. On desktop
 * there is room for both and the launcher stays where it was.
 */
function ActionBarButtons({ addId, extra }: { addId: string; extra?: React.ReactNode }) {
  const cell =
    "flex items-center justify-center rounded-[3px] px-4 py-3.5 text-center text-sm font-semibold md:px-7";
  return (
    <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2.5">
      {extra}
      <a
        href={site.whatsappUrl}
        target="_blank"
        rel="noopener"
        className={`${cell} bg-white text-ink hover:bg-sand`}
      >
        WhatsApp us
      </a>
      <Link
        href={`/plan?add=${addId}`}
        className={`${cell} bg-brick-text text-white hover:bg-brick-dark`}
      >
        Add to my trip
      </Link>
      {/* Mobile only — on desktop the floating launcher has room of its own. */}
      <AskTwaCell className={`${cell} border border-white/25 text-white hover:bg-white/10 md:hidden`} />
    </div>
  );
}

/**
 * The book bar's sibling, for the products we quote rather than list.
 *
 * Zanzibar was the one sellable thing on the site whose page just ended. Every
 * climb, safari, combination and day trip closes with a pinned bar carrying a
 * price and a way to act on it; a beach package closed with a grid of other
 * packages, so the reader who had decided had nowhere to say so. This is the
 * same bar with the number replaced by the reason there isn't one — which is
 * the honest version, not a placeholder for a price we are withholding.
 */
export function QuoteBar({
  name,
  note,
  href,
}: {
  name: string;
  note: string;
  href: string;
}) {
  return (
    <div data-actionbar className="glass-ink sticky bottom-0 z-[90] border-t py-3.5">
      <div className="mx-auto flex max-w-[1170px] flex-col gap-3 px-5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5">
        <div>
          <p className="text-[22px] font-bold leading-none text-white">
            Quoted to your dates
            <span className="mt-1.5 block text-xs font-normal leading-[1.5] text-white/60">{note}</span>
          </p>
          <p className="mt-1 text-[15px] text-white/80">{name}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2.5">
          <a href={site.whatsappUrl} target="_blank" rel="noopener"
            className="flex items-center justify-center rounded-[3px] bg-white px-4 py-3.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-sand md:px-7">
            WhatsApp us
          </a>
          <Link href={href as never}
            className="flex items-center justify-center rounded-[3px] bg-brick-text px-4 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brick-dark md:px-7">
            Get a price
          </Link>
          <AskTwaCell className="col-span-2 flex items-center justify-center rounded-[3px] border border-white/25 px-4 py-3.5 text-center text-sm font-semibold text-white hover:bg-white/10 md:hidden" />
        </div>
      </div>
    </div>
  );
}

/** The seat bar on its own, for contexts that lay out their own row. */
export function SeatBarRow({ capacity, booked }: { capacity: number; booked: number }) {
  return <SeatBar capacity={capacity} booked={booked} />;
}

export { metres };
