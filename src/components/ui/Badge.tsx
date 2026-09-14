import { cn } from "@/lib/utils";

type BadgeTone = "sale" | "new" | "bestseller" | "outline";

const toneClasses: Record<BadgeTone, string> = {
    sale: "bg-red-500 text-white",
    new: "bg-collection1-icon text-white",
    bestseller: "bg-shop-button text-shop-title",
    outline: "border border-shop-border text-shop-text bg-white/80",
};

export function Badge({
    children,
    tone = "outline",
    className,
}: {
    children: React.ReactNode;
    tone?: BadgeTone;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
                toneClasses[tone],
                className
            )}
        >
            {children}
        </span>
    );
}
