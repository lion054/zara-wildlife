import type { Metadata, Viewport } from "next";
import { Header, Footer } from "@/components/site-chrome";
import { TanovaChat } from "@/components/tanova-chat";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Root layout.
 *
 * The `TravelAgency` + `AggregateRating` block sits here so it is on every
 * page. The live site publishes no structured data at all, which means 53
 * five-star reviews it has already earned do nothing for it in search results.
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Kilimanjaro, safaris and Zanzibar`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    images: ["/photos/hero-home.jpg"],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#20201c",
};

const agencyJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: site.name,
  description: site.description,
  url: site.url,
  logo: `${site.url}/brand/logo.png`,
  telephone: site.contact.phone,
  email: site.contact.email,
  foundingDate: String(site.established),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Moshi",
    addressRegion: "Kilimanjaro Region",
    addressCountry: "TZ",
  },
  availableLanguage: [...site.languages],
  sameAs: [...site.social.map((s) => s.url), site.reviews.url],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: String(site.reviews.rating),
    reviewCount: String(site.reviews.count),
    bestRating: "5",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agencyJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-[9999] focus:bg-ink focus:px-6 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        {/* No top padding, deliberately.
            Every page on the site opens with a hero photograph, and each hero
            already reserves the header's 104px inside its own padding. Pushing
            `main` down as well left a 104px band of flat cream above every
            photograph — invisible while the header was an opaque white slab,
            and the first thing you would see through it once it became glass.
            The photographs now run under the chrome, which is the whole point
            of the chrome being translucent. */}
        <main id="main">{children}</main>
        <Footer />
        <TanovaChat />
      </body>
    </html>
  );
}
