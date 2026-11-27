"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * Small interaction kit for shortening pages: tabs, collapsible rows, a
 * filterable grid with "show more", and a bottom booking bar for phones.
 */

/* ------------------------------------------------------------------ *
 * Tabs: every panel stays in the DOM (search engines and screen
 * readers still see it), only the active one is visible.
 * ------------------------------------------------------------------ */
export function Tabs({
  tabs,
  label,
  className = "",
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  label: string;
  className?: string;
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const move = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const t = e.key === "Home" ? 0 : tabs.length - 1;
      setActive(tabs[t].id);
      refs.current[t]?.focus();
    } else if (move) {
      e.preventDefault();
      const t = (i + move + tabs.length) % tabs.length;
      setActive(tabs[t].id);
      refs.current[t]?.focus();
    }
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className="-mx-1 flex gap-1 overflow-x-auto border-b border-mist px-1 pb-px [scrollbar-width:none]"
      >
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${uid}-t-${t.id}`}
              aria-selected={on}
              aria-controls={`${uid}-p-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                on ? "border-tanzanite text-tanzanite" : "border-transparent text-scree hover:text-basalt"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-p-${t.id}`}
          aria-labelledby={`${uid}-t-${t.id}`}
          hidden={t.id !== active}
          className="pt-8"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Collapse: native <details>, styled. Works without JavaScript.
 * ------------------------------------------------------------------ */
export function Collapse({
  title,
  meta,
  children,
  defaultOpen = false,
  badge,
  className = "",
}: {
  title: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <details
      open={defaultOpen}
      className={`group/collapse rounded-2xl bg-glacier ring-1 ring-mist transition-shadow open:shadow-[0_18px_40px_-24px_rgba(43,44,16,0.35)] ${className}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 marker:hidden md:px-6 [&::-webkit-details-marker]:hidden">
        {badge}
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg leading-snug text-basalt md:text-xl">{title}</span>
          {meta && <span className="mt-0.5 block text-xs text-scree">{meta}</span>}
        </span>
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-frost text-tanzanite transition-transform group-open/collapse:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-6 pt-1 md:px-6">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------------ *
 * FilterGrid: chips filter the items, "Show more" reveals the rest.
 * ------------------------------------------------------------------ */
export function FilterGrid({
  items,
  filters,
  initial = 6,
  step = 6,
  label = "Filter",
  columns = "sm:grid-cols-2 lg:grid-cols-3",
  heading,
}: {
  items: { tags: string[]; node: ReactNode; key: string }[];
  filters: { label: string; tag: string }[];
  initial?: number;
  step?: number;
  label?: string;
  columns?: string;
  /** A section heading read by screen readers, so the cards' own headings sit under it (h1 → h2 → h3). */
  heading?: string;
}) {
  const [tag, setTag] = useState("all");
  const [shown, setShown] = useState(initial);
  const list = tag === "all" ? items : items.filter((i) => i.tags.includes(tag));

  return (
    <div>
      {heading && <h2 className="sr-only">{heading}</h2>}
      {filters.length > 0 && (
        <div role="group" aria-label={label} className="flex flex-wrap justify-center gap-2">
          {[{ label: "All", tag: "all" }, ...filters].map((f) => (
            <button
              key={f.tag}
              type="button"
              aria-pressed={tag === f.tag}
              onClick={() => {
                setTag(f.tag);
                setShown(initial);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                tag === f.tag ? "bg-tanzanite text-glacier" : "bg-frost text-tanzanite hover:bg-mist"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      <ul className={`mt-10 grid gap-6 ${columns}`} aria-live="polite">
        {list.slice(0, shown).map((i) => (
          <li key={i.key}>{i.node}</li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-8 text-center text-scree">Nothing here yet.</p>}
      {list.length > shown && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setShown(shown + step)}
            className="rounded-full border border-tanzanite/25 bg-glacier px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite transition-colors hover:bg-tanzanite hover:text-glacier"
          >
            Show more ({list.length - shown})
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Bottom bar for phones: price and one button, always in reach.
 * ------------------------------------------------------------------ */
export function MobileBookBar({
  price,
  label = "From, per person",
  href = "#enquire",
  cta = "Book this tour",
}: {
  price: number | null;
  label?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div data-bottom-bar="on" className="fixed inset-x-0 bottom-0 z-40 border-t border-mist bg-glacier/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <p>
          <span className="label block text-scree">{price ? label : "Price"}</span>
          <span className="metric text-xl text-tanzanite">{price ? `$${price.toLocaleString()}` : "On request"}</span>
        </p>
        <Link
          href={href}
          className="rounded-full bg-brand px-7 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * PhotoGrid: four pictures, the rest behind "See more".
 * ------------------------------------------------------------------ */
export function PhotoGrid({
  items,
  initial = 4,
}: {
  items: { src: string; width: number; height: number; alt?: string | null }[];
  initial?: number;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, initial);
  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {shown.map((g) => (
          <li key={g.src}>
            <Image
              src={g.src}
              alt={g.alt ?? ""}
              width={g.width}
              height={g.height}
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="aspect-[4/3] h-auto w-full rounded-[20px] object-cover"
            />
          </li>
        ))}
      </ul>
      {items.length > initial && !all && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setAll(true)}
            className="rounded-full border border-tanzanite/25 bg-glacier px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite transition-colors hover:bg-tanzanite hover:text-glacier"
          >
            See more ({items.length - initial})
          </button>
        </div>
      )}
    </div>
  );
}
