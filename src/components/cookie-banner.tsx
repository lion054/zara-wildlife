"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "twa-consent-v1";

type Consent = { functional: boolean; analytical: boolean; advertisement: boolean };

function read(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Consent) : null;
  } catch {
    return null;
  }
}

function save(c: Consent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* private window: choice lasts for this page view only */
  }
  window.dispatchEvent(new CustomEvent("twa-consent", { detail: c }));
}

/**
 * Cookie consent. Necessary cookies are always on; the other three start off
 * and nothing optional should load until the matching flag is true. Listen for
 * the `twa-consent` window event (or read localStorage) before adding any
 * analytics or advertising script.
 */
export function CookieBanner() {
  const [shown, setShown] = useState(false);
  const [custom, setCustom] = useState(false);
  const [c, setC] = useState<Consent>({ functional: false, analytical: false, advertisement: false });

  useEffect(() => {
    setShown(read() === null);
    const reopen = () => setShown(true);
    window.addEventListener("twa-cookie-settings", reopen);
    return () => window.removeEventListener("twa-cookie-settings", reopen);
  }, []);

  if (!shown) return null;

  const choose = (v: Consent) => {
    save(v);
    setShown(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-[24px] bg-basalt p-6 text-glacier shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] md:inset-x-6 md:p-7"
    >
      <h2 id="cookie-title" className="font-display text-xl">
        Cookies
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-glacier/85">
        We use necessary cookies to run the site. With your permission we also
        use functional, analytical and advertising cookies. See the{" "}
        <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-brand">
          privacy policy
        </Link>
        .
      </p>

      {custom && (
        <fieldset className="mt-4 space-y-3 text-sm">
          <legend className="sr-only">Cookie categories</legend>
          <label className="flex items-start gap-3 opacity-80">
            <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-brand" />
            <span>
              <b>Necessary</b> — always on. Keeps the site working.
            </span>
          </label>
          {(
            [
              ["functional", "Functional", "Remembers choices such as your trip basket."],
              ["analytical", "Analytical", "Anonymous visit statistics."],
              ["advertisement", "Advertisement", "Measures and personalises our adverts."],
            ] as const
          ).map(([k, label, note]) => (
            <label key={k} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={c[k]}
                onChange={(e) => setC({ ...c, [k]: e.target.checked })}
                className="mt-1 h-4 w-4 accent-brand"
              />
              <span>
                <b>{label}</b> — {note}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => choose({ functional: true, analytical: true, advertisement: true })}
          className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-basalt hover:bg-brand-bright"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => choose({ functional: false, analytical: false, advertisement: false })}
          className="rounded-full border border-glacier/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-glacier hover:text-basalt"
        >
          Reject all
        </button>
        {custom ? (
          <button
            type="button"
            onClick={() => choose(c)}
            className="rounded-full border border-glacier/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-glacier hover:text-basalt"
          >
            Save choices
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCustom(true)}
            className="rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] underline underline-offset-4 hover:text-brand"
          >
            Customize
          </button>
        )}
      </div>
    </div>
  );
}

/** Footer button to reopen the banner. */
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("twa-cookie-settings"))}
    >
      Cookie settings
    </button>
  );
}
