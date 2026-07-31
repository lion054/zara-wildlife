import type { NextConfig } from "next";

/**
 * Next 16. Turbopack is the default bundler for both dev and build, so there
 * is nothing to opt into here.
 *
 * `output: "export"` is deliberately NOT set. The static build this was ported
 * from already covers the "just give me HTML" case; the reason to be on Next
 * at all is the things a static export cannot do — server actions for the
 * deposit, revalidation for live seat counts, and i18n routing for the three
 * languages the operator advertises and does not deliver.
 */
const nextConfig: NextConfig = {
  images: {
    // Every photograph is local and already sized; AVIF first, WebP behind it.
    formats: ["image/avif", "image/webp"],
  },
  typedRoutes: true,
};

export default nextConfig;
