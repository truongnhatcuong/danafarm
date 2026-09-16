import { z } from "zod";
import { authorizeAdminApi, parsePositiveId } from "@/lib/admin";
import {
  changeOrderStatus,
  changePaymentStatus,
  OrderLifecycleError,
} from "@/lib/order-lifecycle";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const updateOrderSchema = z
  .object({
    status: z
      .enum([
        "PENDING",
        "CONFIRMED",
        "PACKING",
        "SHIPPING",
        "DELIVERED",
        "CANCELLED",
      ])
      .optional(),
    paymentStatus: z
      .enum(["PENDING", "PAID", "CANCELLED", "FAILED"])
      .optional(),
    undo: z.boolean().optional().default(false),
  })
  .refine(
    (data) =>
      (data.status !== undefined) !== (data.paymentStatus !== undefined),
    { message: "Mỗi lần chỉ được cập nhật một loại trạng thái." },
  );

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const id = parsePositiveId(rawId);
  if (!id) {
    return Response.json(
      { error: "ID đơn hàng không hợp lệ." },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true } },
      statusHistory: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { changedBy: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!order) {
    return Response.json(
      { error: "Không tìm thấy đơn hàng." },
      { status: 404 },
    );
  }

  return Response.json({ data: order });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeAdminApi();
  if (auth.response || !auth.user) return auth.response;

  const { id: rawId } = await params;
  const id = parsePositiveId(rawId);
  if (!id) {
    return Response.json(
      { error: "ID đơn hàng không hợp lệ." },
      { status: 400 },
    );
  }

  const parsed = updateOrderSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      if (parsed.data.status) {
        return changeOrderStatus(tx, {
          orderId: id,
          changedById: auth.user.id,
          actorType: "ADMIN",
          nextStatus: parsed.data.status,
          undo: parsed.data.undo,
        });
      }

      return changePaymentStatus(tx, {
        orderId: id,
        changedById: auth.user.id,
        nextStatus: parsed.data.paymentStatus!,
        undo: parsed.data.undo,
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
    console.error(`PATCH /api/admin/orders/${id} failed`, error);
    return Response.json(
      { error: "Không thể cập nhật trạng thái đơn hàng." },
      { status: 500 },
    );
  }
}
