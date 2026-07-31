# Tanzania Wildlife Adventures — Next.js 16

The Kiwano-designed static build, ported to **Next 16.2 · React 19.2 · Tailwind 4.3 · TypeScript 5.9**.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 35 pages, four dynamic groups prerendered
npm run typecheck
```

Nothing was overwritten: the earlier `wildlife-adventures-nextjs/` project — with its
own tanzanite palette and Chivo type — is untouched. This is a second app.

---

## Why Next at all

The static build already covers "just give me HTML", and does it at 378 KB
first load. The reason to be here is the four things a static export cannot do,
one of which is now real:

| | Status |
|---|---|
| **Server action for enquiries and booking requests** | ✅ built — validated server-side, cannot be bypassed |
| Payments — a real 30% deposit via PesaPal or Stripe | ready for it; the action is the hook |
| Revalidation, so seat counts change without a redeploy | ready for it; `departures` is the data to move |
| i18n routing for the three languages the operator advertises | not started |

`output: "export"` is deliberately **not** set. Exporting statically would give
back the one thing that justifies the port.

---

## Structure

```
src/
  app/
    layout.tsx              TravelAgency + AggregateRating on every page
    page.tsx                home
    actions.ts            ★ server action — validation, honeypot, webhook
    kilimanjaro/            all six routes compared, zone explainer, 12 FAQs
    kilimanjaro/[slug]/   ★ route detail — profile, day by day, rate ladder
    safaris/ safaris/[slug]/
    combos/  combos/[slug]/
    zanzibar/ zanzibar/[slug]/
    departures/ destinations/ day-trips/ about/ contact/ plan/
    sitemap.ts robots.ts not-found.tsx
  lib/
    routes trips parks combos zanzibar services inclusions reviews photos site
                            the audited dataset, unchanged TypeScript
    faqs.ts                 22 answers, all grounded in the above
    nav.ts                  labels + figures computed from the data
    format.ts               money, dates, day-trip rates, route badges
    plan-store.ts         ★ the basket — one source of truth
  components/
    site-chrome            header with CSS-only dropdowns, short footer
    primitives             Section, Button, TripCard, Tile, SeatBar, PageHero
    blocks                 RouteTable, Terms, FAQ, guides, BookBar, departures
    route-profile        ★ the altitude chart
    planner              ★ four steps, single-select, live totals
    enquiry-form         ★ enquiry / quote / booking, one component
    basket-badge  mobile-nav  trip-finder
```

Six client components. Everything else is a server component, which is why the
homepage ships 237 KB of HTML against the live site's 3,542 KB.

## What is actually different from the static build

**The invalid state is now unrepresentable.** The static planner held selections
in arrays, so a basket could contain three Kilimanjaro routes at once and total
them; it needed tests to prove it could not. Here `plan.route` is a single
string. One climb, one safari, many day trips, and a combination that replaces
climb and safari because it contains both — enforced by the type, not by a
click handler.

**Enquiries reach a server.** `submitEnquiry` validates name, email and — on a
booking request — the deposit acknowledgement, on the server where it cannot be
bypassed. With no `TWA_ENQUIRY_WEBHOOK` set it returns `delivered: false` and
says so plainly rather than showing a success screen. A form that silently
swallows enquiries is worse than no form.

**The chart is server-rendered.** All 8 day markers, 4 zone bands and the gold
summit are in the HTML; the client component only adds hover and keyboard
readout. It works with JavaScript off and it prints.

## The palette is measured, not chosen

The live homepage was rendered at 1600×6000 and its pixels counted. Every value
in `globals.css` `@theme` is a colour the operator already uses, weighted by how
much of the page it covers — cream `#f8f6e5` at 215,310 px, warm black
`#20201c` at 79,737, olive `#798645` at 8,175.

Most of them **fail WCAG AA** where the live site puts text on them: olive
3.64:1, brick 3.88:1, gold 2.02:1, lime 2.33:1 against their own cream, on a
4.5:1 threshold. So the hues are theirs and unchanged; what differs is where
each may carry text. Exactly two are darkened, only enough to pass, and only for
white-on-fill: olive → `#6f7b3f` (4.58:1), brick → `#a15f59` (4.89:1).

## Before this goes live

Unchanged from the static build, because they are data and business questions
rather than code:

1. **Summit rates are indicative industry figures, not this operator's own.**
   Every route renders an `Own data to confirm` marker until `successVerified`
   is set.
2. **Confirm every price.** The live site contradicts itself on route lengths.
3. **Replace the departure calendar** with real 2027 dates and capacities.
4. **Set `TWA_ENQUIRY_WEBHOOK`** — until then the form tells the truth about not
   being connected.
5. **Zanzibar has no published price** and is 917,000 visitors a year, growing
   24.5%. It is the largest thing on this site that a visitor cannot price.
6. Licence numbers for TATO, TALA, TANAPA, KPAP, TTB.
7. Guide photographs — `GuideCard` draws a placeholder at the exact size.
8. Payments, then i18n.
9. The 301 map in the static build's `REDIRECTS.md` applies unchanged; no URL
   differs between the two builds.
