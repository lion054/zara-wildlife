# How this site works with Tanova

Tanova is the company's system. The website holds no tours, prices, dates or posts of its own: it reads them from Tanova and sends bookings and enquiries back.

## Settings (`.env.local`, or the host's environment)
```
TANOVA_API_URL=https://tanovaapp.com/api/v     # local test: http://127.0.0.1:8124/api/v
TANOVA_API_KEY=sk_live_...                      # the company's SECRET key. Server-side only.
```
The key is made in Tanova under API keys (a secret key for the site). Never put it in a `NEXT_PUBLIC_` variable.

## What comes from where
| What | How it is read | How fresh |
|---|---|---|
| Tours, itineraries, prices per group size, inclusions, accommodation, photos | `npm run sync` (runs before every `npm run build`) writes `src/data/tours.json` and downloads photos into `public/photos/tanova/` | on each build/deploy |
| Group departures: dates, seats left, price | live from Tanova (`src/lib/departures.ts`) | about a minute |
| Blog posts | live from Tanova's news feed (`src/lib/posts.ts`) | about five minutes |
| Bookings | `createBooking` (`src/lib/bookings.ts`) posts to Tanova, which checks seats again and holds them; the visitor gets the booking code, total and payment link | instant |
| Enquiries (contact, planner, halal, tour enquiries) | `submitEnquiry` (`src/lib/enquiries.ts`): a customer record in Tanova's CRM tagged `website-enquiry`, message and trip in its notes | instant |
| Waitlist (no dates yet, or a full date) | a waitlist entry on that tour in Tanova | instant |

If Tanova is unreachable at build time the sync keeps the last snapshot, so a build never fails. If it is unreachable while the site runs, departures and the blog show empty and forms say so honestly.

## What the page does depends on what Tanova offers for the tour
- **Group departures:** pick a date (seats left shown), book. A full date, or no dates yet, becomes the waitlist.
- **Any-day tours with a price:** pick a date and party size, get a live estimate, book.
- **No price (for example Zanzibar packages, Meru):** an enquiry form, no instant booking.

## Running a change through
1. Edit the tour, add a departure or write a post in Tanova.
2. Departures and posts show up on their own. Tour text, prices and photos need a rebuild/redeploy (`npm run build`).

## Accommodation (new in Tanova)
Each tour can list where it sleeps: name, place, a few lines, what it offers and a photo. In Tanova open the tour, **More details**, **Accommodation**, add rows. It shows on the tour page as the **Accommodation** tab.
This is on **live Tanova** (deployed 12 Nov 2026): the `accommodations` column, the editor, and the API fields. The live tours already carry their accommodation.

## State of live Tanova
- All 49 tours and 49 posts are published for the Tanzania Wildlife Adventures account.
- Group tours list only their own dates. **They have no dates yet**: the office adds real departures in `/vendor/departures` (the site shows "dates being added" and a waitlist until then).
- A secret API key for this site exists (kept in `~/Documents/tsokatravel/db-backups/twa-LIVE-keys.txt`, readable only by its owner). Create a new one in Tanova > API keys at any time and revoke the old.

## Deploying the site: Vercel
The site is built for Vercel (not the Tanova server).
1. `npx vercel login`, then in this folder `npx vercel link` (project name `tanzania-wildlife-adventures`).
2. Add two **Production** (and Preview) environment variables, as secrets:
   - `TANOVA_API_URL` = `https://tanovaapp.com/api/v`
   - `TANOVA_API_KEY` = the live secret key
3. `npx vercel deploy --prod`. The build runs `npm run sync` first, which pulls the live tours and photos, then builds.
4. Departures and blog posts refresh on their own. For tour text, prices or photo changes made in Tanova, redeploy (a Vercel deploy hook can do that automatically).
5. Attach `tanzaniawildlifeadventures.com` in the Vercel project and point DNS to Vercel when ready. The old WordPress site stays up until DNS changes.
