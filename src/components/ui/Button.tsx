import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
    primary:
        "bg-shop-main text-white hover:bg-shop-main/90 shadow-sm",
    secondary:
        "bg-shop-button text-shop-title hover:bg-shop-button/90 shadow-sm",
    outline:
        "border border-shop-main text-shop-main bg-transparent hover:bg-shop-main hover:text-white",
    ghost: "bg-transparent text-shop-title hover:bg-shop-bg",
};

const sizeClasses: Record<Size, string> = {
    sm: "text-sm px-3 py-1.5 rounded-md",
    md: "text-sm px-5 py-2.5 rounded-lg",
    lg: "text-base px-7 py-3 rounded-lg",
};

const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    children: ReactNode;
}

export function Button({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}

interface ButtonLinkProps {
    href: string;
    variant?: Variant;
    size?: Size;
    className?: string;
    children: ReactNode;
}

export function ButtonLink({
    href,
    variant = "primary",
    size = "md",
    className,
    children,
}: ButtonLinkProps) {
    return (
        <Link
            href={href}
            className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        >
            {children}
        </Link>
    );
}
