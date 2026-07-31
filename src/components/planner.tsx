"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePlan, pricePlan } from "@/lib/plan-store";
import { money, earliestArrival, dayTripRates, list } from "@/lib/format";
import { routes } from "@/lib/routes";
import { safaris, dayTrips } from "@/lib/trips";
import { combos } from "@/lib/combos";
import { EnquiryForm } from "@/components/enquiry-form";
import { haptic } from "@/lib/haptics";
import { suggestPlan, type Suggestion } from "@/app/plan-actions";
import { useState, useTransition } from "react";
import { departures } from "@/lib/trips";
import { longDate } from "@/lib/format";

/**
 * The trip planner.
 *
 * Four numbered steps, and every option a chip rather than a full-width row —
 * a four-decision task should not run to several screens of near-identical
 * bars.
 *
 * The model is the one that matches how a trip actually works: one climb, one
 * safari, many day trips, and a combination that REPLACES climb and safari
 * because it already contains both. An earlier version put an Add toggle on
 * every row, so a basket could hold three Kilimanjaro routes at once.
 *
 * Travellers, arrival date and email are step four rather than a separate form
 * below the fold, and the arrival date has a floor of two weeks out — permits
 * and long-haul flights need the lead time, and the old field accepted
 * yesterday.
 */

type ChipProps = {
  on: boolean;
  name: string;
  meta?: string;
  price?: number | null;
  role: "radio" | "checkbox";
  onSelect: () => void;
  muted?: boolean;
};

function Chip({ on, name, meta, price, role, onSelect, muted = false }: ChipProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={on}
      /* On and off are different pulses — a single buzz for both would tell an
         Android user that the tap registered but not which way it went, and
         this is the control that moves the price. The only haptic on the site
         besides the reply to a submitted form. */
      onClick={() => {
        haptic(on ? "deselect" : "select");
        onSelect();
      }}
      className={`block w-full rounded border px-4 py-[13px] text-left ${
        on
          ? muted
            ? "border-slate bg-slate"
            : "border-olive-deep bg-olive-deep"
          : muted
            ? "border-line bg-paper hover:border-olive"
            : "border-line bg-white hover:border-olive"
      }`}
    >
      {/* The tick means the state is not carried by colour alone. */}
      <span className={`block text-[15px] font-semibold leading-[1.35] ${on ? "text-white" : "text-ink"}`}>
        {name}
        {on && <span aria-hidden> ✓</span>}
      </span>
      {meta && (
        <span className={`mt-0.5 block text-[12.5px] ${on ? "text-white/72" : "text-muted"}`}>{meta}</span>
      )}
      {price != null && (
        <span className={`metric mt-1.5 block text-sm font-bold ${on ? "text-white" : "text-olive-deep"}`}>
          {money(price)}
        </span>
      )}
    </button>
  );
}

function Step({ n, title, lead, children }: { n?: number; title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pb-10 pt-[34px] first:border-t-0 first:pt-0">
      <h2 className="mb-2 flex items-center gap-3 text-2xl">
        {n && (
          <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-ink font-sans text-sm font-bold text-white">
            {n}
          </span>
        )}
        {title}
      </h2>
      <p className="mb-[18px] max-w-[60ch] text-[15px] leading-[1.7] text-muted">{lead}</p>
      {children}
    </div>
  );
}

const grid = "grid grid-cols-1 gap-2.5 sm:grid-cols-2";

/**
 * "Describe it and I'll build it."
 *
 * Sits above step 1 rather than replacing it. The four steps are the product;
 * this is a way in for the reader who does not yet know that route choice is
 * what decides whether they summit, and who would otherwise bounce before
 * touching a chip.
 *
 * It fills the planner in and stops. Every chip it sets is a chip the reader
 * can unset, the basket re-prices from the same ladder either way, and nothing
 * is sent anywhere — a suggestion that fired off an enquiry would be a
 * different and much worse feature.
 */
