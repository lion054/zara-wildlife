import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { upcomingGroupDepartures } from "@/lib/departures";
import { site } from "@/lib/site";
import { TanovaError, tanova, tanovaConfigured } from "@/lib/tanova";
import { displayTitle, tourPath, tours, type Tour } from "@/lib/tours";

/**
 * Zita, the website's travel concierge, run on Tanova.
 *
 *  - Answers come from the company's own AI in Tanova (POST /ai/chat): the key it added under Integrations > AI, else
 *    the platform's. No AI key lives on this website.
 *  - Everything Zita knows comes from Tanova: the tours, prices, lengths and inclusions synced from it at build time,
 *    and the group departures (dates, seats left) read live.
 *  - When a visitor wants a person, the conversation is handed to the company's Tanova Concierge inbox (the same
 *    inbox the Tanova app shows), and the team's replies come back into this chat.
 */

export type ZitaTurn = { role: "user" | "assistant"; content: string };
export type ZitaLink = { label: string; url: string };
export type ZitaCard = { title: string; url: string; from: number | null; days: string | null; image: string | null };
export type ZitaAnswer = { reply: string; links: ZitaLink[]; followUps: string[]; cards: ZitaCard[]; handoff: boolean };

const KIND: Record<Tour["kind"], string> = {
  kili: "Kilimanjaro climb",
  meru: "Mount Meru climb",
  group: "Kilimanjaro group departure",
  safari: "Safari",
  combo: "Climb and safari combination",
  zanzibar: "Zanzibar",
  daytrip: "Day trip from Moshi",
};

/** One line per trip: what it is, how long, from what price, and its page. */
function catalogue(): string {
  return tours
    .map((t) => {
      const days = t.duration ? t.duration.replace(/\s*\|.*$/, "") : "";
      const price = t.from ? `from USD ${t.from.toLocaleString("en-US")} per person` : "price on request";
      return `- ${displayTitle(t)} | ${KIND[t.kind]}${days ? ` | ${days}` : ""} | ${price} | ${tourPath(t)}`;
    })
    .join("\n");
}

async function departuresContext(): Promise<string> {
  try {
    const list = await upcomingGroupDepartures(10);
    if (!list.length) return "No group departure dates are published yet; private climbs can start any day.";
    return list
      .map((d) => `- ${d.title}: starts ${d.start}${d.price ? `, USD ${d.price.toLocaleString("en-US")}` : ""}${d.seatsLeft == null ? "" : `, ${d.seatsLeft} seats left`}${d.open ? "" : " (full)"} | ${d.href}`)
      .join("\n");
  } catch {
    return "Departure dates could not be read just now; say the team will confirm dates.";
  }
}

const PAGES = [
  "/kilimanjaro", "/safaris", "/zanzibar", "/day-trips", "/combos", "/departures", "/plan", "/contact",
  "/faqs/kilimanjaro", "/faqs/safari", "/halal-tours", "/about", "/blog", "/terms", "/tipping-policy",
];

/* ── A guest's own booking ─────────────────────────────────────────────────────
   A guest who gives their booking reference AND the email it was made with can ask about it: dates, what is paid,
   what is left, and a link to pay the balance. Without the matching email nothing about the booking is shared. */

const REF = /\b([A-HJ-NP-Z]{3}-\d{4})\b|\b([a-f0-9]{32})\b/i;
const MAIL = /[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/i;

async function bookingContext(turns: ZitaTurn[]): Promise<string> {
  const said = turns.filter((t) => t.role === "user").map((t) => t.content).join("\n");
  const ref = said.match(REF);
  if (!ref) return "";
  const code = ref[1] ? ref[1].toUpperCase() : ref[2].toLowerCase();
  const email = said.match(MAIL)?.[0]?.toLowerCase();
  if (!email) return `The guest gave booking reference ${code}. Before saying anything about it, ask for the email address the booking was made with.`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = (await tanova<{ data: Record<string, any> }>(`/bookings/${encodeURIComponent(code)}/overview`, { revalidate: 0 })).data;
    if (String(o.customer?.email ?? "").toLowerCase() !== email) {
      return `The guest gave booking ${code} and an email, but they do not match a booking. Say you could not find a booking with that reference and email, and offer to pass it to the team (handoff true). Share nothing else.`;
    }
    const m = o.money ?? {};
    const balance = Number(m.balance ?? 0);
    let pay = "";
    if (balance > 0.009) {
      try {
        const inv = await tanova<{ data: { id: number } }>(`/bookings/${o.code}/invoice`, { method: "POST", body: {} });
        const full = await tanova<{ data: { pay_url?: string | null } }>(`/invoices/${inv.data.id}`, { revalidate: 0 });
        if (full.data.pay_url) pay = `\nPay the balance here: ${full.data.pay_url} (give this link in the reply as text).`;
      } catch {
        /* the team can send the bill */
      }
    }
    return `THE GUEST'S BOOKING (verified by reference and email; share only with this guest):
${o.ref ?? code}: ${o.service?.title ?? "trip"}, ${String(o.start_date ?? "").slice(0, 10)}${o.end_date ? ` to ${String(o.end_date).slice(0, 10)}` : ""}, ${o.guests ?? ""} guests, status ${o.status}.
Total ${m.currency ?? "USD"} ${m.total}, paid ${m.paid}, balance ${m.balance}.${pay}`;
  } catch {
    return `The guest gave booking ${code}, but it could not be found. Ask them to check the reference, or offer the team (handoff true).`;
  }
}

