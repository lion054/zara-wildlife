import Image from "next/image";
import { site } from "@/lib/site";

/**
 * The Tripadvisor mark.
 *
 * The operator has 53 five-star reviews and, on the live site, renders that
 * fact as the word "TripAdvisor" in body copy at the bottom of the homepage.
 * A rating is worth what the reader believes it is, and an unbranded number is
 * a claim the site makes about itself. The owl is the part that makes it a
 * claim somebody else made.
 *
 * Two assets, because the supplied ones are both VERTICAL lockups — owl above
 * a black wordmark:
 *
 *   lockup   `/brand/tripadvisor-lockup.png`, the ® secondary lockup. Black
 *            type, so it may only go on a light ground. On the dark bands it
 *            sits on a white plate, which is the sanctioned way to place it,
 *            rather than being inverted — inverting would take the wordmark
 *            white and swing the green circle to magenta.
 *
 *   owl      `/brand/tripadvisor-owl.png`, cut from the ™ lockup at the exact
 *            bounds of its green circle. The circle is legible at 18px and on
 *            any ground, which the full lockup is not; the header top bar is
 *            22px of warm black and could carry nothing else.
 *
 * Both are local. Hotlinking `static.tacdn.com` and an S3 bucket would put two
 * third-party requests on the critical path of every page, and would break
 * silently the day either path moves.
 */

export function TripadvisorOwl({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/tripadvisor-owl.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * The full lockup on a white plate. `plate` is off where the ground is already
 * light — doubling a white card onto cream reads as a misplaced sticker.
 */
export function TripadvisorLockup({
  width = 116,
  plate = false,
  className = "",
}: {
  width?: number;
  plate?: boolean;
  className?: string;
}) {
  const img = (
    <Image
      src="/brand/tripadvisor-lockup.png"
      alt="Tripadvisor"
      width={width}
      height={Math.round((width * 475) / 1024)}
      className="h-auto"
      style={{ width }}
    />
  );
  if (!plate) return <span className={`inline-block ${className}`}>{img}</span>;
  return (
    <span className={`inline-flex items-center justify-center rounded bg-white px-4 py-3 ${className}`}>
      {img}
    </span>
  );
}

/**
 * Owl, stars, score and count as one clickable unit.
 *
 * `tone` is the ground it sits on, not a style preference — it decides whether
 * the supporting type is white at 60% or muted, and both were checked against
 * their actual backgrounds rather than picked.
 */
export function TripadvisorRating({
  tone = "dark",
  size = 18,
  showCount = true,
  className = "",
}: {
  tone?: "dark" | "light";
  size?: number;
  showCount?: boolean;
  className?: string;
}) {
  const r = site.reviews;
  const label = `Rated ${r.rating} out of 5 from ${r.count} reviews on Tripadvisor. Opens in a new tab.`;
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener"
      aria-label={label}
      /* -my-1.5 py-1.5 keeps the bar the same height while giving the link a
         ~36px tap target — at 20px it was a hairline to hit on a phone, and
         it is the one link on every page that carries the operator's proof. */
      className={`-my-1.5 inline-flex items-center gap-2 py-1.5 text-sm ${
        tone === "dark" ? "text-white hover:text-lime" : "text-slate hover:text-olive-deep"
      } ${className}`}
    >
      <TripadvisorOwl size={size} />
      <span aria-hidden className="tracking-[1px] text-amber">{"★".repeat(r.rating)}</span>
      <span aria-hidden className="metric font-bold">{r.rating}.0</span>
      {showCount && (
        <span aria-hidden className={`hidden sm:inline ${tone === "dark" ? "text-white/60" : "text-muted"}`}>
          {r.count} reviews
        </span>
      )}
    </a>
  );
}