function DescribeTrip({
  onApply,
}: {
  onApply: (s: Suggestion) => void;
}) {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<Suggestion | null>(null);
  const [pending, start] = useTransition();

  const dep = result?.departureId ? departures.find((d) => d.id === result.departureId) : undefined;

  return (
    <div className="border-t border-line pb-10 pt-[34px] first:border-t-0 first:pt-0">
      <h2 className="mb-2 flex items-center gap-3 text-2xl">
        <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full border border-olive-deep font-sans text-sm font-bold text-olive-deep">
          ✦
        </span>
        Or just describe it
      </h2>
      <p className="mb-[18px] max-w-[60ch] text-[15px] leading-[1.7] text-muted">
        Tell us in your own words and we will fill the four steps in below. Nothing is sent — every
        choice stays yours to change, and the basket prices it the same way either way.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-[1fr_auto] sm:items-start">
        <textarea
          value={brief}
          rows={2}
          disabled={pending}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Two of us in August, first time at altitude, want to summit and see the migration."
          className="w-full resize-y rounded-[3px] border border-line bg-white px-4 py-3 text-[15px] text-ink focus:border-olive-deep disabled:opacity-60"
        />
        <button
          type="button"
          disabled={pending || brief.trim().length < 8}
          onClick={() => {
            haptic("select");
            start(async () => {
              const s = await suggestPlan(brief);
              setResult(s);
              if (s.ok) onApply(s);
            });
          }}
          className="rounded-[3px] bg-olive-deep px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-olive-darker disabled:opacity-40 sm:h-[50px]"
        >
          {pending ? "Building…" : "Build it"}
        </button>
      </div>

      <div role="status" aria-live="polite">
        {result && (
          <div className="mt-3.5 border-l-[3px] border-olive-deep bg-paper px-[18px] py-3.5">
            {result.rationale && (
              <p className="text-[15px] leading-[1.7] text-ink">{result.rationale}</p>
            )}
            <p className={`text-[13px] leading-[1.6] ${result.rationale ? "mt-2 text-muted" : "text-slate"}`}>
              {result.message}
            </p>
            {dep && (
              <p className="mt-2 text-[13px] leading-[1.6]">
                <Link href={`/departures#${dep.id}`} className="font-semibold text-olive-deep underline-offset-2 hover:underline">
                  There is a group departure on {longDate(dep.start)}
                </Link>{" "}
                <span className="text-muted">
                  — {dep.capacity - dep.booked} of {dep.capacity} seats left, and below the
                  private-climb price.
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Planner() {
  const { plan, update, restored } = usePlan();
  const { lines, perPerson, total, deposit, balance } = pricePlan(plan);
  const params = useSearchParams();

  /**
   * Deep link from a detail page's book bar: `/plan?add=route-lemosho-8-day`.
   * The id resolves against the same data the chips render from, so a deep link
   * can never introduce a price the planner disagrees with.
   */
  const add = params.get("add");
  useEffect(() => {
    if (!restored || !add) return;
    if (add.startsWith("route-")) update({ route: add, combo: "" });
    else if (add.startsWith("safari-")) update({ safari: add, combo: "" });
    else if (add.startsWith("combo-")) update({ combo: add, route: "", safari: "" });
    else if (add.startsWith("day-")) {
      update((p) => (p.extras.includes(add) ? {} : { extras: [...p.extras, add] }));
    }
  }, [restored, add, update]);

  /** Applies a suggestion by writing the same fields a chip tap would. */
  const applySuggestion = (s: Suggestion) =>
    update({
      route: s.route ? `route-${s.route}` : "",
      safari: s.safari ? `safari-${s.safari}` : "",
      combo: s.combo ? `combo-${s.combo}` : "",
      extras: s.extras.map((slug) => `day-${slug}`),
      people: s.people ?? 2,
    });

  const ratedTrips = dayTrips.filter((t) => t.tiers.length > 0);
  const unrated = dayTrips.length - ratedTrips.length;
  const pricedCombos = combos.filter((c) => c.price != null);
  const quotedCombos = combos.length - pricedCombos.length;

  return (
    <div className="mx-auto grid max-w-[1170px] gap-12 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
        <DescribeTrip onApply={applySuggestion} />

        <Step n={1} title="Your climb"
          lead="One mountain per trip. Prices are the headline rate — the basket re-prices against the party-size ladder as soon as you set step 4.">
          <div className={grid} role="radiogroup" aria-label="Choose a climb">
            <Chip muted role="radio" on={!plan.route && !plan.combo} name="No climb"
              onSelect={() => update({ route: "" })} />
            {routes.map((r) => (
              <Chip key={r.slug} role="radio"
                on={plan.route === `route-${r.slug}`}
                name={`${r.name} Route`}
                meta={`${r.days} days · ${r.successRate}% summit${r.successVerified ? "" : "*"}`}
                price={r.price}
                onSelect={() =>
                  update((p) => ({
                    route: p.route === `route-${r.slug}` ? "" : `route-${r.slug}`,
                    combo: "",
                  }))
                }
              />
            ))}
          </div>
        </Step>

        <Step n={2} title="Your safari" lead="Best done after the climb, while your legs recover.">
          <div className={grid} role="radiogroup" aria-label="Choose a safari">
            <Chip muted role="radio" on={!plan.safari && !plan.combo} name="No safari"
              onSelect={() => update({ safari: "" })} />
            {safaris.map((s) => (
              <Chip key={s.slug} role="radio"
                on={plan.safari === `safari-${s.slug}`}
                name={s.name}
                meta={`${s.days} days · ${s.style}`}
                price={s.price}
                onSelect={() =>
                  update((p) => ({
                    safari: p.safari === `safari-${s.slug}` ? "" : `safari-${s.slug}`,
                    combo: "",
                  }))
                }
              />
            ))}
          </div>
        </Step>

        <Step n={3} title="Days either side"
          lead="Acclimatisation before a climb, or the spare days around a safari. Add as many as you like.">
          <div className={grid} role="group" aria-label="Add day trips">
            {ratedTrips.map((t) => {
              const r = dayTripRates(t);
              const id = `day-${t.slug}`;
              return (
                <Chip key={t.slug} role="checkbox"
                  on={plan.extras.includes(id)}
                  name={t.name} meta={t.hours} price={r.best}
                  onSelect={() =>
                    update((p) => ({
                      extras: p.extras.includes(id) ? p.extras.filter((x) => x !== id) : [...p.extras, id],
                    }))
                  }
                />
              );
            })}
          </div>
          {unrated > 0 && (
            <p className="mt-3.5 text-[13px] leading-[1.65] text-muted">
              {unrated} more day trips have no published rate card, so they are not in the basket —{" "}
              <Link href="/day-trips" className="text-olive-deep underline-offset-2 hover:underline">
                see them and ask for a price
              </Link>.
            </p>
          )}
        </Step>

        <Step n={4} title="Who is coming"
          lead="Party size is what moves the per-person rate, so this is the field that changes the total most.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate" htmlFor="p-people">Travellers</label>
              <input id="p-people" type="number" min={1} max={16} value={plan.people}
                onChange={(e) => update({ people: Math.min(16, Math.max(1, Number(e.target.value) || 1)) })}
                className="metric w-full rounded-[3px] border border-line bg-white px-4 py-3 text-[15px] focus:border-olive-deep" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate" htmlFor="p-arrive">Arriving</label>
              <input id="p-arrive" type="date" min={earliestArrival()} value={plan.arrive}
                onChange={(e) => update({ arrive: e.target.value })}
                className="w-full rounded-[3px] border border-line bg-white px-4 py-3 text-[15px] focus:border-olive-deep" />
              <p className="mt-1.5 text-xs text-muted">Two weeks out at the earliest — permits and flights need the lead time.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate" htmlFor="p-email">Email for your quote</label>
              <input id="p-email" type="email" autoComplete="email" value={plan.email}
                onChange={(e) => update({ email: e.target.value })}
                className="w-full rounded-[3px] border border-line bg-white px-4 py-3 text-[15px] focus:border-olive-deep" />
            </div>
          </div>
        </Step>

        <Step title="Or start from a ready-made combination"
          lead="These already contain a climb and a safari, so picking one clears steps 1 and 2.">
          <div className={grid} role="radiogroup" aria-label="Choose a combination">
            <Chip muted role="radio" on={!plan.combo} name="No combination" onSelect={() => update({ combo: "" })} />
            {pricedCombos.map((c) => (
              <Chip key={c.slug} role="radio"
                on={plan.combo === `combo-${c.slug}`}
                name={c.name}
                meta={`${c.days} days · ${list(c.legs)}`}
                price={c.price}
                onSelect={() =>
                  update((p) => ({
                    combo: p.combo === `combo-${c.slug}` ? "" : `combo-${c.slug}`,
                    route: "", safari: "",
                  }))
                }
              />
            ))}
          </div>
          {quotedCombos > 0 && (
            <p className="mt-3.5 text-[13px] leading-[1.65] text-muted">
              {quotedCombos} combinations include a Zanzibar leg, which we quote rather than list —{" "}
              <Link href="/combos" className="text-olive-deep underline-offset-2 hover:underline">
                ask for a price on those
              </Link>.
            </p>
          )}
        </Step>

        <Step title="Zanzibar"
          lead="Not in the basket, because we publish no rate for it — the figure moves with the hotel standard and the season by more than an honest “from” would survive. Say you want it in the message and we quote the beach half alongside everything above.">
          <Link href="/zanzibar"
            className="inline-block rounded-[3px] border border-olive-deep px-6 py-3 text-sm font-semibold text-olive-deep hover:bg-olive-deep hover:text-white">
            See the Zanzibar packages
          </Link>
        </Step>
      </div>

      {/* The basket */}
      <aside>
        {/* Sticky, so the four steps scroll behind it — the second place on the
            site where the blur is load-bearing rather than decorative. */}
        <div className="glass sticky top-[124px] rounded border p-[26px]">
          <h2 className="text-xl">Your trip</h2>
          <p className="text-[13px] leading-[1.6] text-muted">
            Saved in this browser. Nothing is booked and no card is charged here.
          </p>

          {lines.length === 0 ? (
            <p className="py-5 text-sm text-muted">
              Nothing chosen yet. Pick a climb, a safari, or both — the price updates as you go.
            </p>
          ) : (
            <>
              <ul className="mt-4">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-3 border-b border-line py-3 text-sm">
                    <span className="font-semibold text-ink">
                      {l.name}
                      <span className="mt-0.5 block text-xs font-normal text-muted">{l.kind}</span>
                    </span>
                    <span className="metric whitespace-nowrap font-bold text-olive-deep">{money(l.unit)}</span>
                  </li>
                ))}
              </ul>

              {/* Per person as well as the total: it is the number people compare
                  operators on, and the one that improves as the party grows. */}
              <div className="mt-[18px] border-t-2 border-ink pt-[18px]">
                <Row label="Per person" value={money(perPerson)} />
                <Row label={`Total, ${plan.people} ${plan.people === 1 ? "traveller" : "travellers"}`}
                  value={money(total)} big />
                <Row label="Deposit to confirm, 30%" value={money(deposit)} accent />
                <Row label="Balance, 45 days before" value={money(balance)} />
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <EnquiryForm
                  kind="plan"
                  subject="Trip built in the planner"
                  booking
                  submitLabel={`Request this trip — ${money(deposit)} deposit`}
                  hidden={{
                    climb: lines.filter((l) => l.kind === "Climb").map((l) => l.name).join(", "),
                    safari: lines.filter((l) => l.kind === "Safari").map((l) => l.name).join(", "),
                    combination: lines.filter((l) => l.kind === "Combination").map((l) => l.name).join(", "),
                    dayTrips: lines.filter((l) => l.kind === "Day trip").map((l) => l.name).join(", "),
                    travellers: String(plan.people),
                    arriving: plan.arrive,
                    perPerson: String(perPerson),
                    tripTotal: String(total),
                    depositDue: String(deposit),
                  }}
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => update({ route: "", safari: "", combo: "", extras: [] })}
            className="pt-3.5 text-[13px] text-olive-deep underline-offset-2 hover:underline"
          >
            Clear and start again
          </button>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, big = false, accent = false }: { label: string; value: string | null; big?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1 ${big ? "text-[22px] font-bold text-ink" : accent ? "font-semibold text-olive-deep" : "text-[15px]"}`}>
      <span>{label}</span>
      <span className="metric">{value}</span>
    </div>
  );
}
