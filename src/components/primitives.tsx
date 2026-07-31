import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { photo } from "@/lib/photos";
import { money } from "@/lib/format";

/**
 * The shared vocabulary.
 *
 * Server components throughout — none of these need state, so none of them
 * ship JavaScript. Only the planner, the profile chart, the forms and the
 * basket badge are client components, which is what keeps the bundle to
 * roughly the weight of the static build it replaces.
 */

/* ------------------------------------------------------------------ *
 * Sections and headings
 * ------------------------------------------------------------------ */

export function Section({
  children,
  tone = "cream",
  id,
  className = "",
}: {
  children: ReactNode;
  tone?: "cream" | "white" | "sand" | "ink";
  id?: string;
  className?: string;
}) {
  const bg = {
    cream: "bg-cream",
    white: "bg-white",
    sand: "bg-sand",
    ink: "bg-ink text-white/80",
  }[tone];
  return (
    /* `scroll-mt` is the header height. Without it every in-page anchor —
       `#departures`, `#reviews`, `#kilimanjaro` — parks its own heading behind
       the fixed chrome and the reader lands on the second paragraph. */
    <section id={id} className={`${bg} scroll-mt-[104px] px-5 py-16 md:py-[78px] ${className}`}>
      <div className="mx-auto max-w-[1170px]">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <span className={`label mb-3.5 block ${tone === "light" ? "text-lime" : "text-olive-deep"}`}>
      {children}
    </span>
  );
}

/**
 * The section head. Centred heading over a centred lead and a hairline rule —
 * the device that separates one band of the page from the next.
 */
export function SectionTitle({
  eyebrow,
  title,
  lead,
  align = "center",
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
}) {
  const centred = align === "center";
  return (
    <div className={centred ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <h2 className={`text-[33px] leading-[1.22] md:text-[33px] ${tone === "light" ? "text-white" : ""}`}>
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 text-base leading-[1.75] ${tone === "light" ? "text-white/70" : "text-muted"}`}>
          {lead}
        </p>
      )}
      <span aria-hidden className={`mt-5 inline-block h-0.5 w-10 bg-lime ${centred ? "" : "block"}`} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Buttons
 * ------------------------------------------------------------------ */

const btnBase =
  "inline-block rounded-[3px] text-sm font-semibold tracking-[0.2px]";

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "light";
  className?: string;
  external?: boolean;
}) {
  const styles = {
    primary: "bg-brick-text px-7 py-3.5 text-white hover:bg-brick-dark",
    ghost:
      "border border-olive-deep px-6 py-3 text-olive-deep hover:bg-olive-deep hover:text-white",
    light: "bg-white px-7 py-3.5 text-ink hover:bg-sand",
  }[variant];
  const cls = `${btnBase} ${styles} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href as never} className={cls}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Provenance markers
 * ------------------------------------------------------------------ */

/**
 * Rendered wherever the dataset flags a figure it could not verify against the
 * operator's own records. Deliberately visible rather than a tooltip: the point
 * is that somebody in Moshi sees it and supplies the real number.
 */
export function Unverified({ children }: { children: ReactNode }) {
  return (
    <span
      title="This figure has not been confirmed against the operator's own records"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ecd2] px-2.5 py-1 align-middle text-[11.5px] font-medium leading-none text-[#7a5a12]"
    >
      {/* A gold dot, not a warning triangle.
          This marker appears seventeen times, several of them directly under a
          price in a route card. Set in uppercase with wide tracking behind a ⚠
          it read as an error state — the loudest thing on the card was the
          disclaimer rather than the number it qualifies. It still has to be
          seen, so it keeps its own colour and a tinted ground; what it gives
          up is the shouting. */}
      <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-[#c79a3e]" />
      {children}
    </span>
  );
}

/**
 * A fixed-height cropped photograph, or an honest stand-in when there is none.
 * An empty box on a page selling something reads as a broken site; a panel that
 * names the missing shot reads as a company that knows what it is short of —
 * and tells the office exactly what to send.
 */
export function Photo({
  photoKey,
  alt,
  subject,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  photoKey?: string;
  alt?: string;
  subject?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const p = photoKey ? photo(photoKey) : undefined;
  if (!p) {
    return (
      <div className={`flex items-center justify-center bg-paper px-5 text-center ${className}`}>
        <span className="text-[13px] leading-relaxed text-muted">
          <Unverified>Photograph needed</Unverified>
          <span className="mt-2 block">
            {subject ? `A shot of ${subject}.` : "No image on file for this."} Nothing invented in
            its place.
          </span>
        </span>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={p.src}
        alt={alt ?? p.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Trip card
 * ------------------------------------------------------------------ */

export function TripCard({
  href,
  photoKey,
  title,
  excerpt,
  meta = [],
  price,
  priceNote = "From",
  priceVerified = true,
  tag,
  cta = "See dates and prices",
  badges = [],
  children,
}: {
  href: string;
  photoKey?: string;
  title: string;
  excerpt: string;
  meta?: string[];
  price?: number | null;
  priceNote?: string;
  priceVerified?: boolean;
  tag?: string;
  cta?: string;
  badges?: { kind: "odds" | "value"; label: string; title: string }[];
  children?: ReactNode;
}) {
  return (
    <article className="group overflow-hidden rounded">
      <Link href={href as never} aria-hidden tabIndex={-1} className="block">
        <Photo photoKey={photoKey} alt="" className="h-[230px]" sizes="(max-width:768px) 100vw, 33vw" />
      </Link>
      <div className="rounded-b border border-t-0 border-line bg-white px-6 pb-[22px] pt-[26px]">
        {tag && <span className="label mb-2 block text-olive-deep">{tag}</span>}
        <h3 className="text-[19px] leading-[1.35]">
          <Link href={href as never} className="transition-colors hover:text-olive-deep">
            {title}
          </Link>
        </h3>

        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b.kind} {...b} />
            ))}
          </div>
        )}

        {meta.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] text-muted">
            {meta.map((m) => (
              <li key={m} className="flex items-center gap-1.5 before:block before:size-[5px] before:shrink-0 before:rounded-full before:bg-lime">
                {m}
              </li>
            ))}
          </ul>
        )}

        {children}

        <p className="py-3 text-[15px] leading-[1.7] text-muted">{excerpt}</p>

        <div className="flex items-center justify-between gap-3">
          <Link href={href as never} className="text-sm font-semibold text-olive-deep underline-offset-4 hover:underline">
            {cta}
          </Link>
          {price != null && (
            <p className="text-right text-sm text-muted">
              {priceNote} <strong className="metric block text-xl text-olive-deep">{money(price)}</strong>
            </p>
          )}
        </div>

        {price != null && !priceVerified && (
          <div className="mt-2.5">
            <Unverified>Rate sheet to confirm</Unverified>
          </div>
        )}
      </div>
    </article>
  );
}

