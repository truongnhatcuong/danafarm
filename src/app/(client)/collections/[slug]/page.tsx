import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CollectionSortSelect } from "@/components/product/CollectionSortSelect";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 20;
const VALID_SORTS = new Set(["newest", "price-asc", "price-desc", "name"]);

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string | string[];
    page?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/collections/${slug}`;

  if (slug === "all") {
    return {
      title: "Tất cả sản phẩm",
      description:
        "Khám phá toàn bộ trà, cà phê, matcha và đặc sản Đà Lạt tại DanaFarm.",
      alternates: { canonical: path },
      openGraph: { url: absoluteUrl(path) },
    };
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!category) return { title: "Không tìm thấy danh mục | DanaFarm" };

  const description =
    category.description ?? `Khám phá ${category.name} tại DanaFarm.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: path },
    openGraph: { title: category.name, description, url: absoluteUrl(path) },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const sortValue = Array.isArray(query.sort) ? query.sort[0] : query.sort;
  const sort = sortValue && VALID_SORTS.has(sortValue) ? sortValue : "newest";
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const requestedPage = Math.max(1, Number.parseInt(pageValue ?? "1", 10) || 1);
  const category =
    slug === "all"
      ? null
      : await prisma.category.findUnique({
          where: { slug },
          include: { children: { orderBy: { position: "asc" } } },
        });

  if (slug !== "all" && !category) notFound();

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : sort === "name"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const where: Prisma.ProductWhereInput = {
    status: "active",
    ...(category
      ? {
          categories: {
            some: {
              OR: [{ id: category.id }, { parentId: category.id }],
            },
          },
        }
      : {}),
  };

  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      categories: { orderBy: { position: "asc" } },
    },
    orderBy,
    skip: (currentPage - 1) * PRODUCTS_PER_PAGE,
    take: PRODUCTS_PER_PAGE,
  });

  const title = category?.name ?? "Tất cả sản phẩm";
  const breadcrumbItems = category
    ? [{ label: "Tất cả sản phẩm", href: "/collections/all" }, { label: title }]
    : [{ label: title }];

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: category?.description ?? `Khám phá ${title} tại DanaFarm.`,
    url: absoluteUrl(`/collections/${slug}`),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * PRODUCTS_PER_PAGE + index + 1,
        url: absoluteUrl(`/products/${product.slug}`),
        name: product.name,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <Breadcrumb items={breadcrumbItems} />
      <Container className="py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {category && (
              <Link
                href="/collections/all"
                className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-shop-text/60 hover:text-shop-main"
              >
                <ArrowLeft size={15} /> Tất cả sản phẩm
              </Link>
            )}
            <h1 className="text-2xl font-bold uppercase text-shop-title md:text-3xl">
              {title}
            </h1>
            {category?.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-shop-text/70">
                {category.description}
              </p>
            )}
            <p className="mt-2 text-sm text-shop-text/60">
              {totalProducts} sản phẩm · Trang {currentPage}/{totalPages}
            </p>
          </div>
          <CollectionSortSelect defaultValue={sort} />
        </div>
        <ProductGrid products={products} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pathname={`/collections/${slug}`}
          query={{ sort: sort === "newest" ? undefined : sort }}
        />
      </Container>
    </>
  );
}
