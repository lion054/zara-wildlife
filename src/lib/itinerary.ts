/**
 * A climb's days as numbers, from the stats Tanova keeps per day ("Altitude: 2,780 m – 3,840 m", "Hiking distance: 12 km",
 * "Hiking time: 6–7 hours"). Written in many ways across the tours (metres alone or with feet in brackets, "5, 895 m",
 * "3,500m"), so only the metres are read. A day with no altitude (arrival, departure) is not a trekking day.
 */
export type TrekDay = {
  n: number;
  /** "Moshi → Marangu Gate → Mandara Hut" */
  route: string;
  /** Where the night is spent: the last place of the day. */
  to: string;
  start: number;
  end: number;
  /** A higher point passed on the way (Lava Tower, the summit), when there is one. */
  via: number | null;
  km: string | null;
  time: string | null;
  overnight: string | null;
};

type DayIn = { n: number; label: string; stats: Record<string, string>; overnight?: string | null };

const METRES = /(\d{1,2},\s?\d{3}|\d{3,4})\s?(?:m\b|meters\b|metres\b)/gi;

export function metres(s: string): number[] {
  return [...s.matchAll(METRES)].map((m) => Number(m[1].replace(/[,\s]/g, ""))).filter((n) => n >= 500 && n <= 6000);
}

/** "MTI MKUBWA CAMP | SHIRA CAMP 1" → "Mti Mkubwa Camp | Shira Camp 1"; leaves mixed case alone. */
function tidy(s: string): string {
  const t = s.trim();
  if (t !== t.toUpperCase()) return t;
  return t.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

export function trekDays(days: DayIn[]): TrekDay[] {
  const out: TrekDay[] = [];
  for (const d of days) {
    const alt = Object.entries(d.stats).find(([k]) => /altitude|elevation/i.test(k))?.[1] ?? "";
    const pts = metres(alt);
    if (!pts.length) continue;
    const start = pts[0];
    const end = pts[pts.length - 1];
    const top = Math.max(...pts);
    let parts = tidy(d.label)
      .replace(/^(trek|trekking|hike|hiking)\s+(from|to)\s+/i, "")
      .split(/\s*\|\s*|\s+to\s+|\s+then\s+|\s+-\s+|\s+–\s+/i)
      .map((p) => p.replace(/^(trek|trekking|hike)\s+(from\s+)?/i, "").trim())
      .filter((p) => p && !/^(return|trek|day)$/i.test(p));
    // A summit day reads the same on every route: the high camp, Uhuru Peak, then where the night is spent.
    const SUMMIT = /^(summit|summit day|summit attempt|uhuru peak|summit attempt - uhuru peak)$/i;
    const summitDay = top >= 5800;
    if (summitDay) {
      const camps = parts.filter((p) => !SUMMIT.test(p));
      parts = camps.length ? [camps[0], "Uhuru Peak", ...camps.slice(1)] : ["Uhuru Peak"];
    }
    parts = parts.filter((p, i) => p !== parts[i - 1]);
    const km = Object.entries(d.stats).find(([k]) => /distance/i.test(k))?.[1] ?? null;
    const time = Object.entries(d.stats).find(([k]) => /time/i.test(k))?.[1] ?? null;
    out.push({
      n: d.n,
      route: parts.join(" → "),
      to: summitDay && parts[parts.length - 1] === "Uhuru Peak" ? "" : (parts[parts.length - 1] ?? ""),
      start,
      end,
      via: top > Math.max(start, end) ? top : null,
      km: km ? km.replace(/\s*time$/i, "").trim() : null,
      time: time ? time.replace(/\s*time$/i, "").replace(/(\d)\s*-\s*(\d)/g, "$1–$2").trim() : null,
      overnight: d.overnight ?? null,
    });
  }
  return out;
}

/** Kilimanjaro's climate zones by altitude, the way guides describe them. */
export function zoneOf(m: number): { key: "forest" | "moor" | "desert" | "arctic"; name: string } {
  if (m < 2800) return { key: "forest", name: "Rainforest" };
  if (m < 4000) return { key: "moor", name: "Heath & moorland" };
  if (m < 5000) return { key: "desert", name: "Alpine desert" };
  return { key: "arctic", name: "Arctic summit" };
}
