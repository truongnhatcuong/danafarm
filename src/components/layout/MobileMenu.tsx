"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { SearchBox } from "./SearchBox";

export function MobileMenu() {
    const [open, setOpen] = useState(false);
    const [openSub, setOpenSub] = useState<string | null>(null);

    return (
        <>
            <button
                aria-label="Mở menu"
                className="md:hidden p-2 text-shop-title"
                onClick={() => setOpen(true)}
            >
                <Menu size={24} />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl overflow-y-auto animate-fade-in-up">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-shop-border">
                            <span className="font-bold text-shop-title">Danh mục</span>
                            <button aria-label="Đóng menu" onClick={() => setOpen(false)}>
                                <X size={22} />
                            </button>
                        </div>
                        <div className="p-4">
                            <SearchBox />
                        </div>
                        <nav className="px-2 pb-6">
                            <div className="mb-2 grid grid-cols-2 gap-2 px-2">
                                <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-lg bg-shop-main px-3 py-2.5 text-sm font-semibold text-white">
                                    <LogIn size={17} /> Đăng nhập
                                </Link>
                                <Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-lg border border-shop-main px-3 py-2.5 text-sm font-semibold text-shop-main">
                                    <UserPlus size={17} /> Đăng ký
                                </Link>
                            </div>
                            {[
                                ["Về chúng tôi", "/pages/gioi-thieu-dalat-farm"],
                                ["Bài viết", "/blogs/news"],
                                ["Liên hệ DanaFarm", "/pages/lien-he"],
                            ].map(([label, href]) => (
                                <Link key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-shop-border/60 px-2 py-3 font-medium text-shop-title">
                                    {label}
                                </Link>
                            ))}
                            <p className="mt-5 px-2 text-xs font-bold uppercase tracking-wider text-shop-text/50">Danh mục sản phẩm</p>
                            {NAV_ITEMS.map((item) => (
                                <div key={item.slug} className="border-b border-shop-border/60">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/collections/${item.slug}`}
                                            onClick={() => setOpen(false)}
                                            className="flex-1 py-3 px-2 text-shop-title font-medium"
                                        >
                                            {item.label}
                                        </Link>
                                        {item.children && (
                                            <button
                                                aria-label={`Mở rộng ${item.label}`}
                                                className="p-3"
                                                onClick={() =>
                                                    setOpenSub(openSub === item.slug ? null : item.slug)
                                                }
                                            >
                                                <ChevronDown
                                                    size={18}
                                                    className={`transition-transform ${openSub === item.slug ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                    {item.children && openSub === item.slug && (
                                        <div className="pl-4 pb-2">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.slug}
                                                    href={`/collections/${child.slug}`}
                                                    onClick={() => setOpen(false)}
                                                    className="block py-2 px-2 text-sm text-shop-text hover:text-shop-hover"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
