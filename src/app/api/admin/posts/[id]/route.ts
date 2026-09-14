import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID bài viết không hợp lệ." }, { status: 400 });

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return Response.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

    return Response.json({ data: post });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID bài viết không hợp lệ." }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body || !body.title || !body.slug) {
        return Response.json({ error: "Tiêu đề và đường dẫn (slug) là bắt buộc." }, { status: 400 });
    }

    try {
        const post = await prisma.post.update({
            where: { id },
            data: {
                title: String(body.title).trim(),
                slug: String(body.slug).trim(),
                excerpt: body.excerpt ? String(body.excerpt).trim() : null,
                content: String(body.content || "").trim(),
                coverImageUrl: body.coverImageUrl || null,
                coverImageUploadKey: body.coverImageUploadKey || null,
                author: body.author ? String(body.author).trim() : "DanaFarm",
                isFeatured: Boolean(body.isFeatured),
                publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
            },
        });
        return Response.json({ data: post });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") {
            return Response.json({ error: "Slug bài viết đã tồn tại." }, { status: 409 });
        }
        console.error(`PUT /api/admin/posts/${id} failed`, error);
        return Response.json({ error: "Không thể cập nhật bài viết." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID bài viết không hợp lệ." }, { status: 400 });

    try {
        await prisma.post.delete({ where: { id } });
        return Response.json({ success: true });
    } catch (error) {
        console.error(`DELETE /api/admin/posts/${id} failed`, error);
        return Response.json({ error: "Không thể xóa bài viết." }, { status: 500 });
    }
}
