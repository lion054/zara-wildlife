import Link from "next/link";
import { SeatBar } from "@/components/primitives";
import type { Departure } from "@/lib/departures";

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", o);

/** One live group departure: date, trip, seats left, price, and the way to reserve or join the waitlist. */
export function DepartureCard({ d, tone = "light" }: { d: Departure; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const booked = d.capacity !== null && d.seatsLeft !== null ? d.capacity - d.seatsLeft : null;
  const href = `${d.href}?date=${d.start}#enquire`;
  return (
    <article
      className={`flex h-full flex-col rounded-3xl p-6 ${
        dark ? "border border-glacier/15 bg-basalt/55 backdrop-blur-md" : "bg-glacier ring-1 ring-mist"
      }`}
    >
      <p className={`metric text-sm ${dark ? "text-brand" : "text-tanzanite"}`}>
        {fmt(d.start, { day: "numeric", month: "short" })}
        {d.end ? ` – ${fmt(d.end, { day: "numeric", month: "short", year: "numeric" })}` : `, ${fmt(d.start, { year: "numeric" })}`}
      </p>
      <h3 className={`mt-2 font-display text-2xl leading-snug ${dark ? "text-glacier" : "text-basalt"}`}>
        {d.title.replace(/\s*·\s*Group$/, "")}
      </h3>
      {d.days && <p className={`mt-1 text-sm ${dark ? "text-glacier/80" : "text-scree"}`}>{d.days} days</p>}
      {d.capacity !== null && booked !== null && (
        <div className={`mt-4 ${dark ? "[&_.bg-mist]:bg-glacier/20 [&_.text-scree]:text-glacier/75" : ""}`}>
          <SeatBar capacity={d.capacity} booked={booked} />
        </div>
      )}
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <p className={`metric text-3xl ${dark ? "text-brand" : "text-tanzanite"}`}>
          {d.price ? `$${d.price.toLocaleString()}` : "On request"}
          <span className={`label block ${dark ? "text-glacier/75" : "text-scree"}`}>per person</span>
        </p>
        <Link
          href={href}
          className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] ${
            d.open
              ? "bg-brand text-basalt hover:bg-brand-bright"
              : dark
                ? "border border-glacier/40 text-glacier"
                : "border border-tanzanite/30 text-tanzanite"
          }`}
        >
          {d.open ? "Reserve a seat" : "Join waitlist"}
        </Link>
      </div>
    </article>
  );
}
