import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-full flex-1 flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
