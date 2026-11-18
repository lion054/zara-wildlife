import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handOff, readConversation, sendToTeam, signConversation, teamMessages, type ZitaTurn } from "@/lib/zita";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "zita_team";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** GET → the conversation with the team so far (the guest's messages and the team's approved replies). */
export async function GET() {
  const id = readConversation((await cookies()).get(COOKIE)?.value);
  if (!id) return NextResponse.json({ open: false, messages: [] });
  try {
    return NextResponse.json({ open: true, messages: await teamMessages(id) });
  } catch {
    return NextResponse.json({ open: true, messages: [], error: "Messages could not be read just now." });
  }
}

/**
 * POST { name, email, phone?, question?, transcript } → opens the conversation in the company's Tanova inbox.
 * POST { body } with an open conversation → sends the guest's next message to the team.
 */
export async function POST(req: Request) {
  const jar = await cookies();
  const open = readConversation(jar.get(COOKIE)?.value);
  const b = (await req.json().catch(() => ({}))) as { name?: string; email?: string; phone?: string; question?: string; body?: string; transcript?: ZitaTurn[] };

  try {
    if (open && typeof b.body === "string" && b.body.trim()) {
      await sendToTeam(open, b.body.trim());
      return NextResponse.json({ ok: true, messages: await teamMessages(open) });
    }
    const name = (b.name ?? "").trim().slice(0, 120);
    const email = (b.email ?? "").trim().slice(0, 200);
    if (!name || !EMAIL.test(email)) return NextResponse.json({ error: "Add your name and an email the team can reply to." }, { status: 422 });
    const turns = (Array.isArray(b.transcript) ? b.transcript : [])
      .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
      .map((t) => ({ role: t.role, content: t.content.slice(0, 1200) }));
    const id = await handOff({ name, email, phone: (b.phone ?? "").trim().slice(0, 30) || undefined }, turns, (b.question ?? "").trim().slice(0, 1000) || undefined);
    jar.set(COOKIE, signConversation(id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return NextResponse.json({ ok: true, messages: await teamMessages(id).catch(() => []) });
  } catch (e) {
    console.error("[zita] hand-off failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "We could not reach the team just now. Email or WhatsApp us and we will reply." }, { status: 503 });
  }
}

/** DELETE → forget the conversation on this browser (a new chat). */
export async function DELETE() {
  (await cookies()).delete(COOKIE);
  return NextResponse.json({ ok: true });
}
