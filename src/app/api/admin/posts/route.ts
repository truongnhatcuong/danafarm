import type { Prisma } from "@prisma/client";
import { authorizeAdminApi, paginatedResponse, parseAdminListQuery } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const sorts = ["publishedAt", "createdAt", "title", "updatedAt"] as const;

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const query = parseAdminListQuery(request, sorts, "publishedAt");
    const where: Prisma.PostWhereInput = query.search
        ? {
              OR: [
                  { title: { contains: query.search } },
                  { slug: { contains: query.search } },
                  { author: { contains: query.search } },
              ],
          }
        : {};

    const [items, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            orderBy: { [query.sort]: query.direction },
            skip: query.skip,
            take: query.pageSize,
        }),
        prisma.post.count({ where }),
    ]);

    return Response.json(paginatedResponse(items, total, query.page, query.pageSize));
}

export async function POST(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body || !body.title || !body.slug) {
        return Response.json({ error: "Tiêu đề và đường dẫn (slug) là bắt buộc." }, { status: 400 });
    }

    try {
        const post = await prisma.post.create({
            data: {
                title: String(body.title).trim(),
                slug: String(body.slug).trim(),
                excerpt: body.excerpt ? String(body.excerpt).trim() : null,
                content: String(body.content || "").trim(),
                coverImageUrl: body.coverImageUrl || null,
                coverImageUploadKey: body.coverImageUploadKey || null,
                author: body.author ? String(body.author).trim() : "DanaFarm",
                isFeatured: Boolean(body.isFeatured),
                publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
            },
        });
        return Response.json({ data: post }, { status: 201 });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") {
            return Response.json({ error: "Slug bài viết đã tồn tại." }, { status: 409 });
        }
        console.error("POST /api/admin/posts failed", error);
        return Response.json({ error: "Không thể tạo bài viết." }, { status: 500 });
    }
}
