import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderCard } from "@/components/account/OrderCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đơn hàng của tôi | DanaFarm" };

const PAGE_SIZE = 6;

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKING: "Đang đóng gói",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

type OrdersPageProps = {
  searchParams: Promise<{ page?: string; status?: string }>;
};

function buildHref(page: number, status: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/account/orders?${query}` : "/account/orders";
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");

  const query = await searchParams;
  const status = (ORDER_STATUSES as readonly string[]).includes(
    query.status ?? "",
  )
    ? query.status!
    : "";
  const rawPage = Number(query.page);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const where = {
    userId: user.id,
    ...(status ? { status: status as (typeof ORDER_STATUSES)[number] } : {}),
  };

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        code: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            variantName: true,
            imageUrl: true,
            unitLabel: true,
            price: true,
            quantity: true,
            lineTotal: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AccountShell
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Tài khoản", href: "/account" },
            { label: "Đơn hàng của tôi" },
          ]}
        />
      }
    >
      <section className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-shop-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Receipt className="text-shop-main" size={28} />
            <h1 className="text-xl font-bold uppercase text-shop-title sm:text-2xl">
              Đơn hàng của tôi
            </h1>
          </div>
          {total > 0 && (
            <span className="text-sm font-medium text-shop-text/60">
              Tổng {total} đơn hàng
            </span>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 overflow-x-auto rounded-2xl border border-shop-border bg-white p-3 shadow-sm">
          <Link
            href={buildHref(1, "")}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              status === ""
                ? "bg-shop-main text-white shadow-sm"
                : "bg-shop-bg text-shop-text/70 hover:bg-shop-border/70",
            )}
          >
            Tất cả
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link
              key={s}
              href={buildHref(1, s)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                status === s
                  ? "bg-shop-main text-white shadow-sm"
                  : "bg-shop-bg text-shop-text/70 hover:bg-shop-border/70",
              )}
            >
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <div className="my-8 rounded-2xl border border-dashed border-shop-border bg-white p-12 text-center shadow-sm">
            <p className="text-base font-semibold text-shop-title">
              {status
                ? "Không có đơn hàng nào ở trạng thái này."
                : "Bạn chưa có đơn hàng nào."}
            </p>
            <p className="mt-1 text-sm text-shop-text/60">
              Hãy khám phá các sản phẩm tươi ngon tại DanaFarm nhé!
            </p>
            <ButtonLink href="/collections/all" className="mt-5">
              Bắt đầu mua sắm
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}

            {pageCount > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pageCount}
                pathname="/account/orders"
                query={status ? { status } : {}}
                className="mt-8 border-t border-shop-border/70 pt-6"
              />
            )}
          </div>
        )}
      </section>
    </AccountShell>
  );
}
