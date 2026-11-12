import type { ReactNode } from "react";

export type FaqItem = { q: string; a: string };

/**
 * Accessible accordion on native <details>: keyboard and screen-reader
 * support come from the browser, and it works with JavaScript off. Also emits
 * FAQPage structured data for the same questions.
 */
export function Faq({ items, id }: { items: FaqItem[]; id?: string }) {
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
    <div id={id} className="mx-auto max-w-3xl divide-y divide-mist rounded-[24px] bg-glacier ring-1 ring-mist">
      {items.map((i) => (
        <details key={i.q} className="group px-6 py-1 md:px-8">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg text-basalt marker:hidden [&::-webkit-details-marker]:hidden">
            {i.q}
            <span
              aria-hidden="true"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-frost text-tanzanite transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="pb-6 pr-10 text-base leading-relaxed text-scree">
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
