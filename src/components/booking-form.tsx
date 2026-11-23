"use client";

import { useEffect, useMemo, useState } from "react";
import { DepartureCalendar } from "@/components/departure-calendar";
import { EnquiryForm } from "@/components/enquiry-form";
import { PhoneField } from "@/components/phone-field";
import { createBooking, type BookingResult } from "@/lib/bookings";
import { perPerson } from "@/lib/price";

type Dep = { start: string; end?: string | null; seatsLeft: number | null; open: boolean; price: number | null };

const field =
  "w-full rounded-lg border border-scree/60 bg-white px-4 py-3 text-sm text-basalt focus:border-tanzanite focus:outline-none";
const bad = "border-sunrise bg-sunrise/5";
const lab = "label mb-2 block text-scree";

const pretty = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/**
 * Booking for one tour. What it asks depends on what Tanova offers for it:
 *  - group departures: pick one of the published dates (seats left shown); a full
 *    date, or no dates at all, turns the form into a waitlist;
 *  - any-day tours: pick a date;
 * then guests and contact details. The booking is made in Tanova and the visitor
 * gets the booking code, the total and, where Tanova provides one, a payment link.
 */
export function BookingForm({
  tourKey,
  title,
  fixedDate,
  departures,
  ladder,
  initialDate,
  deposit,
}: {
  tourKey: string;
  title: string;
  fixedDate: boolean;
  departures: Dep[];
  ladder: { size: string; price: number | null }[];
  initialDate?: string;
  /** A group climb's terms from Tanova: what holds the seats today, and when the rest is due. */
  deposit?: { type: "percent" | "fixed"; amount: number; label: string; due: string; topups: boolean };
}) {
  const firstOpen = departures.find((d) => d.open)?.start;
  const [start, setStart] = useState(
    initialDate && (!fixedDate || departures.some((d) => d.start === initialDate)) ? initialDate : (firstOpen ?? ""),
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [waitlist, setWaitlist] = useState(false);
  /* Three short steps: the date, who is coming (with the price), then contact details. */
  const [step, setStep] = useState<1 | 2 | 3>(1);

  /* Links from the calendar carry ?date=… so the right departure is already chosen. */
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("date");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && (!fixedDate || departures.some((x) => x.start === d))) setStart(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const picked = departures.find((d) => d.start === start);
  const full = fixedDate && picked && !picked.open;
  const guests = adults + children;
  const per = perPerson(ladder, guests);
  const estimate = per ? per * guests : null;
  // What holds the seats today, worked out the way Tanova's checkout will (a share of the total, or so much a head).
  const holdToday = deposit && estimate ? Math.round(deposit.type === "percent" ? (estimate * deposit.amount) / 100 : Math.min(estimate, deposit.amount * guests)) : null;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const err = result?.errors ?? {};

  /* Group tour with nothing published, or a full date: take their details instead. */
  if (fixedDate && (departures.length === 0 || full || waitlist)) {
    return (
      <div>
        <p className="text-sm leading-relaxed text-scree">
          {departures.length === 0
            ? "No dates are published for this group climb yet. Leave your details and we will email you as soon as dates open, with no obligation."
            : `${picked ? pretty(picked.start) : "That date"} is full. Join the waitlist and we will email you the moment a seat opens.`}
        </p>
        <div className="mt-5">
          <EnquiryForm
            kind="waitlist"
            hidden={{ tourKey, tour: title, ...(picked ? { start: picked.start } : {}) }}
            submitLabel="Join the waitlist"
          >
            <div>
              <label className={lab} htmlFor="wl-guests">How many of you</label>
              <input id="wl-guests" name="guests" type="number" min={1} max={20} defaultValue={2} className={field} />
            </div>
          </EnquiryForm>
        </div>
        {departures.some((d) => d.open) && (
          <button type="button" onClick={() => { setWaitlist(false); setStart(firstOpen ?? ""); }} className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite underline underline-offset-4">
            See the dates with seats
          </button>
        )}
      </div>
    );
  }

  if (result?.ok) {
    return (
      <div role="status" className="rounded-2xl bg-frost p-6">
        <p className="label text-tanzanite">{result.checkoutUrl ? "Seats held" : "Request received"}</p>
        <h3 className="mt-1 font-display text-2xl text-basalt">{result.code ? `Booking ${result.code}` : "Thank you"}</h3>
        <p className="mt-2 text-sm leading-relaxed text-scree">{result.message}</p>
        {typeof result.total === "number" && result.total > 0 && (
          <p className="metric mt-3 text-lg text-tanzanite">Total ${result.total.toLocaleString()}</p>
        )}
        {deposit && typeof result.total === "number" && result.total > 0 && (
          <p className="mt-1 text-sm text-scree">
            Due now to hold your {guests === 1 ? "seat" : "seats"}:{" "}
            <span className="metric text-basalt">
              $
              {Math.round(
                deposit.type === "percent" ? (result.total * deposit.amount) / 100 : Math.min(result.total, deposit.amount * guests),
              ).toLocaleString()}
            </span>{" "}
            ({deposit.label} deposit). {deposit.topups ? `The rest in any amounts, ${deposit.due}.` : `The balance ${deposit.due}.`}
          </p>
        )}
        {result.checkoutUrl && (
          <a
            href={result.checkoutUrl}
            className="mt-5 inline-block rounded-full bg-brand px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-basalt hover:bg-brand-bright"
          >
            {deposit ? "Pay the deposit" : "Pay now"}
          </a>
        )}
        <p className="mt-4 text-xs text-scree">A confirmation goes to the email you gave. Keep the booking code.</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Enter on an earlier step moves on instead of booking.
    if (step < 3) {
      if (step === 1 && !start) return;
      setStep(step === 1 ? 2 : 3);
      return;
    }
    setState("sending");
    const data = new FormData(e.currentTarget);
    data.set("start", start);
    data.set("adults", String(adults));
    data.set("children", String(children));
    const r = await createBooking(tourKey, data);
    setState("idle");
    if (r.soldOut) setWaitlist(true);
    if (r.errors?.start) setStep(1);
    setResult(r);
  }

  const STEPS = [fixedDate ? "Date" : "Start", "Travellers", "Your details"] as const;
  const pickedLabel = start
    ? new Date(`${start}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : null;
  const next = "w-full rounded-full bg-basalt px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-glacier transition hover:bg-basalt-soft disabled:opacity-40";
  const back = "text-xs font-semibold uppercase tracking-[0.12em] text-scree hover:text-basalt";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="bk-company">Company</label>
        <input id="bk-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Where you are: three steps, the earlier ones reachable again. */}
      <ol className="flex items-center gap-2" aria-label="Booking steps">
        {STEPS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const done = n < step;
          const here = n === step;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                disabled={n > step}
                onClick={() => setStep(n)}
                aria-current={here ? "step" : undefined}
                className="flex min-w-0 items-center gap-2 text-left disabled:cursor-default"
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[0.7rem] font-semibold ${
                    here ? "bg-basalt text-glacier" : done ? "bg-tanzanite text-glacier" : "bg-mist text-scree"
                  }`}
                >
                  {done ? "✓" : n}
                </span>
                <span className={`truncate text-xs font-semibold ${here ? "text-basalt" : "text-scree"}`}>{label}</span>
              </button>
              {n < 3 && <span className={`h-px flex-1 ${done ? "bg-tanzanite" : "bg-mist"}`} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {/* What is already chosen, once past the first step. */}
      {step > 1 && pickedLabel && (
        <p className="flex items-center justify-between gap-3 rounded-xl bg-frost px-4 py-2.5 text-sm">
          <span className="text-basalt">
            <span className="font-semibold">{pickedLabel}</span>
            {step > 2 && (
              <span className="text-scree">
                {" "}
                · {guests} {guests === 1 ? "traveller" : "travellers"}
              </span>
            )}
          </span>
          <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-tanzanite underline underline-offset-4">
            Change
          </button>
        </p>
      )}

      {/* Step 1: the date */}
      <div hidden={step !== 1} className="space-y-4">
        {fixedDate ? (
          <fieldset>
            <legend className={lab}>Choose your departure</legend>
            <DepartureCalendar departures={departures} selected={start} onSelect={setStart} />
            {err.start && <p className="mt-1.5 text-xs text-sunrise-ink">{err.start}</p>}
          </fieldset>
        ) : (
          <div>
            <label className={lab} htmlFor="bk-start">Start date</label>
            <input
              id="bk-start"
              type="date"
              min={today}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-invalid={!!err.start}
              className={`${field} ${err.start ? bad : ""}`}
            />
            {err.start && <p className="mt-1.5 text-xs text-sunrise-ink">{err.start}</p>}
          </div>
        )}
        <button type="button" disabled={!start} onClick={() => setStep(2)} className={next}>
          Continue
        </button>
      </div>

      {/* Step 2: who is coming, and what it comes to */}
      <div hidden={step !== 2} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lab} htmlFor="bk-adults">Adults</label>
            <input id="bk-adults" type="number" min={1} max={50} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} className={field} />
          </div>
          <div>
            <label className={lab} htmlFor="bk-children">Children</label>
            <input id="bk-children" type="number" min={0} max={20} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))} className={field} />
          </div>
        </div>

        {estimate ? (
          <div className="rounded-xl bg-frost px-4 py-3 text-sm" aria-live="polite">
            <p className="flex items-baseline justify-between gap-3 text-scree">
              <span>
                {guests} × <span className="metric text-basalt">${per!.toLocaleString()}</span>
              </span>
              <span>
                about <span className="metric text-base text-basalt">${estimate.toLocaleString()}</span>
              </span>
            </p>
            {deposit && holdToday ? (
              <>
                <p className="mt-2 flex items-baseline justify-between gap-3 border-t border-mist pt-2">
                  <span className="font-semibold text-basalt">Due today · {deposit.label} deposit</span>
                  <span className="metric text-lg text-tanzanite">${holdToday.toLocaleString()}</span>
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-scree">
                  {deposit.topups ? `Then pay the rest in any amounts, ${deposit.due}.` : `The balance is due ${deposit.due}.`} Or pay in full.
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-scree">The exact total is confirmed when you book.</p>
            )}
          </div>
        ) : null}

        <button type="button" onClick={() => setStep(3)} className={next}>
          Continue
        </button>
        <button type="button" onClick={() => setStep(1)} className={back}>
          ← Back
        </button>
      </div>

      {/* Step 3: contact details, then book */}
      <div hidden={step !== 3} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={lab} htmlFor="bk-first">First name</label>
            <input id="bk-first" name="first_name" autoComplete="given-name" aria-invalid={!!err.first_name} className={`${field} ${err.first_name ? bad : ""}`} />
            {err.first_name && <p className="mt-1.5 text-xs text-sunrise-ink">{err.first_name}</p>}
          </div>
          <div>
            <label className={lab} htmlFor="bk-last">Surname</label>
            <input id="bk-last" name="last_name" autoComplete="family-name" aria-invalid={!!err.last_name} className={`${field} ${err.last_name ? bad : ""}`} />
            {err.last_name && <p className="mt-1.5 text-xs text-sunrise-ink">{err.last_name}</p>}
          </div>
          <div>
            <label className={lab} htmlFor="bk-email">Email</label>
            <input id="bk-email" name="email" type="email" autoComplete="email" aria-invalid={!!err.email} className={`${field} ${err.email ? bad : ""}`} />
            {err.email && <p className="mt-1.5 text-xs text-sunrise-ink">{err.email}</p>}
          </div>
          <PhoneField id="bk-phone" fieldClass={field} labelClass={lab} />
        </div>
        {/* Notes are optional: folded away so the form stays short, and still sent when filled in. */}
        <details className="group/notes">
          <summary className="cursor-pointer list-none text-xs font-semibold text-tanzanite [&::-webkit-details-marker]:hidden">
            <span className="group-open/notes:hidden">+ Add a note (diet, fitness, celebrations, halal…)</span>
            <span className="hidden group-open/notes:inline">Anything we should know</span>
          </summary>
          <textarea id="bk-notes" name="notes" rows={2} aria-label="Anything we should know" className={`${field} mt-2`} placeholder="Dietary needs, fitness, celebrations, halal arrangements…" />
        </details>

        <button
          type="submit"
          disabled={state === "sending" || !start}
          className="w-full rounded-full bg-brand px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright disabled:opacity-60"
        >
          {state === "sending" ? "Booking…" : deposit && holdToday ? `Hold my ${guests === 1 ? "seat" : "seats"} · $${holdToday.toLocaleString()}` : fixedDate ? "Reserve my seats" : "Book this tour"}
        </button>
        {result && !result.ok && (
          <p role="alert" className="text-sm text-sunrise-ink">
            {result.message}
          </p>
        )}
        <button type="button" onClick={() => setStep(2)} className={back}>
          ← Back
        </button>
      </div>

      <p className="text-xs text-scree">No payment is taken on this page. You get a booking code and a secure payment link.</p>
    </form>
  );
}
