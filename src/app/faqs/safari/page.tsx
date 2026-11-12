import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { Eyebrow, Section } from "@/components/primitives";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQs about a Tanzania safari",
  description: "When to go, what to pack, how it works and what it costs: the questions travellers ask before a safari.",
};

export default function Page() {
  return (
    <Section>
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <Eyebrow>Safari</Eyebrow>
        <h1 className="font-display text-5xl md:text-6xl">Questions about a Tanzania safari</h1>
      </div>
      <Faq items={content.faqs.safari} />
    </Section>
  );
}
