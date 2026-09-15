import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pathname: string;
  query?: Record<string, string | undefined>;
  className?: string;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push(previousPage === 1 ? "ellipsis-start" : "ellipsis-end");
    }
    items.push(page);
  });

  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  pathname,
  query = {},
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function createHref(page: number) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  }

  const linkClass =
    "inline-flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors";

  return (
    <nav
      aria-label="Phân trang"
      className={cn(
        "mt-10 flex flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      {currentPage > 1 ? (
        <Link
          href={createHref(currentPage - 1)}
          aria-label="Trang trước"
          rel="prev"
          className={cn(
            linkClass,
            "border-shop-border bg-white text-shop-title hover:border-shop-main hover:text-shop-main",
          )}
        >
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={cn(
            linkClass,
            "cursor-not-allowed border-shop-border bg-shop-bg text-shop-text/30",
          )}
        >
          <ChevronLeft size={18} />
        </span>
      )}

      {getPageItems(currentPage, totalPages).map((item) =>
        typeof item === "number" ? (
          <Link
            key={item}
            href={createHref(item)}
            aria-label={`Trang ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            className={cn(
              linkClass,
              item === currentPage
                ? "border-shop-main bg-shop-main text-white"
                : "border-shop-border bg-white text-shop-title hover:border-shop-main hover:text-shop-main",
            )}
          >
            {item}
          </Link>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="inline-flex size-10 items-center justify-center text-shop-text/50"
          >
            …
          </span>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={createHref(currentPage + 1)}
          aria-label="Trang sau"
          rel="next"
          className={cn(
            linkClass,
            "border-shop-border bg-white text-shop-title hover:border-shop-main hover:text-shop-main",
          )}
        >
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={cn(
            linkClass,
            "cursor-not-allowed border-shop-border bg-shop-bg text-shop-text/30",
          )}
        >
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}