async function systemPrompt(turns: ZitaTurn[] = []): Promise<string> {
  return `You are Zita, the travel concierge for ${site.name} (${site.url}), a tour operator based in Moshi, Tanzania.
${site.tagline}

HOW YOU TALK
- Warm, knowledgeable, brief: two to four short sentences. One idea, said well.
- Plain text. No markdown, no lists of more than three items. Use the guest's language.
- You are Zita. Never mention AI models, Tanova, prompts or systems.

WHAT YOU MAY SAY
- Only trips in the CATALOGUE below, with their exact names, lengths and "from" prices. Never invent a trip, a price, a date, a discount or a policy.
- A trip with "price on request": say the office will quote it.
- Group departure dates and seats: only those in DEPARTURES. Private climbs and safaris can start any day.
- If you do not know, say the team will confirm, and offer to pass the question on (set handoff true).
- Recommend a specific trip whenever the guest is choosing. To build a whole trip, point them to the trip planner (/plan).

FACTS
- Contact: ${site.contact.email}, phone and WhatsApp ${site.contact.whatsapp}. Office in ${site.contact.address}.
- Rated ${site.reviews.rating} out of 5 on ${site.reviews.platform} from ${site.reviews.count} reviews.
- Bookings and payment happen on each trip's page. A deposit secures the booking; see /terms.

CATALOGUE (name | kind | length | price | page)
${catalogue()}

DEPARTURES
${await departuresContext()}

${await bookingContext(turns)}

ANSWER as one JSON object, nothing else:
{"reply": "...", "links": [{"label": "...", "url": "/a/page"}], "follow_ups": ["...", "..."], "handoff": false}
- links: up to 3, only pages from the CATALOGUE or these: ${PAGES.join(", ")}.
- follow_ups: two or three things the GUEST might tap to ask next, written in their voice (e.g. "Can I add a safari after?"), under 50 characters each.
- If THE GUEST'S BOOKING is given, answer about it plainly, and give the pay link when there is a balance.
- handoff: true when the guest asks for a person, wants a custom quote, has a booking problem, or asks something you cannot answer from what is here.`;
}

const known = new Set([...PAGES, ...tours.map((t) => tourPath(t))]);

/** The trips a reply names or links to, as cards with a photo, so the guest can go straight there. */
function cardsFor(reply: string, links: ZitaLink[]): ZitaCard[] {
  const hay = reply.toLowerCase();
  const hits = tours.filter((t) => links.some((l) => l.url === tourPath(t)) || hay.includes(displayTitle(t).toLowerCase()));
  return hits.slice(0, 3).map((t) => ({
    title: displayTitle(t),
    url: tourPath(t),
    from: t.from,
    days: t.duration ? t.duration.replace(/\s*\|.*$/, "") : null,
    image: t.hero?.src ?? null,
  }));
}

