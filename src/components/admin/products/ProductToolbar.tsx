"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { groupCategoriesByParent, type Category } from "./types";

const fieldClass =
    "w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-ink outline-none focus:border-admin-accent transition";

const sortCombinedOptions = [
    { value: "createdAt-desc", label: "Mới nhất" },
    { value: "createdAt-asc", label: "Cũ nhất" },
    { value: "name-asc", label: "Tên A → Z" },
    { value: "name-desc", label: "Tên Z → A" },
    { value: "price-asc", label: "Giá thấp → cao" },
    { value: "price-desc", label: "Giá cao → thấp" },
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

    const sortValue = `${sort}-${direction}`;

    function handleSortChange(value: string) {
        const [nextSort, nextDirection] = value.split("-");
        onSortChange(nextSort);
        onDirectionChange(nextDirection);
    }

    return (
        <section className="space-y-3 rounded-2xl border border-admin-border bg-admin-surface p-4 shadow-xs">
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
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-admin-accent px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:brightness-95"
                >
                    <Plus size={15} />
                    Thêm sản phẩm
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <select
                    className={`${fieldClass} sm:w-44`}
                    value={categoryFilter}
                    onChange={(e) => onCategoryFilterChange(e.target.value)}
                >
                    <option value="">Tất cả danh mục</option>
                    {groupCategoriesByParent(categories).map(({ root, children }) => [
                        <option key={root.id} value={root.id}>
                            {root.name}
                        </option>,
                        ...children.map((child) => (
                            <option key={child.id} value={child.id}>
                                {"  — "}
                                {child.name}
                            </option>
                        )),
                    ])}
                </select>
                <select
                    className={`${fieldClass} sm:w-40`}
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hiển thị</option>
                    <option value="draft">Bản nháp</option>
                </select>
                <select
                    className={`${fieldClass} col-span-2 sm:ml-auto sm:w-44`}
                    value={sortValue}
                    onChange={(e) => handleSortChange(e.target.value)}
                >
                    {sortCombinedOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </section>
    );
}
