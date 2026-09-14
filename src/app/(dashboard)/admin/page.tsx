import { Activity, FileText, LayoutGrid, MessageSquare, Package, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
    const [products, categories, posts, users, contacts] = await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.post.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.contactMessage.count(),
    ]);
    const cards = [
        ["Sản phẩm", products, Package, "text-blue-600", "bg-blue-50"],
        ["Danh mục", categories, LayoutGrid, "text-violet-600", "bg-violet-50"],
        ["Bài viết", posts, FileText, "text-emerald-600", "bg-emerald-50"],
        ["Khách hàng", users, Users, "text-amber-600", "bg-amber-50"],
        ["Tin nhắn", contacts, MessageSquare, "text-rose-600", "bg-rose-50"],
    ] as const;

    return (
        <div>
            <div className="mb-6 flex items-center gap-3"><Activity className="text-shop-main" /><div><h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1><p className="text-sm text-slate-500">Theo dõi và quản lý dữ liệu DanaFarm</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map(([label, count, Icon, color, background]) => (
                    <article key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div><p className="text-sm font-medium text-slate-500">{label}</p><strong className="mt-1 block text-3xl text-slate-900">{count}</strong></div>
                        <span className={`grid size-12 place-items-center rounded-xl ${background} ${color}`}><Icon size={23} /></span>
                    </article>
                ))}
            </div>
        </div>
    );
}
