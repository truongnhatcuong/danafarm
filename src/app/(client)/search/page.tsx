import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tìm kiếm | DanaFarm" };

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q = "" } = await searchParams;
    const query = q.trim();
    const products = query
        ? await prisma.product.findMany({
            where: {
                status: "active",
                OR: [
                    { name: { contains: query } },
                    { shortDescription: { contains: query } },
                    { description: { contains: query } },
                ],
            },
            include: {
                images: { orderBy: { position: "asc" } },
                variants: { orderBy: { position: "asc" } },
                categories: { orderBy: { position: "asc" } },
            },
            orderBy: { createdAt: "desc" },
        })
        : [];

    return (
        <>
            <Breadcrumb items={[{ label: "Tìm kiếm" }]} />
            <Container className="py-8 md:py-12">
                <h1 className="text-2xl font-bold uppercase text-shop-title md:text-3xl">Kết quả tìm kiếm</h1>
                <p className="mb-8 mt-3 text-sm text-shop-text/65">
                    {query
                        ? `Tìm thấy ${products.length} sản phẩm cho “${query}”.`
                        : "Vui lòng nhập từ khóa vào ô tìm kiếm."}
                </p>
                <ProductGrid products={products} />
            </Container>
        </>
    );
}