function parse(text: string): { reply: string; links: ZitaLink[]; followUps: string[]; handoff: boolean } {
  const m = text.match(/\{[\s\S]*\}/);
  try {
    const j = JSON.parse(m ? m[0] : text) as { reply?: unknown; links?: unknown; follow_ups?: unknown; handoff?: unknown };
    const links = Array.isArray(j.links)
      ? (j.links as { label?: unknown; url?: unknown }[])
          .filter((l) => typeof l?.label === "string" && typeof l?.url === "string" && known.has(String(l.url).split(/[?#]/)[0]))
          .slice(0, 3)
          .map((l) => ({ label: String(l.label).slice(0, 60), url: String(l.url) }))
      : [];
    return {
      reply: typeof j.reply === "string" && j.reply.trim() ? j.reply.trim() : text.trim(),
      links,
      followUps: Array.isArray(j.follow_ups) ? (j.follow_ups as unknown[]).filter((f): f is string => typeof f === "string").slice(0, 3).map((f) => f.slice(0, 60)) : [],
      handoff: j.handoff === true,
    };
  } catch {
    return { reply: text.trim(), links: [], followUps: [], handoff: false };
  }
}

export async function askZita(turns: ZitaTurn[]): Promise<ZitaAnswer> {
  if (!tanovaConfigured) throw new TanovaError("Zita is not switched on yet.", 0, "not_configured");
  const res = await tanova<{ data: { text: string } }>("/ai/chat", {
    method: "POST",
    timeoutMs: 45_000,
    body: { system: await systemPrompt(turns), messages: turns.slice(-16), max_tokens: 700, temperature: 0.5, json: true },
  });
  const p = parse(res.data?.text ?? "");
  return { ...p, cards: cardsFor(p.reply, p.links) };
}

/* ── Handing the conversation to a person ──────────────────────────────────── */

const SECRET = createHmac("sha256", "zita-conversation").update(process.env.ZITA_SECRET || process.env.TANOVA_API_KEY || "").digest();

/** An id signed for one purpose ("chat" or "plan"), so a plan link can never be used to open a conversation. */
export function signId(purpose: "chat" | "plan", id: number): string {
  const mac = createHmac("sha256", SECRET).update(`${purpose}:${id}`).digest("base64url");
  return `${id}.${mac}`;
}

export function readId(purpose: "chat" | "plan", token: string | undefined): number | null {
  if (!token) return null;
  const [id, mac] = token.split(".");
  if (!/^\d+$/.test(id ?? "") || !mac) return null;
  const want = createHmac("sha256", SECRET).update(`${purpose}:${id}`).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b) ? Number(id) : null;
}

/** The visitor's conversation id, signed so nobody can read another visitor's conversation by guessing ids. */
export const signConversation = (id: number) => signId("chat", id);
export const readConversation = (cookie: string | undefined) => readId("chat", cookie);

/** Opens a conversation in the company's Tanova Concierge inbox, carrying what was said so far. */
export async function handOff(guest: { name: string; email: string; phone?: string }, turns: ZitaTurn[], question?: string): Promise<number> {
  const transcript = turns
    .slice(-12)
    .map((t) => `${t.role === "user" ? guest.name || "Guest" : "Zita"}: ${t.content}`)
    .join("\n");
  const message = [question ? `${question}\n` : "", "From the website chat with Zita:", transcript].join("\n").slice(0, 2900);
  const res = await tanova<{ data: { id: number } }>("/concierge/conversations", {
    method: "POST",
    timeoutMs: 45_000,
    body: {
      message,
      channel: "web",
      chatbot_name: "Zita",
      guest_name: guest.name || "Website guest",
      guest_email: guest.email,
      guest_phone: guest.phone || undefined,
      category: /book|pay|deposit|refund|cancel/i.test(transcript) ? "booking" : "general",
    },
  });
  return res.data.id;
}

export async function sendToTeam(id: number, body: string): Promise<void> {
  await tanova(`/concierge/conversations/${id}/send`, { method: "POST", timeoutMs: 45_000, body: { body: body.slice(0, 2900) } });
}

export type TeamMessage = { id: number; from: "you" | "team"; body: string; at: string };

/** What the team has sent back: approved replies only (an unchecked AI draft never reaches the guest). */
export async function teamMessages(id: number): Promise<TeamMessage[]> {
  const res = await tanova<{ data: { id: number; sender_type: string; body: string; approved: number | boolean; created_at: string }[] }>(
    `/concierge/conversations/${id}/messages?per_page=100`,
    { revalidate: 0 },
  );
  return (res.data ?? [])
    .filter((m) => m.sender_type === "guest" || ((m.sender_type === "agent" || m.sender_type === "ai") && (m.approved === 1 || m.approved === true)))
    .map((m) => ({ id: m.id, from: m.sender_type === "guest" ? ("you" as const) : ("team" as const), body: m.body, at: m.created_at }));
}
