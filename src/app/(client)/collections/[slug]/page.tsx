import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CollectionPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({
    params,
}: CollectionPageProps): Promise<Metadata> {
    const { slug } = await params;
    if (slug === "all") return { title: "Tất cả sản phẩm | DanaFarm" };

    const category = await prisma.category.findUnique({
        where: { slug },
        select: { name: true, description: true },
    });

    return category
        ? {
            title: `${category.name} | DanaFarm`,
            description: category.description ?? `Khám phá ${category.name} tại DanaFarm.`,
        }
        : { title: "Không tìm thấy danh mục | DanaFarm" };
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

    return (
        <>
            <Breadcrumb items={[{ label: title }]} />
            <Container className="py-8 md:py-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
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
                    <form className="flex items-center gap-2" action={`/collections/${slug}`}>
                        <label htmlFor="sort" className="text-sm font-medium text-shop-title">
                            Sắp xếp:
                        </label>
                        <select
                            id="sort"
                            name="sort"
                            defaultValue={query.sort ?? "newest"}
                            className="rounded-lg border border-shop-border bg-white px-3 py-2 text-sm outline-none focus:border-shop-main"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price-asc">Giá tăng dần</option>
                            <option value="price-desc">Giá giảm dần</option>
                            <option value="name">Tên A-Z</option>
                        </select>
                        <button
                            type="submit"
                            className="rounded-lg bg-shop-main px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Áp dụng
                        </button>
                    </form>
                </div>
                <ProductGrid products={products} />
            </Container>
        </>
    );
}
