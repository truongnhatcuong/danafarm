import { z } from "zod";
import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const statusSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "DELIVERED", "CANCELLED"]),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID đơn hàng không hợp lệ." }, { status: 400 });

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true, user: { select: { name: true, email: true, phone: true } } },
    });
    if (!order) return Response.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });

    return Response.json({ data: order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authorizeAdminApi();
    if (auth.response) return auth.response;

    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    if (!id) return Response.json({ error: "ID đơn hàng không hợp lệ." }, { status: 400 });

    const parsed = statusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    try {
        const order = await prisma.order.update({
            where: { id },
            data: { status: parsed.data.status },
            include: { items: true },
        });
        return Response.json({ data: order });
    } catch (error) {
        console.error(`PATCH /api/admin/orders/${id} failed`, error);
        return Response.json({ error: "Không thể cập nhật trạng thái đơn hàng." }, { status: 500 });
    }
}
