import type { ReactNode } from "react";
import { TripCard } from "@/components/tsoka";
import { displayTitle, excerpt, tourPath, type Tour } from "@/lib/tours";

/** Whole days in a duration string such as "6 Days | 5 Nights". */
export const daysOf = (t: Tour) => parseInt(t.duration ?? "", 10) || 0;

/** Cards for FilterGrid. Tags drive the filter chips. */
export function tourItems(list: Tour[], tags: (t: Tour) => string[] = () => []) {
  return list.map((t) => ({
    key: `${t.kind}-${t.key}`,
    tags: tags(t),
    node: (
      <TripCard
        href={tourPath(t)}
        image={t.hero ? { src: t.hero.src, alt: "" } : undefined}
        title={displayTitle(t)}
        excerpt={excerpt(t, 100)}
        meta={t.duration ? [{ k: "Duration", v: t.duration.replace(/\s*\|\s*/g, " · ") }] : []}
        price={t.from}
        priceNote={t.ladder.length > 1 ? "From" : "Price"}
        cta="View tour"
      />
    ),
  }));
}

/** A compact page opener: small eyebrow, one heading, one sentence. */
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="label text-brand">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl md:text-6xl">{title}</h1>
      {children && <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-scree md:text-lg">{children}</p>}
    </div>
  );
}
