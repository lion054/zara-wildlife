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
};

type Raw = { data: { terms?: { deposit_type: string | null; deposit_amount: number | null; balance_days: number | null; topups: boolean; min_topup: number | null } } };

export async function groupTerms(tanovaId: number | null | undefined): Promise<GroupTerms | null> {
  if (!tanovaConfigured || !tanovaId) return null;
  try {
    const t = (await tanova<Raw>(`/group-trips/${tanovaId}`, { revalidate: 300 })).data.terms;
    if (!t || !t.deposit_type || !t.deposit_amount) return null;
    return {
      depositType: t.deposit_type === "fixed" ? "fixed" : "percent",
      depositAmount: Number(t.deposit_amount),
      balanceDays: t.balance_days ?? null,
      topups: Boolean(t.topups),
      minTopup: t.min_topup ?? null,
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
