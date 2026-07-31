"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/nav";

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
          </div>,
          document.body,
        )}
    </>
  );
}
