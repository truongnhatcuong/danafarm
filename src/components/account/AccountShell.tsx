import type { ReactNode } from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Container } from "@/components/ui/Container";

export function AccountShell({
    breadcrumb,
    children,
}: {
    breadcrumb: ReactNode;
    children: ReactNode;
}) {
    return (
        <>
            {breadcrumb}
            <Container className="py-10 md:py-14">
                <div className="grid gap-6 md:grid-cols-[240px_1fr] md:gap-8">
                    <AccountSidebar />
                    <div className="space-y-6">{children}</div>
                </div>
            </Container>
        </>
    );
}
