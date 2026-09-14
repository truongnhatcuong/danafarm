"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/products/ConfirmDialog";
import { ProductDrawer } from "@/components/admin/products/ProductDrawer";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductToolbar } from "@/components/admin/products/ProductToolbar";
import { emptyProductForm, productToFormValues, type Category, type Product, type ProductFormValues, type ProductMeta } from "@/components/admin/products/types";

export function ProductManager() {
    const [items, setItems] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [meta, setMeta] = useState<ProductMeta>({ page: 1, pageCount: 1, total: 0, pageSize: 10 });
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("createdAt");
    const [direction, setDirection] = useState("desc");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [form, setForm] = useState<ProductFormValues>(emptyProductForm);
    const [editing, setEditing] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const load = useCallback(
        async (page = 1) => {
            const result = await fetch(
                `/api/admin/products?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}&direction=${direction}`,
            ).then((r) => r.json());
            setItems(result.data ?? []);
            setMeta(result.pagination ?? meta);
        },
        [search, sort, direction],
    );

    const loadCategories = useCallback(async () => {
        const result = await fetch("/api/admin/categories/options").then((r) => r.json());
        setCategories(result.data ?? []);
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    const filteredItems = useMemo(() => {
        return items.filter((p) => {
            if (categoryFilter && !p.categories.some((c) => c.id === Number(categoryFilter))) return false;
            if (statusFilter && p.status !== statusFilter) return false;
            return true;
        });
    }, [items, categoryFilter, statusFilter]);

    function openAdd() {
        setEditing(null);
        setForm(emptyProductForm);
        setDrawerOpen(true);
    }

    function openEdit(product: Product) {
        setEditing(product.id);
        setForm(productToFormValues(product));
        setDrawerOpen(true);
    }

    function closeDrawer() {
        setDrawerOpen(false);
        setEditing(null);
        setForm(emptyProductForm);
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        const body = {
            ...form,
            price: Number(form.price),
            compareAtPrice: form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
            sku: form.sku || null,
            unitLabel: form.unitLabel || null,
            shortDescription: form.shortDescription || null,
            description: form.description || null,
            usageGuide: form.usageGuide || null,
            preservationGuide: form.preservationGuide || null,
        };
        const response = await fetch(editing ? `/api/admin/products/${editing}` : "/api/admin/products", {
            method: editing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const result = await response.json();
        setBusy(false);
        if (!response.ok) {
            toast.error(result.error ?? "Có lỗi xảy ra.");
            return;
        }
        toast.success(editing ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới.");
        closeDrawer();
        await load(meta.page);
    }

    async function performDelete() {
        if (!deleteTarget) return;
        setDeleteBusy(true);
        const response = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
        const result = await response.json();
        setDeleteBusy(false);
        if (!response.ok) {
            toast.error(result.error ?? "Không thể xóa sản phẩm.");
            return;
        }
        toast.success(`Đã xóa "${deleteTarget.name}".`);
        if (editing === deleteTarget.id) closeDrawer();
        setDeleteTarget(null);
        await load(Math.min(meta.page, meta.pageCount));
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-admin-ink">Quản lý sản phẩm</h1>
                    <p className="text-sm text-admin-muted">Sản phẩm, danh mục, biến thể và hình ảnh.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-muted shadow-xs">
                    Tổng số: <span className="text-sm font-bold text-admin-ink">{meta.total}</span> sản phẩm
                </div>
            </header>

            <ProductToolbar
                search={search}
                onSearchChange={setSearch}
                sort={sort}
                onSortChange={setSort}
                direction={direction}
                onDirectionChange={setDirection}
                categories={categories}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onAdd={openAdd}
            />

            <ProductTable items={filteredItems} meta={meta} onPageChange={load} onEdit={openEdit} onDelete={setDeleteTarget} />

            <ProductDrawer
                open={drawerOpen}
                editing={editing}
                value={form}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                categories={categories}
                busy={busy}
                onSubmit={submit}
                onClose={closeDrawer}
                onUploadError={(message) => toast.error(message)}
            />

            <ConfirmDialog
                open={deleteTarget != null}
                title={`Xóa sản phẩm "${deleteTarget?.name ?? ""}"?`}
                description="Toàn bộ biến thể và hình ảnh liên quan sẽ bị xóa. Hành động này không thể hoàn tác."
                busy={deleteBusy}
                onConfirm={performDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
