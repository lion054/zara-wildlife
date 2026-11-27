"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ZitaFace } from "@/components/zita-launcher";

export { AskZitaButton } from "@/components/zita-launcher";

/**
 * Zita: the site's travel concierge. Answers come from the company's Tanova (its AI, its tours, its departures);
 * "Talk to a person" hands the conversation to the team's Tanova inbox and their replies arrive here.
 *
 * The conversation is kept for this browser tab (sessionStorage) so moving between pages does not lose it.
 */

type Link_ = { label: string; url: string };
type Card = { title: string; url: string; from: number | null; days: string | null; image: string | null };
type Msg = { role: "user" | "assistant"; content: string; links?: Link_[]; cards?: Card[]; followUps?: string[]; team?: boolean; error?: boolean };
type TeamMsg = { id: number; from: "you" | "team"; body: string; at: string };

const STORE = "zita-chat-v1";
const STARTERS = ["Which Kilimanjaro route suits me?", "When is the best time for the migration?", "Plan a climb and a safari", "What does a day trip from Moshi cost?"];
const HELLO: Msg = {
  role: "assistant",
  content: "Hello, I'm Zita. Ask me about climbing Kilimanjaro, safaris, Zanzibar or a day out from Moshi, and I'll point you to the right trip and its real price.",
};

