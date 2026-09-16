import "server-only";

import type {
    OrderStatus,
    PaymentStatus,
    Prisma,
    PrismaClient,
} from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PACKING: "Đang đóng gói",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    CANCELLED: "Đã hủy thanh toán",
    FAILED: "Thanh toán thất bại",
};

const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PACKING", "CANCELLED"],
    PACKING: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
};

const PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
    PENDING: ["PAID", "FAILED", "CANCELLED"],
    PAID: [],
    CANCELLED: ["PENDING"],
    FAILED: ["PENDING"],
};

export class OrderLifecycleError extends Error {
    constructor(
        message: string,
        public readonly statusCode = 409,
    ) {
        super(message);
    }
}

export function allowedOrderTransitions(status: OrderStatus): readonly OrderStatus[] {
    return ORDER_TRANSITIONS[status];
}

export function allowedPaymentTransitions(
    status: PaymentStatus,
): readonly PaymentStatus[] {
    return PAYMENT_TRANSITIONS[status];
}

export function isOrderTransitionAllowed(
    current: OrderStatus,
    next: OrderStatus,
): boolean {
    return ORDER_TRANSITIONS[current].includes(next);
}

export function isPaymentTransitionAllowed(
    current: PaymentStatus,
    next: PaymentStatus,
): boolean {
    return PAYMENT_TRANSITIONS[current].includes(next);
}

type TransactionClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type LoadedOrder = Prisma.OrderGetPayload<{
    include: { items: true; voucherUsage: true };
}>;

async function restoreInventoryAndVoucher(
    tx: TransactionClient,
    order: LoadedOrder,
) {
    if (order.inventoryRestored) return;

    for (const item of order.items) {
        await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } },
        });
    }

    if (order.voucherId && order.voucherUsage) {
        await tx.voucherUsage.delete({ where: { id: order.voucherUsage.id } });
        await tx.voucher.updateMany({
            where: { id: order.voucherId, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
        });
    }
}

async function reclaimInventoryAndVoucher(
    tx: TransactionClient,
    order: LoadedOrder,
) {
    if (!order.inventoryRestored) return;

    for (const item of order.items) {
        const claimed = await tx.product.updateMany({
            where: { id: item.productId, quantity: { gte: item.quantity } },
            data: { quantity: { decrement: item.quantity } },
        });
        if (claimed.count === 0) {
            throw new OrderLifecycleError(
                `Không thể hoàn tác: sản phẩm "${item.productName}" không còn đủ tồn kho.`,
            );
        }
    }

    if (order.voucherId) {
        const existingUsage = await tx.voucherUsage.findUnique({
            where: {
                voucherId_userId: {
                    voucherId: order.voucherId,
                    userId: order.userId,
                },
            },
        });
        if (existingUsage) {
            throw new OrderLifecycleError(
                "Không thể hoàn tác: khách hàng đã sử dụng lại voucher này.",
            );
        }

        const voucher = await tx.voucher.findUnique({ where: { id: order.voucherId } });
        if (!voucher) {
            throw new OrderLifecycleError("Không thể hoàn tác: voucher không còn tồn tại.");
        }

        const claimed = await tx.voucher.updateMany({
            where: {
                id: voucher.id,
                ...(voucher.usageLimit == null
                    ? {}
                    : { usedCount: { lt: voucher.usageLimit } }),
            },
            data: { usedCount: { increment: 1 } },
        });
        if (claimed.count === 0) {
            throw new OrderLifecycleError(
                "Không thể hoàn tác: voucher đã hết lượt sử dụng.",
            );
        }

        await tx.voucherUsage.create({
            data: {
                voucherId: voucher.id,
                userId: order.userId,
                orderId: order.id,
                discount: order.discount,
            },
        });
    }
}

