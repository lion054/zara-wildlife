"use server";

/**
 * Enquiry and booking-request handling.
 *
 * This is the single biggest reason to be on Next rather than the static build
 * this was ported from: the static site could validate a form in the browser
 * and then had nowhere to send it. Here the submission is validated on the
 * server, where it cannot be bypassed, and forwarded to whatever the operator
 * configures.
 *
 * If `TWA_ENQUIRY_WEBHOOK` is not set, this returns `delivered: false` and says
 * so plainly rather than showing a success screen. A form that silently
 * swallows enquiries is worse than no form: the visitor believes they have made
 * contact and the Moshi office never hears from them.
 */

export type EnquiryResult = {
  ok: boolean;
  delivered: boolean;
  message: string;
  errors?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function submitEnquiry(
  _prev: EnquiryResult | null,
  data: FormData,
): Promise<EnquiryResult> {
  /* Honeypot. Bots fill every field; humans never see this one. */
  if (str(data.get("company"))) {
    return { ok: true, delivered: true, message: "Thank you — we will be in touch." };
  }

  const errors: Record<string, string> = {};
  const name = str(data.get("name"));
  const email = str(data.get("email"));

  if (!name) errors.name = "Please tell us your name.";
  if (!email) errors.email = "We need a valid email to reply to.";
  else if (!EMAIL.test(email)) errors.email = "That email address does not look right.";

  /* A booking request restates the deposit terms and takes an explicit
     acknowledgement, so consent is checked here rather than trusted. */
  if (str(data.get("booking")) === "1" && !data.get("terms")) {
    errors.terms = "Please confirm you have read what happens next.";
  }

  if (Object.keys(errors).length) {
    return { ok: false, delivered: false, message: "Please fix the highlighted fields.", errors };
  }

  const payload = Object.fromEntries(
    [...data.entries()].filter(([k]) => k !== "company").map(([k, v]) => [k, String(v)]),
  );

  const endpoint = process.env.TWA_ENQUIRY_WEBHOOK;
  if (!endpoint) {
    return {
      ok: true,
      delivered: false,
      message:
        "This form is not connected to an inbox yet, so nothing has been sent. " +
        "Please message us on WhatsApp or email sales@tanzaniawildlifeadventures.com and we will reply within a working day.",
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, receivedAt: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(String(res.status));
    return {
      ok: true,
      delivered: true,
      message: "Thank you — that is with the Moshi office. We reply within one working day.",
    };
  } catch {
    /* Never claim delivery we cannot evidence. */
    return {
      ok: false,
      delivered: false,
      message:
        "We could not send that just now. Please try again, or message us on WhatsApp — " +
        "we would rather you reached us another way than lose the enquiry.",
    };
  }
}
