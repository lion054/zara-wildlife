import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, Section } from "@/components/primitives";
import { DEPOSIT_RULES as R, balanceDue, depositLabel, groupTerms } from "@/lib/group-terms";
import { site } from "@/lib/site";
import { toursOfKind } from "@/lib/tours";
import { withSeo } from "@/lib/seo";

export const metadata: Metadata = withSeo("/terms", {
  title: "Booking terms",
  description: "Deposits, balances, group departures and how to reach us about a booking.",
});

export const revalidate = 300;

/* The previous site has no terms page. This states only the terms already
   used elsewhere on this site; the operator should review and extend it.
   Group climb deposits are read live from Tanova (Group trip > terms), so this page always says what the checkout asks. */
export default async function Page() {
  const group = toursOfKind("group").find((t) => t.tanovaId);
  const terms = await groupTerms(group?.tanovaId);
  return (
    <Section>
      <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed text-scree">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display text-5xl text-basalt">Booking terms</h1>
        <h2 className="pt-4 font-display text-2xl text-basalt">Deposit and balance</h2>
        {terms && (
          <p>
            Group departures: a {depositLabel(terms)} deposit holds your seats{terms.depositType === "percent" ? " (or pay in full if you prefer)" : ""}.{" "}
            {terms.topups
              ? `After that you can pay any amount, whenever it suits you, from your booking's payment link. The balance is due ${balanceDue(terms)}.`
              : `The balance is due ${balanceDue(terms)}.`}
          </p>
        )}
        <p>{terms ? "Private trips: a" : "A"} 30% deposit confirms a booking. The balance is due 45 days before you fly.</p>
        <h2 id="group" className="scroll-mt-28 pt-4 font-display text-2xl text-basalt">Group departures</h2>
        <p>
          Group climbs run from four climbers. If a departure does not fill, we will offer you the next date or a full refund, decided 45 days before the start date.
        </p>
        <h3 id="deposit" className="scroll-mt-28 pt-2 font-display text-xl text-basalt">
          The {terms?.depositType === "fixed" ? `$${terms.depositAmount}` : "group"} deposit
        </h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>The deposit is per climber and holds your seat on the date you chose.</li>
          <li>
            Changed your mind? Cancel within {R.coolingOffDays} days of booking for a full refund of the deposit, as long as the climb is at least{" "}
            {R.coolingOffMinDaysOut} days away.
          </li>
          <li>
            After that the deposit is not refundable, but it is never lost: move it to any other group date or private climb within {R.transferMonths} months.
            Tell us at least {R.transferNoticeDays} days before your original start date.
          </li>
          <li>If we cancel a departure, or it does not reach four climbers, you choose: the next date, or everything you paid back in full.</li>
        </ul>
        <h3 className="pt-2 font-display text-xl text-basalt">If you cancel</h3>
        <p>Counted from the start date of your climb, we keep:</p>
        <ul className="list-disc space-y-1 pl-6">
          {R.cancellation.map((c, i) => {
            const prev = i ? R.cancellation[i - 1].from : null;
            const when = prev === null ? `${c.from} days or more before` : c.from === 0 ? `${prev - 1} days or less before` : `${c.from}–${prev - 1} days before`;
            return (
              <li key={c.from}>
                {when}: {c.kept}
              </li>
            );
          })}
        </ul>
        <p>
          The rest of what you paid is refunded to the card or account you paid from, less any bank fees for sending it. Travel insurance that covers
          cancellation is strongly recommended.
        </p>
        <h2 className="pt-4 font-display text-2xl text-basalt">Tips, insurance and visas</h2>
        <p>
          Tips, personal equipment, visas, flights and travel insurance are not included unless a tour page says so. See the{" "}
          <Link href="/tipping-policy" className="text-tanzanite underline underline-offset-4">tipping policy</Link>.
        </p>
        <h2 className="pt-4 font-display text-2xl text-basalt">Your data</h2>
        <p>
          See the <Link href="/privacy-policy" className="text-tanzanite underline underline-offset-4">privacy policy</Link>.
        </p>
        <h2 className="pt-4 font-display text-2xl text-basalt">Questions</h2>
        <p>
          Email <a href={`mailto:${site.contact.email}`} className="text-tanzanite underline underline-offset-4">{site.contact.email}</a> or call {site.contact.phone}.
        </p>
      </div>
    </Section>
  );
}
