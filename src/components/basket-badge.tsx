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
      className={`hidden shrink-0 items-center gap-2 rounded-[3px] px-5 py-3 text-sm font-semibold text-white sm:inline-flex ${
        active
          ? "bg-olive-deep hover:bg-olive-darker"
          : "bg-brick-text hover:bg-brick-dark"
      }`}
    >
      {active ? (
        <>
          My trip
          <span className="metric rounded-sm bg-white/20 px-1.5 py-px text-[13px]">{lines.length}</span>
          <span className="metric opacity-85">{money(total)}</span>
        </>
      ) : (
        "Plan my trip"
      )}
    </Link>
  );
}
