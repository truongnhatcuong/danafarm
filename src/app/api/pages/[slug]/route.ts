import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;
        const page = await prisma.page.findUnique({ where: { slug } });

        if (!page) {
            return Response.json(
                { error: "Không tìm thấy trang nội dung." },
                { status: 404 },
            );
        }

        return Response.json({ data: page });
    } catch (error) {
        console.error("GET /api/pages/[slug] failed", error);
        return Response.json(
            { error: "Không thể tải trang nội dung." },
            { status: 500 },
        );
    }
}
