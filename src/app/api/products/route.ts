import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const productInclude = {
    images: { orderBy: { position: "asc" as const } },
    variants: { orderBy: { position: "asc" as const } },
    categories: { orderBy: { position: "asc" as const } },
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category")?.trim();
        const query = searchParams.get("q")?.trim();
        const featured = searchParams.get("featured") === "true";
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 12, 1), 48);
        const sort = searchParams.get("sort") ?? "newest";

        const where = {
            status: "active",
            ...(category
                ? {
                    categories: {
                        some: {
                            OR: [{ slug: category }, { parent: { slug: category } }],
                        },
                    },
                }
                : {}),
            ...(query
                ? {
                    OR: [
                        { name: { contains: query } },
                        { shortDescription: { contains: query } },
                    ],
                }
                : {}),
            ...(featured ? { isFeatured: true } : {}),
        };

        const orderBy =
            sort === "price-asc"
                ? { price: "asc" as const }
                : sort === "price-desc"
                    ? { price: "desc" as const }
                    : sort === "name"
                        ? { name: "asc" as const }
                        : { createdAt: "desc" as const };

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                include: productInclude,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return Response.json({
            data: products,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("GET /api/products failed", error);
        return Response.json(
            { error: "Không thể tải sản phẩm." },
            { status: 500 },
        );
    }
}
