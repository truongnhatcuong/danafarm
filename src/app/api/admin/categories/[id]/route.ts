import { categoryInputSchema, nullable, validationError } from "@/lib/admin-catalog";
import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deleteUploadThingFiles } from "@/lib/uploadthing-server";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const id = parsePositiveId((await params).id);
    if (!id) return Response.json({ error: "ID không hợp lệ." }, { status: 400 });
    const category = await prisma.category.findUnique({ where: { id } });
    return category ? Response.json({ data: category }) : Response.json({ error: "Không tìm thấy danh mục." }, { status: 404 });
}

export async function PUT(request: Request, { params }: Context) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const id = parsePositiveId((await params).id);
    if (!id) return Response.json({ error: "ID không hợp lệ." }, { status: 400 });
    const parsed = categoryInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError(parsed.error);
    const input = parsed.data;
    if (input.parentId === id) return Response.json({ error: "Danh mục không thể là cha của chính nó." }, { status: 400 });
    const existing = await prisma.category.findUnique({ where: { id }, select: { imageUploadKey: true } });
    if (!existing) return Response.json({ error: "Không tìm thấy danh mục." }, { status: 404 });
    if (input.parentId && !await prisma.category.count({ where: { id: input.parentId, parentId: { not: id } } })) {
        return Response.json({ error: "Danh mục cha không hợp lệ." }, { status: 400 });
    }
    try {
        const category = await prisma.category.update({
            where: { id }, data: {
                name: input.name, slug: input.slug, description: nullable(input.description),
                imageUrl: nullable(input.imageUrl), imageUploadKey: nullable(input.imageUploadKey),
                position: input.position, parentId: nullable(input.parentId),
            }
        });
        if (existing.imageUploadKey && existing.imageUploadKey !== input.imageUploadKey) {
            await deleteUploadThingFiles(existing.imageUploadKey).catch((error) => console.error("Category image cleanup failed", error));
        }
        return Response.json({ data: category });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") return Response.json({ error: "Slug danh mục đã tồn tại." }, { status: 409 });
        console.error("PUT /api/admin/categories/[id] failed", error);
        return Response.json({ error: "Không thể cập nhật danh mục." }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: Context) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const id = parsePositiveId((await params).id);
    if (!id) return Response.json({ error: "ID không hợp lệ." }, { status: 400 });
    const category = await prisma.category.findUnique({ where: { id }, select: { imageUploadKey: true, _count: { select: { children: true, products: true } } } });
    if (!category) return Response.json({ error: "Không tìm thấy danh mục." }, { status: 404 });
    if (category._count.children || category._count.products) return Response.json({ error: "Hãy gỡ danh mục con và sản phẩm trước khi xóa." }, { status: 409 });
    await prisma.category.delete({ where: { id } });
    await deleteUploadThingFiles(category.imageUploadKey).catch((error) => console.error("Category delete cleanup failed", error));
    return Response.json({ success: true });
}
