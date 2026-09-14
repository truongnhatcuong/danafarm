import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            orderBy: { position: "asc" },
            include: {
                children: {
                    orderBy: { position: "asc" },
                    include: { _count: { select: { products: true } } },
                },
                _count: { select: { products: true } },
            },
        });

        return Response.json({ data: categories });
    } catch (error) {
        console.error("GET /api/categories failed", error);
        return Response.json(
            { error: "Không thể tải danh mục sản phẩm." },
            { status: 500 },
        );
    }
}
