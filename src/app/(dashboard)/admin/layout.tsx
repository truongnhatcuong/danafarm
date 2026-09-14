import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản trị | DanaFarm" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const admin = await requireAdmin();

    return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
