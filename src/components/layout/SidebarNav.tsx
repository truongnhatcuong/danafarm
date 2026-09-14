"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

/**
 * Desktop sidebar category navigation, matches the original site's
 * left-hand menu shown alongside the homepage hero slider.
 */
export function SidebarNav({ className }: { className?: string }) {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <ul className={`bg-white rounded-lg border border-shop-border divide-y divide-shop-border ${className ?? ""}`}>
            {NAV_ITEMS.map((item) => (
                <li
                    key={item.slug}
                    className="relative"
                    onMouseEnter={() => setHovered(item.slug)}
                    onMouseLeave={() => setHovered(null)}
                >
                    <Link
                        href={`/collections/${item.slug}`}
                        className="flex items-center justify-between px-4 py-3 text-sm text-shop-text hover:text-shop-hover hover:bg-shop-bg transition-colors"
                    >
                        <span>{item.label}</span>
                        {item.children && <ChevronRight size={14} />}
                    </Link>
                    {item.children && hovered === item.slug && (
                        <div className="absolute left-full top-0 z-20 w-56 bg-white border border-shop-border rounded-lg shadow-lg py-2">
                            {item.children.map((child) => (
                                <Link
                                    key={child.slug}
                                    href={`/collections/${child.slug}`}
                                    className="block px-4 py-2 text-sm text-shop-text hover:text-shop-hover hover:bg-shop-bg transition-colors"
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}
