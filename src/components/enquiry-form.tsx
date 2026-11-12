"use client";

import { useState } from "react";
import { submitEnquiry, type EnquiryKind, type EnquiryResult } from "@/lib/enquiries";

/**
 * The one place a visitor can actually reach the office.
 *
 * Handles the three states a form has to have and previously did not:
 * submitting (button disabled, label changes), succeeded (the form is
 * replaced by the confirmation, so nobody sends twice), and failed (errors
 * appear against the field that caused them, not as a banner).
 */

const field =
  "w-full rounded-lg border border-scree/60 bg-white px-4 py-3 text-sm text-basalt " +
  "focus:border-tanzanite focus:outline-none";
const fieldBad = "border-sunrise bg-sunrise/5";
const labelCls = "label mb-2 block text-scree";

export function EnquiryForm({
  kind = "contact",
  hidden = {},
  submitLabel = "Send message",
  compact = false,
  children,
  extra,
}: {
  kind?: EnquiryKind;
  /** Context the office needs but the visitor should not have to type. */
  hidden?: Record<string, string>;
  submitLabel?: string;
  compact?: boolean;
  children?: React.ReactNode;
  /** Extra fields rendered just above the message box. */
  extra?: React.ReactNode;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [result, setResult] = useState<EnquiryResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = new FormData(e.currentTarget);
    Object.entries(hidden).forEach(([k, v]) => data.set(k, v));
    const res = await submitEnquiry(kind, data);
    setResult(res);
    setState(res.ok ? "done" : "idle");
  }

  if (state === "done" && result?.ok) {
    return (
      <div
        role="status"
        className={`rounded-[10px] border p-6 ${
          result.degraded
            ? "border-sunrise bg-sunrise/10"
            : "border-brand bg-brand/10"
        }`}
      >
        <h3 className="font-display text-xl">
          {result.degraded ? "Recorded — but please double-check" : "Message sent"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-scree">{result.message}</p>
      </div>
    );
  }

  const err = result?.errors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Honeypot — off-screen, not display:none, so bots still fill it. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor={`company-${kind}`}>Company</label>
        <input id={`company-${kind}`} name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {children}

      {!compact && (
        <div>
          <label className={labelCls} htmlFor={`name-${kind}`}>
            Your name
          </label>
          <input
            id={`name-${kind}`}
            name="name"
            autoComplete="name"
            aria-invalid={!!err.name}
            aria-describedby={err.name ? `name-${kind}-err` : undefined}
            className={`${field} ${err.name ? fieldBad : ""}`}
          />
          {err.name && (
            <p id={`name-${kind}-err`} className="mt-1.5 text-xs text-sunrise-ink">
              {err.name}
            </p>
          )}
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor={`email-${kind}`}>
          Email
        </label>
        <input
          id={`email-${kind}`}
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!err.email}
          aria-describedby={err.email ? `email-${kind}-err` : undefined}
          className={`${field} ${err.email ? fieldBad : ""}`}
        />
        {err.email && (
          <p id={`email-${kind}-err`} className="mt-1.5 text-xs text-sunrise-ink">
            {err.email}
          </p>
        )}
      </div>

      {!compact && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor={`phone-${kind}`}>
              Phone number
            </label>
            <input id={`phone-${kind}`} name="phone" type="tel" autoComplete="tel" className={field} />
          </div>
          <div>
            <label className={labelCls} htmlFor={`country-${kind}`}>
              Country
            </label>
            <input id={`country-${kind}`} name="country" autoComplete="country-name" className={field} />
          </div>
        </div>
      )}

      {!compact && (
        <>
          {!hidden.tour && (
          <div>
            <label className={labelCls} htmlFor={`topic-${kind}`}>
              What it is about
            </label>
            <select
              id={`topic-${kind}`}
              name="topic"
              className={field}
              defaultValue={hidden.interest === "halal" ? "A halal tour" : undefined}
            >
              <option>A Kilimanjaro climb</option>
              <option>A safari</option>
              <option>Zanzibar</option>
              <option>A halal tour</option>
              <option>A combo trip</option>
              <option>A group departure</option>
              <option>Day trips</option>
              <option>An existing booking</option>
              <option>Agents and trade</option>
            </select>
          </div>
          )}
          <div>
            <label className={labelCls} htmlFor={`start-${kind}`}>
              Arrival date
            </label>
            <input
              id={`start-${kind}`}
              name="start"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              aria-invalid={!!err.start}
              className={`${field} ${err.start ? fieldBad : ""}`}
            />
            {err.start && <p className="mt-1.5 text-xs text-sunrise-ink">{err.start}</p>}
          </div>
          {extra}
          <div>
            <label className={labelCls} htmlFor={`message-${kind}`}>
              Message
            </label>
            <textarea
              id={`message-${kind}`}
              name="message"
              rows={6}
              aria-invalid={!!err.message}
              aria-describedby={err.message ? `message-${kind}-err` : undefined}
              className={`${field} ${err.message ? fieldBad : ""}`}
            />
            {err.message && (
              <p id={`message-${kind}-err`} className="mt-1.5 text-xs text-sunrise-ink">
                {err.message}
              </p>
            )}
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-full bg-brand px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright hover:shadow-[0_2px_20px_0_rgba(157,171,31,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : submitLabel}
      </button>

      {result && !result.ok && (
        <p role="alert" className="text-xs text-sunrise-ink">
          {result.message}
        </p>
      )}
    </form>
  );
}
