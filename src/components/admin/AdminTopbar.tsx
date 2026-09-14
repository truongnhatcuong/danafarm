"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, Menu } from "lucide-react";

const segmentLabels: Record<string, string> = {
    admin: "Quản trị",
    products: "Sản phẩm",
    categories: "Danh mục",
    posts: "Bài viết",
    banners: "Banner",
    pages: "Trang nội dung",
    users: "Khách hàng",
    contacts: "Liên hệ",
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
    const pathname = usePathname();
    const crumbs = useBreadcrumbs(pathname);
    const initial = adminName.trim().charAt(0).toUpperCase() || "A";

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

            <Link
                href="/"
                target="_blank"
                className="hidden items-center gap-1.5 rounded-lg border border-admin-border px-3 py-2 text-sm font-medium text-admin-ink transition hover:border-admin-accent hover:text-admin-accent sm:flex"
            >
                Xem website
                <ExternalLink size={14} />
            </Link>

            <div className="flex items-center gap-2.5 border-l border-admin-border pl-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-admin-accent-soft text-sm font-bold text-admin-accent">
                    {initial}
                </span>
                <span className="hidden leading-tight md:block">
                    <strong className="block max-w-32 truncate text-sm text-admin-ink">{adminName}</strong>
                    <small className="text-xs text-admin-muted">Quản trị viên</small>
                </span>
            </div>
        </header>
    );
}
