"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitEnquiry, type EnquiryResult } from "@/app/actions";
import { site } from "@/lib/site";
import { earliestArrival } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { TripadvisorOwl } from "@/components/tripadvisor";

/**
 * The enquiry form, and the quote and booking variants of it.
 *
 * Three shapes, because three different things are being asked:
 *
 *   enquiry   name, email, roughly when, party size
 *   quote     plus the two or three questions that ACTUALLY set that price —
 *             hotel standard and board for Zanzibar, date and pickup for a day
 *             trip, route and beach nights for a combination
 *   booking   plus the deposit terms restated at the point of commitment, and
 *             an explicit acknowledgement
 *
 * The quote variant exists because every "ask for a price" link used to drop
 * the visitor onto a generic contact form with a raw slug in the URL. Clicking
 * it on the Marangu Waterfalls day trip produced a banner reading "Group
 * departure marangu-waterfalls" and a pre-written message about joining a group
 * departure — wrong product, and words the visitor never typed.
 *
 * The open-text field is optional throughout. Requiring a paragraph before
 * somebody can ask a price is pure abandonment.
 */

export type QuoteKind = "beach" | "daytrip" | "combo" | null;

const QUOTE_LEAD: Record<string, string> = {
  beach:
    "Zanzibar is the one thing we quote rather than list — the figure moves with the hotel standard and the season by more than an honest “from” would survive.",
  daytrip:
    "We publish no rate card for this one, so we price it to your group and your date rather than guess at it.",
  combo:
    "The beach half of this trip is in Zanzibar, which we quote rather than list. Tell us the shape and we will price the whole thing in one go.",
};

const field =
  "w-full rounded-[3px] border border-line bg-white px-4 py-3 text-[15px] text-ink focus:border-olive-deep";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-slate";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-block rounded-[3px] bg-brick-text px-7 py-3.5 text-sm font-semibold text-white hover:bg-brick-dark disabled:opacity-60"
    >
      {pending ? "Sending…" : label}
    </button>
  );
}

