/**
 * Pulls the company's published tours from Tanova into src/data/tours.json, in
 * exactly the shape the pages already use, and downloads their photos into
 * public/photos/tanova/. Runs before every build (npm run build) when the
 * Tanova settings exist; otherwise it leaves the last snapshot alone so a build
 * never fails because the API was unreachable.
 *
 *   TANOVA_API_URL=https://tanovaapp.com/api/v TANOVA_API_KEY=sk_live_… node scripts/sync-tanova.mjs
 *
 * Tanova is the source of truth. Edit tours there, rebuild (or redeploy) and the
 * site follows. Departures, seats, bookings and enquiries are NOT part of this
 * snapshot; the site reads those live.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "image-size";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.env.TANOVA_API_URL ?? "").replace(/\/$/, "");
const KEY = process.env.TANOVA_API_KEY ?? "";
const dataFile = join(root, "src/data/tours.json");
const imgDir = join(root, "public/photos/tanova");

if (!BASE || !KEY) {
  console.log("sync-tanova: TANOVA_API_URL / TANOVA_API_KEY not set, keeping the current snapshot.");
  process.exit(0);
}

const KIND = {
  "Kilimanjaro climbs": "kili",
  "Mount Meru climbs": "meru",
  "Group departures": "group",
  "Wildlife safaris": "safari",
  "Combo trips": "combo",
  "Zanzibar beach holidays": "zanzibar",
  "Day trips": "daytrip",
};

async function api(path) {
  // Tanova limits requests per minute: wait and retry rather than fail the build.
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });
    if (res.status === 429 && attempt < 5) {
      const wait = Math.min(70, Number(res.headers.get("retry-after")) || 20);
      console.log(`  rate limited, waiting ${wait}s…`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json();
  }
}

/* ---------- html -> the structured text the pages render ---------- */
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”" };
const decode = (t) =>
  t
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
const text = (h) => decode(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
/* A sentence the editor broke into blocks (a paste that wrapped bold words in <h3>: "known as the" / "Saddle" /
 * ", a rugged landscape between the" / "Kibo" / "and" / "Mawenzi" / "peaks. …") is put back together, so the site does
 * not show each piece as a heading. A block joins the one before when that one is plainly unfinished: it has no closing
 * punctuation and the next block carries on (a comma, a lowercase start), or it stops on a word no sentence ends with. */
const OPEN_ENDS = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "on", "at", "between", "around", "about", "from", "with", "for", "as", "by", "into", "across", "than", "near", "over", "under", "is", "are", "was", "takes", "known", "towards", "toward", "through", "this", "your", "our", "its", "their", "reaching", "via", "descend", "enter", "reach", "visit", "explore", "climb", "continue"]);
/** "Hiking distance: 10 km": a stat line, never part of a sentence. */
const isStat = (s) => /^[A-Za-z][^:]{1,30}:\s/.test(s) && s.length < 60;
function rejoin(blocks) {
  const out = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    // "Cycling Distance" then "10 km": a stat whose colon was lost between blocks.
    if (prev && /^([A-Z][a-z]+ ){0,2}[A-Z][a-z]+$/.test(prev) && /^((approximately|about|around|up to)\s+)?\d[^.]{0,20}?\b(km|m|meters|metres|hours?|hrs?|minutes?|mins?|days?)\b/i.test(b)) {
      out[out.length - 1] = `${prev}: ${b}`;
      continue;
    }
    const finished = !prev || /[.!?…:;"”’)\]]$/.test(prev) || isStat(prev) || isStat(b);
    const carriesOn = /^[a-z,;:.)\]]/.test(b) || (/^\d/.test(b) && /\b(around|about|of|to|takes)$/i.test(prev ?? ""));
    const lastWord = (prev ?? "").split(/\s+/).pop()?.toLowerCase() ?? "";
    // A heading is short; a long block with no full stop is a sentence the editor cut.
    // "Waterfall Visit": a heading in Title Case is joined only when the next block plainly carries it on.
    const titleCase = /^([A-Z0-9][\w’'&-]*)( [A-Z0-9&][\w’'&-]*)*$/.test(prev ?? "");
    const loneWord = OPEN_ENDS.has((prev ?? "").toLowerCase()); // "At", "And": never a heading on its own
    if (!finished && (carriesOn || loneWord || (!titleCase && (OPEN_ENDS.has(lastWord) || prev.length > 60)))) {
      out[out.length - 1] = /^[,;:.)\]]/.test(b) ? prev + b : `${prev} ${b}`;
    } else {
      out.push(b);
    }
  }
  return out;
}

