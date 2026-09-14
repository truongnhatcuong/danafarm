import type { Prisma } from "@prisma/client";
import { nullable, productInputSchema, validationError } from "@/lib/admin-catalog";
import { authorizeAdminApi, paginatedResponse, parseAdminListQuery } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const sorts = ["name", "price", "status", "createdAt", "updatedAt"] as const;
const include = { images: { orderBy: { position: "asc" as const } }, variants: { orderBy: { position: "asc" as const } }, categories: { select: { id: true, name: true } } };

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const query = parseAdminListQuery(request, sorts, "createdAt");
    const where: Prisma.ProductWhereInput = query.search ? {
        OR: [
            { name: { contains: query.search } }, { slug: { contains: query.search } }, { sku: { contains: query.search } },
            { categories: { some: { name: { contains: query.search } } } },
        ]
    } : {};
    const [items, total] = await prisma.$transaction([
        prisma.product.findMany({ where, orderBy: { [query.sort]: query.direction }, skip: query.skip, take: query.pageSize, include }),
        prisma.product.count({ where }),
    ]);
    return Response.json(paginatedResponse(items, total, query.page, query.pageSize));
}

export async function POST(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const parsed = productInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError(parsed.error);
    const input = parsed.data;
    if (input.categoryIds.length !== await prisma.category.count({ where: { id: { in: input.categoryIds } } })) return Response.json({ error: "Một hoặc nhiều danh mục không tồn tại." }, { status: 400 });
    try {
        const product = await prisma.$transaction(async (tx) => tx.product.create({
            data: {
                name: input.name, slug: input.slug, sku: nullable(input.sku), unitLabel: nullable(input.unitLabel), price: input.price,
                compareAtPrice: nullable(input.compareAtPrice), shortDescription: nullable(input.shortDescription), description: nullable(input.description),
                usageGuide: nullable(input.usageGuide), preservationGuide: nullable(input.preservationGuide), quantity: input.quantity, status: input.status,
                isFeatured: input.isFeatured, isOnSale: input.isOnSale, isBestSeller: input.isBestSeller, isNew: input.isNew,
                categories: { connect: input.categoryIds.map((id) => ({ id })) },
                images: { create: input.images.map((image, position) => ({ url: image.url, uploadKey: nullable(image.uploadKey), alt: nullable(image.alt), position: image.position ?? position })) },
                variants: { create: input.variants.map((variant, position) => ({ name: variant.name, price: variant.price, compareAtPrice: nullable(variant.compareAtPrice), sku: nullable(variant.sku), position: variant.position ?? position })) },
            }, include
        }));
        return Response.json({ data: product }, { status: 201 });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") return Response.json({ error: "Slug sản phẩm đã tồn tại." }, { status: 409 });
        console.error("POST /api/admin/products failed", error);
        return Response.json({ error: "Không thể tạo sản phẩm." }, { status: 500 });
    }
}