export function EnquiryForm({
  kind = "trip",
  subject = "",
  booking = false,
  quoteKind = null,
  quoteLabel = "",
  context = "",
  hidden = {},
  submitLabel,
}: {
  kind?: string;
  subject?: string;
  booking?: boolean;
  quoteKind?: QuoteKind;
  quoteLabel?: string;
  /** A departure or product this request is about, confirmed back to the reader. */
  context?: string;
  hidden?: Record<string, string>;
  submitLabel?: string;
}) {
  const [state, action] = useActionState<EnquiryResult | null, FormData>(submitEnquiry, null);
  const err = state?.errors ?? {};

  /**
   * The answer, felt as well as read.
   *
   * `seen` guards against re-firing when the component re-renders for any
   * reason other than a new result — a submit that failed validation twice in
   * a row is two distinct answers and should buzz twice, but one answer
   * re-rendered is not.
   */
  const seen = useRef<EnquiryResult | null>(null);
  useEffect(() => {
    if (!state || seen.current === state) return;
    seen.current = state;
    haptic("reply");
  }, [state]);

  const defaultLabel = booking ? "Request to book" : quoteKind ? "Send price request" : "Send enquiry";

  return (
    <form action={action} noValidate>
      <input type="hidden" name="subject" value={subject || kind} />
      {booking && <input type="hidden" name="booking" value="1" />}
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {/* Honeypot — visually and programmatically hidden from people. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />

      {(context || quoteKind) && (
        <div className="mb-[22px] border-l-[3px] border-olive-deep bg-paper px-[18px] py-3.5">
          <strong className="label mb-1 block text-olive-deep">
            {quoteKind ? "Price request" : "Group departure"}
          </strong>
          <span className="block text-base font-semibold text-ink">{quoteLabel || context}</span>
          {quoteKind && (
            <span className="mt-1.5 block text-[13px] leading-[1.65] text-muted">{QUOTE_LEAD[quoteKind]}</span>
          )}
        </div>
      )}

      <div className="grid gap-x-5 sm:grid-cols-2">
        <div className="mb-[18px]">
          <label className={labelCls} htmlFor={`f-name-${kind}`}>Your name</label>
          <input id={`f-name-${kind}`} name="name" type="text" autoComplete="name" required
            aria-invalid={!!err.name} className={`${field} ${err.name ? "border-brick-dark" : ""}`} />
          {err.name && <p className="mt-1.5 text-[13px] text-brick-dark">{err.name}</p>}
        </div>
        <div className="mb-[18px]">
          <label className={labelCls} htmlFor={`f-email-${kind}`}>Email</label>
          <input id={`f-email-${kind}`} name="email" type="email" autoComplete="email" required
            aria-invalid={!!err.email} className={`${field} ${err.email ? "border-brick-dark" : ""}`} />
          {err.email && <p className="mt-1.5 text-[13px] text-brick-dark">{err.email}</p>}
        </div>

        <div className="mb-[18px]">
          <label className={labelCls} htmlFor={`f-when-${kind}`}>
            {booking ? "Preferred start date" : "Roughly when"}
          </label>
          <input
            id={`f-when-${kind}`} name="when"
            type={booking ? "date" : "text"}
            min={booking ? earliestArrival() : undefined}
            placeholder={booking ? undefined : "August 2027, or flexible"}
            className={field}
          />
          {booking && (
            <p className="mt-1.5 text-xs text-muted">
              Two weeks out at the earliest — permits and flights need the lead time.
            </p>
          )}
        </div>
        <div className="mb-[18px]">
          <label className={labelCls} htmlFor={`f-people-${kind}`}>How many of you</label>
          <select id={`f-people-${kind}`} name="people" defaultValue="2" className={field}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
            <option>7 or more</option>
          </select>
        </div>
      </div>

      {/* Only the questions that genuinely set THIS kind of price. */}
      {quoteKind === "beach" && (
        <QuoteBlock why="Those two answers are most of a Zanzibar price. With them we can quote properly rather than send you a range.">
          <Select name="standard" label="Hotel standard" options={[
            "No preference yet",
            "Mid-range — clean, comfortable, good location",
            "Superior — beachfront, pool, a step up",
            "Luxury — the best on the island",
          ]} kind={kind} />
          <Select name="board" label="Board basis" options={[
            "No preference yet", "Bed and breakfast", "Half board", "Full board", "All inclusive",
          ]} kind={kind} />
        </QuoteBlock>
      )}

      {quoteKind === "daytrip" && (
        <QuoteBlock why="This one has no published rate card, so we price it to your group and your date. Both answers above set it.">
          <div>
            <label className={labelCls} htmlFor={`f-dt-${kind}`}>Which day</label>
            <input id={`f-dt-${kind}`} name="tripDate" type="date" min={earliestArrival()} className={field} />
          </div>
          <Select name="pickup" label="Picking up from" kind={kind}
            options={["Moshi", "Arusha", "Kilimanjaro Airport", "Somewhere else"]} />
        </QuoteBlock>
      )}

      {quoteKind === "combo" && (
        <QuoteBlock why="The climb is fixed by the route; the beach half is not. These two set the shape and most of the price.">
          <Select name="route" label="Which climb, if you know" kind={kind} options={[
            "Not decided — advise me",
            "Lemosho, 8 days — best odds",
            "Machame, 7 days — the classic",
            "Marangu, 6 days — huts, gentlest gradient",
            "Rongai, 7 days — quietest",
            "Northern Circuit, 9 days — highest summit rate",
          ]} />
          <Select name="beachNights" label="Nights on the beach" kind={kind}
            options={["Not sure", "2 or 3", "4 or 5", "A week", "Longer"]} />
        </QuoteBlock>
      )}

      <div className="mb-[18px]">
        <label className={labelCls} htmlFor={`f-msg-${kind}`}>
          Anything we should know <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea id={`f-msg-${kind}`} name="message" rows={4}
          placeholder="Which route or parks, what you want out of the trip, anything we should know."
          className={`${field} resize-y`} />
      </div>

      {booking && (
        <div className="mb-6 rounded border border-line bg-paper px-[26px] py-6">
          <h4 className="mb-3 text-[15px]">What happens when you send this</h4>
          <ol className="mb-[18px] list-decimal space-y-1.5 pl-5 text-sm leading-[1.7] text-slate">
            <li>We confirm in writing that your dates, crew and vehicles are actually available — usually within one working day.</li>
            <li>You get a firm price and a deposit link. <strong>Nothing is charged until you have both.</strong></li>
            <li>A <strong>30% deposit</strong> confirms the booking. The balance is due <strong>45 days</strong> before you arrive.</li>
            <li>Cancel more than 60 days out and the deposit moves to another date within a year. Inside 45 days the balance is non-refundable — which is what travel insurance is for.</li>
          </ol>
          <label className="grid grid-cols-[20px_1fr] items-start gap-2.5 border-t border-line pt-4 text-[13px] leading-[1.6] text-slate">
            <input type="checkbox" name="terms" required className="mt-0.5 size-[17px] accent-olive-deep" />
            <span>
              I understand this is a request, not a booking, and that nothing is charged until I have
              confirmed availability and a firm price.
              {err.terms && <span className="mt-1 block text-brick-dark">{err.terms}</span>}
            </span>
          </label>
        </div>
      )}

      <Submit label={submitLabel ?? defaultLabel} />

      <div role="status" aria-live="polite">
        {state && (
          <p className={`mt-3.5 text-sm leading-[1.65] ${state.delivered ? "text-olive-deep" : "text-brick-dark"}`}>
            {state.delivered ? <strong>{state.message}</strong> : state.message}
          </p>
        )}
      </div>

      {/* Trust where the decision is made, not only in the header — and with
          the owl on it, so it is Tripadvisor's number rather than ours. */}
      <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-line pt-3.5 text-[13px] text-muted">
        <TripadvisorOwl size={16} />
        <span aria-hidden className="tracking-[1px] text-amber">{"★".repeat(site.reviews.rating)}</span>
        <span><strong className="text-ink">{site.reviews.rating}.0</strong> from {site.reviews.count} reviews on {site.reviews.platform}</span>
        <span aria-hidden>·</span>
        <span>Operating from Moshi since {site.established}</span>
        <span aria-hidden>·</span>
        <span>We never pass your details on</span>
      </p>
    </form>
  );
}

function QuoteBlock({ why, children }: { why: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <div className="grid gap-x-5 sm:grid-cols-2">{children}</div>
      <p className="mt-1 border-l-2 border-line pl-3.5 text-[13px] leading-[1.65] text-muted">{why}</p>
    </div>
  );
}

function Select({ name, label, options, kind }: { name: string; label: string; options: string[]; kind: string }) {
  return (
    <div className="mb-[18px]">
      <label className={labelCls} htmlFor={`f-${name}-${kind}`}>{label}</label>
      <select id={`f-${name}-${kind}`} name={name} className={field}>
        {options.map((o, i) => <option key={o} value={i === 0 ? "" : o}>{o}</option>)}
      </select>
    </div>
  );
}
