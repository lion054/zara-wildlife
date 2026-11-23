import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Search engines may read every page; the site's internal endpoints (bookings, chat, location) are not pages. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/"] }, sitemap: `${site.url}/sitemap.xml`, host: site.url };
}
