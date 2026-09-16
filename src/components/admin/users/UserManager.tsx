"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ShieldCheck,
  UserCheck,
  Trash2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type UserItem = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  _count?: { sessions: number };
};

type UserMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

const fieldClass =
  "w-full md:w-fit rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

export function UserManager() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [meta, setMeta] = useState<UserMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [roleTarget, setRoleTarget] = useState<UserItem | null>(null);
  const [changingRole, setChangingRole] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      const params = new URLSearchParams({
        page: String(page),
        search,
        sort: "createdAt",
        direction: "desc",
      });
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`).then(
        (r) => r.json(),
      );
      setItems(res.data ?? []);
      setMeta(res.pagination ?? meta);
    },
    [search, roleFilter],
  );

  useEffect(() => {
    // Initial/filter-driven fetch intentionally synchronizes remote user data with the view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function performRoleChange() {
    if (!roleTarget) return;
    const nextRole = roleTarget.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    setChangingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${roleTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Không thể đổi vai trò.");
        return;
      }
      toast.success(`Đã đổi vai trò của ${roleTarget.name} thành ${nextRole}.`);
      setRoleTarget(null);
      await load(meta.page);
    } finally {
      setChangingRole(false);
    }
  }

  async function performDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error ?? "Không thể xóa tài khoản.");
      return;
    }
    toast.success(`Đã xóa tài khoản "${deleteTarget.name}".`);
    setDeleteTarget(null);
    await load(Math.min(meta.page, meta.pageCount));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-admin-ink">
            Khách hàng & Người dùng
          </h1>
          <p className="text-sm text-admin-muted">
            Danh sách tài khoản đã đăng ký trên hệ thống DanaFarm.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-muted shadow-xs">
          Tổng số:{" "}
          <span className="text-sm font-bold text-admin-ink">{meta.total}</span>{" "}
          tài khoản
        </div>
      </header>

      <section className="rounded-2xl border border-admin-border bg-admin-surface shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-start gap-3 border-b border-admin-border p-4">
          <div className="relative max-w-sm flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
            />
            <input
              className={`${fieldClass} pl-9`}
              placeholder="Tìm tên, email, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className={`${fieldClass} w-auto`}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-admin-border bg-admin-bg/50 text-xs font-semibold uppercase text-admin-muted">
              <tr>
                <th className="p-3.5">Người dùng</th>
                <th className="p-3.5">Liên hệ</th>
                <th className="p-3.5">Vai trò</th>
                <th className="p-3.5">Ngày tham gia</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-admin-muted">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="transition hover:bg-admin-bg/40">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-admin-accent-soft font-bold text-admin-accent">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <strong className="block font-semibold text-admin-ink">
                            {u.name}
                          </strong>
                          <span className="text-xs text-admin-muted">
                            ID #{u.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-admin-muted">
                      <div className="flex items-center gap-1.5 text-admin-ink">
                        <Mail size={13} className="text-admin-muted" />{" "}
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <Phone size={13} className="text-admin-muted" />{" "}
                          {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.role === "ADMIN"
                          ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                          }`}
                      >
                        {u.role === "ADMIN" ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <UserCheck size={12} />
                        )}
                        {u.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-admin-muted">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title={
                            u.role === "ADMIN"
                              ? "Chuyển thành khách hàng"
                              : "Phân quyền Quản trị"
                          }
                          onClick={() => setRoleTarget(u)}
                          className="rounded-lg border border-admin-border px-2.5 py-1 text-xs font-medium text-admin-muted transition hover:bg-admin-bg hover:text-admin-ink"
                        >
                          Đổi vai trò
                        </button>
                        <button
                          type="button"
                          title="Xóa người dùng"
                          onClick={() => setDeleteTarget(u)}
                          className="grid size-8 place-items-center rounded-lg text-admin-muted transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
            <strong>{meta.total}</strong> người dùng
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

      {/* Confirm Đổi Vai Trò */}
      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-2xl">
            <h3 className="text-base font-bold text-admin-ink">
              Xác nhận đổi vai trò?
            </h3>
            <p className="mt-1 text-sm text-admin-muted">
              Bạn có chắc muốn chuyển{" "}
              <strong>&ldquo;{roleTarget.name}&rdquo;</strong> (
              {roleTarget.email}) từ{" "}
              <strong>
                {roleTarget.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
              </strong>{" "}
              thành{" "}
              <strong>
                {roleTarget.role === "ADMIN" ? "Khách hàng" : "Quản trị viên"}
              </strong>
              ?
              {roleTarget.role !== "ADMIN" && (
                <span className="mt-1 block text-amber-600">
                  Tài khoản này sẽ có toàn quyền truy cập trang quản trị.
                </span>
              )}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoleTarget(null)}
                disabled={changingRole}
                className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink hover:bg-admin-bg disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={performRoleChange}
                disabled={changingRole}
                className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white shadow-xs hover:brightness-95 disabled:opacity-50"
              >
                {changingRole ? "Đang xử lý..." : "Xác nhận đổi vai trò"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Xóa Tài khoản */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-2xl">
            <h3 className="text-base font-bold text-admin-ink">
              Xác nhận xóa tài khoản?
            </h3>
            <p className="mt-1 text-sm text-admin-muted">
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong>&ldquo;{deleteTarget.name}&rdquo;</strong> (
              {deleteTarget.email})?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-ink hover:bg-admin-bg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={performDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-rose-700"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
