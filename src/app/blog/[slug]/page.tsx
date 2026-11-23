import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/primitives";
import { getPost } from "@/lib/posts";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return withSeo(
    `/blog/${slug}`,
    { title: post.title, description: post.excerpt, openGraph: { type: "article", publishedTime: post.date } },
    post.image ? { src: post.image, alt: post.imageAlt ?? post.title } : null,
  );
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    image: post.image,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
  };

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <p className="label text-tanzanite">
          <Link href={`/blog?category=${post.category}`} className="hover:underline">
            {post.categoryName}
          </Link>{" "}
          ·{" "}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </time>
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{post.title}</h1>
        {post.image && (
          <Image
            src={post.image}
            alt={post.imageAlt ?? ""}
            width={1200}
            height={700}
            sizes="(min-width: 768px) 768px, 100vw"
            priority
            className="mt-8 w-full rounded-[20px] object-cover"
          />
        )}
        <div
          className="prose-body mt-10 space-y-5 text-lg leading-relaxed text-scree [&_a]:text-tanzanite [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-basalt [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-basalt [&_li]:ml-5 [&_li]:list-disc"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <p className="mt-12">
          <Link href="/blog" className="text-sm font-semibold uppercase tracking-[0.12em] text-tanzanite">
            ← All articles
          </Link>
        </p>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Section>
  );
}
