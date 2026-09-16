import type { Metadata } from "next";
import { PostCard } from "@/components/post/PostCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tin tức | DanaFarm",
  description:
    "Câu chuyện về trà, cà phê, matcha và đặc sản Đà Lạt từ DanaFarm.",
};

const POSTS_PER_PAGE = 12;

type NewsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const query = await searchParams;
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const requestedPage = Math.max(1, Number.parseInt(pageValue ?? "1", 10) || 1);
  const totalPosts = await prisma.post.count();
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: "desc" },
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  return (
    <>
      <Breadcrumb items={[{ label: "Tin tức" }]} />
      <Container className="py-8 md:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase text-shop-title md:text-3xl">
            Tin Tức DanaFarm
          </h1>
          <p className="mt-3 text-sm text-shop-text/65">
            Khám phá kiến thức, công thức và câu chuyện từ vùng đất Đà Lạt.
          </p>
          <p className="mt-2 text-xs text-shop-text/50">
            {totalPosts} bài viết · Trang {currentPage}/{totalPages}
          </p>
        </header>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-shop-border py-16 text-center text-shop-text/60">
            Chưa có bài viết nào.
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pathname="/blogs/news"
        />
      </Container>
    </>
  );
}
