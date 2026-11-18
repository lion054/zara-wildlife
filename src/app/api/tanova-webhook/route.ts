import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tanova tells the site when something changed (a Tanova webhook to /api/tanova-webhook, signed with
 * TANOVA_WEBHOOK_SECRET). Live parts (departures, posts, planner places) are refreshed at once; when tours or site
 * content changed, the site is rebuilt through DEPLOY_HOOK_URL (a Vercel deploy hook, or any URL that rebuilds it).
 */
function verified(body: string, header: string | null): boolean {
  const secret = process.env.TANOVA_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 600) return false; // older than ten minutes: a replay
  const want = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const got = parts.v2 ?? "";
  return got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!verified(body, req.headers.get("x-tsoka-signature-256"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const event = req.headers.get("x-tsoka-event") ?? "";

  // Seats and dates move with every booking: refresh the pages that show them.
  if (event.startsWith("booking.") || event.startsWith("waitlist.")) {
    revalidatePath("/departures");
    revalidatePath("/departures/[key]", "page");
  }
  if (event === "content.updated") {
    revalidatePath("/", "layout");
    const hook = process.env.DEPLOY_HOOK_URL;
    if (hook) {
      // Tour text, prices and photos are baked in at build: rebuild, at most once every five minutes.
      const g = globalThis as unknown as { __lastRebuild?: number };
      if (!g.__lastRebuild || Date.now() - g.__lastRebuild > 300_000) {
        g.__lastRebuild = Date.now();
        await fetch(hook, { method: "POST" }).catch((e) => console.error("[webhook] rebuild hook failed", e));
      }
    } else {
      console.info("[webhook] content changed in Tanova; no DEPLOY_HOOK_URL set, so tour pages update on the next deploy");
    }
  }
  return NextResponse.json({ ok: true });
}
