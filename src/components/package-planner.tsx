"use client";

import { useEffect, useState } from "react";
import { EnquiryForm } from "@/components/enquiry-form";
import { kilimanjaroRoutes, rateFor } from "@/lib/routes";
import { dayTrips, safaris } from "@/lib/trips";

/**
 * The trip planner.
 *
 * The current site's only conversion path is "Send a Request" — a form that
 * produces an email and no price. This produces a costed basket: climb plus
 * safari plus day trips, totalled, with a deposit figure, before anyone in
 * Moshi has to type a word.
 *
 * The basket persists to localStorage. Planning a $6,000 trip is not something
 * anyone finishes in one sitting, and losing the selection on a refresh was
 * the quickest way to lose the booking with it.
 */
const STORE = "twa-plan";

type Saved = { route: string; safari: string; extras: string[]; people: number };

export function PackagePlanner() {
  const [route, setRoute] = useState("");
  const [safari, setSafari] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [people, setPeople] = useState(2);
  const [restored, setRestored] = useState(false);

  /* Read once on mount. Guarded because localStorage throws in private mode
     on some browsers, and a saved basket is not worth a blank page. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Saved>;
        if (typeof s.route === "string") setRoute(s.route);
        if (typeof s.safari === "string") setSafari(s.safari);
        if (Array.isArray(s.extras)) setExtras(s.extras.filter((x) => typeof x === "string"));
        if (typeof s.people === "number" && s.people > 0) setPeople(s.people);
      }
    } catch {
      /* no saved basket, or storage unavailable — start empty */
    }
    setRestored(true);
  }, []);

  /* Write on every change, but only after the restore has run — otherwise the
     empty initial state overwrites the saved basket before it is read. */
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ route, safari, extras, people }));
    } catch {
      /* storage full or blocked — the basket still works for this session */
    }
  }, [restored, route, safari, extras, people]);

  /* Earliest sensible departure. Kilimanjaro permits and flights need lead
     time, so today is not a valid arrival date. */
  const earliest = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);

  const chosenRoute = kilimanjaroRoutes.find((r) => r.slug === route);
  const chosenSafari = safaris.find((s) => s.slug === safari);

  const routeCost = chosenRoute ? rateFor(chosenRoute, people) : 0;
  const safariCost = chosenSafari?.price ?? 0;
  const extrasCost = extras.reduce(
    (sum, slug) => sum + (dayTrips.find((t) => t.slug === slug)?.price ?? 0),
    0,
  );
  const perPerson = routeCost + safariCost + extrasCost;
  const total = perPerson * people;
  const deposit = Math.round(total * 0.3);

  const field =
    "w-full rounded-lg border border-scree/60 bg-white px-4 py-3 text-sm focus:border-tanzanite";
  const label = "label mb-2 block text-scree";

  return (
    <>

      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div className="space-y-10">
          <div>
            <h2 className="font-display text-2xl">1 · Climb</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRoute("")}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  route === "" ? "border-tanzanite bg-tanzanite text-white" : "border-mist hover:border-tanzanite"
                }`}
              >
                No climb
              </button>
              {kilimanjaroRoutes.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => setRoute(r.slug)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    route === r.slug ? "border-tanzanite bg-tanzanite text-white" : "border-mist hover:border-tanzanite"
                  }`}
                >
                  {r.name}{" "}
                  <span className="metric text-xs opacity-70">
                    {r.days}d · {r.successRate}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl">2 · Safari</h2>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => setSafari("")}
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  safari === "" ? "border-tanzanite bg-tanzanite text-white" : "border-mist hover:border-tanzanite"
                }`}
              >
                No safari
              </button>
              {safaris.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setSafari(s.slug)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    safari === s.slug ? "border-tanzanite bg-tanzanite text-white" : "border-mist hover:border-tanzanite"
                  }`}
                >
                  {s.name}{" "}
                  <span className="metric text-xs opacity-70">{s.days}d</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl">3 · Spare days</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {/* Only trips with a real rate — the basket has to add up. */}
              {dayTrips.filter((t) => t.tiers.length > 0).map((t) => {
                const on = extras.includes(t.slug);
                return (
                  <button
                    key={t.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setExtras(on ? extras.filter((e) => e !== t.slug) : [...extras, t.slug])
                    }
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      on ? "border-tanzanite bg-tanzanite text-white" : "border-mist hover:border-tanzanite"
                    }`}
                  >
                    {t.name} <span className="metric text-xs opacity-70">${t.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl">4 · Who is coming</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={label} htmlFor="people">
                  Travellers
                </label>
                <input
                  id="people"
                  type="number"
                  min={1}
                  max={16}
                  value={people}
                  onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
                  className={`${field} metric`}
                />
              </div>
              <div>
                <label className={label} htmlFor="start">
                  Arriving
                </label>
                <input id="start" name="start" type="date" min={earliest} className={field} />
              </div>
              <div>
                <label className={label} htmlFor="email">
                  Email for your quote
                </label>
                <input id="email" type="email" className={field} autoComplete="email" />
              </div>
            </div>
          </div>
        </div>

        {/* The basket */}
        <aside>
          <div className="sticky top-32 rounded-[10px] border border-mist bg-frost p-6 shadow-[0_10px_25px_0_rgba(74,85,104,0.10)]">
            <h2 className="font-display text-xl">Your trip</h2>

            <dl className="mt-5 divide-y divide-mist">
              {chosenRoute && (
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm">
                    {chosenRoute.name}
                    <span className="metric ml-2 text-xs text-scree">
                      {chosenRoute.days}d
                    </span>
                  </dt>
                  <dd className="metric text-sm">${routeCost.toLocaleString()}</dd>
                </div>
              )}
              {chosenSafari && (
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm">
                    {chosenSafari.name}
                    <span className="metric ml-2 text-xs text-scree">
                      {chosenSafari.days}d
                    </span>
                  </dt>
                  <dd className="metric text-sm">${safariCost.toLocaleString()}</dd>
                </div>
              )}
              {extras.map((slug) => {
                const t = dayTrips.find((x) => x.slug === slug);
                if (!t) return null;
                return (
                  <div key={slug} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-sm">{t.name}</dt>
                    <dd className="metric text-sm">${t.price}</dd>
                  </div>
                );
              })}
              {!chosenRoute && !chosenSafari && extras.length === 0 && (
                <p className="py-6 text-sm text-scree">
                  Nothing chosen yet. Pick a climb, a safari, or both — the price
                  updates as you go.
                </p>
              )}
            </dl>

            {perPerson > 0 && (
              <>
                <div className="mt-4 border-t-2 border-basalt pt-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="label text-scree">Per person</span>
                    <span className="metric text-lg">${perPerson.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-4">
                    <span className="label text-scree">
                      Total, {people} {people === 1 ? "traveller" : "travellers"}
                    </span>
                    <span className="metric text-3xl text-tanzanite">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-mist pt-3">
                    <span className="label text-scree">Deposit today, 30%</span>
                    <span className="metric text-lg">${deposit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Was two dead buttons. Now one real submission that carries
                    the whole basket to the office, so the quote they reply
                    with matches the number the visitor was just shown. */}
                <div className="mt-6 border-t border-mist pt-5">
                  <EnquiryForm
                    kind="trip"
                    compact
                    submitLabel={`Request this trip — $${deposit.toLocaleString()} deposit`}
                    hidden={{
                      route: chosenRoute?.name ?? "",
                      safari: chosenSafari?.name ?? "",
                      extras: extras.join(", "),
                      people: String(people),
                      perPerson: String(perPerson),
                      total: String(total),
                      deposit: String(deposit),
                    }}
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-scree">
                  No card is charged here. We confirm availability first, then
                  send a payment link for the 30% deposit. Balance due 45 days
                  before you fly. Park fees included; tips and insurance are not.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
