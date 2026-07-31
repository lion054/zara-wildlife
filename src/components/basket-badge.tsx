"use client";

import Link from "next/link";
import { usePlan, pricePlan } from "@/lib/plan-store";
import { money } from "@/lib/format";

/**
 * The header CTA, doubling as the basket indicator.
 *
 * Before this, somebody could add a climb, browse on to safaris, and have no
 * signal anywhere that a trip was half-built. Every checkout in the world shows
 * a running count, and the reason is that a part-filled basket is the strongest
 * reason a visitor has to come back.
 *
 * Renders "Plan my trip" until the basket has something in it, and does so on
 * the server too — so the button never flashes a different label on hydration.
 *
 * It used to be `hidden sm:inline-flex`, which meant that below 640px the only
 * route to the planner was three taps deep inside the drawer, under "Company".
 * A part-built basket was invisible on the device most people browse on. It is
 * now always present: the full label where there is room, and a compact count
 * where there is not.
 */
export function BasketBadge() {
  const { plan, restored } = usePlan();
  const { lines, total } = pricePlan(plan);
  const active = restored && lines.length > 0;

  return (
    <Link
      href="/plan"
      aria-label={
        active
          ? `My trip: ${lines.length} item${lines.length === 1 ? "" : "s"}, ${money(total)} total. Open the planner.`
          : "Plan my trip"
      }
      className={`inline-flex shrink-0 items-center gap-2 rounded-[3px] px-3 py-2.5 text-sm font-semibold text-white sm:px-5 sm:py-3 ${
        active
          ? "bg-olive-deep hover:bg-olive-darker"
          : "bg-brick-text hover:bg-brick-dark"
      }`}
    >
      {active ? (
        <>
          <span className="hidden sm:inline">My trip</span>
          <span className="sm:hidden">Trip</span>
          <span className="metric rounded-sm bg-white/20 px-1.5 py-px text-[13px]">{lines.length}</span>
          {/* The total is the part worth coming back for, but it is also the
              widest. It waits for a screen that can hold it beside the logo. */}
          <span className="metric hidden opacity-85 sm:inline">{money(total)}</span>
        </>
      ) : (
        <>
          <span className="hidden sm:inline">Plan my trip</span>
          <span className="sm:hidden">Plan</span>
        </>
      )}
    </Link>
  );
}
