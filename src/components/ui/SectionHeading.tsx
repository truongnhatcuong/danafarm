import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeading({
    title,
    viewAllHref,
    subtitle,
}: {
    title: string;
    viewAllHref?: string;
    subtitle?: string;
}) {
    return (
        <div className="flex items-end justify-between gap-4 mb-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-shop-title">
                    {viewAllHref ? (
                        <Link href={viewAllHref} className="hover:text-shop-hover transition-colors">
                            {title}
                        </Link>
                    ) : (
                        title
                    )}
                </h2>
                {subtitle && <p className="text-sm text-shop-text/70 mt-1">{subtitle}</p>}
            </div>
            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-shop-main hover:text-shop-hover transition-colors shrink-0"
                >
                    Xem tất cả
                    <ChevronRight size={16} />
                </Link>
            )}
        </div>
    );
}
