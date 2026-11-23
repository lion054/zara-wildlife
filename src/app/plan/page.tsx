import type { Metadata } from "next";
import { Contour, Eyebrow } from "@/components/primitives";
import { TripPlanner } from "@/components/trip-planner";
import { plannerPlaces } from "@/lib/planner";
import { withSeo } from "@/lib/seo";

export const metadata: Metadata = withSeo("/plan", {
  title: "Plan my trip",
  description: "Tell us where and when: get a priced, day-by-day trip from our own climbs, safaris and day trips, and book it in one go.",
});

/* The places the planner can plan are read from Tanova every ten minutes. */
export const revalidate = 600;

export default async function PlanPage() {
  const places = await plannerPlaces();
  return (
    <>
      <section className="border-b border-mist px-6 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Contour className="mb-5" />
          <Eyebrow>Plan my trip</Eyebrow>
          <h1 className="max-w-3xl font-display text-5xl md:text-6xl">Build it, price it, book it.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-scree">
            Tell us where and when, and get a priced plan day by day from our own trips. Or put your own together and see the total.
          </p>
        </div>
      </section>
      <TripPlanner places={places} />
    </>
  );
}
