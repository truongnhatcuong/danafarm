import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản trị | DanaFarm" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const admin = await requireAdmin();

    return (
        <div className="min-h-[70vh] bg-slate-100 px-4 py-6 md:px-6 md:py-8">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row">
                <AdminSidebar adminName={admin.name} />
                <section className="min-w-0 flex-1">{children}</section>
            </div>
        </div>
    );
}
