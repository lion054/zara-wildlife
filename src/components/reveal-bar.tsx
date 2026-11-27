"use client";

import { useEffect, useState } from "react";

/**
 * A bar fixed to the bottom of the screen that appears only once the element with id `after` has scrolled out of
 * view above, so the page never shows two "Book now" buttons at once. While hidden it is inert, so keyboard users
 * do not tab into it, and the chat bubble drops back to the corner (data-bottom-bar).
 */
export function RevealBar({ after, children }: { after: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById(after);
    if (!el) return setShow(true);
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [after]);
  return (
    <div
      data-bottom-bar={show ? "all" : "off"}
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-mist bg-glacier/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {children}
    </div>
  );
}
