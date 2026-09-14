import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CollectionSortSelect } from "@/components/product/CollectionSortSelect";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CollectionPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({
    params,
}: CollectionPageProps): Promise<Metadata> {
    const { slug } = await params;
    const path = `/collections/${slug}`;

    if (slug === "all") {
        return {
            title: "Tất cả sản phẩm",
            description: "Khám phá toàn bộ trà, cà phê, matcha và đặc sản Đà Lạt tại DanaFarm.",
            alternates: { canonical: path },
            openGraph: { url: absoluteUrl(path) },
        };
    }

    const category = await prisma.category.findUnique({
        where: { slug },
        select: { name: true, description: true },
    });
    if (!category) return { title: "Không tìm thấy danh mục | DanaFarm" };

    const description = category.description ?? `Khám phá ${category.name} tại DanaFarm.`;
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
    const category =
        slug === "all"
            ? null
            : await prisma.category.findUnique({
                where: { slug },
                include: { children: { orderBy: { position: "asc" } } },
            });

    if (slug !== "all" && !category) notFound();

    const orderBy =
        query.sort === "price-asc"
            ? { price: "asc" as const }
            : query.sort === "price-desc"
                ? { price: "desc" as const }
                : query.sort === "name"
                    ? { name: "asc" as const }
                    : { createdAt: "desc" as const };

    const products = await prisma.product.findMany({
        where: {
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
        },
        include: {
            images: { orderBy: { position: "asc" } },
            variants: { orderBy: { position: "asc" } },
            categories: { orderBy: { position: "asc" } },
        },
        orderBy,
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
            itemListElement: products.slice(0, 24).map((product, index) => ({
                "@type": "ListItem",
                position: index + 1,
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
                            {products.length} sản phẩm
                        </p>
                    </div>
                    <CollectionSortSelect defaultValue={query.sort ?? "newest"} />
                </div>
                <ProductGrid products={products} />
            </Container>
        </>
    );
}
