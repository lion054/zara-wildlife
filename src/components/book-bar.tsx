"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Sticky booking bar, mobile only.
 *
 * On a phone the price and the CTA scroll off within the first screen and
 * never return across a very long product page — a visitor who reads the
 * whole itinerary then has to scroll back up to act. This keeps the number
 * and the button in reach for the whole page.
 *
 * Hidden until the user has scrolled past the hero, so it does not cover the
 * price they are already looking at, and hidden on `lg` where the sidebar
 * already does this job.
 */
export function BookBar({
  price,
  qualifier,
  href,
  label = "Book",
}: {
  price: number;
  qualifier: string;
  href: string;
  label?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-mist bg-glacier/95 px-4 py-3 backdrop-blur transition-transform duration-200 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      /* Inert while off-screen so it is not a keyboard trap above the fold. */
      aria-hidden={!show}
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0">
          <p className="metric text-xl text-tanzanite">
            ${price.toLocaleString()}
          </p>
          <p className="label truncate text-scree">{qualifier}</p>
        </div>
        <Link
          href={href}
          tabIndex={show ? 0 : -1}
          className="ml-auto shrink-0 rounded-full bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright"
        >
          {label}
        </Link>
      </div>
    </div>
  );
}
