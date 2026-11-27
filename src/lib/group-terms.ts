import "server-only";
import { tanova, tanovaConfigured } from "@/lib/tanova";

/**
 * How a group climb is paid, as the office set it in Tanova (Group trip > terms): a deposit holds the seats, the rest
 * can be paid in any amounts from the booking's pay link, the balance by `balanceDays` before the start. Read live, so
 * the site never promises a figure the checkout does not ask for.
 */
export type GroupTerms = {
  depositType: "percent" | "fixed";
  depositAmount: number;
  balanceDays: number | null;
  /** Any amount, any time, from the pay link (lay-by) until the balance is paid. */
  topups: boolean;
  minTopup: number | null;
  /** A promotional price the office switched on in Tanova (Group trip > terms > promo), or null. Never invented here. */
  promo: { price: number; label: string | null; until: string | null } | null;
  /** Climbers needed for the date to run (Tanova "minimum"), when set. */
  minimum: number | null;
};

type Raw = {
  data: {
    minimum?: number | null;
    promo_active?: boolean;
    terms?: {
      deposit_type: string | null;
      deposit_amount: number | null;
      balance_days: number | null;
      topups: boolean;
      min_topup: number | null;
      promo_price?: number | string | null;
      promo_until?: string | null;
      promo_label?: string | null;
    };
  };
};

export async function groupTerms(tanovaId: number | null | undefined): Promise<GroupTerms | null> {
  if (!tanovaConfigured || !tanovaId) return null;
  try {
    const raw = (await tanova<Raw>(`/group-trips/${tanovaId}`, { revalidate: 300 })).data;
    const t = raw.terms;
    if (!t || !t.deposit_type || !t.deposit_amount) return null;
    return {
      depositType: t.deposit_type === "fixed" ? "fixed" : "percent",
      depositAmount: Number(t.deposit_amount),
      balanceDays: t.balance_days ?? null,
      topups: Boolean(t.topups),
      minTopup: t.min_topup ?? null,
      promo:
        raw.promo_active && t.promo_price && (!t.promo_until || t.promo_until >= new Date().toISOString().slice(0, 10))
          ? { price: Number(t.promo_price), label: t.promo_label ?? null, until: t.promo_until ?? null }
          : null,
      // Tanova's own minimum is often 1 (anyone can book); the rule climbers are told is the group minimum, so only a real one counts.
      minimum: raw.minimum && raw.minimum > 1 ? raw.minimum : null,
    };
  } catch {
    return null;
  }
}

/** What one person puts down to hold a seat at [price] (rounded to the dollar), or null when there is no deposit. */
export function depositPerPerson(t: GroupTerms | null, price: number | null): number | null {
  if (!t || !price) return null;
  return Math.round(t.depositType === "percent" ? (price * t.depositAmount) / 100 : Math.min(price, t.depositAmount));
}

/** "10%" or "$300 per person". */
export function depositLabel(t: GroupTerms): string {
  return t.depositType === "percent" ? `${t.depositAmount}%` : `$${t.depositAmount.toLocaleString()} per person`;
}

/** "by the day before your climb starts", "by 30 days before your climb starts". */
export function balanceDue(t: GroupTerms): string {
  if (t.balanceDays === null || t.balanceDays === 0) return "by the day your climb starts";
  if (t.balanceDays === 1) return "by the day before your climb starts";
  return `by ${t.balanceDays} days before your climb starts`;
}

/** The promotional price for a date at [price], when the office set one lower than it; else null. */
export function promoPrice(t: GroupTerms | null, price: number | null): number | null {
  return t?.promo && price && t.promo.price < price ? t.promo.price : null;
}

/** The $130 deposit's rules, in one place so the terms page, the booking steps and the reserve pop-up say the same. */
export const DEPOSIT_RULES = {
  coolingOffDays: 14,
  /** Cooling-off applies only when the climb is at least this far away. */
  coolingOffMinDaysOut: 60,
  transferMonths: 12,
  transferNoticeDays: 60,
  /** Cancellation by the climber, on what was paid beyond the deposit. Days before the start → share kept. */
  cancellation: [
    { from: 90, kept: "the deposit only" },
    { from: 60, kept: "30% of the trip price" },
    { from: 30, kept: "60% of the trip price" },
    { from: 8, kept: "80% of the trip price" },
    { from: 0, kept: "the full trip price" },
  ],
} as const;
