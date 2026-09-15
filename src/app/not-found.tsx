import Link from "next/link";
import { ArrowLeft, Home, SearchX, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-shop-bg px-4 py-16">
      <div
        aria-hidden="true"
        className="absolute -left-24 -top-24 size-80 rounded-full bg-shop-main/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-24 size-96 rounded-full bg-orange-300/20 blur-3xl"
      />

      <section className="relative w-full max-w-2xl rounded-3xl border border-shop-border bg-white px-6 py-12 text-center shadow-xl shadow-shop-main/5 sm:px-12 sm:py-16">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-shop-main/10 text-shop-main">
          <SearchX size={38} strokeWidth={1.8} />
        </div>

        <p className="mt-7 font-serif text-7xl font-bold leading-none text-shop-main sm:text-8xl">
          404
        </p>
        <h1 className="mt-5 text-2xl font-bold text-shop-title sm:text-3xl">
          Không tìm thấy trang
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-shop-text/65 sm:text-base">
          Trang bạn đang tìm kiếm không tồn tại, đã được di chuyển hoặc đường
          dẫn không còn hợp lệ.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-shop-main px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-shop-main/90"
          >
            <Home size={18} /> Về trang chủ
          </Link>
          <Link
            href="/collections/all"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-shop-main bg-white px-6 py-3 text-sm font-bold text-shop-main transition hover:bg-shop-main hover:text-white"
          >
            <ShoppingBag size={18} /> Xem sản phẩm
          </Link>
        </div>

        <Link
          href="/blogs/news"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-shop-text/55 transition hover:text-shop-main"
        >
          <ArrowLeft size={15} /> Khám phá bài viết DanaFarm
        </Link>
      </section>
    </main>
  );
}
