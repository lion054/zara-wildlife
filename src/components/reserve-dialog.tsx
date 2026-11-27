"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { PhoneField } from "@/components/phone-field";
import { createBooking, type BookingResult } from "@/lib/bookings";

const field =
  "w-full rounded-xl border border-scree/40 bg-white px-4 py-3 text-base text-basalt focus:border-tanzanite focus:outline-none sm:text-sm";
const lab = "label mb-1.5 block text-scree";
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", o);

export type ReserveProps = {
  tourKey: string;
  /** "Kilimanjaro via Lemosho route – 7 days" */
  title: string;
  start: string;
  end: string | null;
  /** Price per person, when known. */
  price: number | null;
  /** What one person pays today to hold a seat (the group deposit). */
  deposit: number | null;
  /** Seats left on this departure (caps the climbers counter). */
  seatsLeft: number | null;
  climbers?: number;
};

/**
 * "Reserve your climb": a booking for one departure in a dialog (full screen on phones). The date is the departure's;
 * the visitor says how many are climbing and how to reach them, and gets a booking code and the link to pay the
 * deposit at once. Anything beyond the booking itself (a safari after the climb, how to be contacted) reaches the
 * office as notes on the booking.
 */
export function ReserveButton({ label, className, ...p }: ReserveProps & { label: React.ReactNode; className: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId().replace(/:/g, "");
  const [climbers, setClimbers] = useState(p.climbers ?? 2);
  const [safari, setSafari] = useState<"yes" | "no">("no");
  const [contact, setContact] = useState("WhatsApp");
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [result, setResult] = useState<BookingResult | null>(null);
  const max = Math.max(1, Math.min(12, p.seatsLeft ?? 12));

  useEffect(() => setClimbers((c) => Math.min(Math.max(1, p.climbers ?? c), max)), [p.climbers, max]);

  const open = () => {
    setResult(null);
    ref.current?.showModal();
  };
  const close = () => ref.current?.close();
  const dueToday = p.deposit ? p.deposit * climbers : null;
  const total = p.price ? p.price * climbers : null;
  const err = result?.errors ?? {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = new FormData(e.currentTarget);
    data.set("start", p.start);
    data.set("adults", String(climbers));
    data.set("children", "0");
    data.set("safari", safari);
    data.set("contact_pref", contact);
    const r = await createBooking(p.tourKey, data);
    setState("idle");
    setResult(r);
  }

  return (
    <>
      <button type="button" onClick={open} className={className}>
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={`rsv-${uid}`}
        onClick={(e) => e.target === ref.current && close()}
        className="m-0 h-[100dvh] max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-basalt/60 backdrop:backdrop-blur-sm sm:m-auto sm:h-auto sm:max-h-[92dvh] sm:w-[min(40rem,calc(100vw-2rem))]"
      >
        <div className="flex h-full flex-col overflow-hidden bg-glacier sm:rounded-3xl">
          <header className="flex items-start gap-3 border-b border-mist px-5 py-4 sm:px-7">
            <div className="min-w-0 flex-1">
              <p id={`rsv-${uid}`} className="font-display text-xl leading-tight text-basalt sm:text-2xl">
                Reserve your climb
              </p>
              <p className="mt-0.5 truncate text-sm text-scree">{p.title}</p>
            </div>
            <button type="button" onClick={close} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-frost text-lg text-basalt">
              ×
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            {result?.ok ? (
              <div role="status" className="space-y-4">
                <p className="label text-tanzanite">{result.checkoutUrl ? "Seats held" : "Request received"}</p>
                <p className="font-display text-2xl text-basalt">{result.code ? `Booking ${result.code}` : "Thank you"}</p>
                <p className="text-sm leading-relaxed text-scree">{result.message}</p>
                {dueToday && result.checkoutUrl ? (
                  <a href={result.checkoutUrl} className="block rounded-full bg-brand px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.1em] text-basalt hover:bg-brand-bright">
                    Pay the ${dueToday.toLocaleString()} deposit
                  </a>
                ) : null}
                <p className="text-xs text-scree">A confirmation goes to the email you gave. Keep the booking code.</p>
              </div>
            ) : (
              <form id={`rsv-form-${uid}`} onSubmit={onSubmit} noValidate className="space-y-5">
                <div className="absolute left-[-9999px]" aria-hidden="true">
                  <label htmlFor={`company-${uid}`}>Company</label>
                  <input id={`company-${uid}`} name="company" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                  <div>
                    <p className={lab}>Climb dates</p>
                    <p className="rounded-xl bg-frost px-4 py-3 text-sm font-semibold text-basalt">
                      {fmt(p.start, { day: "numeric", month: "short" })}
                      {p.end ? ` – ${fmt(p.end, { day: "numeric", month: "short", year: "numeric" })}` : `, ${fmt(p.start, { year: "numeric" })}`}
                    </p>
                  </div>
                  <div>
                    <p className={lab}>Climbers</p>
                    <div className="flex items-center rounded-xl bg-white ring-1 ring-scree/40">
                      <button type="button" onClick={() => setClimbers(Math.max(1, climbers - 1))} disabled={climbers <= 1} aria-label="Fewer climbers" className="grid h-12 w-11 place-items-center text-xl text-tanzanite disabled:opacity-30">
                        −
                      </button>
                      <span className="w-8 text-center text-lg font-semibold tabular-nums text-basalt" aria-live="polite">
                        {climbers}
                      </span>
                      <button type="button" onClick={() => setClimbers(Math.min(max, climbers + 1))} disabled={climbers >= max} aria-label="More climbers" className="grid h-12 w-11 place-items-center text-xl text-tanzanite disabled:opacity-30">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={lab} htmlFor={`rf-${uid}`}>First name</label>
                    <input id={`rf-${uid}`} name="first_name" autoComplete="given-name" aria-invalid={!!err.first_name} className={field} />
                    {err.first_name && <p className="mt-1 text-xs text-sunrise-ink">{err.first_name}</p>}
                  </div>
                  <div>
                    <label className={lab} htmlFor={`rl-${uid}`}>Surname</label>
                    <input id={`rl-${uid}`} name="last_name" autoComplete="family-name" aria-invalid={!!err.last_name} className={field} />
                    {err.last_name && <p className="mt-1 text-xs text-sunrise-ink">{err.last_name}</p>}
                  </div>
                  <div>
                    <label className={lab} htmlFor={`re-${uid}`}>Email</label>
                    <input id={`re-${uid}`} name="email" type="email" inputMode="email" autoComplete="email" aria-invalid={!!err.email} className={field} />
                    {err.email && <p className="mt-1 text-xs text-sunrise-ink">{err.email}</p>}
                  </div>
                  <PhoneField id={`rp-${uid}`} fieldClass={field} labelClass={lab} />
                </div>

                <fieldset className="rounded-2xl bg-frost p-4">
                  <legend className="sr-only">Add a safari</legend>
                  <p className="text-sm font-semibold text-basalt">Would you like to add a safari after your climb?</p>
                  <div className="mt-3 flex gap-2">
                    {(["yes", "no"] as const).map((v) => (
                      <button key={v} type="button" aria-pressed={safari === v} onClick={() => setSafari(v)} className={`min-w-20 rounded-full px-5 py-2.5 text-sm font-semibold transition ${safari === v ? "bg-tanzanite text-glacier" : "bg-white text-basalt ring-1 ring-mist"}`}>
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-scree">No need to decide the details now: we will suggest a safari that fits your dates.</p>
                </fieldset>

                <div>
                  <p className={lab}>How should we contact you?</p>
                  <div className="flex flex-wrap gap-2">
                    {["WhatsApp", "Email", "Phone call"].map((v) => (
                      <button key={v} type="button" aria-pressed={contact === v} onClick={() => setContact(v)} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${contact === v ? "bg-basalt text-glacier" : "bg-white text-basalt ring-1 ring-mist"}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <details className="group/n">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-tanzanite [&::-webkit-details-marker]:hidden">
                    <span className="group-open/n:hidden">+ Anything else we should know?</span>
                    <span className="hidden group-open/n:inline">Anything else we should know?</span>
                  </summary>
                  <textarea name="notes" rows={3} aria-label="Anything else we should know" className={`${field} mt-2`} placeholder="Climbing experience, diet, celebrations, halal arrangements…" />
                </details>

                {result && !result.ok && (
                  <p role="alert" className="rounded-xl bg-sunrise/10 px-4 py-3 text-sm text-sunrise-ink">
                    {result.message} {result.soldOut && <Link href="/departures" className="underline">See other dates</Link>}
                  </p>
                )}
              </form>
            )}
          </div>

          {!result?.ok && (
            <footer className="border-t border-mist bg-white px-5 py-4 sm:px-7">
              <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-scree">
                  {total ? (
                    <>
                      Total about <span className="metric text-basalt">${total.toLocaleString()}</span>
                    </>
                  ) : (
                    "Total confirmed when you book"
                  )}
                </span>
                {dueToday ? (
                  <span className="text-right">
                    <span className="block text-xs text-scree">Due today</span>
                    <span className="metric text-xl text-tanzanite">${dueToday.toLocaleString()}</span>
                  </span>
                ) : null}
              </div>
              <button
                type="submit"
                form={`rsv-form-${uid}`}
                disabled={state === "sending"}
                className="w-full rounded-full bg-brand px-6 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-basalt transition hover:bg-brand-bright disabled:opacity-60"
              >
                {state === "sending" ? "Holding your seats…" : dueToday ? `Reserve · pay $${dueToday.toLocaleString()} deposit` : "Reserve my seats"}
              </button>
              <p className="mt-2 text-center text-xs text-scree">You get a booking code at once and a secure link to pay the deposit.</p>
            </footer>
          )}
        </div>
      </dialog>
    </>
  );
}
