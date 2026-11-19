import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { PageIntro, daysOf, tourItems } from "@/components/listing";
import { PhotoHero, Section } from "@/components/primitives";
import { Collapse, FilterGrid } from "@/components/ui";
import { content } from "@/lib/content";
import { routes, zones } from "@/lib/routes";
import { toursOfKind } from "@/lib/tours";

export const metadata: Metadata = {
  title: "Climbing Kilimanjaro",
  description:
    "Every Kilimanjaro and Mount Meru package, private or group, with day-by-day itineraries and a price for every group size.",
};

export default function KilimanjaroPage() {
  const list = toursOfKind("kili", "meru", "group");
  const items = tourItems(list, (t) => [
    t.kind === "group" ? "group" : t.kind === "meru" ? "meru" : "private",
    daysOf(t) <= 6 ? "d6" : daysOf(t) <= 8 ? "d8" : "d9",
  ]);
  const byOdds = [...routes].sort((a, b) => b.successRate - a.successRate);

  return (
    <>
      <PhotoHero imageKey="hero-kilimanjaro" height="min-h-[16rem] md:min-h-[21rem]">
        <PageIntro eyebrow="Climbing Kilimanjaro" title="Find your route up Africa's highest peak." />
      </PhotoHero>

      <Section id="packages">
        <FilterGrid
          label="Filter climbs"
          items={items}
          filters={[
            { label: "Private", tag: "private" },
            { label: "Group departures", tag: "group" },
            { label: "5–6 days", tag: "d6" },
            { label: "7–8 days", tag: "d8" },
            { label: "9+ days", tag: "d9" },
            { label: "Mount Meru", tag: "meru" },
          ]}
        />
      </Section>

      <Section tone="frost">
        <div className="mx-auto max-w-4xl space-y-3">
          <Collapse title="Compare the routes" meta="Summit rate, difficulty and how busy each route is">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <caption className="sr-only">Routes compared by days, summit rate, difficulty, traffic and price</caption>
                <thead>
                  <tr className="bg-frost text-left">
                    {["Route", "Days", "Summit rate", "Difficulty", "Traffic", "From"].map((h) => (
                      <th key={h} scope="col" className="label px-3 py-2.5 text-scree">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byOdds.map((r) => (
                    <tr key={r.slug} className="border-t border-mist">
                      <th scope="row" className="px-3 py-3 text-left font-normal">
                        <Link href={`/kilimanjaro/${r.slug}`} className="font-display text-base text-tanzanite underline-offset-4 hover:underline">
                          {r.name}
                        </Link>
                      </th>
                      <td className="metric px-3 py-3">{r.days}</td>
                      <td className="metric px-3 py-3">{r.successRate}%</td>
                      <td className="px-3 py-3 text-scree">{r.difficulty}</td>
                      <td className="px-3 py-3 text-scree">{r.traffic}</td>
                      <td className="metric px-3 py-3 text-tanzanite">${r.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-scree">Summit rates are industry figures for each route. Longer routes allow more time to acclimatise.</p>
            </div>
          </Collapse>

          <Collapse title="Four climates in one week" meta="What you walk through, from rainforest to glacier">
            <ul className="grid gap-5 sm:grid-cols-2">
              {(Object.keys(zones) as (keyof typeof zones)[]).map((k) => (
                <li key={k}>
                  <p className="font-display text-lg">{zones[k].label}</p>
                  <p className="metric text-xs text-tanzanite">{zones[k].range}</p>
                  <p className="mt-1 text-sm text-scree">{zones[k].description}</p>
                </li>
              ))}
            </ul>
          </Collapse>

          <Collapse title="Climbing Kilimanjaro: FAQs" meta="Seasons, fitness, altitude, tipping">
            <Faq flush items={content.faqs.kili} />
          </Collapse>

          <Collapse title="Mount Meru: FAQs" meta="The best warm-up">
            <Faq flush items={content.faqs.meru} />
          </Collapse>
        </div>
      </Section>
    </>
  );
}
