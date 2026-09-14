import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;
        const post = await prisma.post.findUnique({ where: { slug } });

        if (!post) {
            return Response.json(
                { error: "Không tìm thấy bài viết." },
                { status: 404 },
            );
        }

        return Response.json({ data: post });
    } catch (error) {
        console.error("GET /api/posts/[slug] failed", error);
        return Response.json(
            { error: "Không thể tải bài viết." },
            { status: 500 },
        );
    }
}
