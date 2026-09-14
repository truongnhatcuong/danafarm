import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID trang không hợp lệ." }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body || !body.title || !body.slug) {
        return Response.json({ error: "Tiêu đề và đường dẫn (slug) là bắt buộc." }, { status: 400 });
    }

    try {
        const page = await prisma.page.update({
            where: { id },
            data: {
                title: String(body.title).trim(),
                slug: String(body.slug).trim(),
                content: String(body.content || "").trim(),
            },
        });
        return Response.json({ data: page });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") {
            return Response.json({ error: "Slug trang nội dung đã tồn tại." }, { status: 409 });
        }
        console.error(`PUT /api/admin/pages/${id} failed`, error);
        return Response.json({ error: "Không thể cập nhật trang." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID trang không hợp lệ." }, { status: 400 });

    try {
        await prisma.page.delete({ where: { id } });
        return Response.json({ success: true });
    } catch (error) {
        console.error(`DELETE /api/admin/pages/${id} failed`, error);
        return Response.json({ error: "Không thể xóa trang." }, { status: 500 });
    }
}