export function Badge({ kind, label, title }: { kind: "odds" | "value"; label: string; title: string }) {
  const cls =
    kind === "odds"
      ? "bg-olive-deep text-white"
      : "border border-line bg-paper text-slate";
  return (
    <span title={title} className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Pills, tiles and seat bars
 * ------------------------------------------------------------------ */

export function Pill({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "moderate" | "challenging" | "hard" }) {
  const cls = {
    plain: "border-line bg-paper text-slate",
    moderate: "border-[#d6dcb8] bg-[#eef0e2] text-olive-deep",
    challenging: "border-[#e6d3ae] bg-[#f7ecd8] text-[#7a5a12]",
    hard: "border-[#e2c6c3] bg-[#f4e4e2] text-brick-dark",
  }[tone];
  return (
    <span className={`inline-block whitespace-nowrap rounded-sm border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

export const difficultyTone = (d: string) =>
  d.toLowerCase() as "moderate" | "challenging" | "hard";

export function Tile({
  href,
  photoKey,
  name,
  note,
}: {
  href?: string;
  photoKey?: string;
  name: string;
  note?: string;
}) {
  const inner = (
    <>
      <Photo photoKey={photoKey} alt="" className="absolute inset-0 h-full w-full" sizes="(max-width:768px) 50vw, 25vw" />
      <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-b from-transparent to-ink/80 p-5 text-white">
        <strong className="text-[19px] leading-tight">{name}</strong>
        {note && <span className="mt-1 text-[13px] text-white/75">{note}</span>}
      </span>
    </>
  );
  const cls =
    "group relative block h-[260px] overflow-hidden rounded [&_img]:transition-transform [&_img]:duration-500 hover:[&_img]:scale-[1.07]";
  return href ? (
    <Link href={href as never} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/**
 * Seat availability.
 *
 * The live site's calendar shows a flat $2,000 on nearly every date across two
 * years and its "Join Group" button joins nothing. Three states here, because
 * "9 of 12 booked" and "sold out" are different decisions — and the bar is
 * `role="img"` with a text label, since a progress bar that exists only
 * visually tells a screen reader nothing.
 */
export function SeatBar({ capacity, booked }: { capacity: number; booked: number }) {
  const left = Math.max(0, capacity - booked);
  const pct = Math.min(100, Math.round((booked / capacity) * 100));
  const label = left === 0 ? "Sold out" : `${left} of ${capacity} ${left === 1 ? "seat" : "seats"} left`;
  const fill = left === 0 ? "bg-brick-dark" : left <= 3 ? "bg-alert" : "bg-lime";
  const text = left === 0 ? "text-brick-dark" : left <= 3 ? "text-alert" : "text-slate";
  return (
    <div>
      <div role="img" aria-label={label} className="my-2.5 h-2 overflow-hidden rounded-lg bg-line">
        <span className={`block h-full rounded-lg ${fill}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-[13px] font-semibold ${text}`}>{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page hero and breadcrumbs
 * ------------------------------------------------------------------ */

export function PageHero({
  eyebrow,
  title,
  lead,
  photoKey,
  crumbs = [],
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  photoKey?: string;
  crumbs?: { label: string; href: string }[];
}) {
  const p = photoKey ? photo(photoKey) : undefined;
  return (
    <div className="relative flex min-h-[380px] items-center">
      {p && (
        <Image src={p.src} alt="" fill priority sizes="100vw" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 to-ink/80" />
      <div className="relative z-10 mx-auto w-full max-w-[1170px] px-5 pb-14 pt-[140px]">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-white/70">
            {crumbs.map((c, i) =>
              i === crumbs.length - 1 ? (
                <span key={c.href} aria-current="page">{c.label}</span>
              ) : (
                <span key={c.href}>
                  <Link href={c.href as never} className="hover:text-white">{c.label}</Link>
                  {/* Margins rather than literal spaces — JSX collapses the
                      trailing one against the next element and the crumbs run
                      together as "Home ›Climb". */}
                  <span aria-hidden className="mx-1.5">›</span>
                </span>
              ),
            )}
          </nav>
        )}
        {eyebrow && <Eyebrow tone="light">{eyebrow}</Eyebrow>}
        <h1 className="text-[29px] leading-[1.15] text-white md:text-[40px]">{title}</h1>
        {lead && <p className="mt-3.5 max-w-[660px] text-base leading-[1.65] text-white/85 md:text-[17px]">{lead}</p>}
      </div>
    </div>
  );
}
