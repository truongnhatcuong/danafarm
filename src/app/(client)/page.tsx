import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HeroStory } from "@/components/home/HeroStory";
import { HomeBanner } from "@/components/home/HomeBanner";
import { OriginBand } from "@/components/home/OriginBand";
import { PostSection } from "@/components/home/PostSection";
import { ProductSection } from "@/components/home/ProductSection";
import { VoucherSection } from "@/components/home/VoucherSection";
import { prisma } from "@/lib/prisma";

// Keep time-bound homepage vouchers reasonably fresh while still allowing ISR.
export const revalidate = 60;

const HOME_TITLE = "DanaFarm - Trà ngon & Cà phê sạch từ Cầu Đất";
const HOME_DESCRIPTION =
  "Khám phá trà, cà phê Cầu Đất, matcha, trái cây sấy và những hộp quà đặc sản từ DanaFarm.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: HOME_TITLE, description: HOME_DESCRIPTION, url: "/" },
};

const productRelations = {
  images: { orderBy: { position: "asc" as const } },
  variants: { orderBy: { position: "asc" as const } },
  categories: { orderBy: { position: "asc" as const } },
};

export default async function HomePage() {
  const now = new Date();
  const [
    banners,
    categories,
    featuredProducts,
    newProducts,
    posts,
    voucherRows,
  ] = await Promise.all([
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
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "active", isFeatured: true },
      include: productRelations,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { status: "active", isNew: true },
      include: productRelations,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.post.findMany({
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    prisma.voucher.findMany({
      where: {
        isActive: true,
        showOnHomepage: true,
        startsAt: { lte: now },
        expiresAt: { gte: now },
      },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      take: 8,
    }),
  ]);

  const vouchers = voucherRows
    .filter(
      (voucher) =>
        voucher.usageLimit == null || voucher.usedCount < voucher.usageLimit,
    )
    .slice(0, 8)
    .map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      title: voucher.title,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      maxDiscount: voucher.maxDiscount,
      expiresAt: voucher.expiresAt.toISOString(),
    }));

  return (
    <>
      <HomeBanner banners={banners} />
      <HeroStory />
      <CategoryGrid categories={categories} />
      <VoucherSection vouchers={vouchers} />
      <OriginBand />
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
