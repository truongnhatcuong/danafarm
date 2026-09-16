import type { Prisma } from "@prisma/client";
import { authorizeAdminApi, paginatedResponse, parseAdminListQuery } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const sorts = ["createdAt", "total"] as const;
const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_STATUSES = ["PENDING", "PAID", "CANCELLED", "FAILED"] as const;
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1_000;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Chuyển "YYYY-MM-DD" (giờ Việt Nam) thành mốc 00:00:00 UTC tương ứng. */
function parseVietnamDayStart(value: string | null): Date | null {
    if (!value || !DATE_ONLY_PATTERN.test(value)) return null;
    const localMidnightUtcMs = Date.parse(`${value}T00:00:00.000Z`);
    if (Number.isNaN(localMidnightUtcMs)) return null;
    return new Date(localMidnightUtcMs - VIETNAM_OFFSET_MS);
}

/** Chuyển "YYYY-MM-DD" (giờ Việt Nam) thành mốc đầu ngày kế tiếp (loại trừ), dùng làm cận trên `lt`. */
function parseVietnamDayEndExclusive(value: string | null): Date | null {
    const start = parseVietnamDayStart(value);
    if (!start) return null;
    return new Date(start.getTime() + 24 * 60 * 60 * 1_000);
}

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const query = parseAdminListQuery(request, sorts, "createdAt");
    const searchParams = new URL(request.url).searchParams;
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const dateFromStart = parseVietnamDayStart(searchParams.get("dateFrom"));
    const dateToEndExclusive = parseVietnamDayEndExclusive(searchParams.get("dateTo"));

    const where: Prisma.OrderWhereInput = {
        ...(status && (ORDER_STATUSES as readonly string[]).includes(status)
            ? { status: status as (typeof ORDER_STATUSES)[number] }
            : {}),
        ...(paymentStatus && (PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)
            ? { paymentStatus: paymentStatus as (typeof PAYMENT_STATUSES)[number] }
            : {}),
        ...(dateFromStart || dateToEndExclusive
            ? {
                createdAt: {
                    ...(dateFromStart ? { gte: dateFromStart } : {}),
                    ...(dateToEndExclusive ? { lt: dateToEndExclusive } : {}),
                },
            }
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
