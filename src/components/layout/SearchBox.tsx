"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ className }: { className?: string }) {
    const router = useRouter();
    const [q, setQ] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!q.trim()) return;
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex h-11 w-full items-stretch overflow-hidden rounded-lg border-2 border-white/80 bg-white shadow-sm md:h-12 ${className ?? ""}`}
        >
            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="min-w-0 flex-1 px-4 text-sm text-shop-text outline-none placeholder:text-shop-text/55 md:px-5 md:text-base"
            />
            <button
                type="submit"
                aria-label="Tìm kiếm"
                className="flex w-14 items-center justify-center bg-shop-main text-white transition-colors hover:bg-shop-hover md:w-16"
            >
                <Search size={24} strokeWidth={2.5} />
            </button>
        </form>
    );
}
