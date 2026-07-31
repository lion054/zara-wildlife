"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { haptic } from "@/lib/haptics";

/**
 * Yusuph — the assistant panel.
 *
 * Deliberately built in this site's own language rather than the usual chat
 * widget idiom: no gradient bubbles, no pulsing avatar, no rounded-full
 * everything. It is the same cream, the same hairline borders and the same
 * two type sizes as the rest of the page, because a panel that looks bolted on
 * from a different product reads as a bolted-on product.
 *
 * The panel is glass — it is fixed over a scrolling page, which is the one
 * condition the blur is for.
 */

const STORAGE_KEY = "twa.yusuph.v1";

const OPENERS = [
  "Which route gives me the best chance of summiting?",
  "What dates have seats left?",
  "Two of us, two weeks, climb and safari — what does that cost?",
  "What is the cheapest way up the mountain?",
];

type Msg = { role: "user" | "assistant"; content: string; streaming?: boolean };

const GREETING: Msg = {
  role: "assistant",
  content:
    "I'm Yusuph. I can look up any route, price, or departure date on this site — every figure I give you comes from the same data the pages do.<br>What are you thinking about?",
};

/* ------------------------------------------------------------------ *
 * Rendering the reply
 * ------------------------------------------------------------------ */

/**
 * Only <strong> and <br> survive.
 *
 * The system prompt permits exactly those two tags, but a prompt is not a
 * security boundary — a jailbroken or simply confused reply could emit
 * anything, and it lands in `dangerouslySetInnerHTML`. Everything else is
 * stripped, along with any `on*` handler and any `javascript:` URL.
 */
function safeHtml(s: string) {
  return s
    .replace(/<(?!\/?(?:strong|br)\b)[^>]*>/gi, "")
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

const LINK_RE = /\[\[LINK\|([^|\]]+)\|([^\]]+)\]\]/g;

/** Splits the reply into prose and the link blocks the model emitted. */
function parseReply(raw: string) {
  const links: { label: string; href: string }[] = [];
  const prose = raw.replace(LINK_RE, (_m, label: string, href: string) => {
    /* Same-origin paths only. The model is told to use tool-supplied urls;
       this is what happens when it doesn't. */
    if (/^\/[\w\-/#?=&.%]*$/.test(href.trim()) && links.length < 2) {
      links.push({ label: label.trim(), href: href.trim() });
    }
    return "";
  });
  return { prose: prose.trim(), links };
}

function Reply({ text }: { text: string }) {
  const { prose, links } = parseReply(text);
  return (
    <>
      {prose && (
        <p
          className="text-[14.5px] leading-[1.65] text-slate"
          dangerouslySetInnerHTML={{ __html: safeHtml(prose) }}
        />
      )}
      {links.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-1.5">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href as never}
              className="flex items-center justify-between gap-3 border-l-[3px] border-olive-deep bg-paper px-3.5 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:bg-sand"
            >
              {l.label}
              <span aria-hidden className="text-olive-deep">→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * The panel
 * ------------------------------------------------------------------ */

export function YusuphChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Survives navigation within the session, not across visits — a two-week-old
     conversation about dates that have since sold out is worse than none. */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      /* private mode, quota, corrupt value — the greeting is a fine fallback */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter((m) => !m.streaming)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      const next: Msg[] = [
        ...messages.filter((m) => !m.streaming),
        { role: "user", content: trimmed },
      ];
      setMessages([...next, { role: "assistant", content: "", streaming: true }]);
      setInput("");
      setBusy(true);

      let acc = "";
      const settle = (final: string) =>
        setMessages([...next, { role: "assistant", content: final }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.body) throw new Error("no stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          /* Hold the tail — an SSE frame can be split across chunks. */
          const frames = buf.split("\n\n");
          buf = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            let ev: { t?: string; done?: boolean; text?: string };
            try {
              ev = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (ev.t) {
              acc += ev.t;
              setMessages([...next, { role: "assistant", content: acc, streaming: true }]);
            } else if (ev.done) {
              haptic("reply");
              settle(ev.text ?? acc.trim());
              return;
            }
          }
        }
        settle(acc.trim() || "I did not get a reply back. Try that again?");
      } catch {
        settle(
          `I could not reach the office system just then. WhatsApp <strong>${site.contact.whatsapp}</strong> and a person will pick it up.`,
        );
      } finally {
        setBusy(false);
      }
    },
    [messages, busy],
  );

  const fresh = messages.length === 1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="yusuph"
        className="fixed bottom-5 right-5 z-[995] flex items-center gap-2.5 rounded-[3px] bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(32,32,28,0.6)] transition-colors hover:bg-ink-soft"
      >
        <span aria-hidden className="block size-[7px] rounded-full bg-lime" />
        {open ? "Close" : "Ask Yusuph"}
      </button>

      {open && (
        <div
          id="yusuph"
          role="dialog"
          aria-label="Yusuph, the trip assistant"
          className="glass fixed inset-x-3 bottom-[86px] z-[996] flex max-h-[min(620px,calc(100dvh-140px))] flex-col rounded border sm:inset-x-auto sm:right-5 sm:w-[400px]"
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-3.5">
            <div>
              <p className="text-[15px] font-bold text-ink">Yusuph</p>
              <p className="text-[12.5px] text-muted">
                Reads the same prices and seat counts as the pages
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMessages([GREETING]);
                try {
                  sessionStorage.removeItem(STORAGE_KEY);
                } catch {
                  /* ignore */
                }
              }}
              className="shrink-0 text-[12.5px] text-olive-deep underline-offset-2 hover:underline"
            >
              Start over
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4" style={{ overscrollBehavior: "contain" }}>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p key={i} className="ml-8 bg-ink px-3.5 py-2.5 text-[14.5px] leading-[1.55] text-white">
                  {m.content}
                </p>
              ) : (
                <div key={i} className="mr-4">
                  {m.streaming && !m.content ? (
                    <p className="flex gap-1 py-1" aria-label="Yusuph is thinking">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="size-1.5 animate-pulse rounded-full bg-muted"
                          style={{ animationDelay: `${d * 160}ms` }}
                        />
                      ))}
                    </p>
                  ) : (
                    <Reply text={m.content} />
                  )}
                </div>
              ),
            )}

            {fresh && (
              <div className="flex flex-col gap-1.5 pt-1">
                {OPENERS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="border border-line bg-white/70 px-3.5 py-2.5 text-left text-[13.5px] leading-[1.45] text-slate transition-colors hover:border-olive hover:text-ink"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-line px-3 py-3"
          >
            <label className="sr-only" htmlFor="yusuph-input">
              Ask Yusuph a question
            </label>
            <textarea
              id="yusuph-input"
              ref={inputRef}
              value={input}
              rows={1}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Routes, dates, what it costs…"
              className="max-h-24 flex-1 resize-none rounded-[3px] border border-line bg-white px-3.5 py-2.5 text-[14.5px] text-ink focus:border-olive-deep disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="shrink-0 rounded-[3px] bg-brick-text px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brick-dark disabled:opacity-40"
            >
              Send
            </button>
          </form>

          <p className="border-t border-line px-5 py-2 text-[11.5px] leading-[1.5] text-muted">
            Yusuph cannot book or take payment. Nothing is charged until the Moshi office confirms
            your dates in writing.
          </p>
        </div>
      )}
    </>
  );
}
