"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import Image from "next/image";

export interface NavCategoryItem {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  children?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "hop-qua-tra-ca-phe-dalatfarm":
    "https://theme.hstatic.net/200000076583/1001285352/14/img_sidebar_menu_1.png?v=503",
  tra: "https://theme.hstatic.net/200000076583/1001285352/14/img_sidebar_menu_2.png?v=503",
  "ca-phe-cau-dat":
    "https://theme.hstatic.net/200000076583/1001285352/14/img_sidebar_menu_3.png?v=503",
  "bot-matcha":
    "https://theme.hstatic.net/200000076583/1001285352/14/img_sidebar_menu_4.png?v=503",
  "dac-san-da-lat-1":
    "https://theme.hstatic.net/200000076583/1001285352/14/img_sidebar_menu_5.png?v=503",
  "hat-dinh-duong":
    "https://theme.hstatic.net/200000076583/1001285352/14/img_sidebar_menu_6.png?v=503",
};

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("//")) return "https:" + trimmed;
  return trimmed;
}

export function getCategoryImageUrl(cat: {
  imageUrl?: string | null;
  slug: string;
  name: string;
}): string {
  const normalized = normalizeImageUrl(cat.imageUrl);
  if (normalized) return normalized;

  if (CATEGORY_IMAGE_MAP[cat.slug]) return CATEGORY_IMAGE_MAP[cat.slug];
  const lower = cat.name.toLowerCase();
  if (lower.includes("quà"))
    return CATEGORY_IMAGE_MAP["hop-qua-tra-ca-phe-dalatfarm"];
  if (lower.includes("trà") || lower.includes("chè"))
    return CATEGORY_IMAGE_MAP["tra"];
  if (
    lower.includes("cà phê") ||
    lower.includes("cafe") ||
    lower.includes("coffee")
  )
    return CATEGORY_IMAGE_MAP["ca-phe-cau-dat"];
  if (lower.includes("matcha")) return CATEGORY_IMAGE_MAP["bot-matcha"];
  if (
    lower.includes("trái cây") ||
    lower.includes("sấy") ||
    lower.includes("hoa quả")
  )
    return CATEGORY_IMAGE_MAP["dac-san-da-lat-1"];
  if (lower.includes("hạt") || lower.includes("dinh dưỡng"))
    return CATEGORY_IMAGE_MAP["hat-dinh-duong"];
  return CATEGORY_IMAGE_MAP["hop-qua-tra-ca-phe-dalatfarm"];
}

export function CategoryNavMenu({
  categories,
}: {
  categories: NavCategoryItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveSlug(null);
  }, [pathname]);

  // Handle click outside and Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSlug(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActiveSlug(null);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <div ref={menuRef} className="relative select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (next && !activeSlug) {
              // Pre-select first category that has children for great UX
              const firstWithChildren = categories.find(
                (c) => c.children && c.children.length > 0,
              );
              setActiveSlug(
                firstWithChildren
                  ? firstWithChildren.slug
                  : (categories[0]?.slug ?? null),
              );
            }
            return next;
          });
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 py-4 pr-6 text-sm font-bold text-white transition-colors hover:text-white/85 cursor-pointer lg:text-base"
      >
        <Menu size={24} className="shrink-0" />
        <span>DANH MỤC SẢN PHẨM</span>
        <ChevronDown
          size={17}
          className={cn(
            "transition-transform duration-200 opacity-85",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 flex rounded-b-xl border border-shop-border bg-white text-shop-text shadow-2xl animate-fade-in-up"
          style={{ minHeight: "360px" }}
          onMouseLeave={() => {
            // Keep current active category so menu doesn't jitter
          }}
        >
          {/* Left Panel: Parent Categories */}
          <div className="w-64 py-2 bg-white flex flex-col shrink-0">
            {categories.map((cat) => {
              const hasChildren = Boolean(
                cat.children && cat.children.length > 0,
              );
              const isActive = activeSlug === cat.slug;
              const iconUrl = getCategoryImageUrl(cat);

              return (
                <div
                  key={cat.slug}
                  onMouseEnter={() => setActiveSlug(cat.slug)}
                  className="relative"
                >
                  <Link
                    href={`/collections/${cat.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-shop-bg/70 hover:text-shop-main",
                      isActive
                        ? "bg-shop-bg text-shop-main font-semibold"
                        : "text-shop-title",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-md bg-shop-bg border border-shop-border/70 flex items-center justify-center">
                        <Image
                          src={iconUrl}
                          alt={cat.name}
                          fill
                          sizes="28px"
                          quality={90}
                          className="object-cover"
                        />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </div>

                    {hasChildren && (
                      <ChevronRight
                        size={16}
                        className={cn(
                          "shrink-0 transition-all",
                          isActive
                            ? "text-shop-main translate-x-0.5"
                            : "text-shop-title/40",
                        )}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Child Categories */}
          {activeCategory?.children && activeCategory.children.length > 0 && (
            <div className="w-72 border-l border-shop-border/70 bg-white p-3 py-3 flex flex-col justify-start shrink-0 animate-fade-in">
              <div className="px-3 pb-2 mb-1 border-b border-shop-border/40">
                <Link
                  href={`/collections/${activeCategory.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-shop-main hover:underline flex items-center justify-between"
                >
                  <span>Xem tất cả {activeCategory.name}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-0.5 overflow-y-auto max-h-[420px]">
                {activeCategory.children.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/collections/${child.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-shop-title hover:bg-shop-bg hover:text-shop-main transition-colors"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
