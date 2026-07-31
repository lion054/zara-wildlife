"use server";

import Anthropic from "@anthropic-ai/sdk";
import { routes } from "@/lib/routes";
import { safaris, dayTrips } from "@/lib/trips";
import { combos } from "@/lib/combos";
import { searchCatalogue, openDepartures, priceTrip } from "@/lib/catalogue";

/**
 * "Describe your trip" — the planner's AI step.
 *
 * The planner already prices a trip perfectly well once you have made four
 * decisions. The hard part was never the arithmetic; it was the first
 * decision, made by somebody who does not yet know that Lemosho has better
 * odds than Machame or that a day trip is how you acclimatise. That reader
 * bounces before chip one.
 *
 * So this takes a sentence in the reader's own words and returns a filled-in
 * plan. Three constraints shape it:
 *
 *   1. It SELECTS, it does not INVENT. The model is handed the slug list and
 *      must return slugs from it — a `route` field that does not match a real
 *      route is dropped rather than shown. It never sees or returns a price.
 *   2. Prices are computed afterwards by `priceTrip`, from the same ladder the
 *      basket uses. The suggestion and the basket cannot disagree because only
 *      one of them does arithmetic.
 *   3. It fills the planner in and stops. The reader sees every chip light up,
 *      can change any of them, and nothing is sent anywhere. A suggestion that
 *      submitted an enquiry would be a different and much worse feature.
 */

const MODEL = "claude-opus-5";

export type Suggestion = {
  ok: boolean;
  message: string;
  /** Slugs, not ids — the client prefixes them for the plan store. */
  route?: string;
  safari?: string;
  combo?: string;
  extras: string[];
  people?: number;
  /** Why this shape, in the assistant's words. Shown above the basket. */
  rationale?: string;
  /** A dated group departure that fits, if the brief mentioned timing. */
  departureId?: string;
};

const EMPTY: Suggestion = { ok: false, message: "", extras: [] };

const SCHEMA = {
  type: "object",
  properties: {
    route: {
      type: "string",
      description: "Slug of one climb, or empty string for no climb.",
      enum: ["", ...routes.map((r) => r.slug)],
    },
    safari: {
      type: "string",
      description: "Slug of one safari, or empty string for none.",
      enum: ["", ...safaris.map((s) => s.slug)],
    },
    combo: {
      type: "string",
      description:
        "Slug of a ready-made combination. If set, route and safari MUST both be empty — a combination already contains both.",
      enum: ["", ...combos.map((c) => c.slug)],
    },
    extras: {
      type: "array",
      description: "Slugs of day trips to add. Empty array if none fit.",
      items: { type: "string", enum: dayTrips.map((t) => t.slug) },
    },
    people: { type: "integer", description: "Travellers, 1 to 16. Default 2 if not stated." },
    rationale: {
      type: "string",
      description:
        "Two sentences, max 40 words, in plain British English: why this shape for this person. Name the one thing that decided it. No prices — you do not know them.",
    },
    departureId: {
      type: "string",
      description:
        "Id of a fixed-date group departure that fits their timing and still has seats, or empty string. Only from the list you were given.",
    },
  },
  required: ["route", "safari", "combo", "extras", "people", "rationale", "departureId"],
  additionalProperties: false,
} as const;

