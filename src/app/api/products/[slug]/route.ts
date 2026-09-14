import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                images: { orderBy: { position: "asc" } },
                variants: { orderBy: { position: "asc" } },
                categories: { orderBy: { position: "asc" } },
            },
        });

        if (!product || product.status !== "active") {
            return Response.json(
                { error: "Không tìm thấy sản phẩm." },
                { status: 404 },
            );
        }

        return Response.json({ data: product });
    } catch (error) {
        console.error("GET /api/products/[slug] failed", error);
        return Response.json(
            { error: "Không thể tải sản phẩm." },
            { status: 500 },
        );
    }
}
