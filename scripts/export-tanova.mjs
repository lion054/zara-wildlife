/**
 * Exports everything the website holds into one bundle for the Tanova importer
 * (`php artisan twa:import`, in tsokaportal).
 *
 *   node scripts/export-tanova.mjs
 *
 * Writes tanova-bundle/bundle.json and tanova-bundle/blog-images/*. Tour photos
 * stay in public/photos and are referenced by path (pass --images=<public dir>
 * to the importer). Blog posts are read from the live site's public WordPress
 * REST API, since the website itself has none.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "tanova-bundle");
mkdirSync(join(out, "blog-images"), { recursive: true });

/* The content as it was taken from the old site. src/data/tours.json is now synced FROM Tanova, so it is no longer the source. */
const tours = JSON.parse(readFileSync(join(root, "tanova-bundle/source-tours.json"), "utf8"));
const content = JSON.parse(readFileSync(join(root, "src/data/content.json"), "utf8"));

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const isHeading = (s) => s.length < 60 && !/[.!?]$/.test(s.trim());
const html = (lines) =>
  lines
    .map((l) => (isHeading(l) ? `<h3>${esc(l.replace(/:$/, ""))}</h3>` : `<p>${esc(l)}</p>`))
    .join("\n");

const KIND_LABEL = {
  kili: "Kilimanjaro climbs",
  meru: "Mount Meru climbs",
  group: "Group departures",
  safari: "Wildlife safaris",
  combo: "Combo trips",
  zanzibar: "Zanzibar beach holidays",
  daytrip: "Day trips",
};
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** "6 Days | 5 Nights" -> 6 */
const days = (t) => parseInt(t.duration ?? "", 10) || 0;

/** Same rule as displayTitle() on the website, so titles stay unique. */
const title = (t) => {
  if (!["kili", "meru", "group"].includes(t.kind)) return t.title.replace(/\s+/g, " ").trim();
  const d = days(t);
  const dd = d && !/\d/.test(t.title) ? ` · ${d} days` : "";
  return `${t.title}${dd}${t.kind === "group" ? " · Group" : ""}`.replace(/\s+/g, " ");
};

/** "2 - 4 Pax", "11+ people", "1 person" -> {min,max} */
function band(size) {
  const n = size.match(/\d+/g)?.map(Number) ?? [];
  if (!n.length) return null;
  if (/\+/.test(size)) return { min: n[0], max: null };
  return { min: n[0], max: n[1] ?? n[0] };
}


/** Sub-points ("First night includes breakfast") belong to the line above them. */
const withNotes = (items) => {
  const out = [];
  for (const i of items) {
    if (i.sub && out.length) out[out.length - 1].notes.push(i.text.replace(/^[-–]\s*/, ""));
    else out.push({ text: i.text, notes: [] });
  }
  return out.map((o) => ({ title: o.notes.length ? `${o.text} (${o.notes.join("; ")})` : o.text }));
};

/** The old site's tables carry typos ("2 - 50 Pax") and $2000 placeholder rows. */
function cleanLadder(rows) {
  const real = rows.some((r) => r.price !== 2000) ? rows.filter((r) => r.price !== 2000) : rows;
  const sorted = [...real].sort((a, b) => a.min - b.min);
  return sorted.map((r, i) => {
    const next = sorted[i + 1];
    const max = r.max !== null && next && r.max >= next.min ? next.min - 1 : r.max;
    return { ...r, max };
  });
}

const FAQ_FOR = {
  kili: ["kili"],
  meru: ["meru"],
  group: ["kili"],
  safari: ["safari", "destinations"],
  combo: ["combo"],
  zanzibar: ["zanzibar"],
  daytrip: ["daytrips"],
};


