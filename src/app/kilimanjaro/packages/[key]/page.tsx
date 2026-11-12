import { notFound } from "next/navigation";
import { TourPage, tourMetadata } from "@/components/tour-page";
import { getTour, toursOfKind, type TourKind } from "@/lib/tours";

const KINDS: TourKind[] = ["kili", "meru"];
export const revalidate = 120;
type Props = { params: Promise<{ key: string }> };

export function generateStaticParams() {
  return toursOfKind(...KINDS).map((t) => ({ key: t.key }));
}

export async function generateMetadata({ params }: Props) {
  return tourMetadata(getTour(KINDS, (await params).key));
}

export default async function Page({ params }: Props) {
  const tour = getTour(KINDS, (await params).key);
  if (!tour) notFound();
  return <TourPage tour={tour} />;
}
