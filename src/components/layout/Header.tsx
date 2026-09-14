import Image from "next/image";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";
import { CategoryNavMenu } from "./CategoryNavMenu";
import { NavLogoutButton } from "@/components/account/NavLogoutButton";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NAV_ITEMS } from "@/lib/constants";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { formatCurrency } from "@/lib/utils";

const utilityLinks = [
  { label: "VỀ CHÚNG TÔI", href: "/pages/gioi-thieu-dalat-farm" },
  { label: "BÀI VIẾT", href: "/blogs/news" },
  { label: "LIÊN HỆ DANAFARM", href: "/pages/lien-he" },
  { label: "CHĂM SÓC KHÁCH HÀNG", href: "/pages/chinh-sach-giao-hang" },
];

export async function Header() {
  const [user, dbCategories, siteInfo] = await Promise.all([
    getCurrentUser(),
    prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    }),
    getPublicSiteSettings(),
  ]);

  const categories =
    dbCategories.length > 0
      ? dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
          children: c.children.map((ch) => ({
            id: ch.id,
            name: ch.name,
            slug: ch.slug,
          })),
        }))
      : NAV_ITEMS.map((item, idx) => ({
          id: idx + 1,
          name: item.label,
          slug: item.slug,
          children: item.children?.map((ch, chIdx) => ({
            id: (idx + 1) * 100 + chIdx,
            name: ch.label,
            slug: ch.slug,
          })),
        }));

  return (
    <header id="site-header" className="relative z-40 shadow-sm">
      <div className="bg-shop-main text-white">
        <Container className="flex min-h-16 items-center gap-3 py-2 md:min-h-28 md:gap-7 md:py-4">
          <MobileMenu categories={categories} />
          <Link href="/" className="shrink-0" aria-label="DanaFarm - Trang chủ">
            <Image
              src={"/logo.png"}
              alt="DanaFarm"
              width={150}
              height={75}
              quality={100}
              className="h-10 w-auto brightness-0 invert md:h-[67px] 2xl:h-[55px]"
              priority
            />
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <SearchBox />
            <div className="mt-3 flex items-center justify-center gap-7 text-xs lg:gap-10 lg:text-sm">
              <span className="flex items-center gap-2">
                <Award size={20} /> Đảm bảo chất lượng
              </span>
              <span className="flex items-center gap-2">
                <Truck size={22} /> Miễn phí vận chuyển từ{" "}
                {formatCurrency(siteInfo.freeShipThreshold)}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={21} /> Mở hộp kiểm tra nhận hàng
              </span>
            </div>
          </div>

          <div className="ml-auto hidden shrink-0 items-center divide-x divide-white/20 lg:flex">
            <a
              href={`tel:${siteInfo.phone}`}
              className="flex items-center gap-3 px-5 text-sm hover:text-white/80"
            >
              <Phone size={27} fill="currentColor" />
              <span>
                Tư vấn và hỗ trợ
                <br />
                <b>{siteInfo.phone}</b>
              </span>
            </a>
            <div className="group relative px-5 py-2">
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 text-sm hover:text-white/80"
                  >
                    <UserRound size={29} />
                    <span>
                      Tài khoản của tôi
                      <br />
                      <b className="flex max-w-44 items-center gap-1 truncate">
                        {user.name}{" "}
                        <ChevronDown size={15} className="shrink-0" />
                      </b>
                    </span>
                  </Link>
                  <div className="invisible absolute right-3 top-full z-50 w-64 translate-y-2 rounded-md border border-shop-border bg-white p-4 text-shop-text opacity-0 shadow-xl transition-all before:absolute before:-top-2 before:right-10 before:size-4 before:rotate-45 before:border-l before:border-t before:border-shop-border before:bg-white group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="border-b border-shop-border pb-3 text-center text-base font-bold uppercase text-shop-title">
                      Thông tin tài khoản
                    </p>
                    <p className="px-3 pb-2 pt-4 font-semibold text-shop-title">
                      {user.name}
                    </p>
                    <Link
                      href="/account"
                      className="block rounded-md px-3 py-2 text-sm hover:bg-shop-bg hover:text-shop-main"
                    >
                      • &nbsp;Tài khoản của tôi
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="block rounded-md px-3 py-2 text-sm hover:bg-shop-bg hover:text-shop-main"
                    >
                      • &nbsp;Danh sách địa chỉ
                    </Link>
                    <div className="pl-3">
                      <NavLogoutButton />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <UserRound size={29} />
                  <span>
                    <Link
                      href="/login"
                      className="font-semibold hover:text-white/80"
                    >
                      Đăng nhập
                    </Link>
                    {" / "}
                    <Link
                      href="/register"
                      className="font-semibold hover:text-white/80"
                    >
                      Đăng ký
                    </Link>
                  </span>
                </div>
              )}
            </div>
            <CartHeaderLink />
          </div>
          <div className="ml-auto md:hidden">
            <CartHeaderLink mobile />
          </div>
        </Container>
      </div>

      <nav className="hidden bg-[#eb9362] text-white md:block">
        <Container>
          <ul className="flex min-h-14 items-center">
            <li className="mr-auto relative">
              <CategoryNavMenu categories={categories} />
            </li>
            {utilityLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-4 text-sm font-medium transition-colors hover:bg-white/10 lg:px-6 lg:text-base"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
      <div className="bg-shop-main px-4 pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
