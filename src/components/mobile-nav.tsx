"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/nav";
import { site } from "@/lib/site";

/**
 * Mobile navigation.
 *
 * A drawer rather than an accordion: seven top-level items each with up to five
 * children is too much to expand in place, and the operator's own menu already
 * collapses at this width.
 *
 * Closes on route change — a drawer that survives navigation leaves the reader
 * looking at the menu they just used.
 *
 * PORTALLED TO `document.body`, and it has to be.
 *
 * This button sits inside the header's white bar, and that bar now carries
 * `backdrop-filter`. An element with a backdrop-filter becomes the containing
 * block for every `position: fixed` descendant — the same rule that `filter`
 * and `transform` have always had. Rendered in place, the drawer's `top: 104px;
 * bottom: 0` therefore resolved against a 50px-tall bar instead of the viewport
 * and computed to a negative height, so it opened to nothing at all.
 *
 * The portal takes it out from under any ancestor that could do that, now or
 * later. Worth knowing if anything else here ever needs `position: fixed`.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  /* `document` does not exist during the server render, and the portal target
     has to. The button ships in the HTML; the drawer only ever exists after
     a tap, which is client-side by definition. */
  useEffect(() => setMounted(true), []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex size-10 flex-col items-center justify-center gap-[5px] lg:hidden"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className={`block h-0.5 w-6 bg-ink transition-transform duration-[var(--dur-base)] ${open ? "translate-y-[7px] rotate-45" : ""}`} />
        <span aria-hidden className={`block h-0.5 w-6 bg-ink transition-opacity duration-[var(--dur-fast)] ${open ? "opacity-0" : ""}`} />
        <span aria-hidden className={`block h-0.5 w-6 bg-ink transition-transform duration-[var(--dur-base)] ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id="mobile-nav"
            className="fixed inset-x-0 bottom-0 top-[104px] z-[998] overflow-y-auto border-t border-line bg-white px-5 py-6 lg:hidden"
          >
            {/* The drawer was 24 links and nothing else — no way to reach a
                person, and the planner buried under "Company". The two things
                a phone visitor most often wants are now the first and last
                things in it. */}
            <Link
              href="/plan"
              className="mb-5 flex items-center justify-between gap-3 rounded-[3px] bg-brick-text px-5 py-4 text-base font-semibold text-white"
            >
              Plan and price your trip
              <span aria-hidden>→</span>
            </Link>

            <ul className="divide-y divide-line">
              {nav.map((item) => (
                <li key={item.href} className="py-3">
                  <Link
                    href={item.href as never}
                    className="block py-1.5 text-lg font-semibold text-ink hover:text-olive-deep"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {item.children.map((c) => (
                        <li key={c.href + c.label}>
                          <Link href={c.href as never} className="block py-2">
                            <span className="block text-[15px] font-medium text-slate">{c.label}</span>
                            <span className="block text-[12.5px] text-muted">{c.note}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-2 border-t border-line pt-5">
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center rounded-[3px] border border-olive-deep px-4 py-3.5 text-sm font-semibold text-olive-deep"
              >
                Call the office
              </a>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center rounded-[3px] border border-olive-deep px-4 py-3.5 text-sm font-semibold text-olive-deep"
              >
                WhatsApp
              </a>
            </div>
            <p className="mt-3 pb-2 text-center text-[13px] text-muted">
              {site.contact.phone} · Moshi, Tanzania
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
