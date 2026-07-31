import type { Metadata } from "next";
import { parks, circuits } from "@/lib/parks";
import { Section, SectionTitle, PageHero, Photo, Pill, Button } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Tanzania safari destinations — ten national parks",
  description:
    "Serengeti, Ngorongoro, Tarangire, Manyara, Arusha, Mkomazi, Nyerere, Ruaha, Katavi, Mahale and Gombe — what each one holds and the months to see it.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero eyebrow="Destinations" title="Ten parks, and when each is worth it"
        lead="The northern circuit is where a first Tanzanian safari should go. The southern and western parks are quieter and wilder, and you fly to them."
        photoKey="park-serengeti"
        crumbs={[{ label: "Home", href: "/" }, { label: "Safari", href: "/safaris" }, { label: "Destinations", href: "/destinations" }]} />

      {Object.entries(circuits).map(([key, c], i) => {
        const inCircuit = parks.filter((p) => p.circuit === key);
        if (!inCircuit.length) return null;
        return (
          <Section key={key} tone={i % 2 ? "sand" : "cream"} id={key}>
            <SectionTitle eyebrow={c.access} title={c.label} lead={c.note} />
            <div className="mt-9 grid gap-8 lg:grid-cols-2">
              {inCircuit.map((p) => (
                <article key={p.name} id={p.name.toLowerCase().split(" ")[0]}
                  className="overflow-hidden rounded border border-line bg-white">
                  <Photo photoKey={p.photoKey} alt={p.name} className="h-[230px]" sizes="(max-width:1024px) 100vw, 50vw" />
                  <div className="p-[26px]">
                    <Pill>{p.headline}</Pill>
                    <h3 className="mb-2 mt-2.5 text-[23px]">{p.name}</h3>
                    <p className="mb-3 text-[15px] leading-[1.75] text-muted">{p.note}</p>
                    <p className="text-sm font-semibold text-olive-deep">
                      When to go: <span className="font-normal text-slate">{p.when}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </Section>
        );
      })}

      <Section tone="ink" className="text-center">
        <p className="label mb-3 text-lime">Build it around the parks</p>
        <h2 className="mx-auto max-w-[700px] text-[33px] leading-[1.22] text-white">
          Every safari on this site is drawn from the northern circuit
        </h2>
        <p className="mx-auto mt-4 max-w-[620px] text-[17px] text-white/78">
          Tell us which of these you want in it and we will build the route, or start from one of the
          three costed itineraries.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/safaris">The three itineraries</Button>
          <Button href="/plan" variant="light">Build my own</Button>
        </div>
      </Section>
    </>
  );
}
