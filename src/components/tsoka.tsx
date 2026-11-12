import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { photo } from "@/lib/photos";

/**
 * The Kiwano layout kit.
 *
 * The earlier pass took Kiwano's colour, type and button shapes but kept this
 * site's own left-aligned editorial layout — which is why it read as text with
 * pictures attached rather than as a travel site. Kiwano's actual grammar is
 * three blocks, and they are the whole look:
 *
 *   TripCard        their `block-style-three` — picture on top, white body
 *                   under it, meta row, then "explore" against a price. This
 *                   is how every sellable thing should appear in a list.
 *   DestinationTile their `media-meta-box` — a tall photograph with one word
 *                   centred on it, the picture scaling and a hairline drawing
 *                   itself in on hover. Used for navigation, not for selling.
 *   SectionTitle    their `theme-title-one` — centred heading over a centred
 *                   lead. It is what separates their sections; this site was
 *                   running everything left-aligned and flush.
 *
 * Everything here is presentational. Prices, names and copy still come from
 * lib/, so nothing below invents a fact.
 */

/* ------------------------------------------------------------------ *
 * Section title — centred, the way Kiwano opens every band
 * ------------------------------------------------------------------ */
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
      {eyebrow && (
        <p
          className={`label mb-4 inline-block rounded-full px-3.5 py-1.5 ${
            tone === "light"
              ? "bg-glacier/10 text-brand"
              : "bg-tanzanite/10 text-tanzanite"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
      {lead && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            tone === "light" ? "text-glacier/75" : "text-scree"
          } ${centred ? "mx-auto" : ""}`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Trip card — Kiwano's block-style-three
 * ------------------------------------------------------------------ */
export function TripCard({
  href,
  imageKey,
  image,
  title,
  excerpt,
  meta = [],
  price,
  priceNote = "From",
  tag,
  cta = "Explore this trip",
}: {
  href: string;
  imageKey?: string;
  /** A picture not in the photo manifest, e.g. one of the imported tour photos. */
  image?: { src: string; alt: string };
  title: string;
  excerpt: string;
  /** Up to three short facts. Kiwano runs Trip Type / Service Level / Location. */
  meta?: { k: string; v: string }[];
  /** Null renders "On request" rather than a number we cannot honour. */
  price: number | null;
  priceNote?: string;
  tag?: string;
  cta?: string;
}) {
  const img = image ?? (imageKey ? photo(imageKey) : undefined);

  return (
    <article className="card-lift group flex h-full flex-col bg-glacier">
      <div className="relative h-60 overflow-hidden bg-frost">
        {img ? (
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(160deg, currentColor 0 1px, transparent 1px 18px)",
            }}
          />
        )}
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        {tag && (
          <span className="tag-teal label absolute -top-3.5 left-6">{tag}</span>
        )}

        <h3 className="font-display text-xl leading-snug tracking-tight">
          <Link href={href} className="transition-colors hover:text-tanzanite">
            {title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-scree">{excerpt}</p>

        {meta.length > 0 && (
          <dl className="mt-4 space-y-1.5 border-t border-mist pt-4 text-xs">
            {meta.map((m) => (
              <div key={m.k} className="flex justify-between gap-3">
                <dt className="label text-scree">{m.k}</dt>
                <dd className="text-right text-basalt">{m.v}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Push the action row to the bottom so cards in a row line up. */}
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <Link
            href={href}
            aria-label={`${cta}: ${title}`}
            className="label text-tanzanite underline underline-offset-4 transition-colors hover:text-basalt"
          >
            {cta}
          </Link>
          <div className="text-right">
            {price === null ? (
              <span className="metric text-lg text-scree">On request</span>
            ) : (
              <>
                <span className="label block text-scree">{priceNote}</span>
                <span className="metric text-xl text-tanzanite">
                  ${price.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Destination tile — Kiwano's media-meta-box
 * ------------------------------------------------------------------ */
export function DestinationTile({
  href,
  imageKey,
  title,
  note,
  tall = false,
}: {
  href: string;
  imageKey?: string;
  title: string;
  note?: string;
  tall?: boolean;
}) {
  const img = imageKey ? photo(imageKey) : undefined;

  return (
    <Link
      href={href}
      className={`media-tile group relative block ${tall ? "h-[26rem]" : "h-64"} bg-basalt`}
    >
      {img && (
        <Image
          src={img.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="media-tile-img object-cover"
        />
      )}
      {/* Kiwano darkens the whole tile on hover; the wash is what makes the
          single centred word readable over any photograph. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-basalt/80 via-basalt/50 to-basalt/40 transition-colors duration-300 group-hover:bg-basalt/70"
      />
      <span className="relative z-[3] flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="font-display text-3xl tracking-tight text-glacier">
          {title}
        </span>
        {note && (
          <span className="label mt-2 text-glacier/90">{note}</span>
        )}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Feature block — Kiwano's block-style-one
 * ------------------------------------------------------------------ */
export function FeatureBlock({
  figure,
  title,
  children,
}: {
  /** A number, or a very short glyph. Never an emoji. */
  figure: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[20px] bg-glacier p-7 shadow-[var(--shadow-card)]">
      <span className="block font-display text-5xl tracking-tight text-tanzanite">{figure}</span>
      <h3 className="mt-4 font-display text-xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-scree">{children}</p>
    </div>
  );
}
