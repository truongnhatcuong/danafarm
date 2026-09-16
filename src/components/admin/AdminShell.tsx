"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminShell({ adminName, children }: { adminName: string; children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-admin-bg">
            <AdminSidebar adminName={adminName} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminTopbar adminName={adminName} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
                    <div className="mx-auto w-full max-w-[1400px]a">{children}</div>
                </main>
            </div>
        </div>
    );
}
