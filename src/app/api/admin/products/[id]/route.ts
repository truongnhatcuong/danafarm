import { nullable, productInputSchema, validationError } from "@/lib/admin-catalog";
import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deleteUploadThingFiles } from "@/lib/uploadthing-server";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const include = { images: { orderBy: { position: "asc" as const } }, variants: { orderBy: { position: "asc" as const } }, categories: { select: { id: true, name: true } } };

export async function GET(_: Request, { params }: Context) {
    const auth = await authorizeAdminApi(); if (auth.response) return auth.response;
    const id = parsePositiveId((await params).id); if (!id) return Response.json({ error: "ID không hợp lệ." }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { id }, include });
    return product ? Response.json({ data: product }) : Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
}

export async function PUT(request: Request, { params }: Context) {
    const auth = await authorizeAdminApi(); if (auth.response) return auth.response;
    const id = parsePositiveId((await params).id); if (!id) return Response.json({ error: "ID không hợp lệ." }, { status: 400 });
    const parsed = productInputSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error);
    const input = parsed.data;
    const existing = await prisma.product.findUnique({ where: { id }, select: { images: { select: { uploadKey: true } } } });
    if (!existing) return Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    if (input.categoryIds.length !== await prisma.category.count({ where: { id: { in: input.categoryIds } } })) return Response.json({ error: "Một hoặc nhiều danh mục không tồn tại." }, { status: 400 });
    try {
        const product = await prisma.$transaction(async (tx) => {
            await tx.productImage.deleteMany({ where: { productId: id } });
            await tx.productVariant.deleteMany({ where: { productId: id } });
            return tx.product.update({
                where: { id }, data: {
                    name: input.name, slug: input.slug, sku: nullable(input.sku), unitLabel: nullable(input.unitLabel), price: input.price,
                    compareAtPrice: nullable(input.compareAtPrice), shortDescription: nullable(input.shortDescription), description: nullable(input.description), usageGuide: nullable(input.usageGuide), preservationGuide: nullable(input.preservationGuide),
                    stockStatus: input.stockStatus, status: input.status, isFeatured: input.isFeatured, isOnSale: input.isOnSale, isBestSeller: input.isBestSeller, isNew: input.isNew,
                    categories: { set: input.categoryIds.map((categoryId) => ({ id: categoryId })) },
                    images: { create: input.images.map((image, position) => ({ url: image.url, uploadKey: nullable(image.uploadKey), alt: nullable(image.alt), position: image.position ?? position })) },
                    variants: { create: input.variants.map((variant, position) => ({ name: variant.name, price: variant.price, compareAtPrice: nullable(variant.compareAtPrice), sku: nullable(variant.sku), position: variant.position ?? position })) },
                }, include
            });
        });
        const retained = new Set(input.images.map((image) => image.uploadKey).filter(Boolean));
        await deleteUploadThingFiles(existing.images.map((image) => image.uploadKey).filter((key) => key && !retained.has(key))).catch((error) => console.error("Product image cleanup failed", error));
        return Response.json({ data: product });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") return Response.json({ error: "Slug sản phẩm đã tồn tại." }, { status: 409 });
        console.error("PUT /api/admin/products/[id] failed", error); return Response.json({ error: "Không thể cập nhật sản phẩm." }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: Context) {
    const auth = await authorizeAdminApi(); if (auth.response) return auth.response;
    const id = parsePositiveId((await params).id); if (!id) return Response.json({ error: "ID không hợp lệ." }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { id }, select: { images: { select: { uploadKey: true } } } });
    if (!product) return Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    await prisma.product.delete({ where: { id } });
    await deleteUploadThingFiles(product.images.map((image) => image.uploadKey)).catch((error) => console.error("Product delete cleanup failed", error));
    return Response.json({ success: true });
}