/* ---------- accommodation: names the old pages never printed ---------- */
const CANON = {
  "salsalinerohotel": "Sal Salinero Hotel", "salinerohotel": "Sal Salinero Hotel", "endorolodge": "Endoro Lodge", "endurolodge": "Endoro Lodge",
  "matawiserengaticamp": "Matawi Serengeti Camp", "matawiserengeticamp": "Matawi Serengeti Camp", "serengenticentrallodge": "Serengeti Central Lodge",
  "serengeticentrallodge": "Serengeti Central Lodge", "serengetisafarilodge": "Serengeti Safari Lodge", "ikomawildcamp": "Ikoma Wild Camp",
  "ngorongorosafarilodge": "Ngorongoro Safari Lodge", "ngorongorowildcamp": "Ngorongoro Wild Camp", "tembohousehotel": "Tembo House Hotel",
  "mahalizanzibar": "Mahali Zanzibar", "zanzibarqueenhotel": "Zanzibar Queen Hotel", "emeraldzanzibarresort&spa": "Emerald Zanzibar Resort & Spa",
};
const nrm = (x) => x.toLowerCase().replace(/[^a-z0-9&]/g, "");
const canon = (x) => CANON[nrm(x)] ?? x.replace(/\b\w/g, (c) => c.toUpperCase());
const STOP = new Set(["lodge", "camp", "hotel", "safari", "wild", "resort", "house"]);

function overnightNames(t) {
  const out = [];
  for (const d of t.days) {
    if (!d.overnight) continue;
    const o = d.overnight.replace(/\s*\((?:dinner|bed|half|full)[^)]*\)\s*/gi, "").replace(/\s*,?\s*or a? ?similar.*$/i, "").trim().replace(/[ ,]+$/, "");
    for (const part of o.split(/,\s*|\s+or\s+/)) {
      const n = part.trim();
      if (n.length > 3 && !/^similar/i.test(n) && !out.includes(canon(n))) out.push(canon(n));
    }
  }
  return out;
}

function accommodations(t) {
  const names = overnightNames(t);
  const seen = new Set();
  const out = [];
  t.accommodation.forEach((a, i) => {
    const text = a.description.filter((p) => !p.startsWith("##"));
    const head = nrm(text.join(" ").slice(0, 500));
    let best = null, bs = 0;
    for (const n of names) {
      const words = n.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !STOP.has(w));
      const sc = (head.includes(nrm(n)) ? 3 : 0) + words.filter((w) => head.includes(w)).length;
      if (sc > bs) (best = n), (bs = sc);
    }
    const m = text[0]?.match(/^(?:At |Welcome to )?(?:our |the )?([A-Z][A-Za-z0-9'’& -]{3,40}?)(?: is | offers | has | are |, |\. )/);
    const name = best ?? (m ? canon(m[1]) : `Accommodation ${i + 1}`);
    const key = `${name}|${text[0]?.slice(0, 40)}`;
    if (seen.has(key)) return;
    seen.add(key);
    let body = text.slice(0, 2).join("\n\n");
    if (/^Is (located|situated)/i.test(body)) body = `${name} ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    const key2 = nrm(name);
    const nights = t.days.filter((d) => d.overnight && nrm(d.overnight).includes(key2)).length;
    out.push({
      name,
      location: null,
      nights: null, // the old pages list two places for one night, so a count would mislead
      description: body.slice(0, 700),
      amenities: a.amenities.slice(0, 12),
      image: a.images[0]?.src ?? null,
      photos: a.images.slice(0, 3).map((x) => x.src),
    });
  });
  return out;
}

/* ---------- tours ---------- */
const bundleTours = tours.map((t) => {
  const stays = t.accommodation
    .map((a) => a.description.filter((p) => !p.startsWith("##")).slice(0, 2))
    .flat();
  const body =
    html(t.overview) +
    t.sections
      .filter((s) => !/pric|includes/i.test(s.label))
      .map((s) => `\n<h2>${esc(s.label)}</h2>\n${html(s.text)}`)
      .join("") +
    (stays.length ? `\n<h2>Where you stay</h2>\n${html(stays)}` : "");

  const itinerary = t.days.map((d) => {
    const stats = Object.entries(d.stats)
      .map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`)
      .join("");
    return {
      title: `Day ${d.n}`,
      desc: d.label,
      content:
        (stats ? `<ul>${stats}</ul>\n` : "") +
        html(d.text) +
        (d.overnight ? `\n<p><strong>Overnight:</strong> ${esc(d.overnight)}</p>` : ""),
      image: d.images[0]?.src ?? null,
    };
  });

  const faqs = FAQ_FOR[t.kind]
    .flatMap((k) => content.faqs[k] ?? [])
    .map((q) => ({ title: q.q, content: q.a.split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("") }));

  return {
    key: t.key,
    kind: t.kind,
    group: t.kind === "group",
    title: title(t),
    category: KIND_LABEL[t.kind],
    days: days(t),
    duration_label: t.duration,
    from_price: t.from,
    places: t.places,
    short_desc: (t.overview[0] ?? "").slice(0, 240),
    meta_description: t.metaDescription,
    content: body,
    include: withNotes(t.included),
    exclude: withNotes(t.excluded),
    faqs,
    itinerary,
    accommodations: accommodations(t),
    ladder: cleanLadder(t.ladder.map((r) => ({ ...band(r.size), price: r.price, label: r.size })).filter((r) => r.min && r.price)),
    hero: t.hero?.src ?? null,
    gallery: [...t.gallery.map((g) => g.src), ...t.days.flatMap((d) => d.images.map((i) => i.src))].filter(
      (v, i, a) => v && a.indexOf(v) === i,
    ),
    map: t.map?.src ?? null,
    old_url: `/${t.oldSlug}/`,
  };
});

