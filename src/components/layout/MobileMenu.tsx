"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  LogIn,
  UserPlus,
  UserRound,
  Package,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { deactivateCart } from "@/stores/cart-store";
import { SearchBox } from "./SearchBox";
import { getCategoryImageUrl, type NavCategoryItem } from "./CategoryNavMenu";

export type MobileMenuUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
} | null;

export function MobileMenu({
  categories,
  user,
}: {
  categories?: NavCategoryItem[];
  user?: MobileMenuUser;
} = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      deactivateCart();
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const navList: {
    label: string;
    slug: string;
    imageUrl?: string | null;
    children?: { label: string; slug: string }[];
  }[] =
    categories && categories.length > 0
      ? categories.map((c) => ({
        label: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
        children: c.children?.map((ch) => ({
          label: ch.name,
          slug: ch.slug,
        })),
      }))
      : NAV_ITEMS.map((item) => ({
        label: item.label,
        slug: item.slug,
        imageUrl: null,
        children: item.children?.map((ch) => ({
          label: ch.label,
          slug: ch.slug,
        })),
      }));

  return (
    <>
      <button
        aria-label="Mở menu"
        className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
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
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white text-shop-text shadow-xl overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-shop-border">
              <span className="font-bold text-shop-title">Danh mục</span>
              <button
                aria-label="Đóng menu"
                onClick={() => setOpen(false)}
                className="p-1 text-shop-title hover:text-shop-hover transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-4 border-b border-shop-border/40">
              <SearchBox className="border-shop-border" />
            </div>
            <nav className="px-2 pb-6">
              {user ? (
                <div className="mb-3 border-b border-shop-border/60 pb-3">
                  <div className="mx-2 mb-2 flex items-center gap-3 rounded-xl bg-shop-bg/70 p-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-shop-main text-base font-bold text-white shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-shop-title">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-shop-text/60">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-0.5 px-1">
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium !text-shop-title transition-colors hover:bg-shop-bg hover:!text-shop-main"
                    >
                      <UserRound size={17} className="text-shop-main" /> Tài khoản của tôi
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium !text-shop-title transition-colors hover:bg-shop-bg hover:!text-shop-main"
                    >
                      <Package size={17} className="text-shop-main" /> Đơn hàng của tôi
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium !text-shop-title transition-colors hover:bg-shop-bg hover:!text-shop-main"
                      >
                        <ShieldCheck size={17} className="text-purple-600" /> Quản trị website
                      </Link>
                    )}
                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                    >
                      <LogOut size={17} /> {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 grid grid-cols-2 gap-2 px-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-shop-main px-3 py-2.5 text-sm font-semibold !text-white shadow-sm transition-colors hover:bg-shop-hover"
                  >
                    <LogIn size={17} /> Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-shop-main px-3 py-2.5 text-sm font-semibold !text-shop-main transition-colors hover:bg-shop-main/10"
                  >
                    <UserPlus size={17} /> Đăng ký
                  </Link>
                </div>
              )}
              {[
                ["Về chúng tôi", "/pages/gioi-thieu-dalat-farm"],
                ["Bài viết", "/blogs/news"],
                ["Liên hệ DanaFarm", "/pages/lien-he"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-shop-border/60 px-2 py-3 font-medium !text-shop-title hover:!text-shop-main transition-colors"
                >
                  {label}
                </Link>
              ))}
              <p className="mt-5 px-2 text-xs font-bold uppercase tracking-wider text-shop-text/50">
                Danh mục sản phẩm
              </p>
              {navList.map((item) => (
                <div key={item.slug} className="border-b border-shop-border/60">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/collections/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 flex-1 py-3 px-2 !text-shop-title font-medium hover:!text-shop-main transition-colors"
                    >
                      <div className="relative size-6 shrink-0 overflow-hidden rounded-md bg-shop-bg border border-shop-border/70 flex items-center justify-center">
                        <Image
                          src={getCategoryImageUrl({
                            imageUrl: item.imageUrl,
                            slug: item.slug,
                            name: item.label,
                          })}
                          alt={item.label}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <span>{item.label}</span>
                    </Link>
                    {item.children && item.children.length > 0 && (
                      <button
                        aria-label={`Mở rộng ${item.label}`}
                        className="p-3 text-shop-title hover:text-shop-main transition-colors"
                        onClick={() =>
                          setOpenSub(openSub === item.slug ? null : item.slug)
                        }
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${openSub === item.slug ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                    )}
                  </div>
                  {item.children &&
                    item.children.length > 0 &&
                    openSub === item.slug && (
                      <div className="pl-4 pb-2 bg-shop-bg/40 rounded-lg my-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.slug}
                            href={`/collections/${child.slug}`}
                            onClick={() => setOpen(false)}
                            className="block py-2 px-2 text-sm !text-shop-text hover:!text-shop-main transition-colors"
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
