"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Receipt, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type OrderRow = {
  id: number;
  code: string;
  status: string;
  paymentMethod: "COD" | "BANK_TRANSFER";
  paymentStatus: string;
  recipientName: string;
  phone: string;
  total: number;
  createdAt: string;
  items: { id: number }[];
  user: { name: string; email: string } | null;
};

type Meta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái đơn" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PACKING", label: "Đang đóng gói" },
  { value: "SHIPPING", label: "Đang giao hàng" },
  { value: "DELIVERED", label: "Đã giao hàng" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PACKING: "bg-indigo-50 text-indigo-700",
  SHIPPING: "bg-sky-50 text-sky-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "FAILED", label: "Thất bại" },
];

const PAYMENT_STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả TT thanh toán" },
  ...PAYMENT_STATUS_OPTIONS,
];

const PAYMENT_STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200",
  FAILED: "bg-rose-50 text-rose-700 border border-rose-200",
};

const fieldClass =
  "rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

export function OrderManager() {
  const [items, setItems] = useState<OrderRow[]>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(
    async (page = 1) => {
      const query = new URLSearchParams({
        page: String(page),
        search,
        sort: "createdAt",
        direction: "desc",
      });
      if (status) query.set("status", status);
      if (paymentStatus) query.set("paymentStatus", paymentStatus);
      if (dateFrom) query.set("dateFrom", dateFrom);
      if (dateTo) query.set("dateTo", dateTo);
      const res = await fetch(`/api/admin/orders?${query.toString()}`).then(
        (r) => r.json(),
      );
      setItems(res.data ?? []);
      setMeta((current) => res.pagination ?? current);
    },
    [search, status, paymentStatus, dateFrom, dateTo],
  );

  useEffect(() => {
    // Initial/filter-driven fetch intentionally synchronizes remote order data with the view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-admin-ink">
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-admin-muted">
            Theo dõi và cập nhật trạng thái đơn hàng của khách.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-muted shadow-xs">
          Tổng số:{" "}
          <span className="text-sm font-bold text-admin-ink">{meta.total}</span>{" "}
          đơn hàng
        </div>
      </header>

      <section className="rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
        <div className="border-b border-admin-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_auto_auto_auto] lg:items-end">
            {/* Search */}
            <div className="relative min-w-0">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
              />
              <input
                className={`${fieldClass} w-full pl-9`}
                placeholder="Tìm mã đơn, tên người nhận, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Trạng thái đơn */}
            <select
              className={`${fieldClass} w-full lg:w-auto`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Trạng thái thanh toán */}
            <select
              className={`${fieldClass} w-full lg:w-auto`}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              {PAYMENT_STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Ngày */}
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:flex lg:items-center">
              <div className="min-w-0">
                <label
                  htmlFor="order-date-from"
                  className="mb-1 block text-xs font-medium text-admin-muted"
                >
                  Từ ngày
                </label>

                <input
                  id="order-date-from"
                  type="date"
                  className={`${fieldClass} w-full`}
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="order-date-to"
                  className="mb-1 block text-xs font-medium text-admin-muted"
                >
                  Đến ngày
                </label>

                <input
                  id="order-date-to"
                  type="date"
                  className={`${fieldClass} w-full`}
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="col-span-2 whitespace-nowrap rounded-lg border border-admin-border px-3 py-2.5 text-xs font-medium text-admin-muted transition hover:bg-admin-bg hover:text-admin-ink lg:self-end"
                >
                  Xóa ngày
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border text-left text-xs font-semibold uppercase text-admin-muted">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Hình thức</th>
                <th className="px-4 py-3">TT Thanh toán</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái đơn</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-admin-muted">
                    <Receipt
                      size={32}
                      className="mx-auto mb-2 text-admin-muted/60"
                    />
                    Không có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                items.map((order) => (
                  <tr key={order.id} className="hover:bg-admin-bg/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-admin-accent hover:underline"
                      >
                        #{order.code}
                      </Link>
                      <p className="text-xs text-admin-muted">
                        {order.items.length} sản phẩm
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-admin-ink">
                        {order.recipientName}
                      </p>
                      <p className="text-xs text-admin-muted">{order.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {order.paymentMethod === "COD" ? "COD" : "VietQR"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_CLASS[order.paymentStatus] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {PAYMENT_STATUS_OPTIONS.find(
                          (option) => option.value === order.paymentStatus,
                        )?.label ?? order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-admin-ink">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[order.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {STATUS_OPTIONS.find(
                          (option) => option.value === order.status,
                        )?.label ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-admin-muted">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        aria-label={`Xem chi tiết đơn hàng ${order.code}`}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-xs font-semibold text-admin-ink transition hover:border-admin-accent hover:bg-admin-accent hover:text-white"
                      >
                        <Eye size={14} /> Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border p-4 text-xs text-admin-muted">
          <span>
            Hiển thị <strong>{items.length}</strong> /{" "}
            <strong>{meta.total}</strong> đơn hàng
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => load(meta.page - 1)}
              className="flex items-center gap-1 rounded-lg border border-admin-border px-2.5 py-1 font-medium transition hover:bg-admin-bg disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Trước
            </button>
            <span>
              Trang {meta.page} / {meta.pageCount}
            </span>
            <button
              disabled={meta.page >= meta.pageCount}
              onClick={() => load(meta.page + 1)}
              className="flex items-center gap-1 rounded-lg border border-admin-border px-2.5 py-1 font-medium transition hover:bg-admin-bg disabled:opacity-40"
            >
              Sau <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