/** Loaded on demand by ZitaLauncher, which says whether to open at once and with what question. */
export function Zita({ initialOpen = false, initialQuestion = "" }: { initialOpen?: boolean; initialQuestion?: string } = {}) {
  const [open, setOpen] = useState(initialOpen);
  const [msgs, setMsgs] = useState<Msg[]>([HELLO]);
  const [input, setInput] = useState(initialQuestion);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"zita" | "form" | "team">("zita");
  const [team, setTeam] = useState<TeamMsg[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  // Restore this tab's conversation, and whether it was already with the team.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw) as { msgs?: Msg[]; mode?: typeof mode };
        if (Array.isArray(s.msgs) && s.msgs.length) setMsgs(s.msgs.slice(-40));
        if (s.mode === "team") setMode("team");
      }
    } catch {
      /* nothing saved, or storage blocked */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ msgs: msgs.slice(-40), mode: mode === "form" ? "zita" : mode }));
    } catch {
      /* storage full or blocked: the chat still works */
    }
  }, [msgs, mode, restored]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, team, busy, mode, open]);

  // Open from anywhere on the site: <a href="#zita"> or a button that dispatches "zita:open".
  useEffect(() => {
    const show = (e?: Event) => {
      const q = (e as CustomEvent<string> | undefined)?.detail;
      setOpen(true);
      if (typeof q === "string" && q) setInput(q);
    };
    const hash = () => window.location.hash === "#zita" && show();
    window.addEventListener("zita:open", show as EventListener);
    window.addEventListener("hashchange", hash);
    hash();
    return () => {
      window.removeEventListener("zita:open", show as EventListener);
      window.removeEventListener("hashchange", hash);
    };
  }, []);

  // While talking to the team, look for their replies.
  const loadTeam = useCallback(async () => {
    try {
      const r = await fetch("/api/zita/team", { cache: "no-store" });
      const j = (await r.json()) as { open: boolean; messages: TeamMsg[] };
      if (j.open) {
        setTeam(j.messages);
        setMode((m) => (m === "form" ? m : "team"));
      }
    } catch {
      /* offline: try again on the next tick */
    }
  }, []);
  useEffect(() => {
    if (!open || mode !== "team") return;
    loadTeam();
    const t = setInterval(loadTeam, 10_000);
    return () => clearInterval(t);
  }, [open, mode, loadTeam]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    if (mode === "team") {
      setBusy(true);
      try {
        const r = await fetch("/api/zita/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: q }) });
        const j = (await r.json()) as { messages?: TeamMsg[]; error?: string };
        if (j.messages) setTeam(j.messages);
      } finally {
        setBusy(false);
      }
      return;
    }
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const r = await fetch("/api/zita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => !m.error && !m.team).map((m) => ({ role: m.role, content: m.content })) }),
      });
      const j = (await r.json()) as { reply?: string; links?: Link_[]; cards?: Card[]; followUps?: string[]; handoff?: boolean; error?: string };
      if (!r.ok || !j.reply) {
        setMsgs([...next, { role: "assistant", content: j.error ?? "Zita could not answer just now.", error: true }]);
        return;
      }
      setMsgs([...next, { role: "assistant", content: j.reply, links: j.links, cards: j.cards, followUps: j.followUps }]);
      if (j.handoff) setTimeout(() => setMode((m) => (m === "zita" ? "form" : m)), 600);
    } catch {
      setMsgs([...next, { role: "assistant", content: "You seem to be offline. Try again in a moment.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  async function handOff(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const lastQuestion = [...msgs].reverse().find((m) => m.role === "user")?.content;
      const r = await fetch("/api/zita/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, question: lastQuestion, transcript: msgs.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content })) }),
      });
      const j = (await r.json()) as { ok?: boolean; messages?: TeamMsg[]; error?: string };
      if (!r.ok || !j.ok) {
        setFormError(j.error ?? "That did not go through. Try again.");
        return;
      }
      setTeam(j.messages ?? []);
      setMode("team");
      setMsgs((m) => [...m, { role: "assistant", team: true, content: `Thanks ${form.name.split(" ")[0]}. Your conversation is with the team in Moshi now. They reply here and to ${form.email}, usually within a few hours.` }]);
    } catch {
      setFormError("You seem to be offline. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function restart() {
    await fetch("/api/zita/team", { method: "DELETE" }).catch(() => {});
    setMsgs([HELLO]);
    setTeam([]);
    setMode("zita");
  }

  const lastFollowUps = !busy && mode === "zita" ? msgs[msgs.length - 1]?.followUps ?? [] : [];

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fab flex items-center gap-3 rounded-full bg-basalt py-2 pl-2 pr-5 text-glacier shadow-lift transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Ask Zita: trips, prices, dates"
        >
          <ZitaFace size={40} />
          <span className="fab-text text-left leading-tight">
            <span className="block text-[15px] font-semibold">Ask Zita</span>
            <span className="block text-[12px] opacity-75">Trips, prices, dates</span>
          </span>
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Chat with Zita"
          className="fixed inset-0 z-[70] flex flex-col bg-glacier sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(680px,calc(100vh-40px))] sm:w-[400px] sm:overflow-hidden sm:rounded-[24px] sm:shadow-lift"
        >
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-mist bg-basalt px-4 py-3 text-glacier">
            <ZitaFace size={42} />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold leading-tight">Zita</p>
              <p className="flex items-center gap-1.5 text-[12px] opacity-80">
                <span className={`inline-block h-2 w-2 rounded-full ${mode === "team" ? "bg-brand" : "bg-[#7bd389]"}`} />
                {mode === "team" ? "With the team in Moshi" : "Travel concierge · replies in seconds"}
              </p>
            </div>
            <button type="button" onClick={restart} className="rounded-full px-3 py-1.5 text-[12px] opacity-80 hover:bg-white/10 hover:opacity-100">
              New chat
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </header>

          {/* Conversation */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-frost/60 px-4 py-5" aria-live="polite">
            {msgs.map((m, i) => (
              <Bubble key={i} m={m} />
            ))}

            {msgs.length === 1 && mode === "zita" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {STARTERS.map((s) => (
                  <Chip key={s} onClick={() => ask(s)}>{s}</Chip>
                ))}
              </div>
            )}

            {mode === "team" &&
              team.filter((t) => t.from === "team").map((t) => (
                <div key={t.id} className="flex gap-2">
                  <TeamFace />
                  <div className="max-w-[85%] rounded-[18px] rounded-tl-md bg-glacier px-4 py-3 text-[15px] leading-relaxed text-basalt shadow-card">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-tanzanite">The team</p>
                    <p className="whitespace-pre-line">{t.body}</p>
                  </div>
                </div>
              ))}

            {busy && (
              <div className="flex gap-2">
                <ZitaFace size={30} />
                <div className="flex items-center gap-1 rounded-[18px] rounded-tl-md bg-glacier px-4 py-3 shadow-card">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-scree/60" style={{ animationDelay: `${d * 140}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {lastFollowUps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lastFollowUps.map((f) => (
                  <Chip key={f} onClick={() => ask(f)}>{f}</Chip>
                ))}
              </div>
            )}

            {mode === "form" && (
              <form onSubmit={handOff} className="space-y-3 rounded-[18px] bg-glacier p-4 shadow-card">
                <p className="text-[15px] font-semibold text-basalt">Talk to a person</p>
                <p className="text-[13px] leading-relaxed text-scree">The team in Moshi picks up this conversation and replies here and by email.</p>
                <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
                <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
                <Field label="WhatsApp or phone (optional)" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
                {formError && <p className="text-[13px] font-medium text-sunrise-ink">{formError}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setMode("zita")} className="h-12 flex-1 rounded-full border border-mist text-[15px] font-semibold text-basalt">
                    Not now
                  </button>
                  <button type="submit" disabled={busy} className="h-12 flex-1 rounded-full bg-tanzanite text-[15px] font-semibold text-glacier disabled:opacity-60">
                    Send to the team
                  </button>
                </div>
              </form>
            )}
            <div ref={end} />
          </div>

          {/* Composer */}
          <div className="border-t border-mist bg-glacier px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
            {mode === "zita" && msgs.length > 1 && (
              <button type="button" onClick={() => setMode("form")} className="mb-2 ml-1 text-[13px] font-semibold text-tanzanite underline-offset-2 hover:underline">
                Talk to a person instead
              </button>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={box}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(input);
                  }
                }}
                rows={1}
                maxLength={1500}
                placeholder={mode === "team" ? "Write to the team…" : "Ask Zita anything about your trip…"}
                className="max-h-32 min-h-12 flex-1 resize-none rounded-[22px] border border-mist bg-frost px-4 py-3 text-[15px] text-basalt outline-none placeholder:text-scree/70 focus:border-tanzanite"
                aria-label="Your message"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-tanzanite text-glacier transition disabled:opacity-40"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </form>
            <p className="mt-2 px-1 text-center text-[11px] text-scree/80">
              Zita answers from our live trips and prices. The team confirms every booking.
            </p>
          </div>
        </section>
      )}
    </>
  );
}

