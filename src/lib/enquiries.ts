"use server";

/**
 * Enquiry handling.
 *
 * Before this existed, the contact form had no `action` and no handler: a
 * visitor filled it in, pressed send, the page reloaded and the message was
 * discarded. Every planner button was inert in the same way. This is the one
 * path that turns the site from a brochure into something that can take work.
 *
 * TRANSPORT is deliberately pluggable and deliberately loud about being
 * unconfigured. With no `ENQUIRY_WEBHOOK_URL` set, submissions are validated
 * and logged server-side and the caller is told, honestly, that the message
 * was recorded but not yet delivered — rather than showing a green tick over
 * a message that went nowhere. Set the env var to a Formspree/Resend/CRM
 * endpoint and it starts posting for real with no code change.
 */

import { tanova, tanovaConfigured } from "@/lib/tanova";
import { tours } from "@/lib/tours";

export type EnquiryKind = "contact" | "trip" | "waitlist" | "day-trip";

export type EnquiryResult = {
  ok: boolean;
  /** Shown to the visitor. Written for them, not for a log. */
  message: string;
  /** True when we stored it but could not send it on. */
  degraded?: boolean;
  /** Field name → problem, for inline errors. */
  errors?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function req(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Validates on the server regardless of what the browser did. Client-side
 * validation is a convenience; this is the one that counts.
 */
function validate(kind: EnquiryKind, data: FormData) {
  const errors: Record<string, string> = {};
  const email = req(data.get("email"));
  const name = req(data.get("name"));
  const message = req(data.get("message"));
  const start = req(data.get("start"));

  if (!EMAIL.test(email)) {
    errors.email = "Enter an email address we can reply to.";
  }
  if (kind === "contact") {
    if (name.length < 2) errors.name = "Tell us what to call you.";
    if (message.length < 10) {
      errors.message = "A sentence or two about your trip helps us answer properly.";
    }
  }
  if (start) {
    // Compared date-only, so a trip starting today is still valid.
    const today = new Date().toISOString().slice(0, 10);
    if (start < today) errors.start = "Pick a date in the future.";
  }
  return errors;
}

type Delivery = { delivered: boolean };

/**
 * Where an enquiry goes. With Tanova configured it lands in the company's own
 * system: a waitlist request becomes a waitlist entry on the tour, anything else
 * becomes (or is added to) a customer record, tagged "website-enquiry", with the
 * message, trip and dates in its notes, so the office sees it next to bookings.
 * Without Tanova, the old webhook still works.
 */
async function deliver(kind: EnquiryKind, p: Record<string, string>): Promise<Delivery> {
  if (tanovaConfigured) {
    try {
      await toTanova(kind, p);
      return { delivered: true };
    } catch (e) {
      console.error(`[enquiry:${kind}] Tanova failed`, e);
    }
  }
  const url = process.env.ENQUIRY_WEBHOOK_URL;
  if (!url) return { delivered: false };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...p }),
    });
    return { delivered: res.ok };
  } catch {
    return { delivered: false };
  }
}

async function toTanova(kind: EnquiryKind, p: Record<string, string>) {
  const name = (p.name ?? "").trim() || p.email.split("@")[0];
  const [first, ...rest] = name.split(/\s+/);
  const last = rest.join(" ");
  const tour = tours.find((t) => `${t.kind}:${t.key}` === p.tourKey || t.title === p.tour);

  if (kind === "waitlist" && tour?.tanovaId) {
    await tanova("/waitlist", {
      method: "POST",
      body: {
        customer_name: name,
        customer_email: p.email,
        customer_phone: p.phone || undefined,
        tour_id: tour.tanovaId,
        party_size: Number(p.guests) > 0 ? Number(p.guests) : 1,
        preferred_date: p.start || undefined,
        notes: [p.message, p.country && `Country: ${p.country}`].filter(Boolean).join("\n") || undefined,
      },
    });
    return;
  }

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const entry = [
    `[${stamp}] Website ${kind} enquiry`,
    (tour?.title ?? p.tour) && `Trip: ${tour?.title ?? p.tour}`,
    p.topic && `About: ${p.topic}`,
    p.type && `Type: ${p.type}`,
    p.start && `Arrival: ${p.start}`,
    p.days && `Days: ${p.days}`,
    p.country && `Country: ${p.country}`,
    p.route && `Route: ${p.route}`,
    p.message && `Message: ${p.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  const found = await tanova<{ data: { id: number; notes: string | null; tags: string[]; email: string | null }[] }>(
    `/crm/customers?q=${encodeURIComponent(p.email)}&per_page=5`,
    { revalidate: 0 },
  ).catch(() => ({ data: [] }));
  const existing = found.data.find((c) => c.email?.toLowerCase() === p.email.toLowerCase());
  const tags = ["website-enquiry", kind];

  if (existing) {
    await tanova(`/crm/customers/${existing.id}`, {
      method: "PUT",
      body: {
        notes: [existing.notes, entry].filter(Boolean).join("\n\n").slice(-4900),
        tags: Array.from(new Set([...(existing.tags ?? []), ...tags])),
        phone: p.phone || undefined,
      },
    });
  } else {
    await tanova("/crm/customers", {
      method: "POST",
      body: { first_name: first, last_name: last || undefined, email: p.email, phone: p.phone || undefined, nationality: p.country || undefined, notes: entry, tags },
    });
  }
}

export async function submitEnquiry(
  kind: EnquiryKind,
  data: FormData,
): Promise<EnquiryResult> {
  // Honeypot. Real people leave it empty; most bots fill everything in.
  if (req(data.get("company"))) {
    return { ok: true, message: "Thanks — we will be in touch." };
  }

  const errors = validate(kind, data);
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Some details need another look.",
      errors,
    };
  }

  const payload: Record<string, string> = {};
  for (const [k, v] of data.entries()) {
    if (k === "company") continue;
    if (typeof v === "string") payload[k] = v;
  }

  const { delivered } = await deliver(kind, payload);

  if (!delivered) {
    console.warn(
      `[enquiry:${kind}] not delivered: set TANOVA_API_URL and TANOVA_API_KEY (or ENQUIRY_WEBHOOK_URL)`,
      payload,
    );
    return {
      ok: true,
      degraded: true,
      message:
        "Your details are recorded, but our messaging is not connected yet — " +
        "please also reach us on WhatsApp or by email so nothing is missed.",
    };
  }

  return {
    ok: true,
    message:
      kind === "waitlist"
        ? "You are on the list. We will email you the moment a seat opens."
        : "Thanks — the Moshi office replies within one working day.",
  };
}
