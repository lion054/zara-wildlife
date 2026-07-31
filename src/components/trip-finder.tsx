"use client";

import { useRouter } from "next/navigation";
import { services } from "@/lib/services";

/**
 * The hero trip finder.
 *
 * A plain form that navigates to the page which sells the chosen kind of trip,
 * carrying the month and party size so the destination can pre-fill its enquiry.
 * It does not pretend to search an index that does not exist — a search box
 * that returns nothing is worse than a menu.
 */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const field =
  "w-full rounded-[3px] border border-line bg-white px-4 py-3 text-[15px] text-ink focus:border-olive-deep";
const label = "mb-1.5 block text-[13px] font-semibold text-slate";

export function TripFinder() {
  const router = useRouter();

  return (
    <div className="relative z-20 mx-auto -mt-16 max-w-[1170px] px-5">
      {/* Overlapping the hero by 64px, which is exactly the condition glass is
          for: the photograph runs under the top third of this card and stays
          visible through it. */}
      <div className="glass rounded border p-6">
        <form
          className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-[4fr_3fr_2fr_3fr]"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const q = new URLSearchParams();
            const month = String(f.get("month") ?? "");
            const people = String(f.get("people") ?? "");
            if (month) q.set("month", month);
            if (people) q.set("people", people);
            const to = String(f.get("type") ?? "/kilimanjaro");
            router.push(`${to}${q.size ? `?${q}` : ""}` as never);
          }}
        >
          <div>
            <label className={label} htmlFor="find-type">What kind of trip</label>
            <select id="find-type" name="type" className={field}>
              {services.map((s) => (
                <option key={s.slug} value={s.href}>
                  {s.title} — {s.count}
                </option>
              ))}
              <option value="/departures">Join a group departure — fixed dates</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="find-month">Roughly when</label>
            <select id="find-month" name="month" className={field}>
              <option value="">Not sure yet</option>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="find-people">How many</label>
            <select id="find-people" name="people" defaultValue="2" className={field}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
              <option>7+</option>
            </select>
          </div>
          <button type="submit"
            className="rounded-[3px] bg-brick-text px-7 py-3.5 text-sm font-semibold text-white hover:bg-brick-dark">
            Show me trips
          </button>
        </form>
        <p className="mt-3 text-[13px] text-muted">
          Every price on this site is per person and in US dollars. No trip is listed without one.
        </p>
      </div>
    </div>
  );
}
