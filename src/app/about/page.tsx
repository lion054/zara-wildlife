import type { Metadata } from "next";
import Image from "next/image";
import { Contour, Eyebrow, Section, Stars } from "@/components/primitives";
import { Faq } from "@/components/faq";
import { SectionTitle } from "@/components/tsoka";
import { Collapse, Tabs } from "@/components/ui";
import taReviews from "@/data/tripadvisor.json";
import { content } from "@/lib/content";
import { guides, site } from "@/lib/site";
import { withSeo } from "@/lib/seo";

export const metadata: Metadata = withSeo("/about", {
  title: "About us",
  description:
    "Who guides you, how we treat our porters, what we carry for safety, and the licences we hold.",
});

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-mist px-6 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Contour className="mb-5" />
          <Eyebrow>About us</Eyebrow>
          <h1 className="max-w-3xl font-display text-5xl md:text-6xl">
            A Moshi company, {new Date().getFullYear() - site.established} years
            in, with the reviews to show for it.
          </h1>
          <div className="mt-6">
            <Stars rating={site.reviews.rating} count={site.reviews.count} />
          </div>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-scree">
            We are young by Kilimanjaro standards. That is exactly why what
            follows — licences, wages, safety kit — is published in full rather
            than implied.
          </p>
        </div>
      </section>

      {/* Who we are: two paragraphs, the rest on request */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl">Who we are</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-scree">
            {content.about.who.slice(0, 2).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-6">
            <Collapse title="Read the full story">
              <div className="space-y-5 text-base leading-relaxed text-scree">
                {content.about.who.slice(2).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Collapse>
          </div>
        </div>
      </Section>

      {/* The detail, in tabs so the page stays short */}
      <Section tone="frost" id="whychooseus">
        <SectionTitle eyebrow="The detail" title="What you should know before you book." />
        <div className="mx-auto mt-10 max-w-5xl">
          <Tabs
            label="About us"
            tabs={[
              {
                id: "why",
                label: "Why choose us",
                content: (
                  <div>
                    {content.about.whyIntro && <p className="mb-6 max-w-3xl text-base text-scree">{content.about.whyIntro}</p>}
                    <Faq flush items={content.about.why.map((w) => ({ q: w.title, a: w.text }))} />
                  </div>
                ),
              },
              {
                id: "safety",
                label: "Safety",
                content: (
                  <ul className="grid gap-4 md:grid-cols-2">
                    {[
            {
              h: "Twice-daily health checks",
              p: "Pulse oximeter and resting heart rate, morning and evening, recorded on a chart the guide keeps. Numbers going the wrong way get acted on before they become an evacuation.",
            },
            {
              h: "Oxygen carried, always",
              p: "A bottled-oxygen cylinder travels with every group. It is for emergency descent, not for pushing someone higher than they should go.",
            },
            {
              h: "Guides trained for it",
              p: "Lead guides hold wilderness first-responder certification and altitude-illness training, renewed on a schedule we publish.",
            },
            {
              h: "Evacuation plan",
              p: "Stretcher and route plan for every camp, park rescue coordination, and a helicopter-capable landing point identified per route.",
            },
            {
              h: "Insurance is mandatory",
              p: "Your policy must cover trekking to 6,000 m and helicopter evacuation. We ask for the certificate and we read it.",
            },
            {
              h: "We will turn you around",
              p: "The guide's decision to descend is final. It is not a refundable decision and it is not negotiable at 5,000 m.",
            },
          ].map((item) => (
                      <li key={item.h} className="rounded-2xl bg-glacier p-5 ring-1 ring-mist">
                        <h3 className="font-display text-lg">{item.h}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-scree">{item.p}</p>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                id: "porters",
                label: "Porter welfare",
                content: (
                  <div className="rounded-3xl bg-basalt p-7 text-glacier md:p-9">
                    <h3 className="font-display text-2xl">The crew is why you summit. Here is how they are treated.</h3>
                    <ul className="mt-5 space-y-3">
                      {[
              "Wage at or above the KPAP floor, paid before the crew leaves the gate",
              "Load limit of 20 kg, weighed at the gate and again on the mountain",
              "Three meals a day for every crew member, cooked from the same kitchen",
              "Sleeping bag, mat, jacket and boots provided to any porter who needs them",
              "Tents for all crew — nobody sleeps in the mess",
              "Crew insured for injury and evacuation",
            ].map((item) => (
                        <li key={item} className="flex gap-3 border-b border-glacier/15 pb-3 text-sm leading-relaxed text-glacier/85">
                          <span className="text-brand" aria-hidden="true">—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm text-glacier/80">Member of the Mount Kilimanjaro Porters Society.</p>
                  </div>
                ),
              },
              {
                id: "guides",
                label: "Guides",
                content: (
                  <div>
                    <p className="mb-6 max-w-2xl text-sm text-scree">Named by guests in review after review. Ask for one when you book.</p>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {guides.map((g) => (
                        <li key={g.name} className="rounded-2xl bg-glacier p-4 ring-1 ring-mist">
                          <p className="font-display text-lg">{g.name}</p>
                          <p className="text-sm text-scree">{g.role}</p>
                          <p className="mt-1 text-xs text-scree/80">{g.languages}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                id: "reviews",
                label: `Reviews · ${site.reviews.count}`,
                content: (
                  <div>
                    <ul className="grid gap-4 md:grid-cols-2">
                      {taReviews.map((r) => (
                        <li key={r.reviewer + r.date} className="rounded-2xl bg-glacier p-5 ring-1 ring-mist">
                          <div className="text-sunrise-ink" role="img" aria-label="Five out of five stars">★★★★★</div>
                          <p className="mt-1 font-display text-lg">{r.title}</p>
                          <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-scree">&ldquo;{r.text}&rdquo;</p>
                          <p className="metric mt-3 text-sm">{r.reviewer}</p>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 text-center">
                      <a href={site.reviews.url} rel="noopener noreferrer" className="text-sm font-semibold text-tanzanite underline underline-offset-4">
                        Read all reviews on TripAdvisor
                      </a>
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Section>

      {/* Memberships */}
      <Section>
        <p className="label text-center text-tanzanite">Members of</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-6">
          {site.members.map((m) => (
            <li key={m.name} className="flex h-24 w-36 flex-col items-center justify-center rounded-2xl bg-basalt p-3 text-center">
              <Image src={m.logo} alt={m.full} width={m.w} height={m.h} sizes="140px" className="h-14 w-auto object-contain" />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
