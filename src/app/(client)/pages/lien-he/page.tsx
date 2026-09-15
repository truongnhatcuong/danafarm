import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SITE_INFO } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Liên hệ | DanaFarm",
  description:
    "Liên hệ DanaFarm để được tư vấn về trà, cà phê và đặc sản Đà Lạt.",
};

const MAP_ADDRESS =
  "47 Mạc Thiên Tích, Phường Khuê Mỹ, Quận Ngũ Hành Sơn, Đà Nẵng, Việt Nam";
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps?ll=16.02025,108.242472&z=13&t=m&hl=vi-VN&gl=VN&mapclient=embed&q=47+M%E1%BA%A1c+Thi%C3%AAn+T%C3%ADch,+Ph%C6%B0%E1%BB%9Dng+Khu%C3%AA+M%E1%BB%B9,+Qu%E1%BA%ADn+Ng%C5%A9+H%C3%A0nh+S%C6%A1n,+Da+Nang,+Vietnam";
const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?q=16.02025,108.242472&z=13&hl=vi&output=embed";

export default async function ContactPage() {
  const settings = await prisma.siteSetting.findFirst();
  const info = settings ?? SITE_INFO;

  return (
    <>
      <Breadcrumb items={[{ label: "Liên hệ" }]} />

      <Container className="py-8 md:py-12">
        <section className="mb-10 overflow-hidden rounded-2xl border border-shop-border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-shop-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-shop-title">
                <MapPin size={20} className="text-shop-main" /> Vị trí của chúng
                tôi
              </h2>
              <p className="mt-1 text-sm leading-6 text-shop-text/65">
                {MAP_ADDRESS}
              </p>
            </div>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-shop-main px-4 py-2 text-sm font-semibold text-shop-main transition-colors hover:bg-shop-main hover:text-white"
            >
              Mở Google Maps <ExternalLink size={15} />
            </a>
          </div>
          <div className="relative aspect-[16/10] w-full bg-shop-bg sm:aspect-[16/7] lg:aspect-[21/7]">
            <iframe
              src={GOOGLE_MAPS_EMBED_URL}
              title={`Bản đồ ${MAP_ADDRESS}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <section>
            <p className="text-sm font-semibold uppercase tracking-widest text-shop-main">
              DanaFarm
            </p>
            <h1 className="mt-2 text-3xl font-bold text-shop-title">
              Liên hệ với chúng tôi
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-shop-text/70">
              DanaFarm luôn sẵn sàng tư vấn và tiếp nhận phản hồi để mang đến
              trải nghiệm tốt hơn cho khách hàng.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex gap-4 rounded-xl border border-shop-border bg-white p-4">
                <MapPin className="mt-0.5 shrink-0 text-shop-main" size={22} />
                <div>
                  <h2 className="font-bold text-shop-title">Địa chỉ</h2>
                  <p className="mt-1 text-sm leading-6 text-shop-text/70">
                    {info.addressBusiness}
                  </p>
                </div>
              </div>
              <a
                href={`tel:${info.phone}`}
                className="flex gap-4 rounded-xl border border-shop-border bg-white p-4 hover:border-shop-main"
              >
                <Phone className="shrink-0 text-shop-main" size={22} />
                <div>
                  <h2 className="font-bold text-shop-title">Hotline</h2>
                  <p className="mt-1 text-sm text-shop-text/70">{info.phone}</p>
                </div>
              </a>
              <a
                href={`mailto:${info.email}`}
                className="flex gap-4 rounded-xl border border-shop-border bg-white p-4 hover:border-shop-main"
              >
                <Mail className="shrink-0 text-shop-main" size={22} />
                <div>
                  <h2 className="font-bold text-shop-title">Email</h2>
                  <p className="mt-1 text-sm text-shop-text/70">{info.email}</p>
                </div>
              </a>
            </div>
          </section>
          <section className="rounded-2xl border border-shop-border bg-white p-5 shadow-sm md:p-8">
            <h2 className="mb-6 text-xl font-bold uppercase text-shop-title">
              Gửi thông tin liên hệ
            </h2>
            <ContactForm />
          </section>
        </div>
      </Container>
    </>
  );
}
