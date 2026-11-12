import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, Section } from "@/components/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Booking terms",
  description: "Deposits, balances, group departures and how to reach us about a booking.",
};

/* The previous site has no terms page. This states only the terms already
   used elsewhere on this site; the operator should review and extend it. */
export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed text-scree">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display text-5xl text-basalt">Booking terms</h1>
        <h2 className="pt-4 font-display text-2xl text-basalt">Deposit and balance</h2>
        <p>A 30% deposit confirms a booking. The balance is due 45 days before you fly.</p>
        <h2 className="pt-4 font-display text-2xl text-basalt">Group departures</h2>
        <p>
          Group climbs run from four climbers. If a departure does not fill, we will offer you the next date or a full refund, decided 45 days before the start date.
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
