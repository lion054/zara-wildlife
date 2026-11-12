import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { photo } from "@/lib/photos";

export function Eyebrow({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`label mb-4 ${tone === "light" ? "text-sunrise" : "text-tanzanite"}`}>
      {children}
    </p>
  );
}

export function Contour({ className = "" }: { className?: string }) {
  return <div className={`contour ${className}`} aria-hidden="true" />;
}

export function Section({
  children,
  tone = "glacier",
  id,
  className = "",
  bgKey,
}: {
  children: ReactNode;
  tone?: "glacier" | "frost" | "basalt";
  id?: string;
  /** Photo key shown behind a dark panel, under a heavy shade. */
  bgKey?: string;
  className?: string;
}) {
  const tones = {
    glacier: "bg-glacier text-scree",
    frost: "bg-frost text-scree",
    basalt: "on-dark bg-basalt text-glacier",
  };
  /* The dark band is an inset rounded panel floating on white, not a
     full-bleed slab — the modern "bento" treatment, and it keeps the torn
     edge above it meeting white. */
  const bgImg = bgKey ? photo(bgKey) : undefined;
  if (tone === "basalt") {
    return (
      <section id={id} className="bg-glacier px-3 py-4 md:px-6 md:py-8">
        <div
          className={`${tones.basalt} relative mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] px-6 py-16 md:rounded-[2.5rem] md:px-14 md:py-24 ${className}`}
        >
          {bgImg ? (
            <>
              <Image
                src={bgImg.src}
                alt=""
                fill
                sizes="100vw"
                className="pointer-events-none object-cover object-[50%_30%]"
              />
              {/* Shade: dark enough that text never fights the mountain, with
                  a warm amber wash from the corner so it is not just black. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-basalt/95 via-basalt/70 to-basalt/40"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-basalt/90 via-basalt/20 to-basalt/50"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl"
              />
            </>
          ) : (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/15 blur-3xl"
            />
          )}
          <div className="relative mx-auto max-w-6xl">{children}</div>
        </div>
      </section>
    );
  }
  return (
    <section id={id} className={`${tones[tone]} px-6 py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "light";
  className?: string;
  type?: "button" | "submit";
}) {
  /* Kiwano's button is a pill: full radius, uppercase, and on hover it lifts
     a coloured glow rather than changing fill. The fill is the logo lime, so
     the label on top is navy — white on this green measures 2.54:1. */
  const variants = {
    primary:
      "bg-brand text-basalt hover:bg-brand-bright hover:shadow-[0_8px_28px_-6px_rgba(240,159,15,0.65)]",
    outline:
      "border border-tanzanite/25 bg-glacier text-tanzanite hover:border-tanzanite hover:bg-tanzanite hover:text-glacier",
    light:
      "border border-glacier/50 text-glacier hover:border-glacier hover:bg-glacier hover:text-basalt",
  };
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={classes}>
      {children}
    </button>
  );
}

/** Statistic in mono, with its unit. Altitudes, days, distances, rates. */
export function Metric({
  value,
  unit,
  label,
  tone = "dark",
}: {
  value: string | number;
  unit?: string;
  label: string;
  tone?: "dark" | "light";
}) {
  return (
    <div>
      <p className="metric text-3xl font-medium tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit && (
          <span className="ml-1 text-base opacity-60">{unit}</span>
        )}
      </p>
      <p className={`label mt-1 ${tone === "light" ? "text-glacier/55" : "text-scree"}`}>
        {label}
      </p>
    </div>
  );
}

/** Figures the operator has not confirmed are marked, not quietly published. */
export function Unverified({ what }: { what: string }) {
  /* Brand orange, with navy on top — white would measure 2.49:1 here. */
  return (
    <span className="label inline-block rounded-full bg-sunrise px-3 py-1 text-basalt">
      {what} to confirm
    </span>
  );
}

/**
 * A real photograph, keyed off the manifest in lib/photos.
 *
 * Falls back to the photo-brief placeholder when a key has no image yet, so a
 * page can be built before its picture exists and it is obvious which ones are
 * still missing rather than silently blank.
 */
export function Photo({
  imageKey,
  brief,
  ratio = "4/3",
  tone = "dark",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "",
}: {
  imageKey?: string;
  /** Shown only if the image is missing. */
  brief: string;
  ratio?: string;
  tone?: "dark" | "light";
  /** Set on the one image above the fold — it becomes the LCP element. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const img = imageKey ? photo(imageKey) : undefined;

  if (!img) return <ImageSlot brief={brief} ratio={ratio} tone={tone} />;

  return (
    <figure
      className={`media-tile bg-frost ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={img.src}
        alt={img.alt}
        width={img.width}
        height={img.height}
        sizes={sizes}
        priority={priority}
        className="media-tile-img h-full w-full object-cover"
      />
    </figure>
  );
}

/**
 * Page hero, to Kiwano's pattern.
 *
 * Theirs is a full-bleed photograph roughly 500px tall, torn along BOTH
 * edges, with the display heading centred over it and a single pill CTA
 * centred beneath. Content is centred by default because that is what makes
 * their pages read as posters rather than as documents — pass align="left"
 * only where a page genuinely needs the older editorial treatment.
 */
export function PhotoHero({
  imageKey,
  children,
  height = "min-h-[24rem] md:min-h-[31rem]",
  align = "center",
}: {
  imageKey: string;
  children: ReactNode;
  height?: string;
  align?: "center" | "left";
}) {
  const img = photo(imageKey);
  const centred = align === "center";

  return (
    <section
      className={`relative isolate flex items-center justify-center overflow-hidden bg-basalt ${height}`}
    >
      {img && (
        <Image
          src={img.src}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: img.position }}
          className="-z-20 object-cover"
        />
      )}

      {/* One even wash. Kiwano uses a flat rgba(0,0,0,.3); this is a little
          deeper because Bjorn is a light-weight face and needs the help. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-basalt/55" />
      {/* A second, softer pass concentrated behind the type. Some of these
          photographs have signage or bright snow in them, and a flat wash
          alone leaves the headline fighting the picture. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(20,19,12,0.55)_0%,rgba(20,19,12,0)_70%)]"
      />

      {/* Only the bottom edge. The header hangs its own torn strip down over
          the top of this photograph, so a second one here would double up. */}
      <div className="torn torn-bottom" aria-hidden="true" />

      {/* Pages still author their copy for a light field, so the dark-field
          remaps live here rather than in every page. */}
      <div
        className={`on-dark relative w-full px-6 py-16 md:py-20 [&_.text-scree]:text-glacier/85 [&_.text-tanzanite]:text-brand ${
          centred ? "text-center" : ""
        }`}
      >
        <div
          className={`mx-auto max-w-6xl ${
            centred ? "[&>*]:mx-auto [&_h1]:mx-auto [&_.flex]:justify-center" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function ImageSlot({
  brief,
  ratio = "4/3",
  tone = "dark",
}: {
  brief: string;
  ratio?: string;
  tone?: "dark" | "light";
}) {
  return (
    <figure
      className={`media-tile flex items-end ${
        tone === "dark" ? "bg-basalt-soft text-glacier" : "bg-frost text-basalt"
      }`}
      style={{ aspectRatio: ratio }}
    >
      <div
        aria-hidden="true"
        className="media-tile-img absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(160deg, currentColor 0 1px, transparent 1px 18px)",
        }}
      />
      <figcaption
        className={`relative z-10 m-4 rounded-lg border-l-2 border-tanzanite px-3 py-2 text-[11px] leading-relaxed ${
          tone === "dark" ? "bg-basalt/80" : "bg-glacier/90"
        }`}
      >
        <span className="label block text-tanzanite">Photo brief</span>
        {brief}
      </figcaption>
    </figure>
  );
}

/** Seats remaining, drawn honestly — including sold out. */
export function SeatBar({ capacity, booked }: { capacity: number; booked: number }) {
  const left = capacity - booked;
  const pct = Math.round((booked / capacity) * 100);
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="label text-scree">
          {left === 0 ? "Sold out" : `${left} of ${capacity} seats left`}
        </span>
        <span className="metric text-xs text-scree">{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-mist"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={left === 0 ? "Sold out" : `${left} of ${capacity} seats left`}
        aria-label="Seats booked"
      >
        {/* Urgency reads off the warm colour: brand orange when seats are
            nearly gone, brand green while there is room, grey once it is shut.
            Green-for-available is the reading the logo already trains. */}
        <div
          className={`h-full rounded-full ${left === 0 ? "bg-scree" : left <= 3 ? "bg-sunrise" : "bg-brand"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-sunrise-ink" aria-hidden="true">
        {"★".repeat(rating)}
      </span>
      <span className="metric text-xs">
        {count} reviews on TripAdvisor
      </span>
    </span>
  );
}
