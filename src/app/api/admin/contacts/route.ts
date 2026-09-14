import type { Prisma } from "@prisma/client";
import { authorizeAdminApi, paginatedResponse, parseAdminListQuery } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const sorts = ["createdAt", "name"] as const;

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const query = parseAdminListQuery(request, sorts, "createdAt");
    const where: Prisma.ContactMessageWhereInput = query.search
        ? {
              OR: [
                  { name: { contains: query.search } },
                  { email: { contains: query.search } },
                  { phone: { contains: query.search } },
                  { message: { contains: query.search } },
              ],
          }
        : {};

    const [items, total] = await prisma.$transaction([
        prisma.contactMessage.findMany({
            where,
            orderBy: { [query.sort]: query.direction },
            skip: query.skip,
            take: query.pageSize,
        }),
        prisma.contactMessage.count({ where }),
    ]);

    return Response.json(paginatedResponse(items, total, query.page, query.pageSize));
}
