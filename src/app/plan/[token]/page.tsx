import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SavedPlan } from "@/components/trip-planner";
import { savedTrip } from "@/lib/planner";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trip = await savedTrip((await params).token);
  return { title: trip ? `${trip.destination} trip plan` : "Trip plan", robots: { index: false } };
}

/** A plan made in the planner, opened again from its link. */
export default async function SavedPlanPage({ params }: Props) {
  const trip = await savedTrip((await params).token);
  if (!trip) notFound();
  return <SavedPlan trip={trip} />;
}
