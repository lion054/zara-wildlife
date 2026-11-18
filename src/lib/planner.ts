"use server";

import { headers } from "next/headers";
import { TanovaError, tanova, tanovaConfigured } from "@/lib/tanova";
import { readId, signId } from "@/lib/zita";

/**
 * The trip planner, on Tanova's planner: the same engine as the website planner in Tanova and the Tanova app. It
 * builds priced options from this company's own catalogue (its activities, packages and stays in Tanova), day by day,
 * and books the chosen one as one bill.
 */

export type PlannerPlace = { id: number; name: string; status: "ready" | "partial" | "blocked"; activities: number; packages: number; stays: number };

export type PlanActivity = { time: string; name: string; description: string; cost: number; type: string; duration: number | null };
export type PlanDay = { day: number; date: string | null; weather: { icon: string; max: number | null } | null; activities: PlanActivity[]; stay: string | null };
export type PlanOption = { total: number; perPerson: number; stay: number; activities: number; hotel: { name: string; perNight: number; rooms: number } | null; days: PlanDay[] };
export type PlannedTrip = { id: number; token: string; title: string; destination: string; start: string; end: string; guests: number; currency: string; options: PlanOption[] };

const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0)) || 0;
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

export async function plannerPlaces(): Promise<PlannerPlace[]> {
  if (!tanovaConfigured) return [];
  try {
    const r = await tanova<{ data: Record<string, unknown>[] }>("/tanova/readiness", { revalidate: 600 });
    return (r.data ?? [])
      .map((p) => ({ id: num(p.id), name: str(p.name), status: str(p.status) as PlannerPlace["status"], activities: num(p.activities), packages: num(p.packages), stays: num(p.stays) + num(p.full_board) }))
      .filter((p) => p.status !== "blocked");
  } catch {
    return [];
  }
}

/* A plan takes a few seconds of the planner's time: a few per visitor per ten minutes is plenty. */
const recent = new Map<string, number[]>();
async function allowed(): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 600_000);
  if (list.length >= 6) return false;
  list.push(now);
  recent.set(ip, list);
  return true;
}

function shape(t: Record<string, unknown>): PlannedTrip {
  const pkgs = (Array.isArray(t.itinerary) ? t.itinerary : []) as Record<string, unknown>[];
  return {
    id: num(t.id),
    token: signId("plan", num(t.id)),
    title: str(t.title),
    destination: str(t.destination),
    start: str(t.start_date).slice(0, 10),
    end: str(t.end_date).slice(0, 10),
    guests: num(t.guests),
    currency: str(t.currency) || "USD",
    options: pkgs.map((p) => {
      const h = p.hotel as Record<string, unknown> | null;
      return {
        total: num(p.total_cost),
        perPerson: num(p.price_per_person),
        stay: num(p.stay_cost),
        activities: num(p.activity_cost),
        hotel: h ? { name: str(h.name), perNight: num(h.cost_per_night), rooms: num(h.rooms) || 1 } : null,
        days: ((Array.isArray(p.itinerary) ? p.itinerary : []) as Record<string, unknown>[]).map((d) => {
          const w = d.weather as Record<string, unknown> | null;
          const acc = d.accommodation as Record<string, unknown> | null;
          return {
            day: num(d.day),
            date: str(d.date) || null,
            weather: w ? { icon: str(w.icon), max: w.temp_max == null ? null : num(w.temp_max) } : null,
            stay: acc ? str(acc.name) || null : null,
            activities: ((Array.isArray(d.activities) ? d.activities : []) as Record<string, unknown>[]).map((a) => ({
              time: str(a.time),
              name: str(a.name),
              description: str(a.description),
              cost: num(a.cost),
              type: str(a.type),
              duration: a.duration == null ? null : num(a.duration),
            })),
          };
        }),
      };
    }),
  };
}

export type PlanResult = { ok: true; trip: PlannedTrip } | { ok: false; message: string };

