import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(Number(searchParams.get("page")) || 1, 1);
        const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 9, 1), 30);
        const featured = searchParams.get("featured") === "true";

        const where = featured ? { isFeatured: true } : {};
        const [posts, total] = await prisma.$transaction([
            prisma.post.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    coverImageUrl: true,
                    author: true,
                    isFeatured: true,
                    publishedAt: true,
                },
                orderBy: { publishedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);

        return Response.json({
            data: posts,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("GET /api/posts failed", error);
        return Response.json(
            { error: "Không thể tải bài viết." },
            { status: 500 },
        );
    }
}
