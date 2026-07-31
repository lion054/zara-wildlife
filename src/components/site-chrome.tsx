import Link from "next/link";
import Image from "next/image";
import { site, crewSize } from "@/lib/site";
import { nav, type NavItem } from "@/lib/nav";
import { BasketBadge } from "@/components/basket-badge";
import { MobileNav } from "@/components/mobile-nav";
import { TripadvisorRating, TripadvisorLockup } from "@/components/tripadvisor";

/**
 * Header and footer.
 *
 * The header is a server component apart from two islands: the basket badge
 * and the mobile drawer. The desktop dropdowns are pure CSS (group-hover plus
 * focus-within), so keyboard and pointer both work with no JavaScript at all.
 *
 * Both bars are glass — the only place in the chrome where it is
 * doing work rather than decorating: the header is fixed, so a hero photograph
 * and then the whole page passes behind it, and the blur is what keeps the nav
 * legible over all of it without the opaque white slab that was there before
 * cutting the hero in half.
 */

/* ------------------------------------------------------------------ *
 * Desktop dropdown
 * ------------------------------------------------------------------ */

/**
 * The panel.
 *
 * Wide enough that no line wraps, with two distinct type levels — an earlier
 * pass dropped a sentence of supporting copy into a 220px box with a 40px
 * line-height and Title Case on every word, which produced three wrapped lines
 * per item and no hierarchy at all. Every note is now one line, and every one
 * carries a number.
 */
