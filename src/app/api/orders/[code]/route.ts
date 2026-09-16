import { getCurrentUser } from "@/lib/auth";
import { changeOrderStatus, OrderLifecycleError } from "@/lib/order-lifecycle";
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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ code: string }> },
) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (body?.action !== "CANCEL") {
        return Response.json({ error: "Thao tác không hợp lệ." }, { status: 400 });
    }

    const { code } = await params;

    try {
        const order = await prisma.$transaction(async (tx) => {
            const ownedOrder = await tx.order.findUnique({ where: { code } });
            if (!ownedOrder || ownedOrder.userId !== user.id) {
                throw new OrderLifecycleError("Không tìm thấy đơn hàng.", 404);
            }
            if (ownedOrder.status !== "PENDING") {
                throw new OrderLifecycleError(
                    "Chỉ có thể tự hủy đơn hàng đang chờ xác nhận.",
                );
            }
            if (ownedOrder.paymentStatus === "PAID") {
                throw new OrderLifecycleError(
                    "Đơn hàng đã thanh toán không thể hủy trực tiếp. Vui lòng liên hệ cửa hàng để yêu cầu hủy và hoàn tiền.",
                );
            }

            return changeOrderStatus(tx, {
                orderId: ownedOrder.id,
                changedById: user.id,
                actorType: "CUSTOMER",
                nextStatus: "CANCELLED",
            });
        });

        return Response.json({ data: order });
    } catch (error) {
        if (error instanceof OrderLifecycleError) {
            return Response.json(
                { error: error.message },
                { status: error.statusCode },
            );
        }
        console.error(`PATCH /api/orders/${code} failed`, error);
        return Response.json(
            { error: "Không thể hủy đơn hàng. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
