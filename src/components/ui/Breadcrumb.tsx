import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { absoluteUrl } from "@/lib/seo";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    const listItems = [{ label: "Trang chủ", href: "/" }, ...items];
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: listItems.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: absoluteUrl(item.href) } : {}),
        })),
    };

    return (
        <div className="bg-shop-bg border-b border-shop-border py-3">
            <JsonLd data={breadcrumbJsonLd} />
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
