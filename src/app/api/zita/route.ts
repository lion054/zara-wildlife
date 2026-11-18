import { NextResponse } from "next/server";
import { TanovaError } from "@/lib/tanova";
import { askZita, type ZitaTurn } from "@/lib/zita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* A light per-visitor limit, on top of Tanova's own: a chat is a conversation, not a script. */
const hits = new Map<string, number[]>();
function allowed(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 12) return false;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

/** POST { messages: [{role, content}] } → Zita's answer, with trips and pages to open next. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip)) return NextResponse.json({ error: "Give Zita a moment, then try again." }, { status: 429 });

  let turns: ZitaTurn[] = [];
  try {
    const body = (await req.json()) as { messages?: unknown };
    turns = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m): m is ZitaTurn => !!m && typeof m === "object" && ((m as ZitaTurn).role === "user" || (m as ZitaTurn).role === "assistant") && typeof (m as ZitaTurn).content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
      .slice(-16);
  } catch {
    /* fall through */
  }
  if (!turns.length || turns[turns.length - 1].role !== "user") return NextResponse.json({ error: "Say something to Zita first." }, { status: 422 });

  try {
    return NextResponse.json(await askZita(turns));
  } catch (e) {
    const quota = e instanceof TanovaError && e.status === 429;
    console.error("[zita] answer failed", e instanceof Error ? e.message : e);
    return NextResponse.json(
      {
        error: quota
          ? "Zita is very busy right now. Leave your details and the team will reply here."
          : "Zita could not answer just now. Try again, or pass your question to the team.",
        handoff: true,
      },
      { status: 503 },
    );
  }
}
