import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { CookieBanner } from "@/components/cookie-banner";
import { ZitaLauncher } from "@/components/zita-launcher";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getPosts } from "@/lib/posts";
import { displayTitle, getTour, tourPath, type TourKind } from "@/lib/tours";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Display and body faces are Kiwano's own — Bjorn and San Francisco Display,
 * self-hosted from /public/fonts and declared in globals.css.
 *
 * Mono survives the reskin: every altitude, price and day number on this site
 * is set in it so the columns line up. Kiwano has no mono of its own, and
 * substituting a proportional face would break the one piece of typography
 * here that carries information rather than mood.
 */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.short}` },
  description: site.description,
  /* The operator's own favicon artwork, taken from their site. */
  icons: {
    icon: [
      { url: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/favicon-270.png", sizes: "270x270", type: "image/png" },
    ],
    apple: "/brand/favicon-192.png",
  },
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    locale: "en_GB",
    type: "website",
  },
};

/* Browser chrome picks up the brand green. Lives here, not in `metadata` —
   Next moved themeColor onto the viewport export. */
export const viewport: Viewport = {
  themeColor: "#566a1b",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/logo.png`,
  email: site.contact.email,
  telephone: site.contact.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Moshi",
    addressRegion: "Kilimanjaro",
    addressCountry: "TZ",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: site.reviews.rating,
    reviewCount: site.reviews.count,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hasBlog = (await getPosts()).length > 0;

  /* "Popular" column in the mega menu, built from the tour data so the
     prices never drift from the tour pages. */
  const pick = (kind: TourKind, key: string) => {
    const t = getTour(kind, key);
    if (!t) return null;
    const days = t.duration ? t.duration.replace(/\s*\|.*$/, "") : "";
    return { label: displayTitle(t), href: tourPath(t), meta: [/days/.test(displayTitle(t)) ? "" : days, t.from ? `from $${t.from.toLocaleString()}` : "On request"].filter(Boolean).join(" · ") };
  };
  const popular = {
    Safari: [
      pick("safari", "lion-safari-adventure"),
      pick("safari", "northern-circuit-tanzania-safari"),
      pick("safari", "serengeti-wildebeest-migration-experience"),
    ],
    Trekking: [
      pick("kili", "machame-route-6"),
      pick("kili", "lemosho-route-8"),
      pick("kili", "marangu-route-6"),
    ],
  };
  return (
    <html lang="en" className={plexMono.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-tanzanite focus:px-5 focus:py-2 focus:text-glacier"
        >
          Skip to content
        </a>
        <SiteHeader hasBlog={hasBlog} popular={popular} />
        <main id="main">{children}</main>
        <SiteFooter hasBlog={hasBlog} />
        <CookieBanner />
        <ZitaLauncher />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </body>
    </html>
  );
}
