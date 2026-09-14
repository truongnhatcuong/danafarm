"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { Category } from "./types";

const fieldClass =
    "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

const sortOptions = [
    { value: "createdAt", label: "Ngày tạo" },
    { value: "name", label: "Tên" },
    { value: "price", label: "Giá" },
    { value: "status", label: "Trạng thái" },
] as const;

export function ProductToolbar({
    search,
    onSearchChange,
    sort,
    onSortChange,
    direction,
    onDirectionChange,
    categories,
    categoryFilter,
    onCategoryFilterChange,
    statusFilter,
    onStatusFilterChange,
    onAdd,
}: {
    search: string;
    onSearchChange: (value: string) => void;
    sort: string;
    onSortChange: (value: string) => void;
    direction: string;
    onDirectionChange: (value: string) => void;
    categories: Category[];
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onAdd: () => void;
}) {
    const [draft, setDraft] = useState(search);

    useEffect(() => setDraft(search), [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (draft !== search) onSearchChange(draft);
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft]);

    return (
        <section className="rounded-2xl border border-admin-border bg-admin-surface p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
                    <input
                        className={`${fieldClass} pl-9`}
                        placeholder="Tìm sản phẩm, SKU, danh mục..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                    />
                </div>
                <select className={`${fieldClass} w-auto`} value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value)}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <select className={`${fieldClass} w-auto`} value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hiển thị</option>
                    <option value="draft">Bản nháp</option>
                </select>
                <select className={`${fieldClass} w-auto`} value={sort} onChange={(e) => onSortChange(e.target.value)}>
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select className={`${fieldClass} w-auto`} value={direction} onChange={(e) => onDirectionChange(e.target.value)}>
                    <option value="desc">Giảm dần</option>
                    <option value="asc">Tăng dần</option>
                </select>
                <button
                    type="button"
                    onClick={onAdd}
                    className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95"
                >
                    <Plus size={15} />
                    Thêm sản phẩm
                </button>
            </div>
        </section>
    );
}
