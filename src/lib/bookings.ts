"use server";

import { createHash } from "node:crypto";
import { TanovaError, tanova, tanovaConfigured } from "@/lib/tanova";
import { tours } from "@/lib/tours";

export type BookingResult = {
  ok: boolean;
  /** Written for the visitor. */
  message: string;
  errors?: Record<string, string>;
  code?: string;
  total?: number | null;
  /** Hosted checkout, when Tanova offers one for this booking. */
  checkoutUrl?: string | null;
  status?: string;
  /** True when the date has no seats left: the form then offers the waitlist. */
  soldOut?: boolean;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const int = (v: FormDataEntryValue | null, d: number) => {
  const n = parseInt(str(v), 10);
  return Number.isFinite(n) ? n : d;
};

/**
 * Creates a real booking in Tanova (POST /bookings), attributed to the company.
 * The date is checked again there against seats left, so two people cannot take
 * the last seat. The Idempotency-Key is derived from who/what/when, so a double
 * click or a retry returns the same booking instead of making a second one.
 */
export async function createBooking(tourKey: string, data: FormData): Promise<BookingResult> {
  if (str(data.get("company"))) return { ok: true, message: "Thanks, we will be in touch." }; // honeypot

  const tour = tours.find((t) => `${t.kind}:${t.key}` === tourKey);
  if (!tour?.tanovaId) return { ok: false, message: "This trip cannot be booked online yet. Please send an enquiry." };

  const first = str(data.get("first_name"));
  const last = str(data.get("last_name"));
  const email = str(data.get("email"));
  const start = str(data.get("start"));
  const adults = int(data.get("adults"), 1);
  const children = int(data.get("children"), 0);

  const errors: Record<string, string> = {};
  if (first.length < 1) errors.first_name = "Your first name.";
  if (last.length < 1) errors.last_name = "Your surname.";
  if (!EMAIL.test(email)) errors.email = "An email we can confirm your booking to.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || start < new Date().toISOString().slice(0, 10)) errors.start = "Pick a date in the future.";
  if (adults < 1 || adults > 50) errors.adults = "At least one adult.";
  if (Object.keys(errors).length) return { ok: false, message: "Some details need another look.", errors };

  if (!tanovaConfigured) {
    console.warn("[booking] TANOVA_API_URL / TANOVA_API_KEY not set; booking not created", { tour: tour.title, start });
    return { ok: false, message: "Online booking is not switched on yet. Please send an enquiry and the office will confirm." };
  }

  const key = createHash("sha256").update([tour.tanovaId, start, email.toLowerCase(), adults, children].join("|")).digest("hex").slice(0, 40);
  try {
    const res = await tanova<{ data: { booking_code: string; status: string; total: number | string | null; checkout_url?: string | null } }>("/bookings", {
      method: "POST",
      idempotencyKey: key,
      body: {
        service_type: "tour",
        service_id: tour.tanovaId,
        start_date: start,
        adults,
        children,
        first_name: first,
        last_name: last,
        email,
        phone: str(data.get("phone")) || undefined,
        notes: [str(data.get("country")) && `Country: ${str(data.get("country"))}`, str(data.get("notes"))].filter(Boolean).join("\n") || undefined,
      },
    });
    const b = res.data;
    return {
      ok: true,
      code: b.booking_code,
      status: b.status,
      total: b.total === null || b.total === undefined ? null : Number(b.total),
      checkoutUrl: b.checkout_url ?? null,
      message: b.checkout_url
        ? "Your seats are held. Complete payment to confirm the booking."
        : "Thanks, your booking request is in. The Moshi office confirms within one working day.",
    };
  } catch (e) {
    if (e instanceof TanovaError) {
      if (e.code === "not_available" || e.status === 409) {
        const full = /seat|guest|left|full/i.test(e.message);
        return { ok: false, soldOut: full, message: e.message || "That date is not available. Pick another date." };
      }
      if (e.status === 422) return { ok: false, message: e.message || "Some details need another look." };
    }
    console.error("[booking] failed", e);
    return { ok: false, message: "We could not place the booking just now. Please try again, or message us on WhatsApp." };
  }
}
