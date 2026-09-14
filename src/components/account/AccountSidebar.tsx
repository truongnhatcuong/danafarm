"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, MapPin, Receipt, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { deactivateCart } from "@/stores/cart-store";

const NAV_ITEMS = [
    { href: "/account", label: "Tài khoản của tôi", icon: UserRound },
    { href: "/account/orders", label: "Đơn hàng của tôi", icon: Receipt },
    { href: "/account/addresses", label: "Danh sách địa chỉ", icon: MapPin },
];

export function AccountSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            deactivateCart();
            router.push("/login");
            router.refresh();
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <nav className="h-fit rounded-2xl border border-shop-border bg-white p-2 shadow-sm md:sticky md:top-24">
            <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                                    active
                                        ? "bg-shop-main text-white"
                                        : "text-shop-text hover:bg-shop-bg hover:text-shop-hover",
                                )}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
                <li>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                        <LogOut size={18} />
                        {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                    </button>
                </li>
            </ul>
        </nav>
    );
}
