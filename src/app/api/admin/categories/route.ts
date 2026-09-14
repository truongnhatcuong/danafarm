import type { Prisma } from "@prisma/client";
import { categoryInputSchema, nullable, validationError } from "@/lib/admin-catalog";
import { authorizeAdminApi, paginatedResponse, parseAdminListQuery } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const sorts = ["name", "position", "createdAt", "updatedAt"] as const;

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const query = parseAdminListQuery(request, sorts, "position");
    const where: Prisma.CategoryWhereInput = query.search ? {
        OR: [
            { name: { contains: query.search } },
            { slug: { contains: query.search } },
            { description: { contains: query.search } },
        ],
    } : {};
    const [items, total] = await prisma.$transaction([
        prisma.category.findMany({
            where,
            orderBy: { [query.sort]: query.direction },
            skip: query.skip,
            take: query.pageSize,
            include: { parent: { select: { id: true, name: true } }, _count: { select: { products: true, children: true } } },
        }),
        prisma.category.count({ where }),
    ]);
    return Response.json(paginatedResponse(items, total, query.page, query.pageSize));
}

export async function POST(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;
    const parsed = categoryInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError(parsed.error);
    const input = parsed.data;
    if (input.parentId && !await prisma.category.count({ where: { id: input.parentId } })) {
        return Response.json({ error: "Danh mục cha không tồn tại." }, { status: 400 });
    }
    try {
        const category = await prisma.category.create({
            data: {
                name: input.name, slug: input.slug, description: nullable(input.description),
                imageUrl: nullable(input.imageUrl), imageUploadKey: nullable(input.imageUploadKey),
                position: input.position, parentId: nullable(input.parentId),
            }
        });
        return Response.json({ data: category }, { status: 201 });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") return Response.json({ error: "Slug danh mục đã tồn tại." }, { status: 409 });
        console.error("POST /api/admin/categories failed", error);
        return Response.json({ error: "Không thể tạo danh mục." }, { status: 500 });
    }
}
