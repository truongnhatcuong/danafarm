import type { Prisma } from "@prisma/client";
import { authorizeAdminApi, paginatedResponse, parseAdminListQuery } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const sorts = ["createdAt", "total"] as const;
const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "DELIVERED", "CANCELLED"] as const;

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const query = parseAdminListQuery(request, sorts, "createdAt");
    const status = new URL(request.url).searchParams.get("status");

    const where: Prisma.OrderWhereInput = {
        ...(status && (ORDER_STATUSES as readonly string[]).includes(status)
            ? { status: status as (typeof ORDER_STATUSES)[number] }
            : {}),
        ...(query.search
            ? {
                  OR: [
                      { code: { contains: query.search } },
                      { recipientName: { contains: query.search } },
                      { phone: { contains: query.search } },
                  ],
              }
            : {}),
    };

    const [items, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            orderBy: { [query.sort]: query.direction },
            skip: query.skip,
            take: query.pageSize,
            include: { user: { select: { name: true, email: true } }, items: true },
        }),
        prisma.order.count({ where }),
    ]);

    return Response.json(paginatedResponse(items, total, query.page, query.pageSize));
}
