"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CategoryFormCard } from "@/components/admin/categories/CategoryFormCard";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { emptyCategoryForm, type Category, type CategoryFormValues, type CategoryMeta } from "@/components/admin/categories/types";

export function CategoryManager() {
    const [items, setItems] = useState<Category[]>([]);
    const [options, setOptions] = useState<Category[]>([]);
    const [meta, setMeta] = useState<CategoryMeta>({ page: 1, pageSize: 10, total: 0, pageCount: 1 });
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("position");
    const [direction, setDirection] = useState("asc");
    const [form, setForm] = useState<CategoryFormValues>(emptyCategoryForm);
    const [editing, setEditing] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(
        async (page = 1) => {
            const result = await fetch(
                `/api/admin/categories?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}&direction=${direction}`,
            ).then((r) => r.json());
            setItems(result.data ?? []);
            setMeta(result.pagination ?? meta);
        },
        [search, sort, direction],
    );

    const loadOptions = useCallback(async () => {
        const result = await fetch("/api/admin/categories/options").then((r) => r.json());
        setOptions(result.data ?? []);
    }, []);

    useEffect(() => {
        void load();
        void loadOptions();
    }, [load, loadOptions]);

    function openEdit(item: Category) {
        setEditing(item.id);
        setForm({
            name: item.name,
            slug: item.slug,
            description: item.description ?? "",
            imageUrl: item.imageUrl ?? "",
            imageUploadKey: item.imageUploadKey ?? "",
            position: item.position,
            parentId: item.parentId?.toString() ?? "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelEdit() {
        setEditing(null);
        setForm(emptyCategoryForm);
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        const response = await fetch(editing ? `/api/admin/categories/${editing}` : "/api/admin/categories", {
            method: editing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                parentId: form.parentId ? Number(form.parentId) : null,
                imageUrl: form.imageUrl || null,
                imageUploadKey: form.imageUploadKey || null,
                description: form.description || null,
            }),
        });
        const result = await response.json();
        setBusy(false);
        if (!response.ok) {
            toast.error(result.error ?? "Có lỗi xảy ra.");
            return;
        }
        toast.success(editing ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới.");
        cancelEdit();
        await load();
        await loadOptions();
    }

    async function performDelete(item: Category) {
        const response = await fetch(`/api/admin/categories/${item.id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) {
            toast.error(result.error ?? "Không thể xóa danh mục.");
            return;
        }
        toast.success(`Đã xóa "${item.name}".`);
        if (editing === item.id) {
            cancelEdit();
        }
        await load(Math.min(meta.page, meta.pageCount));
        await loadOptions();
    }

    function requestDelete(item: Category) {
        toast(`Xóa danh mục "${item.name}"?`, {
            description: "Hành động này không thể hoàn tác.",
            action: { label: "Xóa", onClick: () => void performDelete(item) },
            cancel: { label: "Hủy", onClick: () => {} },
        });
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-admin-ink">Quản lý danh mục</h1>
                    <p className="text-sm text-admin-muted">Tạo cấu trúc danh mục và hình đại diện cho cửa hàng.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-muted shadow-xs">
                    Tổng số: <span className="text-sm font-bold text-admin-ink">{meta.total}</span> danh mục
                </div>
            </header>

            {/* Phần Add / Edit Category trên đầu */}
            <CategoryFormCard
                editing={editing}
                value={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                parentOptions={options}
                busy={busy}
                onSubmit={submit}
                onCancel={cancelEdit}
                onUploadError={(message) => toast.error(message)}
            />

            {/* Bảng danh sách danh mục ở dưới giữ nguyên */}
            <CategoryTable
                items={items}
                meta={meta}
                search={search}
                onSearchChange={setSearch}
                sort={sort}
                onSortChange={setSort}
                direction={direction}
                onDirectionChange={setDirection}
                onPageChange={load}
                onEdit={openEdit}
                onDelete={requestDelete}
            />
        </div>
    );
}
