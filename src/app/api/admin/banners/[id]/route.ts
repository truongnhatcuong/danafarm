import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID banner không hợp lệ." }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body || !body.imageUrl) {
        return Response.json({ error: "Hình ảnh banner là bắt buộc." }, { status: 400 });
    }

    try {
        const banner = await prisma.banner.update({
            where: { id },
            data: {
                title: body.title ? String(body.title).trim() : null,
                subtitle: body.subtitle ? String(body.subtitle).trim() : null,
                imageUrl: String(body.imageUrl).trim(),
                imageUploadKey: body.imageUploadKey || null,
                imageMobileUrl: body.imageMobileUrl ? String(body.imageMobileUrl).trim() : null,
                imageMobileUploadKey: body.imageMobileUploadKey || null,
                link: body.link ? String(body.link).trim() : null,
                buttonText: body.buttonText ? String(body.buttonText).trim() : null,
                position: Number(body.position || 0),
                isActive: Boolean(body.isActive),
            },
        });
        return Response.json({ data: banner });
    } catch (error) {
        console.error(`PUT /api/admin/banners/${id} failed`, error);
        return Response.json({ error: "Không thể cập nhật banner." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID banner không hợp lệ." }, { status: 400 });

    try {
        await prisma.banner.delete({ where: { id } });
        return Response.json({ success: true });
    } catch (error) {
        console.error(`DELETE /api/admin/banners/${id} failed`, error);
        return Response.json({ error: "Không thể xóa banner." }, { status: 500 });
    }
}