function Bubble({ m }: { m: Msg }) {
  if (m.role === "user")
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-line rounded-[18px] rounded-tr-md bg-tanzanite px-4 py-3 text-[15px] leading-relaxed text-glacier">{m.content}</p>
      </div>
    );
  return (
    <div className="flex gap-2">
      <ZitaFace size={30} />
      <div className="min-w-0 max-w-[88%] space-y-2">
        <p className={`whitespace-pre-line rounded-[18px] rounded-tl-md px-4 py-3 text-[15px] leading-relaxed shadow-card ${m.error ? "bg-sand text-basalt" : "bg-glacier text-basalt"}`}>{m.content}</p>
        {m.cards?.map((c) => (
          <Link key={c.url} href={c.url} className="flex gap-3 overflow-hidden rounded-[16px] bg-glacier p-2 shadow-card transition hover:-translate-y-0.5">
            {c.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image} alt="" className="h-16 w-20 shrink-0 rounded-[12px] object-cover" loading="lazy" />
            ) : (
              <span className="h-16 w-20 shrink-0 rounded-[12px] bg-sand" />
            )}
            <span className="min-w-0 py-1">
              <span className="block truncate text-[14px] font-semibold text-basalt">{c.title}</span>
              <span className="block font-mono text-[12px] text-scree">
                {[c.days, c.from ? `from $${c.from.toLocaleString("en-US")}` : "price on request"].filter(Boolean).join(" · ")}
              </span>
              <span className="mt-0.5 block text-[12px] font-semibold text-tanzanite">See the trip →</span>
            </span>
          </Link>
        ))}
        {!!m.links?.length && (
          <div className="flex flex-wrap gap-2">
            {m.links
              .filter((l) => !m.cards?.some((c) => c.url === l.url))
              .map((l) => (
                <Link key={l.url} href={l.url} className="rounded-full bg-basalt px-4 py-2 text-[13px] font-semibold text-glacier hover:bg-basalt-soft">
                  {l.label}
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-tanzanite/30 bg-glacier px-3.5 py-2 text-left text-[13px] font-medium text-tanzanite transition hover:border-tanzanite hover:bg-tanzanite hover:text-glacier">
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-scree">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-[14px] border border-mist bg-frost px-4 text-[15px] text-basalt outline-none focus:border-tanzanite"
      />
    </label>
  );
}

function TeamFace() {
  return (
    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-tanzanite text-[12px] font-bold text-glacier" aria-hidden>
      TW
    </span>
  );
}


