"use client";

import { useMemo, useState, useTransition } from "react";
import { PackagePlanner } from "@/components/package-planner";
import { AskZitaButton } from "@/components/zita-launcher";
import { bookTrip, planTrip, type PlannedTrip, type PlannerPlace, type TripBooking } from "@/lib/planner";

/**
 * Two ways to plan, one page:
 *  - "Plan it for me": Tanova's planner builds priced, day-by-day options from the company's own trips, ready to book.
 *  - "Build it myself": pick a climb, a safari and day trips and see the total (the basket the site always had).
 * Places Tanova cannot plan yet simply do not appear; with none, the page opens on the builder.
 */
export function TripPlanner({ places }: { places: PlannerPlace[] }) {
  const [tab, setTab] = useState<"plan" | "build">(places.length ? "plan" : "build");
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div role="tablist" aria-label="How to plan" className="mb-10 inline-flex rounded-full bg-frost p-1.5">
        {places.length > 0 && (
          <TabButton on={tab === "plan"} onClick={() => setTab("plan")}>Plan it for me</TabButton>
        )}
        <TabButton on={tab === "build"} onClick={() => setTab("build")}>Build it myself</TabButton>
      </div>
      {tab === "plan" && places.length > 0 ? <Planner places={places} /> : <PackagePlanner />}
    </div>
  );
}