function Panel({ item }: { item: NavItem }) {
  if (!item.children) return null;
  return (
    <ul className="glass invisible absolute left-[-18px] top-full z-50 w-[372px] rounded border py-2 opacity-0 transition-[opacity,visibility] duration-[var(--dur-base)] ease-[var(--ease-soft)] group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      {item.children.map((c) => (
        <li key={c.href + c.label}>
          <Link
            href={c.href as never}
            className="block border-l-[3px] border-transparent px-[22px] py-[11px] hover:border-l-olive hover:bg-white/60 focus-visible:border-l-olive focus-visible:bg-white/60"
          >
            <span className="block whitespace-nowrap text-[15px] font-semibold text-ink">{c.label}</span>
            <span className="mt-0.5 block whitespace-nowrap text-[12.5px] text-muted">{c.note}</span>
          </Link>
        </li>
      ))}
      {item.foot && (
        <li className="mt-1.5 border-t border-line pt-1.5">
          <Link
            href={item.foot.href as never}
            className="block border-l-[3px] border-transparent px-[22px] py-[11px] hover:border-l-olive hover:bg-white/60"
          >
            <span className="block text-[15px] font-semibold text-olive-deep">
              {item.foot.label} →
            </span>
            <span className="mt-0.5 block text-[12.5px] text-muted">{item.foot.note}</span>
          </Link>
        </li>
      )}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * Header
 * ------------------------------------------------------------------ */

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-[999]">
      {/* The rating rides every page, above the fold, with the owl on it. On
          the live site these 53 five-star reviews sit at the very bottom of
          the homepage — the one place a hesitant first-time buyer never
          reaches, and unbranded when they get there. */}
      <div className="glass-ink">
        {/* py-2.5, not py-2. The header's height is hard-coded in five places —
            the drawer's `top`, the planner's sticky offset, `scroll-mt` on every
            section, and the top padding of both hero styles. Trimming 4px here
            desynchronises all of them. */}
        <div className="mx-auto flex max-w-[1170px] flex-wrap items-center justify-between gap-2.5 px-5 py-2.5">
          <TripadvisorRating tone="dark" />
          <ul className="flex flex-wrap items-center gap-3.5 text-sm text-white/85">
            <li className="hidden sm:block">
              Call us:{" "}
              <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="hover:text-lime">
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener"
                className="-my-1 inline-block rounded-sm border border-white/30 px-3 py-2 text-[13px] hover:bg-white/10 hover:text-white"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="glass">
        <div className="mx-auto flex max-w-[1170px] items-center justify-between gap-6 px-5 py-3">
          <Link href="/" className="shrink-0">
            <Image
              src={site.brand.logo}
              alt={site.name}
              width={180}
              height={60}
              priority
              className="h-auto w-[150px] lg:w-[180px]"
            />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center">
              {nav.map((item) => (
                <li key={item.href} className="group relative mx-2.5 xl:mx-[15px]">
                  <Link
                    href={item.href as never}
                    className="block py-4 text-[13px] font-medium uppercase tracking-[0.3px] text-ink hover:text-olive-deep xl:text-sm"
                  >
                    {item.label}
                    {item.children && <span aria-hidden className="ml-1 text-[10px]">▾</span>}
                  </Link>
                  <Panel item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <BasketBadge />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * Footer
 * ------------------------------------------------------------------ */

const FOOTER = [
  {
    title: "Climb",
    links: [
      { label: "All six routes", href: "/kilimanjaro" },
      { label: "Group departures", href: "/departures" },
      { label: "Mount Meru", href: "/kilimanjaro/mount-meru-4-day" },
    ],
  },
  {
    title: "Travel",
    links: [
      { label: "Safaris", href: "/safaris" },
      { label: "Climb & Safari", href: "/combos" },
      { label: "Zanzibar", href: "/zanzibar" },
      { label: "Day trips", href: "/day-trips" },
      { label: "Halal travel", href: "/halal" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Plan my trip", href: "/plan" },
    ],
  },
];

/**
 * Kept short on purpose. An earlier version ran five link columns, a boxed
 * accreditation strip and a paragraph of blurb, which made the footer taller
 * than several of the sections above it. What survives is what somebody at the
 * bottom of a page actually wants.
 */
export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1170px] px-5 pb-[26px] pt-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.15fr]">
          <div>
            <Image src={site.brand.logo} alt={site.name} width={148} height={49} className="mb-3.5 h-auto w-[148px]" />
            <p className="text-sm leading-[1.7] text-white/65">
              <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {site.contact.phone}
              </a>
              <br />
              <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                {site.contact.email}
              </a>
              <br />
              {site.contact.address}
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              {site.social.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener" className="text-white/50 hover:text-white">
                  {s.name}
                </a>
              ))}
              <a href={site.whatsappUrl} target="_blank" rel="noopener" className="text-white/50 hover:text-white">
                WhatsApp
              </a>
            </div>
          </div>

          {/* The mark itself, plated, because the supplied lockup is black type
              and this band is warm black. Inverting it would take the owl's
              circle off-brand; a white plate is the sanctioned placement. */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="label mb-3.5 text-white/50">Reviewed by guests</h2>
            <a
              href={site.reviews.url}
              target="_blank"
              rel="noopener"
              aria-label={`Read all ${site.reviews.count} Tripadvisor reviews. Opens in a new tab.`}
              className="inline-block"
            >
              <TripadvisorLockup width={124} plate />
            </a>
            <p className="mt-3 text-sm leading-[1.7] text-white/65">
              <span aria-hidden className="tracking-[1px] text-amber">{"★".repeat(site.reviews.rating)}</span>{" "}
              <strong className="metric text-white">{site.reviews.rating}.0</strong> from{" "}
              <span className="metric">{site.reviews.count}</span> reviews, none solicited.
            </p>
          </div>

          {FOOTER.map((col) => (
            <div key={col.title}>
              <h2 className="label mb-3.5 text-white/50">{col.title}</h2>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href as never} className="text-sm text-white/65 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1170px] flex-col justify-between gap-1.5 px-5 py-3.5 text-[13px] text-white/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name} · Moshi, Tanzania since {site.established} ·{" "}
            {site.languages.join(", ")}
          </p>
          {/* Each accreditation carries its full name and, once supplied, its
              number. A claimed membership with nothing behind it is a logo. */}
          <p className="tracking-[0.5px]">
            {site.credentials.map((c, i) => (
              <span key={c.name}>
                {i > 0 && " · "}
                <abbr
                  title={`${c.full}${c.number ? ` — ${c.number}` : " — membership number to confirm"}`}
                  className="cursor-help border-b border-dotted border-white/30 no-underline"
                >
                  {c.name}
                </abbr>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}

export { crewSize };
