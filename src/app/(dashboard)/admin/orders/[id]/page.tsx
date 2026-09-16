import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Truck, User } from "lucide-react";
import { OrderStatusControl } from "@/components/admin/orders/OrderStatusControl";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { parsePositiveId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Chi tiết đơn hàng | DanaFarm Admin" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parsePositiveId(rawId);
  if (!id) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true } },
      statusHistory: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { changedBy: { select: { name: true, email: true } } },
      },
    },
  });
  if (!order) notFound();

  const latestOrderChange = order.statusHistory.find(
    (entry) => entry.changeType === "ORDER_STATUS",
  );
  const latestPaymentChange = order.statusHistory.find(
    (entry) => entry.changeType === "PAYMENT_STATUS",
  );

  const statusLabels: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PACKING: "Đang đóng gói",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="mb-2 flex items-center gap-1.5 text-sm font-medium text-admin-muted hover:text-admin-ink"
          >
            <ArrowLeft size={15} /> Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-2xl font-bold text-admin-ink">
            Đơn hàng #{order.code}
          </h1>
          <p className="text-sm text-admin-muted">
            Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <OrderStatusControl
          orderId={order.id}
          status={order.status}
          paymentStatus={order.paymentStatus}
          previousStatus={latestOrderChange?.previousStatus}
          previousPaymentStatus={latestPaymentChange?.previousPayment}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface p-3.5 sm:p-5 shadow-xs">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs">
          <p className="mb-3 flex items-center gap-2 font-semibold text-admin-ink">
            <User size={16} /> Khách hàng
          </p>
          <p className="text-sm text-admin-ink">{order.user?.name}</p>
          <p className="text-sm text-admin-muted">{order.user?.email}</p>
          <p className="text-sm text-admin-muted">{order.user?.phone}</p>
        </div>
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs">
          <p className="mb-3 flex items-center gap-2 font-semibold text-admin-ink">
            <MapPin size={16} /> Địa chỉ giao hàng
          </p>
          <p className="text-sm text-admin-ink">
            {order.recipientName} · {order.phone}
          </p>
          <p className="text-sm text-admin-muted">
            {order.addressLine}, {order.wardName}, {order.provinceName}
          </p>
        </div>
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs">
          <p className="mb-3 flex items-center gap-2 font-semibold text-admin-ink">
            <Truck size={16} /> Vận chuyển & Thanh toán
          </p>
          <div className="space-y-1 text-sm text-admin-ink">
            <p>
              Phương thức:{" "}
              <strong className="font-semibold">
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi giao hàng (COD)"
                  : "Chuyển khoản ngân hàng qua mã QR (VietQR)"}
              </strong>
            </p>
            <p className="flex items-center gap-2">
              Trạng thái thanh toán:
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${order.paymentStatus === "PAID"
                  ? "bg-emerald-50 text-emerald-700"
                  : order.paymentStatus === "CANCELLED" ||
                    order.paymentStatus === "FAILED"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700"
                  }`}
              >
                {order.paymentStatus === "PAID"
                  ? "Đã thanh toán"
                  : order.paymentStatus === "CANCELLED"
                    ? "Đã hủy thanh toán"
                    : "Chờ thanh toán"}
              </span>
            </p>
            {order.paidAt && (
              <p className="text-xs text-admin-muted">
                Thanh toán lúc: {new Date(order.paidAt).toLocaleString("vi-VN")}
              </p>
            )}
          </div>
          {order.distanceKm != null && (
            <p className="mt-2 text-sm text-admin-muted">
              Khoảng cách ước tính: ~{order.distanceKm}km
            </p>
          )}
          {order.note && (
            <p className="mt-1 text-sm italic text-admin-muted">
              Ghi chú: {order.note}
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
        <div className="divide-y divide-admin-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-admin-border bg-admin-bg">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-admin-ink">{item.productName}</p>
                {item.variantName && (
                  <p className="text-sm text-admin-muted">{item.variantName}</p>
                )}
                <p className="text-sm text-admin-muted">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <strong className="text-admin-ink">
                {formatCurrency(item.lineTotal)}
              </strong>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-admin-border bg-admin-bg/40 p-4 text-sm">
          <div className="flex justify-between text-admin-muted">
            <span>Tạm tính</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-admin-muted">
            <span>Phí vận chuyển</span>
            <span>
              {order.shippingFee === 0
                ? "Miễn phí"
                : formatCurrency(order.shippingFee)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>
                {order.voucherCode
                  ? `Voucher (${order.voucherCode})`
                  : "Giảm giá"}
              </span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-admin-border pt-2 text-base font-bold text-admin-ink">
            <span>Tổng cộng</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
        <header className="border-b border-admin-border px-5 py-4">
          <h2 className="font-semibold text-admin-ink">Lịch sử trạng thái</h2>
          <p className="text-xs text-admin-muted">
            Ghi nhận người thực hiện, thời gian và nội dung thay đổi.
          </p>
        </header>
        {order.statusHistory.length === 0 ? (
          <p className="p-5 text-sm text-admin-muted">
            Chưa có thay đổi trạng thái nào được ghi nhận.
          </p>
        ) : (
          <ol className="divide-y divide-admin-border">
            {order.statusHistory.map((entry) => {
              const isOrder = entry.changeType === "ORDER_STATUS";
              const previous = isOrder
                ? entry.previousStatus
                : entry.previousPayment;
              const next = isOrder ? entry.nextStatus : entry.nextPayment;
              return (
                <li key={entry.id} className="flex flex-wrap justify-between gap-3 px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium text-admin-ink">
                      {entry.isUndo ? "Hoàn tác" : "Cập nhật"}{" "}
                      {isOrder ? "đơn hàng" : "thanh toán"}: {previous ? statusLabels[previous] ?? previous : "—"}{" "}
                      → {next ? statusLabels[next] ?? next : "—"}
                    </p>
                    <p className="text-xs text-admin-muted">
                      {entry.actorType === "CUSTOMER" ? "Khách hàng" : "Quản trị viên"}: {entry.changedBy.name} · {entry.changedBy.email}
                    </p>
                  </div>
                  <time className="text-xs text-admin-muted">
                    {new Date(entry.createdAt).toLocaleString("vi-VN")}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
