# Tanzania Wildlife Adventures — Next.js platform

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Needs network access to Google Fonts at build time (Chivo, IBM Plex Sans, IBM
Plex Mono via `next/font/google`). Self-host and swap the imports in
`src/app/layout.tsx` if your build environment blocks it.

---

## The design in one paragraph

A Kilimanjaro climb is a vertical journey through four stacked climate zones,
and the *shape* of that journey is what decides whether someone summits. The
feature spec called the altitude profile "the single strongest conversion asset
a trekking operator can publish" — so it is the hero, not a footnote. Pick a
route and the profile draws: camps plotted day by day, the real climate zones
banded behind the curve, the summit marked in gold, and every climb-high-sleep-
low day drawn as an explicit spike. That last detail is the entire commercial
argument — it is *why* an eight-day Lemosho costs $2,250 against a five-day
Marangu at $1,680, made visually in about two seconds. Hover or tab any day for
distance, hours and altitude gained.

**Palette** — thin air. A cold glacial paper `#eceff2`, volcanic basalt
`#171c1b`, and **tanzanite `#453b96`** as the action colour: the stone is mined
at Merelani, forty kilometres from this company's office, and is found nowhere
else on earth. Gold `#f2b441` is reserved for one thing only — the summit.
The four zone colours (rainforest, moorland, alpine desert, arctic) appear
*only* inside the profile chart, where they carry real information.

**Type** — Chivo at 800–900 weight for display, which reads athletic and
capable rather than luxury-serif (and separates this build from both sister
sites, which are serif-led). IBM Plex Sans for body. **IBM Plex Mono for every
measurement** — altitudes, distances, hours, day numbers, prices. A climb is a
data set, and the mono voice makes it read like one.

**Structural device** — numbered day markers, which are legitimate here because
a climb genuinely *is* a sequence. D1 → D9 carries information the reader needs.

---

## Structure

```
src/
  app/
    page.tsx                  Home — route picker hero, departures, safaris, guides
    kilimanjaro/              All six routes compared, with zone explainer
    kilimanjaro/[slug]/       Route detail — profile, day by day, inclusions, pricing
    departures/               Group departure calendar with real seats
    safaris/  safaris/[slug]/ Northern circuit safaris, day by day
    day-trips/                Six bookable day trips
    plan/                     Trip planner — costed basket, live total, deposit
    about/                    Credentials, guides, porter welfare, safety
    contact/
  components/
    route-profile.tsx         ★ signature element
    route-picker.tsx          Hero wrapper
    primitives.tsx            Section, Button, Metric, SeatBar, Unverified, ImageSlot
    site-chrome.tsx           Header (with TripAdvisor bar) and footer
  lib/
    routes.ts                 Six routes with full day-by-day altitude data
    trips.ts                  Safaris, group departures, day trips
    site.ts                   Contact, credentials, guides, sister brands
```

---

## Audit findings this build fixes

| Finding | Severity | Fixed how |
|---|---|---|
| No cart, no checkout, no deposit | P0 | `/plan` builds a costed basket — climb + safari + day trips — totals it live and takes a 30% deposit |
| Group calendar shows a flat $2,000 on nearly every 2026/27 date | P0 | Placeholders are **not reproduced**. Eight departures, each with a real price and a real seat count |
| "Join Group" joins nothing | P0 | Seat bar per departure with seats remaining, sold-out state and a waitlist |
| Marangu 5 vs 6 days, Lemosho 7 vs 8 | P1 | One canonical route record each, in `lib/routes.ts` |
| Placeholder graphics on a $2,000 purchase | P1 | `ImageSlot` renders a written photo brief instead — never a broken image |
| 53 TripAdvisor reviews buried at the page bottom | P1 | Rating bar in the header, on every page, above the fold |
| One vague unnamed accreditation | P1 | TATO, TALA, TANAPA, KPAP, TTB listed, each flagged until its number is supplied |
| No day-by-day, no altitude profile, no difficulty | P1 | Full itinerary with altitude, distance, hours and zone per day, plus the profile chart |
| Guides named in reviews but absent from the site | P1 | Nine guides with role, years and languages; bookable by name |
| Day trips listed but never sold | P2 | Priced, and addable to any trip in the planner |
| No cancellation, insurance or crew-welfare policy | P2 | Inclusions/exclusions, deposit terms, porter wage floor and safety protocol published |
| No structured data | P2 | `TravelAgency` + `AggregateRating` in the root layout |

---

## Before this goes live

The first three are blockers.

1. **Summit rates are indicative industry figures, not this operator's own.**
   Every route renders an `Own data to confirm` marker. Publishing someone
   else's summit rate as yours is the fastest way to lose a complaint you
   cannot defend. Pull the real numbers from the last three seasons' records,
   then set `successVerified: true`.

2. **Confirm every price.** The figures used are those currently published on
   the live site, and the live site contradicts itself. Each route carries a
   `Rate sheet to confirm` marker until `priceVerified` is set.

3. **Replace the departure calendar** in `lib/trips.ts` with the real 2027
   dates, prices and capacities. Nothing should appear on `/departures` without
   both a confirmed price and a confirmed seat count.

4. Supply licence and membership numbers for TATO, TALA, TANAPA, KPAP and TTB
   — each renders a marker until filled.

5. Wire payments: PesaPal or Stripe for card, PayPal for the European and North
   American markets, M-Pesa for regional payers. 30% deposit, balance at 45
   days, with automated reminders.

6. Replace every `ImageSlot` with real photography. Each carries a brief for
   the shot needed. Four do not exist yet and are worth commissioning: the
   Barranco Wall with climbers on it, Mawenzi Tarn camp, the Meru crater rim at
   sunrise with Kilimanjaro on the horizon, and a tree-climbing lion at Manyara
   (which is in a trip name and has no photograph anywhere).

7. Guide photographs and confirmed years of experience.

8. Localise to French, German and Spanish. The site advertises four languages
   and delivers one.

9. 301 redirect map from every existing WordPress URL.

---

## Group integration

Safari itineraries book into Tanzania Wild Camps properties by default, so the
margin stays inside the family. Climbers can carry a ZARA Charity fundraising
page created automatically at booking. The CRM record is shared across all
three brands — a donor who later books a climb is recognised as the same
person.

---

## Accessibility and performance

The profile chart is a labelled `img` role with per-day buttons that are
keyboard-focusable and announce their altitude; the day detail panel is
`aria-live`. Skip link, tanzanite focus rings, `prefers-reduced-motion`
respected, ARIA on the route tablist and seat bars, labelled form controls
throughout. All 21 routes prerender; the profile, picker and planner are the
only client components.
