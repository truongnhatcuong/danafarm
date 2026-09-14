"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    ImageIcon,
    LayoutGrid,
    Leaf,
    MessageSquare,
    Newspaper,
    Package,
    Receipt,
    Settings,
    Store,
    Users,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavLink = { label: string; href: string; icon: LucideIcon };
type NavGroup = { title: string; links: NavLink[] };

const groups: NavGroup[] = [
    { title: "Tổng quan", links: [{ label: "Bảng điều khiển", href: "/admin", icon: BarChart3 }] },
    {
        title: "Cửa hàng",
        links: [
            { label: "Đơn hàng", href: "/admin/orders", icon: Receipt },
            { label: "Sản phẩm", href: "/admin/products", icon: Package },
            { label: "Danh mục", href: "/admin/categories", icon: LayoutGrid },
        ],
    },
    {
        title: "Nội dung",
        links: [
            { label: "Bài viết", href: "/admin/posts", icon: Newspaper },
            { label: "Banner", href: "/admin/banners", icon: ImageIcon },
            { label: "Trang nội dung", href: "/admin/pages", icon: Store },
        ],
    },
    {
        title: "Tương tác",
        links: [
            { label: "Khách hàng", href: "/admin/users", icon: Users },
            { label: "Liên hệ", href: "/admin/contacts", icon: MessageSquare },
        ],
    },
    { title: "Cài đặt", links: [{ label: "Cài đặt", href: "/admin/settings", icon: Settings }] },
];

function isActive(pathname: string, href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
    adminName,
    open,
    onClose,
}: {
    adminName: string;
    open: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();

    return (
        <>
            {open && (
                <button
                    aria-label="Đóng menu"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col bg-admin-sidebar-bg text-admin-sidebar-ink transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between gap-3 border-b border-admin-sidebar-border px-5 py-5">
                    <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-admin-accent text-white">
                            <Leaf size={19} />
                        </span>
                        <span className="leading-tight">
                            <strong className="block text-[15px] font-bold text-white">DanaFarm</strong>
                            <small className="text-xs text-admin-sidebar-muted">Quản trị · {adminName}</small>
                        </span>
                    </Link>
                    <button
                        aria-label="Đóng menu"
                        onClick={onClose}
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-admin-sidebar-muted hover:bg-white/5 hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {groups.map((group, i) => (
                        <div key={group.title} className={i === 0 ? "" : "mt-5"}>
                            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-admin-sidebar-muted/80">
                                {group.title}
                            </p>
                            <div className="space-y-0.5">
                                {group.links.map((link) => {
                                    const active = isActive(pathname, link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={onClose}
                                            className={`group relative flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-3 text-[13.5px] transition ${
                                                active
                                                    ? "bg-white/[0.07] font-semibold text-white"
                                                    : "text-admin-sidebar-muted hover:bg-white/5 hover:text-white"
                                            }`}
                                        >
                                            <span
                                                className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-admin-accent transition-opacity ${
                                                    active ? "opacity-100" : "opacity-0"
                                                }`}
                                            />
                                            <link.icon
                                                size={17}
                                                className={active ? "text-admin-accent" : "text-admin-sidebar-muted group-hover:text-white"}
                                            />
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-admin-sidebar-border p-3">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] text-admin-sidebar-muted transition hover:bg-white/5 hover:text-white"
                    >
                        <Store size={17} />
                        Xem cửa hàng
                    </Link>
                </div>
            </aside>
        </>
    );
}
