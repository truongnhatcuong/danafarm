import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HomeBanner } from "@/components/home/HomeBanner";
import { PostSection } from "@/components/home/PostSection";
import { ProductSection } from "@/components/home/ProductSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DanaFarm - Trà ngon & Cà phê sạch từ Cầu Đất",
  description:
    "Khám phá trà, cà phê Cầu Đất, matcha, trái cây sấy và những hộp quà đặc sản từ DanaFarm.",
};

const productRelations = {
  images: { orderBy: { position: "asc" as const } },
  variants: { orderBy: { position: "asc" as const } },
  categories: { orderBy: { position: "asc" as const } },
};

export default async function HomePage() {
  const [banners, categories, featuredProducts, newProducts, posts] =
    await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
      prisma.category.findMany({
        where: { parentId: null },
        include: {
          children: { orderBy: { position: "asc" } },
          _count: { select: { products: true } },
        },
        orderBy: { position: "asc" },
        take: 6,
      }),
      prisma.product.findMany({
        where: { status: "active", isFeatured: true },
        include: productRelations,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "active", isNew: true },
        include: productRelations,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.post.findMany({
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    ]);

  return (
    <>
      <HomeBanner banners={banners} />
      <CategoryGrid categories={categories} />
      <ProductSection
        title="Sản Phẩm Nổi Bật"
        viewAllHref="/collections/all"
        products={featuredProducts}
      />
      <ProductSection
        title="Sản Phẩm Mới"
        viewAllHref="/collections/all?sort=newest"
        products={newProducts}
      />
      <PostSection posts={posts} />
    </>
  );
}
