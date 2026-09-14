import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, UserRound } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SITE_INFO } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Không tìm thấy bài viết | DanaFarm" };

  const path = `/blogs/news/${slug}`;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      url: absoluteUrl(path),
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) notFound();

  const publishedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(post.publishedAt);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.author || SITE_INFO.companyName },
    publisher: {
      "@type": "Organization",
      name: SITE_INFO.companyName,
      logo: { "@type": "ImageObject", url: SITE_INFO.logoUrl },
    },
    mainEntityOfPage: absoluteUrl(`/blogs/news/${post.slug}`),
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <Breadcrumb
        items={[
          { label: "Tin tức", href: "/blogs/news" },
          { label: post.title },
        ]}
      />
      <Container className="py-8 md:py-12">
        <article className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-shop-border bg-white shadow-sm">
          {post.coverImageUrl && (
            <div className="relative aspect-[16/8] w-full bg-shop-bg">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                priority
                quality={92}
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}
          <div className="p-5 md:p-10">
            <h1 className="text-2xl font-bold leading-tight text-shop-title md:text-4xl">
              {post.title}
            </h1>
            <div className="my-5 flex flex-wrap gap-5 border-b border-shop-border pb-5 text-xs text-shop-text/60">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} /> {publishedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <UserRound size={15} /> {post.author ?? "DanaFarm"}
              </span>
            </div>
            {post.excerpt && (
              <p className="mb-6 text-base font-medium leading-7 text-shop-text/75">
                {post.excerpt}
              </p>
            )}
            <div
              className="article-content text-sm leading-7 text-shop-text/85 [&_a]:text-shop-main [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-shop-title [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </Container>
    </>
  );
}
