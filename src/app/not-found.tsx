import { Section, PageHero, Button } from "@/components/primitives";

export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title="That page has moved, or never existed" photoKey="hero-home"
        lead="This site was rebuilt, so some old links no longer resolve. Everything is still here — start from one of these." />
      <Section tone="cream" className="text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/">Home</Button>
          <Button href="/kilimanjaro" variant="ghost">Climbing Kilimanjaro</Button>
          <Button href="/safaris" variant="ghost">Safaris</Button>
          <Button href="/zanzibar" variant="ghost">Zanzibar</Button>
          <Button href="/plan" variant="ghost">Plan my trip</Button>
          <Button href="/contact" variant="ghost">Contact</Button>
        </div>
      </Section>
    </>
  );
}
