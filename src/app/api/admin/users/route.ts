import type { Prisma } from "@prisma/client";
import { authorizeAdminApi, paginatedResponse, parseAdminListQuery } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const sorts = ["createdAt", "name", "email"] as const;

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const query = parseAdminListQuery(request, sorts, "createdAt");
    const roleParam = new URL(request.url).searchParams.get("role");

    const where: Prisma.UserWhereInput = {
        ...(roleParam === "CUSTOMER" || roleParam === "ADMIN" ? { role: roleParam } : {}),
        ...(query.search
            ? {
                  OR: [
                      { name: { contains: query.search } },
                      { email: { contains: query.search } },
                      { phone: { contains: query.search } },
                  ],
              }
            : {}),
    };

    const [items, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            orderBy: { [query.sort]: query.direction },
            skip: query.skip,
            take: query.pageSize,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { sessions: true } },
            },
        }),
        prisma.user.count({ where }),
    ]);

    return Response.json(paginatedResponse(items, total, query.page, query.pageSize));
}