export async function suggestPlan(brief: string): Promise<Suggestion> {
  const text = (brief ?? "").trim().slice(0, 1200);
  if (text.length < 8) {
    return { ...EMPTY, message: "Tell me a bit more — when, how long, and what you want out of it." };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ...EMPTY,
      message:
        "Trip suggestions are not switched on in this environment. Pick your climb and safari below — the basket prices them either way.",
    };
  }

  /* The model sees the catalogue WITHOUT prices. It chooses the shape of the
     trip; the ladder decides what that shape costs, afterwards, here. */
  const catalogue = searchCatalogue({}).map((i) => ({
    kind: i.kind,
    slug: i.slug,
    name: i.name,
    days: i.days,
    summary: i.summary,
    detail: i.detail,
  }));
  const dates = openDepartures().filter((d) => !d.soldOut);

  try {
    const res = await new Anthropic().messages.create({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: `You shape Tanzania trips for a Moshi operator. Given a traveller's own words, pick the combination from the catalogue that actually fits them and say in two sentences why.

Rules:
- Choose ONLY from the slugs provided. Never invent one.
- A combination replaces a climb and a safari — if you set combo, leave route and safari empty.
- Day trips are for acclimatising before a climb or filling spare days. Add them when the brief implies spare time or a first-timer who would benefit from altitude exposure; otherwise leave the array empty. Two at most.
- Route choice is the decision that most affects whether they summit. More days on the mountain means better odds. Say so when it is what decided your pick.
- Only set departureId when they named a month or season that one of the open dates actually matches.
- You do not know prices and must not mention money, cost, value or budget in the rationale.
- If they mention Zanzibar, note in the rationale that the beach half is quoted separately.`,
      messages: [
        {
          role: "user",
          content: `Catalogue:\n${JSON.stringify(catalogue)}\n\nOpen group departures:\n${JSON.stringify(
            dates.map((d) => ({ id: d.id, route: d.route, start: d.start, seatsLeft: d.seatsLeft })),
          )}\n\nThe traveller says:\n"""${text}"""`,
        },
      ],
    });

    if (res.stop_reason === "refusal") {
      return { ...EMPTY, message: "I can't build that one. Pick from the options below instead." };
    }

    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return { ...EMPTY, message: "No suggestion came back — try rephrasing." };

    const raw = JSON.parse(block.text) as Record<string, unknown>;

    /* Validate every slug against the real data. Structured outputs constrain
       the shape, not the truth of it — and a slug that does not resolve would
       silently select nothing while the interface claimed otherwise. */
    const route = routes.some((r) => r.slug === raw.route) ? String(raw.route) : "";
    const safari = safaris.some((s) => s.slug === raw.safari) ? String(raw.safari) : "";
    const combo = combos.some((c) => c.slug === raw.combo) ? String(raw.combo) : "";
    const extras = Array.isArray(raw.extras)
      ? (raw.extras as unknown[])
          .map(String)
          .filter((s) => dayTrips.some((t) => t.slug === s && t.tiers.length > 0))
          .slice(0, 3)
      : [];
    const people = Math.min(16, Math.max(1, Math.round(Number(raw.people) || 2)));
    const departureId = dates.some((d) => d.id === raw.departureId) ? String(raw.departureId) : undefined;

    /* A combination already contains a climb and a safari, so if the model set
       both anyway the combination wins and the other two are cleared below —
       the same precedence the planner's own radio logic uses. The two must not
       diverge, or the basket would price something the suggestion didn't show. */

    if (!route && !safari && !combo) {
      return {
        ...EMPTY,
        message:
          "Nothing in the catalogue clearly fits that. Try naming roughly when you'd travel and whether you want the mountain, the parks, or both.",
      };
    }

    const priced = priceTrip({
      climbSlug: combo ? undefined : route || undefined,
      safariSlug: combo ? undefined : safari || undefined,
      comboSlug: combo || undefined,
      dayTripSlugs: extras,
      people,
    });

    return {
      ok: true,
      message: `Built from ${priced.lines.length} ${priced.lines.length === 1 ? "piece" : "pieces"}. Change anything below.`,
      route: combo ? "" : route,
      safari: combo ? "" : safari,
      combo,
      extras,
      people,
      rationale: typeof raw.rationale === "string" ? raw.rationale.slice(0, 400) : undefined,
      departureId,
    };
  } catch (err) {
    console.error("[suggestPlan]", err);
    return {
      ...EMPTY,
      message: "That did not come back. Pick your climb and safari below — the basket prices them the same way.",
    };
  }
}