function TabButton({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      onClick={onClick}
      className={`rounded-full px-6 py-3 text-[15px] font-semibold transition ${on ? "bg-basalt text-glacier shadow-card" : "text-basalt hover:bg-white"}`}
    >
      {children}
    </button>
  );
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const money = (n: number, c = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
const day = (s: string | null) => (s ? new Date(`${s}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }) : "");

function Planner({ places }: { places: PlannerPlace[] }) {
  // Open on the place with the most to plan: usually the one the office runs from.
  const first = [...places].sort((a, b) => b.activities + b.packages + b.stays - (a.activities + a.packages + a.stays))[0];
  const earliest = addDays(iso(new Date()), 14);
  const [placeId, setPlaceId] = useState(first.id);
  const [start, setStart] = useState(earliest);
  const [end, setEnd] = useState(addDays(earliest, 4));
  const [guests, setGuests] = useState(2);
  const [budget, setBudget] = useState<"budget" | "mid-range" | "luxury">("mid-range");
  const [stay, setStay] = useState<"" | "room" | "apartment" | "full_board">("");
  const [pace, setPace] = useState(2);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<PlannedTrip | null>(null);
  const [option, setOption] = useState(0);
  const [pending, start_] = useTransition();
  const place = places.find((p) => p.id === placeId) ?? first;
  const nights = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 864e5));

  function build() {
    setError(null);
    start_(async () => {
      const r = await planTrip({ placeId, place: place.name, start, end, guests, budget, stay, pace, notes });
      if (r.ok) {
        setTrip(r.trip);
        setOption(0);
        requestAnimationFrame(() => document.getElementById("plan-result")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else setError(r.message);
    });
  }

  if (trip) return <Result trip={trip} option={option} setOption={setOption} onBack={() => setTrip(null)} />;

  const seg = (on: boolean) => `flex-1 rounded-full px-4 py-3 text-[15px] font-semibold transition ${on ? "bg-glacier text-basalt shadow-card" : "text-scree hover:text-basalt"}`;
  const chip = (on: boolean) => `rounded-full border px-4 py-2.5 text-[15px] font-medium transition ${on ? "border-basalt bg-basalt text-glacier" : "border-mist bg-glacier text-basalt hover:border-basalt"}`;
  const label = "mb-3 block text-[13px] font-semibold uppercase tracking-wide text-scree";

  return (
    <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-10">
        <section>
          <span className={label}>Where</span>
          <div className="flex flex-wrap gap-2">
            {places.map((p) => (
              <button key={p.id} type="button" onClick={() => setPlaceId(p.id)} className={chip(p.id === placeId)}>
                {p.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[14px] text-scree">
            {place.activities} activities{place.packages ? ` · ${place.packages} multi-day trips` : ""}
            {place.stays ? ` · ${place.stays} places to stay` : ""}
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          <label className="block">
            <span className={label}>Arrive</span>
            <input
              type="date"
              min={earliest}
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                if (e.target.value >= end) setEnd(addDays(e.target.value, 4));
              }}
              className="h-14 w-full rounded-[14px] border border-mist bg-frost px-4 text-[16px] text-basalt outline-none focus:border-tanzanite"
            />
          </label>
          <label className="block">
            <span className={label}>Leave</span>
            <input
              type="date"
              min={addDays(start, 1)}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="h-14 w-full rounded-[14px] border border-mist bg-frost px-4 text-[16px] text-basalt outline-none focus:border-tanzanite"
            />
          </label>
          <div>
            <span className={label}>Travellers</span>
            <div className="flex h-14 items-center justify-between rounded-[14px] border border-mist bg-frost px-2">
              <Step onClick={() => setGuests(Math.max(1, guests - 1))} label="One fewer">−</Step>
              <span className="font-mono text-[18px] font-medium text-basalt">{guests}</span>
              <Step onClick={() => setGuests(Math.min(20, guests + 1))} label="One more">+</Step>
            </div>
          </div>
        </section>

        <section>
          <span className={label}>Budget</span>
          <div className="flex rounded-full bg-frost p-1.5">
            {(["budget", "mid-range", "luxury"] as const).map((b) => (
              <button key={b} type="button" onClick={() => setBudget(b)} className={seg(budget === b)}>
                {b === "budget" ? "Budget" : b === "mid-range" ? "Mid-range" : "Luxury"}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-10 sm:grid-cols-2">
          {place.stays > 0 && <div>
            <span className={label}>Where you sleep</span>
            <div className="flex flex-wrap gap-2">
              {([["", "Any"], ["room", "Hotel"], ["apartment", "Apartment"], ["full_board", "Full board"]] as const).map(([v, l]) => (
                <button key={l} type="button" onClick={() => setStay(v)} className={chip(stay === v)}>{l}</button>
              ))}
            </div>
          </div>}
          <div>
            <span className={label}>Pace</span>
            <div className="flex rounded-full bg-frost p-1.5">
              {[[1, "Relaxed"], [2, "Balanced"], [3, "Full days"]].map(([v, l]) => (
                <button key={l} type="button" onClick={() => setPace(v as number)} className={seg(pace === v)}>{l}</button>
              ))}
            </div>
          </div>
        </section>

        <label className="block">
          <span className={label}>Anything we should know</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={900}
            placeholder="A honeymoon, a first safari, no early starts, a vegetarian…"
            className="w-full rounded-[14px] border border-mist bg-frost px-4 py-3 text-[16px] text-basalt outline-none focus:border-tanzanite"
          />
        </label>
      </div>

      {/* The summary stays in view while choosing */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[24px] bg-basalt p-7 text-glacier shadow-lift">
          <p className="text-[13px] font-semibold uppercase tracking-wide opacity-70">Your trip</p>
          <p className="mt-2 font-display text-3xl text-glacier">{place.name}</p>
          <p className="mt-2 font-mono text-[15px] opacity-85">
            {day(start)} – {day(end)} · {nights} {nights === 1 ? "night" : "nights"} · {guests} {guests === 1 ? "traveller" : "travellers"}
          </p>
          <ul className="mt-6 space-y-2 text-[15px] opacity-85">
            <li>✓ Priced from our own trips, today's rates</li>
            <li>✓ Day by day, with the weather where known</li>
            <li>✓ Book the whole trip in one go</li>
          </ul>
          {error && <p className="mt-5 rounded-[14px] bg-sunrise/20 px-4 py-3 text-[14px] text-glacier">{error}</p>}
          <button
            type="button"
            onClick={build}
            disabled={pending}
            className="mt-7 h-14 w-full rounded-full bg-brand text-[16px] font-semibold text-basalt transition hover:bg-brand-bright disabled:opacity-60"
          >
            {pending ? "Planning your trip…" : "Plan my trip"}
          </button>
          <AskZitaButton question="Can you help me plan my trip?" className="mt-3 h-12 w-full rounded-full border border-white/25 text-[15px] font-semibold text-glacier hover:bg-white/10">
            Or ask Zita
          </AskZitaButton>
        </div>
      </aside>
    </div>
  );
}

function Step({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full bg-glacier text-[20px] font-semibold text-basalt shadow-card">
      {children}
    </button>
  );
}

/** A saved plan opened from its link. */
export function SavedPlan({ trip }: { trip: PlannedTrip }) {
  const [option, setOption] = useState(0);
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Result trip={trip} option={option} setOption={setOption} onBack={() => (window.location.href = "/plan")} backLabel="← Plan another trip" />
    </div>
  );
}

function Result({ trip, option, setOption, onBack, backLabel = "← Change the plan" }: { trip: PlannedTrip; option: number; setOption: (n: number) => void; onBack: () => void; backLabel?: string }) {
  const o = trip.options[option];
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState<TripBooking | null>(null);

  if (!o)
    return (
      <div id="plan-result" className="rounded-[24px] bg-frost p-10 text-center">
        <p className="font-display text-2xl">Nothing came back for those dates</p>
        <p className="mt-3 text-scree">Try other dates or a different pace, or ask Zita to have the team plan it.</p>
        <button type="button" onClick={onBack} className="mt-6 h-12 rounded-full bg-basalt px-6 font-semibold text-glacier">Change the plan</button>
      </div>
    );

  return (
    <div id="plan-result" className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="text-[15px] font-semibold text-tanzanite hover:underline">{backLabel}</button>
          <ShareIt trip={trip} total={o.total} />
        </div>
        <h2 className="font-display text-4xl">{trip.destination}</h2>
        <p className="mt-2 font-mono text-[15px] text-scree">
          {day(trip.start)} – {day(trip.end)} · {trip.guests} {trip.guests === 1 ? "traveller" : "travellers"}
        </p>

        {trip.options.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {trip.options.map((x, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOption(i)}
                className={`rounded-full border px-4 py-2.5 text-[15px] font-semibold transition ${i === option ? "border-basalt bg-basalt text-glacier" : "border-mist text-basalt hover:border-basalt"}`}
              >
                Option {i + 1} · {money(x.total, trip.currency)}
              </button>
            ))}
          </div>
        )}

        <ol className="mt-10 space-y-5">
          {o.days.map((d) => (
            <li key={d.day} className="rounded-[20px] border border-mist bg-glacier p-6 shadow-card">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-basalt font-mono text-[16px] text-glacier">{d.day}</span>
                <div className="flex-1">
                  <p className="text-[17px] font-semibold text-basalt">{day(d.date) || `Day ${d.day}`}</p>
                  {d.stay && <p className="text-[14px] text-scree">Night at {d.stay}</p>}
                </div>
                {d.weather && <span className="text-[15px] text-scree">{d.weather.icon} {d.weather.max != null ? `${d.weather.max}°` : ""}</span>}
              </div>
              {d.activities.length === 0 ? (
                <p className="mt-4 text-[15px] text-scree">A free day to rest or explore.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {d.activities.map((a, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="w-14 shrink-0 font-mono text-[14px] text-scree">{a.time}</span>
                      <div className="flex-1">
                        <p className="text-[16px] font-semibold text-basalt">{a.name}</p>
                        {a.description && <p className="mt-1 text-[14px] leading-relaxed text-scree">{a.description}</p>}
                      </div>
                      {a.cost > 0 && <span className="font-mono text-[14px] text-basalt">{money(a.cost, trip.currency)}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[24px] bg-basalt p-7 text-glacier shadow-lift">
          <p className="text-[13px] font-semibold uppercase tracking-wide opacity-70">Trip total</p>
          <p className="mt-2 font-mono text-5xl text-glacier">{money(o.total, trip.currency)}</p>
          <p className="mt-1 text-[15px] opacity-80">{money(o.perPerson, trip.currency)} a person</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 font-mono text-[15px]">
            <div>
              <dt className="text-[12px] uppercase tracking-wide opacity-60">Stay</dt>
              <dd>{money(o.stay, trip.currency)}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wide opacity-60">Activities</dt>
              <dd>{money(o.activities, trip.currency)}</dd>
            </div>
          </dl>
          {o.hotel && <p className="mt-5 text-[14px] opacity-80">Staying at {o.hotel.name} · {o.hotel.rooms} {o.hotel.rooms === 1 ? "room" : "rooms"}</p>}

          {done?.ok ? (
            <div className="mt-7 rounded-[18px] bg-white/10 p-5">
              <p className="text-[17px] font-semibold">Your trip is booked</p>
              <p className="mt-1 font-mono text-[14px] opacity-85">Reference {done.code} · {money(done.total, done.currency)}</p>
              {done.payUrl ? (
                <a href={done.payUrl} className="mt-5 flex h-14 items-center justify-center rounded-full bg-brand text-[16px] font-semibold text-basalt hover:bg-brand-bright">
                  Pay the deposit
                </a>
              ) : (
                <p className="mt-3 text-[14px] opacity-85">The confirmation and the bill are on their way to your email.</p>
              )}
            </div>
          ) : booking ? (
            <BookForm tripId={trip.id} option={option} onDone={setDone} onCancel={() => setBooking(false)} />
          ) : (
            <>
              <button type="button" onClick={() => setBooking(true)} className="mt-7 h-14 w-full rounded-full bg-brand text-[16px] font-semibold text-basalt hover:bg-brand-bright">
                Book this trip
              </button>
              <AskZitaButton question={`I planned ${trip.destination}, ${day(trip.start)} to ${day(trip.end)}, for ${trip.guests}. Can the team tailor it?`} className="mt-3 h-12 w-full rounded-full border border-white/25 text-[15px] font-semibold text-glacier hover:bg-white/10">
                Ask the team to tailor it
              </AskZitaButton>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function BookForm({ tripId, option, onDone, onCancel }: { tripId: number; option: number; onDone: (b: TripBooking) => void; onCancel: () => void }) {
  const [f, setF] = useState({ first: "", last: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const input = "h-12 w-full rounded-[14px] border border-white/15 bg-white/10 px-4 text-[15px] text-glacier outline-none placeholder:text-white/50 focus:border-brand";
  const valid = useMemo(() => f.first && f.last && /@/.test(f.email), [f]);
  return (
    <form
      className="mt-7 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await bookTrip(tripId, option, f);
          if (r.ok) onDone(r);
          else setError(r.message);
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <input className={input} placeholder="First name" autoComplete="given-name" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} />
        <input className={input} placeholder="Surname" autoComplete="family-name" value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} />
      </div>
      <input className={input} type="email" placeholder="Email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={input} type="tel" placeholder="WhatsApp or phone (optional)" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      {error && <p className="text-[14px] text-brand-bright">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="h-14 flex-1 rounded-full border border-white/25 text-[15px] font-semibold">Back</button>
        <button type="submit" disabled={pending || !valid} className="h-14 flex-1 rounded-full bg-brand text-[16px] font-semibold text-basalt disabled:opacity-50">
          {pending ? "Booking…" : "Book it"}
        </button>
      </div>
      <p className="pt-1 text-[12px] opacity-70">Everything in the plan is booked together on one bill. See our terms for deposits and changes.</p>
    </form>
  );
}

/** Keep the plan: a link that opens it again, to copy or send on WhatsApp. */
function ShareIt({ trip, total }: { trip: PlannedTrip; total: number }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? `/plan/${trip.token}` : `${window.location.origin}/plan/${encodeURIComponent(trip.token)}`;
  const text = `My ${trip.destination} trip, ${day(trip.start)} to ${day(trip.end)}, ${money(total, trip.currency)}: ${url}`;
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={async () => {
          try {
            if (navigator.share) await navigator.share({ title: `${trip.destination} trip`, text, url });
            else {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }
          } catch {
            /* the guest closed the share sheet */
          }
        }}
        className="h-11 rounded-full border border-mist px-5 text-[14px] font-semibold text-basalt hover:border-basalt"
      >
        {copied ? "Link copied" : "Save or share this plan"}
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" className="grid h-11 place-items-center rounded-full bg-[#1f7a45] px-5 text-[14px] font-semibold text-white">
        WhatsApp
      </a>
    </div>
  );
}