export async function changeOrderStatus(
    tx: TransactionClient,
    input: {
        orderId: number;
        changedById: number;
        actorType?: "ADMIN" | "CUSTOMER";
        nextStatus: OrderStatus;
        undo?: boolean;
    },
) {
    const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { items: true, voucherUsage: true },
    });
    if (!order) throw new OrderLifecycleError("Không tìm thấy đơn hàng.", 404);
    if (order.status === input.nextStatus) return order;

    let isAllowed = isOrderTransitionAllowed(order.status, input.nextStatus);
    if (input.undo) {
        const latestStatusChange = await tx.orderStatusHistory.findFirst({
            where: { orderId: order.id, changeType: "ORDER_STATUS" },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        isAllowed = latestStatusChange?.previousStatus === input.nextStatus;
    }
    if (!isAllowed) {
        throw new OrderLifecycleError(
            `Không thể chuyển đơn từ “${ORDER_STATUS_LABELS[order.status]}” sang “${ORDER_STATUS_LABELS[input.nextStatus]}”.`,
        );
    }

    if (input.nextStatus === "CANCELLED") {
        await restoreInventoryAndVoucher(tx, order);
    } else if (order.status === "CANCELLED") {
        if (!input.undo) {
            throw new OrderLifecycleError("Chỉ có thể khôi phục đơn đã hủy bằng thao tác hoàn tác.");
        }
        await reclaimInventoryAndVoucher(tx, order);
    }

    const updated = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: {
            status: input.nextStatus,
            inventoryRestored: input.nextStatus === "CANCELLED",
        },
    });
    if (updated.count !== 1) {
        throw new OrderLifecycleError(
            "Đơn hàng vừa được người khác cập nhật. Vui lòng tải lại trang.",
        );
    }

    await tx.orderStatusHistory.create({
        data: {
            orderId: order.id,
            changedById: input.changedById,
            actorType: input.actorType ?? "ADMIN",
            changeType: "ORDER_STATUS",
            previousStatus: order.status,
            nextStatus: input.nextStatus,
            isUndo: Boolean(input.undo),
        },
    });

    return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true },
    });
}

export async function changePaymentStatus(
    tx: TransactionClient,
    input: {
        orderId: number;
        changedById: number;
        nextStatus: PaymentStatus;
        undo?: boolean;
    },
) {
    const order = await tx.order.findUnique({ where: { id: input.orderId } });
    if (!order) throw new OrderLifecycleError("Không tìm thấy đơn hàng.", 404);
    if (order.paymentStatus === input.nextStatus) return order;
    if (order.status === "CANCELLED" && input.nextStatus === "PAID") {
        throw new OrderLifecycleError("Không thể đánh dấu đã thanh toán cho đơn đã hủy.");
    }

    let isAllowed = isPaymentTransitionAllowed(
        order.paymentStatus,
        input.nextStatus,
    );
    if (input.undo) {
        const latestPaymentChange = await tx.orderStatusHistory.findFirst({
            where: { orderId: order.id, changeType: "PAYMENT_STATUS" },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        isAllowed = latestPaymentChange?.previousPayment === input.nextStatus;
    }
    if (!isAllowed) {
        throw new OrderLifecycleError(
            `Không thể chuyển thanh toán từ “${PAYMENT_STATUS_LABELS[order.paymentStatus]}” sang “${PAYMENT_STATUS_LABELS[input.nextStatus]}”.`,
        );
    }

    const updated = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: order.paymentStatus },
        data: {
            paymentStatus: input.nextStatus,
            paidAt: input.nextStatus === "PAID" ? new Date() : null,
        },
    });
    if (updated.count !== 1) {
        throw new OrderLifecycleError(
            "Đơn hàng vừa được người khác cập nhật. Vui lòng tải lại trang.",
        );
    }

    await tx.orderStatusHistory.create({
        data: {
            orderId: order.id,
            changedById: input.changedById,
            actorType: "ADMIN",
            changeType: "PAYMENT_STATUS",
            previousPayment: order.paymentStatus,
            nextPayment: input.nextStatus,
            isUndo: Boolean(input.undo),
        },
    });

    return tx.order.findUniqueOrThrow({ where: { id: order.id } });
}
