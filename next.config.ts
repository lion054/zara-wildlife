import type { NextConfig } from "next";
import { redirects } from "./src/lib/redirects";

/* Blog photos are served by Tanova itself, so its address is the one remote
   image host this site trusts. It comes from the same setting the API uses. */
const tanova = (() => {
  try {
    return process.env.TANOVA_API_URL ? new URL(process.env.TANOVA_API_URL) : null;
  } catch {
    return null;
  }
})();

const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  /* NEXT_OUTPUT=standalone builds a self-contained server folder, so the host needs no node_modules. */
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" as const } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: tanova
      ? [{ protocol: tanova.protocol.replace(":", "") as "http" | "https", hostname: tanova.hostname, port: tanova.port, pathname: "/uploads/**" }]
      : [],
  },
  async redirects() {
    return redirects.flatMap(({ from, to }) => [
      { source: from, destination: to, permanent: true },
      { source: `${from}/`, destination: to, permanent: true },
    ]);
  },
};

export default config;
