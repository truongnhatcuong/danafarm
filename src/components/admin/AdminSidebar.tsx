import Link from "next/link";
import {
    BarChart3,
    ContactRound,
    FileText,
    ImageIcon,
    LayoutGrid,
    MessageSquare,
    Package,
    Settings,
    Users,
} from "lucide-react";

const links = [
    ["Tổng quan", "/admin", BarChart3],
    ["Sản phẩm", "/admin/products", Package],
    ["Danh mục", "/admin/categories", LayoutGrid],
    ["Bài viết", "/admin/posts", FileText],
    ["Banner", "/admin/banners", ImageIcon],
    ["Trang nội dung", "/admin/pages", FileText],
    ["Khách hàng", "/admin/users", Users],
    ["Liên hệ", "/admin/contacts", MessageSquare],
    ["Cài đặt", "/admin/settings", Settings],
] as const;

export function AdminSidebar({ adminName }: { adminName: string }) {
    return (
        <aside className="rounded-2xl bg-slate-950 p-4 text-white shadow-xl lg:sticky lg:top-44 lg:h-fit lg:w-64 lg:shrink-0">
            <Link href="/admin" className="mb-5 flex items-center gap-3 border-b border-white/10 pb-5">
                <span className="grid size-10 place-items-center rounded-xl bg-shop-main"><ContactRound size={20} /></span>
                <span><strong className="block">DanaFarm Admin</strong><small className="text-slate-400">{adminName}</small></span>
            </Link>
            <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                {links.map(([label, href, Icon]) => (
                    <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
                        <Icon size={17} />{label}
                    </Link>
                ))}
            </nav>
            <Link href="/" className="mt-5 block border-t border-white/10 pt-4 text-center text-xs text-slate-400 hover:text-white">← Xem cửa hàng</Link>
        </aside>
    );
}