/** Block-level html -> one string per paragraph or heading. */
const lines = (h) =>
  rejoin(
    (h ?? "")
      .replace(/<\/(p|h[1-6]|li|div|ul|ol)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .split("\n")
      .map(text)
      .filter(Boolean),
  );

function splitSections(html) {
  const parts = (html ?? "").split(/<h2[^>]*>/i);
  const overview = lines(parts[0]);
  const sections = parts.slice(1).map((p) => {
    const [label, ...rest] = p.split(/<\/h2>/i);
    return { label: text(label), text: lines(rest.join("")) };
  });
  return { overview, sections };
}

function parseDay(it, n) {
  let html = it.content ?? "";
  const stats = {};
  html = html.replace(/<li[^>]*>\s*<strong>([^<]+?):?<\/strong>\s*([\s\S]*?)<\/li>/gi, (_, k, v) => {
    stats[text(k).replace(/:$/, "")] = text(v);
    return "";
  });
  let overnight = null;
  html = html.replace(/<p[^>]*>\s*<strong>Overnight:?<\/strong>\s*([\s\S]*?)<\/p>/i, (_, v) => {
    overnight = text(v);
    return "";
  });
  // Markdown typed into the editor ("####" on its own, "## Title") is not shown as is.
  let body = lines(html).map((l) => l.replace(/^#{1,6}\s+/, "")).filter((l) => !/^#{1,6}$/.test(l));
  // A day that ends on the lodge ("Endoro Lodge or similar") says where they sleep: show it as the overnight.
  const last = body[body.length - 1];
  if (!overnight && last && last.length < 80 && /\bor similar\.?$/i.test(last)) {
    overnight = last.replace(/\.$/, "");
    body = body.slice(0, -1);
  }
  return { n, label: text(it.desc ?? it.title ?? `Day ${n}`), stats, text: body, overnight, images: [] };
}

/** Tanova's per-size bands -> "From, per person" rows, merging sizes with the same price. */
function ladder(tier) {
  const bands = (tier?.bands ?? []).filter((b) => b.min && b.total);
  const rows = [];
  for (const b of bands) {
    const price = Math.round(b.total / (b.max ?? b.min));
    const last = rows[rows.length - 1];
    if (last && last.price === price && last.to + 1 === b.min) last.to = b.max ?? b.min;
    else rows.push({ from: b.min, to: b.max ?? b.min, price });
  }
  return rows.map((r, i) => ({
    size:
      i === rows.length - 1 && r.to >= 12
        ? `${r.from}+ people`
        : r.from === r.to
          ? `${r.from} ${r.from === 1 ? "person" : "people"}`
          : `${r.from}–${r.to} people`,
    price: r.price,
  }));
}

/* ---------- photos: downloaded once, served from public/ ---------- */
mkdirSync(imgDir, { recursive: true });
const photoCache = new Map();
async function photo(url) {
  if (!url) return null;
  if (photoCache.has(url)) return photoCache.get(url);
  let out = null;
  try {
    const ext = (extname(new URL(url).pathname) || ".jpg").toLowerCase();
    const name = `${createHash("sha1").update(url).digest("hex").slice(0, 16)}${ext}`;
    const dest = join(imgDir, name);
    const valid = () => {
      try {
        imageSize(readFileSync(dest));
        return true;
      } catch {
        return false;
      }
    };
    // Re-fetch when the file is missing or an earlier run saved something that is not a picture.
    if (!existsSync(dest) || !valid()) {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(String(res.status));
      if (!(res.headers.get("content-type") ?? "").startsWith("image/")) throw new Error("not an image (login page or error)");
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
    const { width, height } = imageSize(readFileSync(dest));
    out = { src: `/photos/tanova/${name}`, width: width ?? 1200, height: height ?? 800 };
  } catch (e) {
    console.warn(`  photo skipped: ${url} (${e.message})`);
  }
  photoCache.set(url, out);
  return out;
}

/* ---------- go ---------- */
try {
const previous = existsSync(dataFile) ? JSON.parse(readFileSync(dataFile, "utf8")) : [];
/* The URLs already published keep their keys: match each Tanova tour to the
   previous snapshot by title (Tanova stores the display title, e.g.
   "Machame Route · 6 days"), and only fall back to Tanova's own slug for new tours. */
const displayTitle = (t) => {
  if (!["kili", "meru", "group"].includes(t.kind)) return t.title.replace(/\s+/g, " ").trim();
  const d = parseInt(t.duration ?? "", 10);
  const dd = d && !/\d/.test(t.title) ? ` · ${d} days` : "";
  return `${t.title}${dd}${t.kind === "group" ? " · Group" : ""}`.replace(/\s+/g, " ");
};
const byTitle = new Map(previous.flatMap((t) => [[t.title.replace(/\s+/g, " ").trim(), t], [displayTitle(t), t]]));

const list = [];
for (let page = 1; ; page++) {
  const r = (await api(`/services/tours?status=publish&per_page=100&page=${page}`)).data;
  list.push(...r.data);
  if (page >= (r.last_page ?? 1)) break;
}

const tours = [];
for (const t of list) {
  const kind = KIND[t.category_name];
  if (!kind) {
    console.warn(`  skipped "${t.title}": unknown category "${t.category_name}"`);
    continue;
  }
  const old = byTitle.get(t.title);
  const { overview, sections } = splitSections(t.content);
  const days = (t.itinerary ?? []).map((it, i) => parseDay(it, i + 1));
  const tier = (t.tiers ?? []).find((x) => x.key === "classic") ?? t.tiers?.[0];
  const rows = ladder(tier);
  const nights = t.package_nights ? ` | ${t.package_nights} Nights` : "";
  const hero = await photo(t.hero_url);
  const gallery = [];
  for (const g of (t.gallery_urls ?? []).filter((u) => !/airport/i.test(u)).slice(0, 12)) {
    const p = await photo(g);
    if (p && p.src !== hero?.src) gallery.push({ ...p, alt: null });
  }

  const accommodation = [];
  for (const a of t.accommodations_list ?? []) {
    const imgs = [];
    for (const u of [a.image_url, ...(a.photo_urls ?? [])]) {
      const p = u ? await photo(u) : null;
      if (p && !imgs.some((x) => x.src === p.src)) imgs.push(p);
    }
    accommodation.push({
      name: a.name,
      location: a.location ?? null,
      description: (a.description ?? "").split(/\n{2,}/).map((x) => x.trim()).filter(Boolean),
      amenities: a.amenities ?? [],
      images: imgs.slice(0, 4),
    });
  }

  tours.push({
    key: old?.key ?? t.slug,
    tanovaId: t.id,
    fixedDate: Boolean(t.enable_fixed_date),
    kind,
    oldSlug: old?.oldSlug ?? t.slug,
    title: t.title.replace(/\s+/g, " ").trim(),
    metaDescription: t.short_desc ?? null,
    /* A day trip's length is in hours (the planner schedules by it); a multi-day trip's is in days. */
    duration: !t.duration ? null : kind === "daytrip" ? (Number(t.duration) >= 7 ? "Full day" : `${t.duration} hours`) : `${t.duration} Days${nights}`,
    places: (t.address ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    from: rows.length ? Math.min(...rows.map((r) => r.price)) : Number(t.price) > 0 ? Math.round(Number(t.price)) : null,
    overview,
    days,
    accommodation,
    sections,
    ladder: rows.length
      ? rows.map((r) => ({ size: r.size, price: r.price }))
      : kind === "group" && Number(t.price) > 0
        ? [{ size: "Per person, any group size", price: Math.round(Number(t.price)) }]
        : [],
    included: (t.include ?? []).map((i) => ({ text: i.title, sub: false })),
    excluded: (t.exclude ?? []).map((i) => ({ text: i.title, sub: false })),
    hero,
    map: old?.map ?? null,
    gallery,
    hasGroupNote: kind === "group",
  });
}

const ORDER = { kili: 0, meru: 1, group: 2, safari: 3, combo: 4, zanzibar: 5, daytrip: 6 };
tours.sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.key.localeCompare(b.key));

if (tours.length === 0) {
  console.error("sync-tanova: Tanova returned no tours; keeping the current snapshot.");
  process.exit(0);
}
writeFileSync(dataFile, JSON.stringify(tours, null, 1));
/* A small file for the trip planner (a client component), so it never ships the whole tour data to the browser. */
writeFileSync(
  join(root, "src/data/planner.json"),
  JSON.stringify(
    {
      safaris: tours.filter((t) => t.kind === "safari").map((t) => ({ slug: t.key, name: t.title, price: t.from ?? 0, days: parseInt(t.duration ?? "", 10) || 0 })),
      dayTrips: tours.filter((t) => t.kind === "daytrip").map((t) => ({ slug: t.key, name: t.title, price: t.from ?? 0, tiers: t.ladder })),
    },
    null,
    1,
  ),
);
const counts = tours.reduce((m, t) => ((m[t.kind] = (m[t.kind] ?? 0) + 1), m), {});
console.log(`sync-tanova: ${tours.length} tours`, JSON.stringify(counts), `| photos ${photoCache.size}`);
} catch (e) {
  console.error(`sync-tanova: could not sync (${e.message}). Keeping the current snapshot.`);
}
