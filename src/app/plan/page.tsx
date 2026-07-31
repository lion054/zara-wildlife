import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/primitives";
import { Planner } from "@/components/planner";

export const metadata: Metadata = {
  title: "Plan and price your trip",
  description:
    "Build a Tanzania trip from any climb, safari, combination and day trip, see the live total and the 30% deposit, then send that exact trip to the Moshi office.",
  alternates: { canonical: "/plan" },
};

export default function PlanPage() {
  return (
    <>
      <PageHero eyebrow="Plan & price" title="Build it, price it, book it"
        lead="No enquiry form and no waiting overnight for a reply. Pick what you want and see the number — then send that exact trip to Moshi."
        photoKey="hero-combos"
        crumbs={[{ label: "Home", href: "/" }, { label: "Plan my trip", href: "/plan" }]} />
      {/* `useSearchParams` needs a boundary so the shell can still prerender. */}
      <Suspense fallback={<div className="mx-auto max-w-[1170px] px-5 py-16 text-muted">Loading the planner…</div>}>
        <Planner />
      </Suspense>
    </>
  );
}
