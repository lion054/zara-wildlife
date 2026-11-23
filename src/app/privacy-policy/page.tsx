import type { Metadata } from "next";
import { Prose } from "@/components/prose";
import { Eyebrow, Section } from "@/components/primitives";
import { content } from "@/lib/content";
import { withSeo } from "@/lib/seo";

export const metadata: Metadata = withSeo("/privacy-policy", {
  title: "Privacy policy",
  description: "How Tanzania Wildlife Adventures collects, uses and protects your personal information.",
});

export default function Page() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mb-10 font-display text-5xl">Privacy policy</h1>
        <Prose md={content.policies.privacy} />
      </div>
    </Section>
  );
}
