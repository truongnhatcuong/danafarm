"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "price-asc", label: "Giá: Thấp đến cao" },
    { value: "price-desc", label: "Giá: Cao đến thấp" },
    { value: "name", label: "Tên: A - Z" },
];

export function CollectionSortSelect({ defaultValue }: { defaultValue: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "newest") params.delete("sort");
        else params.set("sort", value);
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    }

    return (
        <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 text-sm font-medium text-shop-title sm:flex">
                <ArrowUpDown size={15} className="text-shop-main" />
                Sắp xếp:
            </span>
            <div className="relative">
                <select
                    aria-label="Sắp xếp sản phẩm"
                    defaultValue={defaultValue}
                    onChange={(event) => handleChange(event.target.value)}
                    className="cursor-pointer appearance-none rounded-full border border-shop-border bg-white py-2 pl-4 pr-9 text-sm font-medium text-shop-title shadow-sm outline-none transition-colors hover:border-shop-main focus:border-shop-main focus:ring-2 focus:ring-shop-main/15"
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-shop-text/50"
                />
            </div>
        </div>
    );
}
