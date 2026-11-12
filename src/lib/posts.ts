import "server-only";
import { tanova, tanovaConfigured } from "@/lib/tanova";

/**
 * Blog posts live in Tanova (its news feed). Write and publish them there and
 * they appear here within five minutes. With Tanova not configured, or
 * unreachable, the list is empty and the Blog link disappears from the menu,
 * so a visitor never lands on an empty archive.
 */
export type Post = {
  slug: string;
  title: string;
  /** ISO date. */
  date: string;
  category: string;
  categoryName: string;
  excerpt: string;
  image?: string;
  imageAlt?: string;
  /** Article body, HTML written in Tanova. */
  html: string;
};

type ApiPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  category: { id: number; name: string; slug: string } | null;
  published_at: string | null;
};
type Page = { data: ApiPost[]; meta?: { last_page?: number } };

const shape = (p: ApiPost): Post => ({
  slug: p.slug,
  title: p.title,
  date: (p.published_at ?? "").slice(0, 10),
  category: p.category?.slug ?? "uncategorized",
  categoryName: p.category?.name ?? "Other",
  excerpt: p.excerpt,
  image: p.image_url ?? undefined,
  imageAlt: p.title,
  html: p.content,
});

export async function getPosts(): Promise<Post[]> {
  if (!tanovaConfigured) return [];
  try {
    const out: Post[] = [];
    for (let page = 1; page <= 10; page++) {
      const r = await tanova<Page>(`/news?per_page=50&page=${page}`, { revalidate: 300 });
      out.push(...r.data.map(shape));
      if (page >= (r.meta?.last_page ?? 1)) break;
    }
    return out.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (!tanovaConfigured) return undefined;
  try {
    const r = await tanova<{ data: ApiPost }>(`/news/${encodeURIComponent(slug)}`, { revalidate: 300 });
    return shape(r.data);
  } catch {
    return undefined;
  }
}

/** Categories actually in use, for the filter chips. */
export function categoriesOf(posts: Post[]) {
  const seen = new Map<string, string>();
  for (const p of posts) if (!seen.has(p.category)) seen.set(p.category, p.categoryName);
  return [...seen].map(([slug, label]) => ({ slug, label }));
}
