import { authorizeAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { bucketRevenue, getRangeStart, type RevenueRange } from "@/lib/revenue";

export const runtime = "nodejs";
const VALID_RANGES: RevenueRange[] = ["day", "week", "month", "quarter"];

export async function GET(request: Request) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const rawRange = new URL(request.url).searchParams.get("range");
    const range = (VALID_RANGES as string[]).includes(rawRange ?? "") ? (rawRange as RevenueRange) : "day";

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: getRangeStart(range) },
            status: { not: "CANCELLED" },
        },
        select: { createdAt: true, total: true },
    });

    const points = bucketRevenue(orders, range);
    const totalRevenue = points.reduce((sum, p) => sum + p.revenue, 0);
    const totalOrders = points.reduce((sum, p) => sum + p.orders, 0);

    return Response.json({ data: points, summary: { totalRevenue, totalOrders } });
}
