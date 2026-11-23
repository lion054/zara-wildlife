import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eyebrow, Section } from "@/components/primitives";
import { categoriesOf, getPosts } from "@/lib/posts";
import { withSeo } from "@/lib/seo";

export const metadata: Metadata = withSeo("/blog", {
  title: "Blog",
  description: "Guides and field notes on Kilimanjaro, safari, Zanzibar and travelling in Tanzania.",
});

const PER_PAGE = 12;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page } = await searchParams;
  const all = await getPosts();
  const filtered = category ? all.filter((p) => p.category === category) : all;
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const posts = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const used = categoriesOf(all);
  const href = (cat?: string, n = 1) => {
    const q = new URLSearchParams();
    if (cat) q.set("category", cat);
    if (n > 1) q.set("page", String(n));
    const s = q.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>Blog</Eyebrow>
        <h1 className="font-display text-5xl md:text-6xl">Our articles</h1>
        <p className="mt-5 text-lg leading-relaxed text-scree">
          Guides and field notes from the Moshi office and the guides who walk
          the routes.
        </p>
      </div>

      {all.length === 0 ? (
        <p className="mx-auto mt-16 max-w-xl text-center text-scree">
          New articles are on their way. In the meantime, the{" "}
          <Link href="/plan" className="text-tanzanite underline underline-offset-4">
            trip planner
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-tanzanite underline underline-offset-4">
            the office
          </Link>{" "}
          can answer any question.
        </p>
      ) : (
        <>
          <nav aria-label="Categories" className="mt-10 flex flex-wrap justify-center gap-2">
            <Link
              href={href()}
              aria-current={!category ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${!category ? "bg-tanzanite text-glacier" : "bg-frost text-tanzanite hover:bg-mist"}`}
            >
              All
            </Link>
            {used.map((c) => (
              <Link
                key={c.slug}
                href={href(c.slug)}
                aria-current={category === c.slug ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${category === c.slug ? "bg-tanzanite text-glacier" : "bg-frost text-tanzanite hover:bg-mist"}`}
              >
                {c.label}
              </Link>
            ))}
          </nav>

          <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug} className="card-lift overflow-hidden rounded-[20px] bg-glacier ring-1 ring-mist">
                <Link href={`/blog/${p.slug}`} className="block h-full">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.imageAlt ?? ""}
                      width={800}
                      height={500}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="h-52 w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <p className="label text-tanzanite">
                      {p.categoryName} ·{" "}
                      <time dateTime={p.date}>
                        {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </time>
                    </p>
                    <h2 className="mt-2 font-display text-2xl leading-snug">{p.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-scree">{p.excerpt}</p>
                    <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-tanzanite">
                      Read more »
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={href(category, n)}
                  aria-current={n === current ? "page" : undefined}
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm ${n === current ? "bg-tanzanite text-glacier" : "bg-frost text-tanzanite hover:bg-mist"}`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </Section>
  );
}
