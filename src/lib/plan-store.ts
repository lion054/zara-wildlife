"use client";

import { useCallback, useEffect, useState } from "react";
import { routes, rateFor, type Route } from "./routes";
import { safaris, dayTrips } from "./trips";
import { combos } from "./combos";

/**
 * The trip basket.
 *
 * A single source of truth shared by the planner and the header badge, so the
 * count in the header can never disagree with the page. Everything resolves
 * from `lib/` by slug — the store holds selections, never prices, which is what
 * makes it impossible for a saved basket to quote a stale figure after a rate
 * change.
 *
 * The model matches how a trip actually works:
 *
 *   climb    one, or none
 *   safari   one, or none
 *   combo    one, and it REPLACES climb + safari because it contains both
 *   extras   many, because you genuinely can do several day trips
 *
 * An earlier version allowed an Add toggle on every row, so a basket could hold
 * three Kilimanjaro routes at once and cheerfully total them.
 */

const KEY = "twa.plan.v3";
const DEPOSIT_RATE = 0.3;

export type PlanState = {
  route: string;
  safari: string;
  combo: string;
  extras: string[];
  people: number;
  arrive: string;
  email: string;
};

export const emptyPlan: PlanState = {
  route: "",
  safari: "",
  combo: "",
  extras: [],
  people: 2,
  arrive: "",
  email: "",
};

function read(): PlanState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<PlanState>;
    return {
      route: typeof raw.route === "string" ? raw.route : "",
      safari: typeof raw.safari === "string" ? raw.safari : "",
      combo: typeof raw.combo === "string" ? raw.combo : "",
      extras: Array.isArray(raw.extras) ? raw.extras.filter((x): x is string => typeof x === "string") : [],
      people: typeof raw.people === "number" && raw.people > 0 ? raw.people : 2,
      arrive: typeof raw.arrive === "string" ? raw.arrive : "",
      email: typeof raw.email === "string" ? raw.email : "",
    };
  } catch {
    /* private mode, or nothing saved yet */
    return emptyPlan;
  }
}

/** Broadcast within the tab; `storage` only fires cross-tab. */
const EVENT = "twa:plan";

export function usePlan() {
  const [plan, setPlan] = useState<PlanState>(emptyPlan);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    setPlan(read());
    setRestored(true);
    const sync = () => setPlan(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback(
    (patch: Partial<PlanState> | ((p: PlanState) => Partial<PlanState>)) => {
      setPlan((prev) => {
        const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* storage blocked — the basket still works for this session */
        }
        window.dispatchEvent(new Event(EVENT));
        return next;
      });
    },
    [],
  );

  return { plan, update, restored };
}

/* ------------------------------------------------------------------ *
 * Costing
 * ------------------------------------------------------------------ */

export type Line = { id: string; name: string; kind: string; unit: number };

/** Largest day-trip tier the party reaches, mirroring `rateFor` for climbs. */
function dayTripRate(slug: string, people: number) {
  const t = dayTrips.find((x) => x.slug === slug);
  if (!t || !t.tiers.length) return 0;
  let best: { min: number; price: number } | null = null;
  for (const tier of t.tiers) {
    const min = parseInt(tier.size, 10);
    if (Number.isFinite(min) && min <= people && (!best || min > best.min)) {
      best = { min, price: tier.price };
    }
  }
  return best ? best.price : t.price;
}

export function pricePlan(plan: PlanState) {
  const lines: Line[] = [];

  if (plan.combo) {
    const c = combos.find((x) => `combo-${x.slug}` === plan.combo);
    if (c?.price != null) lines.push({ id: plan.combo, name: c.name, kind: "Combination", unit: c.price });
  } else {
    if (plan.route) {
      const r = routes.find((x) => `route-${x.slug}` === plan.route) as Route | undefined;
      if (r) lines.push({ id: plan.route, name: `${r.name} Route`, kind: "Climb", unit: rateFor(r, plan.people) });
    }
    if (plan.safari) {
      const s = safaris.find((x) => `safari-${x.slug}` === plan.safari);
      if (s) lines.push({ id: plan.safari, name: s.name, kind: "Safari", unit: s.price });
    }
  }

  for (const id of plan.extras) {
    const t = dayTrips.find((x) => `day-${x.slug}` === id);
    if (t) lines.push({ id, name: t.name, kind: "Day trip", unit: dayTripRate(t.slug, plan.people) });
  }

  const perPerson = lines.reduce((a, l) => a + l.unit, 0);
  const total = perPerson * plan.people;
  const deposit = Math.round(total * DEPOSIT_RATE);
  return { lines, perPerson, total, deposit, balance: total - deposit };
}
