import type { Metadata } from "next";
import { Prose } from "@/components/prose";
import { Eyebrow, Section } from "@/components/primitives";
import { content } from "@/lib/content";
import { withSeo } from "@/lib/seo";

export const metadata: Metadata = withSeo("/tipping-policy", {
  title: "Tipping policy",
  description: "Recommended daily tips for guides, porters and crew on a Kilimanjaro or Meru climb.",
});

export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <Eyebrow>Climbing</Eyebrow>
        <h1 className="mb-10 font-display text-5xl">Tipping policy</h1>
        <Prose md={content.policies.tipping} />
      </div>
    </Section>
  );
}
