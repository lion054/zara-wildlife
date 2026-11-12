"use client";

import { useEffect, useMemo, useState } from "react";
import { EnquiryForm } from "@/components/enquiry-form";
import { createBooking, type BookingResult } from "@/lib/bookings";
import { perPerson } from "@/lib/price";

type Dep = { start: string; seatsLeft: number | null; open: boolean; price: number | null };

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
}: {
  tourKey: string;
  title: string;
  fixedDate: boolean;
  departures: Dep[];
  ladder: { size: string; price: number | null }[];
  initialDate?: string;
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
        {result.checkoutUrl && (
          <a
            href={result.checkoutUrl}
            className="mt-5 inline-block rounded-full bg-brand px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-basalt hover:bg-brand-bright"
          >
            Pay now
          </a>
        )}
        <p className="mt-4 text-xs text-scree">A confirmation goes to the email you gave. Keep the booking code.</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = new FormData(e.currentTarget);
    data.set("start", start);
    data.set("adults", String(adults));
    data.set("children", String(children));
    const r = await createBooking(tourKey, data);
    setState("idle");
    if (r.soldOut) setWaitlist(true);
    setResult(r);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="bk-company">Company</label>
        <input id="bk-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {fixedDate ? (
        <fieldset>
          <legend className={lab}>Choose your departure</legend>
          <div className="space-y-2">
            {departures.slice(0, 12).map((d) => (
              <label
                key={d.start}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                  start === d.start ? "border-tanzanite bg-tanzanite/5" : "border-scree/40 bg-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input type="radio" name="departure" checked={start === d.start} onChange={() => setStart(d.start)} className="h-4 w-4 accent-brand" />
                  <span className="text-basalt">{pretty(d.start)}</span>
                </span>
                <span className="label text-scree">
                  {!d.open ? "Full · waitlist" : d.seatsLeft !== null && d.seatsLeft <= 4 ? `${d.seatsLeft} left` : "Open"}
                </span>
              </label>
            ))}
          </div>
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

      <div className="grid grid-cols-2 gap-4">
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
        <p className="rounded-xl bg-frost px-4 py-3 text-sm text-scree" aria-live="polite">
          <span className="metric text-base text-tanzanite">${per!.toLocaleString()}</span> per person for {guests} {guests === 1 ? "guest" : "guests"}
          {" · "}about <span className="metric text-base text-basalt">${estimate.toLocaleString()}</span> in total. The exact total is confirmed when you book.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
      <div>
        <label className={lab} htmlFor="bk-email">Email</label>
        <input id="bk-email" name="email" type="email" autoComplete="email" aria-invalid={!!err.email} className={`${field} ${err.email ? bad : ""}`} />
        {err.email && <p className="mt-1.5 text-xs text-sunrise-ink">{err.email}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lab} htmlFor="bk-phone">Phone or WhatsApp</label>
          <input id="bk-phone" name="phone" type="tel" autoComplete="tel" className={field} />
        </div>
        <div>
          <label className={lab} htmlFor="bk-country">Country</label>
          <input id="bk-country" name="country" autoComplete="country-name" className={field} />
        </div>
      </div>
      <div>
        <label className={lab} htmlFor="bk-notes">Anything we should know</label>
        <textarea id="bk-notes" name="notes" rows={3} className={field} placeholder="Dietary needs, fitness, celebrations, halal arrangements…" />
      </div>

      <button
        type="submit"
        disabled={state === "sending" || !start}
        className="w-full rounded-full bg-brand px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-basalt transition-all hover:bg-brand-bright disabled:opacity-60"
      >
        {state === "sending" ? "Booking…" : fixedDate ? "Reserve my seats" : "Book this tour"}
      </button>
      {result && !result.ok && (
        <p role="alert" className="text-sm text-sunrise-ink">
          {result.message}
        </p>
      )}
      <p className="text-xs text-scree">No payment is taken on this page. You get a booking code and a secure payment link.</p>
    </form>
  );
}
