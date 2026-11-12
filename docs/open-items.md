# Open items for the operator and the backend

The site now carries every page and figure from tanzaniawildlifeadventures.com.
These are the things that need a person or the backend, not more code.

## Backend seams (set in `.env`, see `.env.example`)
- `ENQUIRY_WEBHOOK_URL`: every form posts here. Until set, enquiries are logged on the server only.
- `NEXT_PUBLIC_PAYMENTS_URL`: the Pesapal page. The footer "Pay safe with us / Pay now" block appears when set.
- `BLOG_API_URL`: JSON array of posts (shape in `src/lib/posts.ts`). The Blog menu item, footer link and `/blog` fill in when it returns posts. Old post URLs already redirect to `/blog/<slug>`.
- Departures: `src/lib/trips.ts` still holds sample dates and seat counts. Replace with real ones.

## Content to confirm with the office
- **Group departure prices** come from the live January calendar ($2,272 Lemosho 8 d, $1,962 Machame 7 d, $1,758 Marangu 6 d, $2,022 Rongai 7 d and Shira 7 d). The live group pages show a flat $2,000 placeholder, so they were not used. Lemosho 7-day group has no price: shown as "On request".
- **Placeholder prices left empty**: all six Zanzibar packages, Tanzania Wildlife Tours (5 d), the 10-day and 12-day Safari + Zanzibar combos, and both Mount Meru packages are a flat $2,000 on the live site. They show "On request".
- **Price headline**: "From" now means the lowest price on the ladder (the 6-person rate), not the 2-person rate the live pages headline.
- **Day numbering**: itineraries are renumbered 1..n (the live Machame page jumps from Day 7 to Day 9).
- **Live copy errors kept verbatim** (fix at source): Marangu day 7 altitude "3,090 – 1,650 m" (a Machame figure); Machame text "Stella Point 5,685 m"; the Londorossi page carries the Shira itinerary; Lemosho day 7 "15+ hours" for 5 km; the biking tour's 1-person price ($2,000) is below its 2-person price; the tipping policy names both Sal Salinero Hotel and Eastpoint Hotel.
- **Halal Tours page**: certification and prayer-stop details are still marked "to confirm". The Islamic calendar is calculated (expected dates, ±1 day).
- **Summit rates** on the six Kilimanjaro route pages are industry figures, labelled as such.
- **Memberships**: logo names were read off the artwork. ASTA's expansion is not stated anywhere, so only "ASTA" is shown. Membership numbers are not shown.
- **Guides**: names, roles and languages only. Years of experience were removed because they were never confirmed. Meru's guide block on the live site is three identical placeholders and was not carried over.
- **Terms page** (`/terms`) states only the deposit (30%), balance (45 days) and group-departure terms already used on the site. The live site has no terms page. Have it reviewed.
- **Privacy and tipping policies** are the live text, unedited.
- **Photo licensing**: the whole photo library came from the live WordPress site. Confirm licences. Most imported tour photos have no alt text on the live site, so day photos are decorative.
- **Fonts** (Megafield, Nobel Uno) were copied from the live site: confirm licensing.
- **Zanzibar hero photo** is 1024 px wide. A hi-res replacement is still wanted.

## Not carried over on purpose
- Live-site bugs: homepage Machame "$2,250" vs "$1,712" on its page; the group cards repeated at $2,000; Privacy link pointing to the tipping policy; the three Day Trips menu items going to one page; the Lemosho card linking to Machame; the "#" placeholder footer links; typos ("Discove More", "Userfull Links", "Princing").
- The four language icons (EN/FR/DE/ES) all link to "#" on the live site, so there is no translated site.
- `/sample` and `/thank-you` redirect to Home and Contact.
- The three older safari pages under `/safaris/<slug>` now redirect to the matching live package; their files can be deleted.
