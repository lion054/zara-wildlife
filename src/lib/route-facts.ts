import { trekDays } from "@/lib/itinerary";
import type { Tour } from "@/lib/tours";

/** A route highlight shown on departure rows and pages, with the icon that goes with it. */
export type Highlight = { icon: "gate" | "hut" | "tent" | "peak" | "rest"; text: string };

const title = (s: string) => s.replace(/\b([a-z])/g, (c) => c.toUpperCase());

/**
 * Three highlights for a group climb, read from the route's own itinerary in Tanova (never written by hand), so they
 * always match what the office sells: where it starts, where you sleep, and how it helps you acclimatise.
 */
export function routeHighlights(tour: Tour): Highlight[] {
  const days = tour.days;
  const text = days.map((d) => `${d.label} ${d.text.join(" ")}`).join(" ");
  const trek = trekDays(days);
  const out: Highlight[] = [];

  // Where it starts: the first gate the itinerary names.
  const gate = text.match(/\b([A-Z][a-z]+(?:\s+(?:Park|National Park))?\s+Gate)\b/);
  if (gate) out.push({ icon: "gate", text: `Starts at ${title(gate[1].replace(/\s+/g, " "))}` });

  // Where you sleep: huts on the hut routes, tents elsewhere.
  const labels = days.map((d) => d.label).join(" ");
  const huts = (labels.match(/\bhut\b/gi) ?? []).length;
  const camps = (labels.match(/\bcamp\b/gi) ?? []).length;
  out.push(
    huts > 0 && camps === 0
      ? { icon: "hut", text: "Nights in mountain huts" }
      : huts > 0
        ? { icon: "tent", text: "Camps, then huts higher up" }
        : { icon: "tent", text: "Nights in tented mountain camps" },
  );

  // How it acclimatises: a rest day where the itinerary has one, else the high point it climbs high to sleep low.
  const rest = days.find((d) => /acclimati[sz]ation day/i.test(d.label));
  const lava = trek.find((d) => /lava tower/i.test(d.route) && d.via);
  if (rest) {
    const at = rest.label.replace(/^.*?\bat\b\s*/i, "").trim();
    out.push({ icon: "rest", text: `Rest day at ${title(at)}` });
  } else if (lava || /lava tower/i.test(text)) {
    // The altitude only when the itinerary itself states it.
    const m = lava?.via ?? Number(text.match(/Lava Tower[^.]{0,80}?(\d,\d{3})\s?m(?:eters|etres)?\b/i)?.[1]?.replace(",", "") ?? 0);
    out.push({ icon: "peak", text: m ? `Climb high to Lava Tower, ${m.toLocaleString()}\u00a0m` : "Climb high to Lava Tower" });
  } else if (/stella point/i.test(text)) {
    out.push({ icon: "peak", text: "Summit via Stella Point" });
  }

  return out.slice(0, 3);
}

/** "Kilimanjaro via Lemosho route – 7 days", the way a climber searches for it. */
export function groupTitle(tour: Pick<Tour, "title">): string {
  const m = tour.title.match(/^(.*?)\s+Route\b.*?(\d+)\s*days/i);
  return m ? `Kilimanjaro via ${m[1]} route – ${m[2]} days` : tour.title.replace(/\s*·\s*Group$/, "");
}