export async function planTrip(input: {
  placeId: number;
  place: string;
  start: string;
  end: string;
  guests: number;
  budget: "budget" | "mid-range" | "luxury";
  stay?: "room" | "apartment" | "full_board" | "";
  pace: number;
  notes?: string;
}): Promise<PlanResult> {
  if (!tanovaConfigured) return { ok: false, message: "The planner is not switched on yet. Send us your dates and we will plan it for you." };
  if (!(await allowed())) return { ok: false, message: "You have planned a few trips just now. Give it a few minutes, or ask Zita." };
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.start) || input.start < today) return { ok: false, message: "Pick an arrival date in the future." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.end) || input.end <= input.start) return { ok: false, message: "Leave at least one day after you arrive." };
  try {
    const made = await tanova<{ data: { id: number } }>("/tanova/generate", {
      method: "POST",
      timeoutMs: 60_000,
      body: {
        destination: input.place,
        place_id: input.placeId,
        start_date: input.start,
        end_date: input.end,
        guests: Math.max(1, Math.min(20, Math.round(input.guests))),
        budget: input.budget,
        ...(input.stay ? { stay_type: input.stay } : {}),
        activities_per_day: Math.max(1, Math.min(4, Math.round(input.pace))),
        ...(input.notes?.trim() ? { notes: input.notes.trim().slice(0, 900) } : {}),
      },
    });
    const full = await tanova<{ data: Record<string, unknown> }>(`/tanova/trips/${made.data.id}`, { revalidate: 0 });
    return { ok: true, trip: shape(full.data) };
  } catch (e) {
    if (e instanceof TanovaError && e.status === 422) return { ok: false, message: e.message || "Nothing could be planned for those dates. Try other dates, or ask Zita." };
    console.error("[planner] generate failed", e instanceof Error ? e.message : e);
    return { ok: false, message: "The planner could not build a trip just now. Try again in a moment, or ask Zita." };
  }
}

export type TripBooking = { ok: true; code: string; total: number; currency: string; payUrl: string | null } | { ok: false; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Books one option of a planned trip: everything in it, on one bill the guest pays once. */
export async function bookTrip(tripId: number, option: number, guest: { first: string; last: string; email: string; phone?: string; notes?: string }): Promise<TripBooking> {
  if (!guest.first.trim() || !guest.last.trim()) return { ok: false, message: "Add your first name and surname." };
  if (!EMAIL.test(guest.email.trim())) return { ok: false, message: "Add an email we can send the confirmation to." };
  try {
    const r = await tanova<{ data: { total: number; currency: string; invoice: { number: string; pay_with: string } } }>(`/tanova/trips/${tripId}/book`, {
      method: "POST",
      timeoutMs: 60_000,
      idempotencyKey: `trip-${tripId}-${option}-${guest.email.trim().toLowerCase()}`,
      body: {
        package: option,
        guest: {
          first_name: guest.first.trim(),
          last_name: guest.last.trim(),
          email: guest.email.trim(),
          ...(guest.phone?.trim() ? { phone: guest.phone.trim() } : {}),
          ...(guest.notes?.trim() ? { notes: guest.notes.trim().slice(0, 1500) } : {}),
        },
      },
    });
    const code = r.data.invoice.pay_with;
    let payUrl: string | null = null;
    try {
      const inv = await tanova<{ data: { id: number } }>(`/bookings/${code}/invoice`, { method: "POST", body: {} });
      const full = await tanova<{ data: { pay_url?: string | null } }>(`/invoices/${inv.data.id}`, { revalidate: 0 });
      payUrl = full.data.pay_url ?? null;
    } catch {
      /* the office sends the bill if a pay link cannot be made here */
    }
    return { ok: true, code, total: num(r.data.total), currency: r.data.currency || "USD", payUrl };
  } catch (e) {
    if (e instanceof TanovaError && (e.status === 409 || e.status === 422)) return { ok: false, message: e.message || "Part of this plan cannot be booked for those dates." };
    console.error("[planner] book failed", e instanceof Error ? e.message : e);
    return { ok: false, message: "We could not book the trip just now. Try again, or ask Zita to pass it to the team." };
  }
}

/** A saved plan, from its signed link (/plan/<token>). Null when the link is not one of ours or the plan is gone. */
export async function savedTrip(token: string): Promise<PlannedTrip | null> {
  const id = readId("plan", decodeURIComponent(token));
  if (!id || !tanovaConfigured) return null;
  try {
    const t = await tanova<{ data: Record<string, unknown> }>(`/tanova/trips/${id}`, { revalidate: 300 });
    return shape(t.data);
  } catch {
    return null;
  }
}
