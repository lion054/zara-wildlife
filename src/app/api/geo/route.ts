import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * The visitor's country (ISO code) as Vercel's network sees it, for pre-filling a phone number's country. Nothing is
 * stored or logged; on a host that does not send the header (local dev) it answers null and the form guesses instead.
 */
export function GET(req: NextRequest) {
  const raw = req.headers.get("x-vercel-ip-country") ?? "";
  const country = /^[A-Z]{2}$/.test(raw) ? raw : null;
  return NextResponse.json({ country }, { headers: { "Cache-Control": "private, no-store" } });
}
