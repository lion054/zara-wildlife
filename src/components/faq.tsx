import type { ReactNode } from "react";

export type FaqItem = { q: string; a: string };

/**
 * Accessible accordion on native <details>: keyboard and screen-reader
 * support come from the browser, and it works with JavaScript off. Also emits
 * FAQPage structured data for the same questions.
 */
/**
 * `flush`: inside a card (a Collapse), the list fills the card and its questions start on the card's own text edge,
 * with the open/close icons in line with the card's. Standalone (an FAQ page) it is its own centred, framed box.
 */
export function Faq({ items, id, flush = false }: { items: FaqItem[]; id?: string; flush?: boolean }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
  return (
    <div
      id={id}
      className={flush ? "divide-y divide-mist border-y border-mist" : "mx-auto max-w-3xl divide-y divide-mist rounded-[24px] bg-glacier ring-1 ring-mist"}
    >
      {items.map((i) => (
        <details key={i.q} className={`group/faq py-1 ${flush ? "" : "px-6 md:px-8"}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg text-basalt marker:hidden [&::-webkit-details-marker]:hidden">
            {i.q}
            <span
              aria-hidden="true"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-frost text-tanzanite transition-transform group-open/faq:rotate-45"
            >
              +
            </span>
          </summary>
          <div className={`pb-6 text-base leading-relaxed text-scree ${flush ? "pr-12" : "pr-10"}`}>
            {i.a.split("\n\n").map((p) => (
              <p key={p} className="mb-3 last:mb-0">
                {p}
              </p>
            ))}
          </div>
        </details>
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </div>
  );
}

export function FaqGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14 first:mt-0">
      <h2 className="mb-6 text-center font-display text-3xl">{title}</h2>
      {children}
    </section>
  );
}
