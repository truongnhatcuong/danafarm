import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <div className="bg-shop-bg border-b border-shop-border py-3">
            <Container>
                <nav className="flex items-center flex-wrap gap-1 text-xs text-shop-text/70">
                    <Link href="/" className="hover:text-shop-hover">
                        Trang chủ
                    </Link>
                    {items.map((item, i) => (
                        <span key={i} className="flex items-center gap-1">
                            <ChevronRight size={12} />
                            {item.href ? (
                                <Link href={item.href} className="hover:text-shop-hover">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-shop-title font-medium">{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            </Container>
        </div>
    );
}