/* ---------- blog, from the public WordPress REST API ---------- */
const WP = "https://tanzaniawildlifeadventures.com/wp-json/wp/v2";
async function wp(path) {
  const r = await fetch(`${WP}${path}`);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}
const cats = Object.fromEntries((await wp("/categories?per_page=100&_fields=id,slug,name")).map((c) => [c.id, c]));
const posts = [];
for (let page = 1; ; page++) {
  const batch = await wp(`/posts?per_page=50&page=${page}&_fields=slug,title,date,excerpt,content,categories,link,jetpack_featured_media_url`).catch(() => []);
  if (!batch.length) break;
  posts.push(...batch);
  if (batch.length < 50) break;
}

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”" };
const decode = (t) =>
  t
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
const strip = (h) => decode(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const bundlePosts = [];
/* The WordPress "Blog" index page and a stray test post are not articles. */
const SKIP = new Set(["blog", "consolidation-great-migration-canonical-hub-differentiated-angles"]);
for (const p of posts.filter((x) => !SKIP.has(x.slug))) {
  const media = p.jetpack_featured_media_url || null;
  let image = null;
  if (media) {
    const file = `${p.slug}${extname(new URL(media).pathname) || ".jpg"}`;
    const dest = join(out, "blog-images", file);
    if (!existsSync(dest)) {
      const res = await fetch(media);
      if (res.ok) writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
    if (existsSync(dest)) image = `blog-images/${file}`;
  }
  const c = cats[p.categories?.[0]] ?? { slug: "uncategorized", name: "Uncategorized" };
  bundlePosts.push({
    slug: p.slug,
    title: strip(p.title.rendered),
    date: p.date,
    category: { slug: c.slug, name: c.name },
    excerpt: strip(p.excerpt.rendered).slice(0, 300),
    content: p.content.rendered,
    image,
    old_url: new URL(p.link).pathname,
  });
}

/* ---------- write ---------- */
const bundle = {
  generated: new Date().toISOString(),
  vendor: { name: "Tanzania Wildlife Adventures", email: "sales@tanzaniawildlifeadventures.com" },
  tour_categories: Object.values(KIND_LABEL).map((name) => ({ name, slug: slugify(name) })),
  tours: bundleTours,
  posts: bundlePosts,
};
writeFileSync(join(out, "bundle.json"), JSON.stringify(bundle, null, 1));
console.log(
  `tours ${bundleTours.length} (group ${bundleTours.filter((t) => t.group).length}), ` +
    `posts ${bundlePosts.length}, post images ${bundlePosts.filter((p) => p.image).length}`,
);
