import data from "@/data/content.json";

/** Copy carried over from the previous site: FAQs, policies, About text. */
export type QA = { q: string; a: string; section?: string | null };

export const content = data as unknown as {
  faqs: Record<"kili" | "safari" | "meru" | "daytrips" | "destinations" | "zanzibar" | "combo", QA[]>;
  policies: { privacy: string; tipping: string };
  about: { who: string[]; whyIntro: string | null; why: { title: string; text: string }[] };
};
