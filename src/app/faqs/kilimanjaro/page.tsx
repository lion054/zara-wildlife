import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { Eyebrow, Section } from "@/components/primitives";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQs about climbing Mount Kilimanjaro",
  description: "Routes, seasons, fitness, altitude, tipping and kit: the questions climbers ask before booking.",
};

export default function Page() {
  return (
    <Section>
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <Eyebrow>Kilimanjaro</Eyebrow>
        <h1 className="font-display text-5xl md:text-6xl">Questions about climbing Kilimanjaro</h1>
      </div>
      <Faq items={content.faqs.kili} />
    </Section>
  );
}
