"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * The "Ask Zita" bubble every page shows. The chat itself (messages, the AI, handing over to the team) is loaded the
 * first time it is wanted: a tap, a hover or focus on the bubble (so it is ready by the click), an "Ask Zita" button,
 * or a link to #zita. Most visitors never open the chat, so no page pays for it up front.
 */
const Zita = dynamic(() => import("@/components/zita").then((m) => m.Zita), { ssr: false });
const load = () => import("@/components/zita");

/** Zita's mark: a sunrise over Kilimanjaro's shoulder, in the brand's amber and green. */
export function ZitaFace({ size }: { size: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-brand" style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="13" r="6" fill="#14130c" opacity="0.9" />
        <path d="M2 27l9-11 5 6 4-4 10 9H2z" fill="#14130c" />
        <path d="M11 16l2.2 2.6L15 17l-4-1z" fill="#fff" opacity="0.9" />
      </svg>
    </span>
  );
}

/** A button anywhere on the site that opens Zita, optionally with a question ready. */
export function AskZitaButton({ question, children, className }: { question?: string; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent("zita:open", { detail: question ?? "" }))}>
      {children}
    </button>
  );
}

const STORE = "zita-chat-v1";

export function ZitaLauncher() {
  // null: the chat is not loaded yet. Once it is, it handles every later open itself.
  const [start, setStart] = useState<{ open: boolean; question: string } | null>(null);

  useEffect(() => {
    // A conversation already going in this tab (moving between pages): bring the chat back as it was, closed.
    try {
      if (sessionStorage.getItem(STORE)) setStart((s) => s ?? { open: false, question: "" });
    } catch {
      /* storage blocked: nothing to restore */
    }
    const show = (e?: Event) => {
      const q = (e as CustomEvent<string> | undefined)?.detail;
      setStart((s) => s ?? { open: true, question: typeof q === "string" ? q : "" });
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

  if (start) return <Zita initialOpen={start.open} initialQuestion={start.question} />;

  return (
    <button
      type="button"
      onClick={() => setStart({ open: true, question: "" })}
      onPointerEnter={load}
      onFocus={load}
      onTouchStart={load}
      className="fab flex items-center gap-3 rounded-full bg-basalt py-2 pl-2 pr-5 text-glacier shadow-lift transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      aria-label="Ask Zita: trips, prices, dates"
    >
      <ZitaFace size={40} />
      <span className="fab-text text-left leading-tight">
        <span className="block text-[15px] font-semibold">Ask Zita</span>
        <span className="block text-[12px] opacity-75">Trips, prices, dates</span>
      </span>
    </button>
  );
}
