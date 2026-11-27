import Image from "next/image";
import Link from "next/link";
import { TrustStrip } from "@/components/trust-strip";
import { DEPOSIT_RULES, balanceDue, type GroupTerms } from "@/lib/group-terms";
import { photo } from "@/lib/photos";
import type { Tour } from "@/lib/tours";

const short = (s: string) => s.replace(/\s*\((?:[^()]|\([^)]*\))*\)\s*/g, " ").replace(/\s+/g, " ").trim();

/**
 * "$130 today. Everything else later.": how a group seat is paid, in three steps, with the deposit's refund rules in
 * one line linking to the full booking terms. The figures come from Tanova's group-trip terms.
 */
export function DepositSteps({ terms, imageKey = "route-lemosho", id = "how-booking" }: { terms: GroupTerms; imageKey?: string; id?: string }) {
  const dep = terms.depositType === "fixed" ? `$${terms.depositAmount.toLocaleString()}` : `${terms.depositAmount}%`;
  const img = photo(imageKey);
  const steps = [
    { t: `Reserve with ${dep} per person`, b: "Pick your date and pay the deposit online. Your seats are held at once and your booking code arrives by email." },
    { t: "We confirm within one working day", b: "The Moshi office checks your details, answers your questions and sends the trip notes for your route." },
    {
      t: "Pay the rest your way",
      b: terms.topups
        ? `Top up in any amounts, whenever suits you, from your booking's payment link. The balance is due ${balanceDue(terms)}.`
        : `The balance is due ${balanceDue(terms)}, from your booking's payment link.`,
    },
  ];
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-[28px] bg-basalt text-glacier on-dark">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="p-7 md:p-12">
          <p className="label text-brand">How booking works</p>
          <h2 id={id} className="mt-3 font-display text-3xl leading-tight md:text-4xl">
            {dep} today.
            <br className="hidden sm:block" /> Everything else later.
          </h2>
          <ol className="mt-8 space-y-6">
            {steps.map((s, i) => (
              <li key={s.t} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand font-semibold text-basalt">{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl">{s.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-glacier/75">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-2xl bg-glacier/[0.06] p-4 text-sm leading-relaxed text-glacier/80">
            Changed your mind? Cancel within {DEPOSIT_RULES.coolingOffDays} days of booking for a full refund. After that the deposit moves to any other date
            within {DEPOSIT_RULES.transferMonths} months. If a group does not reach four climbers, you choose the next date or a full refund.{" "}
            <Link href="/terms#deposit" className="font-semibold text-brand underline underline-offset-4">
              Booking terms
            </Link>
          </p>
          <TrustStrip tone="dark" className="mt-8" />
        </div>
        {img && (
          <div className="relative hidden min-h-80 lg:block">
            <Image src={img.src} alt={img.alt} fill sizes="22rem" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

/** What the group price includes and leaves out, side by side, from the tour's own lists (the same on every group route). */
export function IncludesList({ tour, id = "includes" }: { tour: Pick<Tour, "included" | "excluded">; id?: string }) {
  const inc = tour.included.filter((i) => !i.sub);
  const exc = tour.excluded.filter((i) => !i.sub);
  if (!inc.length && !exc.length) return null;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-display text-3xl md:text-4xl">
        What the price includes
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-mist md:p-8">
          <h3 className="label text-tanzanite">Included</h3>
          <ul className="mt-4 space-y-3">
            {inc.map((i) => (
              <li key={i.text} className="flex gap-3 text-sm leading-relaxed text-basalt">
                <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-tanzanite" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 8.5l3 3 7-7" />
                </svg>
                {short(i.text)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-frost p-6 ring-1 ring-mist md:p-8">
          <h3 className="label text-scree">Not included</h3>
          <ul className="mt-4 space-y-3">
            {exc.map((i) => (
              <li key={i.text} className="flex gap-3 text-sm leading-relaxed text-scree">
                <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
                {short(i.text)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
