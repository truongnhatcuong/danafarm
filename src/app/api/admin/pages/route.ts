import { authorizeAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const pages = await prisma.page.findMany({
        orderBy: { updatedAt: "desc" },
    });

    return Response.json({ data: pages });
}

export async function POST(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body || !body.title || !body.slug) {
        return Response.json({ error: "Tiêu đề và đường dẫn (slug) là bắt buộc." }, { status: 400 });
    }

    try {
        const page = await prisma.page.create({
            data: {
                title: String(body.title).trim(),
                slug: String(body.slug).trim(),
                content: String(body.content || "").trim(),
            },
        });
        return Response.json({ data: page }, { status: 201 });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") {
            return Response.json({ error: "Slug trang nội dung đã tồn tại." }, { status: 409 });
        }
        console.error("POST /api/admin/pages failed", error);
        return Response.json({ error: "Không thể tạo trang nội dung." }, { status: 500 });
    }
}
