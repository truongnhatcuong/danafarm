"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    ExternalLink,
    LogOut,
    Menu,
    Receipt,
    Settings,
    ShieldCheck,
    Store,
    User,
} from "lucide-react";
import { deactivateCart } from "@/stores/cart-store";

const segmentLabels: Record<string, string> = {
    admin: "Quản trị",
    orders: "Đơn hàng",
    vouchers: "Voucher",
    products: "Sản phẩm",
    categories: "Danh mục",
    posts: "Bài viết",
    banners: "Banner",
    pages: "Trang nội dung",
    users: "Khách hàng",
    settings: "Cài đặt",
};

function useBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
        label: segmentLabels[segment] ?? segment,
        href: `/${segments.slice(0, index + 1).join("/")}`,
        isLast: index === segments.length - 1,
    }));
}

export function AdminTopbar({
    adminName,
    onMenuClick,
}: {
    adminName: string;
    onMenuClick: () => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const crumbs = useBreadcrumbs(pathname);
    const initial = adminName.trim().charAt(0).toUpperCase() || "A";

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            deactivateCart();
            setDropdownOpen(false);
            router.push("/login");
            router.refresh();
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-admin-border bg-admin-surface/90 px-4 backdrop-blur md:px-6">
            <button
                aria-label="Mở menu"
                onClick={onMenuClick}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-admin-ink hover:bg-admin-bg lg:hidden"
            >
                <Menu size={19} />
            </button>

            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                <ol className="flex items-center gap-1.5 overflow-hidden text-sm text-admin-muted">
                    {crumbs.map((crumb) => (
                        <li key={crumb.href} className="flex items-center gap-1.5">
                            {crumb.href !== "/admin" && <ChevronRight size={14} className="shrink-0 text-admin-border" />}
                            {crumb.isLast ? (
                                <span className="truncate font-semibold text-admin-ink">{crumb.label}</span>
                            ) : (
                                <Link href={crumb.href} className="shrink-0 hover:text-admin-ink">
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>



            <div className="relative border-l border-admin-border pl-3" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-admin-bg"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-admin-accent-soft text-sm font-bold text-admin-accent shadow-xs">
                        {initial}
                    </span>
                    <span className="hidden text-left leading-tight md:block">
                        <strong className="block max-w-36 truncate text-sm text-admin-ink">{adminName}</strong>
                        <small className="flex items-center gap-1 text-[11px] text-admin-muted">
                            <ShieldCheck size={12} className="text-admin-accent" />
                            Quản trị viên
                        </small>
                    </span>
                    <ChevronDown
                        size={15}
                        className={`text-admin-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {dropdownOpen && (
                    <div className="animate-fade-in-up absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-admin-border bg-admin-surface p-2 shadow-xl">
                        <div className="border-b border-admin-border px-3 py-2.5">
                            <p className="truncate text-sm font-bold text-admin-ink">{adminName}</p>
                            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-admin-accent-soft px-2 py-0.5 text-[10px] font-semibold text-admin-accent">
                                <ShieldCheck size={11} /> Quản trị viên hệ thống
                            </span>
                        </div>

                        <div className="py-1">
                            <Link
                                href="/admin/settings"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-admin-ink transition hover:bg-admin-bg hover:text-admin-accent"
                            >
                                <Settings size={15} className="text-admin-muted" />
                                Cài đặt hệ thống
                            </Link>

                            <Link
                                href="/admin/orders"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-admin-ink transition hover:bg-admin-bg hover:text-admin-accent"
                            >
                                <Receipt size={15} className="text-admin-muted" />
                                Quản lý đơn hàng
                            </Link>

                            <Link
                                href="/account"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-admin-ink transition hover:bg-admin-bg hover:text-admin-accent"
                            >
                                <User size={15} className="text-admin-muted" />
                                Tài khoản cá nhân
                            </Link>

                            <Link
                                href="/"
                                target="_blank"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-admin-ink transition hover:bg-admin-bg hover:text-admin-accent"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Store size={15} className="text-admin-muted" />
                                    Xem cửa hàng
                                </span>
                                <ExternalLink size={12} className="text-admin-muted" />
                            </Link>
                        </div>

                        <div className="border-t border-admin-border pt-1">
                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={handleLogout}
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                            >
                                <LogOut size={15} />
                                {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
