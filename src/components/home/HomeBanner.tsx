"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Banner } from "@/types";

export function HomeBanner({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="pt-4 md:pt-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="group relative overflow-hidden rounded-xl bg-shop-bg">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            slidesPerView={1}
            loop={banners.length > 1}
            autoplay={
              banners.length > 1
                ? {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            navigation={{
              prevEl: ".home-banner-prev",
              nextEl: ".home-banner-next",
            }}
            pagination={banners.length > 1 ? { clickable: true } : false}
            className="home-banner-swiper"
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={banner.id}>
                <Link
                  href={banner.link || "#"}
                  className="relative block aspect-[16/8] w-full overflow-hidden md:aspect-[21/7]"
                  aria-label={banner.title ?? `Banner ${index + 1}`}
                >
                  {banner.imageMobileUrl && (
                    <Image
                      src={banner.imageMobileUrl}
                      alt={banner.title ?? "DanaFarm banner"}
                      fill
                      priority={index === 0}
                      quality={92}
                      className="object-cover md:hidden"
                    />
                  )}
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title ?? "DanaFarm banner"}
                    fill
                    priority={index === 0}
                    quality={92}
                    className={`object-cover ${banner.imageMobileUrl ? "hidden md:block" : ""}`}
                  />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {banners.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Banner trước"
                className="home-banner-prev absolute left-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-shop-title opacity-0 shadow-md transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="Banner tiếp theo"
                className="home-banner-next absolute right-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-shop-title opacity-0 shadow-md transition hover:bg-white group-hover:opacity-100 focus:opacity-100"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
