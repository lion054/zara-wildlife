"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CookieSettingsButton } from "@/components/cookie-banner";
import { photo } from "@/lib/photos";
import { nav as navBase, site, type NavItem } from "@/lib/site";

/**
 * Site chrome, rebuilt to Kiwano's structure.
 *
 * Kiwano stacks three things at the top of every page, and the earlier pass
 * only had the middle one:
 *
 *   1. a coloured utility strip — phone, socials, language — torn along its
 *      bottom edge so it rips into the header below it;
 *   2. a white header with the logo left, the menu centre-right, a search
 *      affordance and a single pill CTA hard right;
 *   3. a torn edge hanging off the header into whatever comes next.
 *
 * The torn edges are the signature. Without them this is just another white
 * header; with them the whole page reads as cut paper.
 */
type Popular = Record<string, ({ label: string; href: string; meta: string } | null)[]>;

export function SiteHeader({ hasBlog = false, popular = {} }: { hasBlog?: boolean; popular?: Popular }) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMenu = (label: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 160);
  };
  const nav = hasBlog ? [...navBase.slice(0, -1), { label: "Blog", href: "/blog" }, ...navBase.slice(-1)] : navBase;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  /* Close both menus on navigation, and the mobile one on Escape. */
  useEffect(() => {
    setMenu(null);
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="relative z-50">
      {/* ---- 1. Utility strip ---- */}
      <div className="relative bg-tanzanite px-6 pb-9 pt-2 text-glacier sm:pb-11">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-6 sm:justify-between">
          <span className="label hidden items-center gap-2 sm:flex">
            <span className="text-glacier" aria-hidden="true">
              ★★★★★
            </span>
            <span className="metric text-[11px] !text-glacier">
              {site.reviews.count} reviews on {site.reviews.platform}
            </span>
          </span>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="label text-glacier/85 transition-colors hover:text-glacier"
            >
              <span className="hidden sm:inline">Call us: </span><span className="metric text-[11px] !text-glacier">{site.contact.phone}</span>
            </a>
            <span className="hidden h-3 w-px bg-glacier/25 sm:block" aria-hidden="true" />
            {site.social.map((s) => (
              <a
                key={s.url}
                href={s.url}
                rel="noopener noreferrer"
                className="label hidden text-glacier/85 transition-colors hover:text-glacier sm:inline"
              >
                {s.name}
              </a>
            ))}
            <a
              href={site.whatsappUrl}
              rel="noopener noreferrer"
              className="label font-bold text-glacier underline underline-offset-4 decoration-brand transition-colors hover:text-brand-bright"
            >
              WhatsApp
            </a>
          </div>
        </div>
        {/* Inside the strip's bottom edge, so the white tear reads AGAINST
            the green the way Kiwano's reads against its pink. The bar carries
            extra bottom padding so the tear never covers its own links. */}
        <div className="torn torn-bottom" aria-hidden="true" />
      </div>

      {/* ---- 2. Header ---- */}
      <div
        ref={wrapRef}
        className="relative bg-glacier"
        onMouseLeave={closeSoon}
        onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && menu) {
            const toggle = wrapRef.current?.querySelector<HTMLElement>(
              `[data-menu-toggle="${menu}"]`,
            );
            setMenu(null);
            toggle?.focus();
          }
        }}
        onBlur={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setMenu(null);
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Link href="/" className="shrink-0 rounded-lg">
            <Image
              src="/brand/logo.png"
              alt={`${site.name} — home`}
              width={1641}
              height={424}
              priority
              className="h-11 w-auto sm:h-14"
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Main">
            {nav.map((item) => {
              const current = isCurrent(item.href);
              const isOpen = menu === item.label;
              return (
                <div
                  key={item.href}
                  className="flex items-center"
                  onMouseEnter={() => openMenu(item.children ? item.label : null)}
                >
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`whitespace-nowrap rounded-full px-2.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-frost hover:text-tanzanite ${
                      current ? "bg-frost text-tanzanite" : "text-basalt"
                    } ${item.children ? "pr-1.5" : ""}`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      data-menu-toggle={item.label}
                      aria-expanded={isOpen}
                      aria-controls={`menu-${item.label}`}
                      onClick={() => setMenu(isOpen ? null : item.label)}
                      className="-ml-1 grid h-9 w-8 place-items-center rounded-full text-scree transition-colors hover:bg-frost hover:text-tanzanite"
                    >
                      <span className="sr-only">{item.label} menu</span>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 12 12"
                        className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.5 4.5 6 8l3.5-3.5" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          <Link
            href="/plan"
            className="ml-auto hidden shrink-0 rounded-full bg-brand px-7 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all sm:inline-flex hover:bg-brand-bright hover:shadow-[0_8px_28px_-6px_rgba(240,159,15,0.65)] xl:ml-0"
          >
            Plan my trip
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-frost sm:ml-0 xl:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="text-2xl leading-none">
              {open ? "×" : "≡"}
            </span>
          </button>
        </div>

        {/* ---- Mega panels (desktop). Rendered only for the open item, so
            closed panels add nothing to the tab order. ---- */}
        {nav.map(
          (item) =>
            item.children &&
            menu === item.label && (
              <div
                key={item.label}
                id={`menu-${item.label}`}
                className="absolute inset-x-0 top-full z-50 hidden px-6 pt-1 xl:block"
              >
                <div
                  className={`mx-auto grid max-w-6xl gap-6 rounded-[24px] bg-glacier p-6 shadow-[0_30px_60px_-20px_rgba(43,44,16,0.35)] ring-1 ring-mist ${
                    popular[item.label] ? "grid-cols-[1fr_1fr_280px]" : "grid-cols-[1fr_300px]"
                  }`}
                >
                  <div>
                    <p className="label mb-2 px-3 text-tanzanite">Explore</p>
                    <ul>
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-frost">
                            <span className="block font-display text-base text-basalt">{c.label}</span>
                            {c.note && <span className="block text-xs text-scree">{c.note}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {popular[item.label] && (
                    <div>
                      <p className="label mb-2 px-3 text-tanzanite">Popular</p>
                      <ul>
                        {popular[item.label].filter(Boolean).map((t) => (
                          <li key={t!.href}>
                            <Link href={t!.href} className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-frost">
                              <span className="block font-display text-base text-basalt">{t!.label}</span>
                              <span className="metric block text-xs text-tanzanite">{t!.meta}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={item.href}
                        className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite hover:bg-frost"
                      >
                        View all {item.label.toLowerCase()} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  )}

                  {item.featured && <FeaturedCard f={item.featured} />}
                </div>
              </div>
            ),
        )}

        {open && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="max-h-[75vh] overflow-y-auto border-t border-mist px-6 py-2 xl:hidden"
          >
            {nav.map((item) => (
              <div key={item.href} className="border-b border-mist py-1 last:border-0">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block py-3 text-xs font-semibold uppercase tracking-[0.14em] text-basalt"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="mb-2 space-y-0.5 pl-4">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block py-2.5 text-sm text-scree"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <Link
              href="/plan"
              onClick={() => setOpen(false)}
              className="my-4 block rounded-full bg-brand px-7 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-basalt"
            >
              Plan my trip
            </Link>
          </nav>
        )}

        {/* Hangs below the header, tearing the white down into the hero
            photograph. Kept out of the header box so it cannot clip the logo. */}
        <div className="torn torn-hang" aria-hidden="true" />
      </div>
    </header>
  );
}

function FeaturedCard({ f }: { f: NonNullable<NavItem["featured"]> }) {
  const img = photo(f.imageKey);
  return (
    <Link
      href={f.href}
      className="group relative isolate flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[20px] bg-basalt p-5 text-glacier"
    >
      {img && (
        <Image
          src={img.src}
          alt=""
          fill
          sizes="340px"
          className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-basalt/90 via-basalt/40 to-transparent"
      />
      <span className="font-display text-2xl leading-tight">{f.title}</span>
      <span className="mt-1.5 text-sm text-glacier/90">{f.note}</span>
      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-basalt">
        {f.cta} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export function SiteFooter({ hasBlog = false }: { hasBlog?: boolean }) {
  const footerImg = photo("hero-safaris");
  const link = "text-sm text-glacier/90 hover:text-glacier hover:underline underline-offset-4";

  const trips = [
    ["Climb Kilimanjaro", "/kilimanjaro"],
    ["Group departures", "/departures"],
    ["Safaris", "/safaris"],
    ["Combo trips", "/combos"],
    ["Zanzibar", "/zanzibar"],
    ["Day trips", "/day-trips"],
    ["Halal tours", "/halal-tours"],
    ["Plan my trip", "/plan"],
  ];
  const company = [
    ["About us", "/about"],
    ["Why choose us", "/about#whychooseus"],
    ["Kilimanjaro FAQs", "/faqs/kilimanjaro"],
    ["Safari FAQs", "/faqs/safari"],
    ...(hasBlog ? [["Blog", "/blog"]] : []),
    ["Contact us", "/contact"],
  ];

  /* A few links up front, the rest behind "See more". */
  const seeMore =
    "mt-3 inline-block cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.12em] text-brand group-open/more:hidden [&::-webkit-details-marker]:hidden";
  const list = (items: string[][], keep: number) => (
    <>
      <ul className="space-y-2">
        {items.slice(0, keep).map(([l, h]) => (
          <li key={h}><Link href={h} className={link}>{l}</Link></li>
        ))}
      </ul>
      {items.length > keep && (
        <details className="group/more">
          <summary className={seeMore}>See more +</summary>
          <ul className="mt-2 space-y-2">
            {items.slice(keep).map(([l, h]) => (
              <li key={h}><Link href={h} className={link}>{l}</Link></li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
  const tripLinks = list(trips, 4);
  const companyLinks = list(company, 3);
  const contactLinks = (
    <>
      <ul className="space-y-2">
        <li><a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className={`${link} metric`}>{site.contact.phone}</a></li>
        <li><a href={`mailto:${site.contact.email}`} className={link}>{site.contact.email}</a></li>
      </ul>
      <details className="group/more">
        <summary className={seeMore}>See more +</summary>
        <ul className="mt-2 space-y-2">
          <li className="text-sm text-glacier/90">{site.contact.address}</li>
          <li className="flex flex-wrap gap-x-4 gap-y-2">
            <a href={site.whatsappUrl} rel="noopener noreferrer" className={link}>WhatsApp</a>
            {site.social.map((s) => (
              <a key={s.url} href={s.url} rel="noopener noreferrer" className={link}>{s.name}</a>
            ))}
            <a href={site.reviews.url} rel="noopener noreferrer" className={link}>{site.reviews.platform}</a>
          </li>
          {site.payments.url && (
            <li>
              <a href={site.payments.url} rel="noopener noreferrer" className="inline-block rounded-full bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-basalt">
                Pay now
              </a>
            </li>
          )}
        </ul>
      </details>
    </>
  );

  const cols: [string, React.ReactNode][] = [
    ["Trips", tripLinks],
    ["Company", companyLinks],
    ["Get in touch", contactLinks],
  ];

  return (
    <footer className="on-dark relative isolate overflow-hidden bg-basalt px-6 pb-10 pt-20 text-glacier">
      {footerImg && (
        <Image src={footerImg.src} alt="" fill sizes="100vw" className="-z-20 object-cover object-[50%_40%]" />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-basalt/92 via-basalt/88 to-basalt/95" />
      <div className="torn torn-top torn-dark" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">
        {/* Brand and the three ways to reach us */}
        <div className="flex flex-col gap-6 border-b border-glacier/15 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Image src="/brand/logo.png" alt={site.name} width={1641} height={424} className="h-12 w-auto" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-glacier/85">
              Kilimanjaro, safaris, Zanzibar and day trips, run from Moshi since {site.established}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="rounded-full border border-glacier/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-glacier hover:text-basalt">
              Call
            </a>
            <a href={site.whatsappUrl} rel="noopener noreferrer" className="rounded-full bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-basalt hover:bg-brand-bright">
              WhatsApp
            </a>
            <Link href="/contact" className="rounded-full border border-glacier/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-glacier hover:text-basalt">
              Message
            </Link>
          </div>
        </div>

        {/* Links: short columns, each with a See more button */}
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 py-7 md:grid-cols-3 md:gap-10">
          {cols.map(([title, body], i) => (
            <div key={title} className={i === 2 ? "col-span-2 md:col-span-1" : ""}>
              <h2 className="label mb-3 text-brand">{title}</h2>
              {body}
            </div>
          ))}
        </nav>

        {/* Memberships */}
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-glacier/15 py-5 md:justify-start" aria-label="Memberships">
          {site.members.map((m) => (
            <li key={m.name}>
              <Image src={m.logo} alt={m.full} width={m.w} height={m.h} className="h-8 w-auto object-contain opacity-90" />
            </li>
          ))}
          {site.payments.url && (
            <li>
              <Image src={site.payment.logo} alt="Accepted payment methods" width={site.payment.w} height={site.payment.h} className="h-7 w-auto rounded bg-glacier/95 p-1" />
            </li>
          )}
        </ul>

        <div className="flex flex-col gap-3 border-t border-glacier/15 pt-5 text-xs text-glacier/80 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link href="/terms" className="hover:text-glacier">Booking terms</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-glacier">Privacy</Link></li>
            <li><Link href="/tipping-policy" className="hover:text-glacier">Tipping policy</Link></li>
            <li><CookieSettingsButton className="hover:text-glacier" /></li>
            <li>
              <a href="https://unsplash.com/photos/6J3gBcvfbfo" rel="noopener noreferrer" className="hover:text-glacier">
                Zanzibar photo: Crispin Jones, Unsplash
              </a>
            </li>
            {site.sisterBrands.map((b) => (
              <li key={b.url}><a href={b.url} rel="noopener noreferrer" className="hover:text-glacier">{b.name}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
