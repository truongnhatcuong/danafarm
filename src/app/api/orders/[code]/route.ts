import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const { code } = await params;
    const order = await prisma.order.findUnique({
        where: { code },
        include: { items: true },
    });

    if (!order || (order.userId !== user.id && user.role !== "ADMIN")) {
        return Response.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
    }

    return Response.json({ data: order });
}
