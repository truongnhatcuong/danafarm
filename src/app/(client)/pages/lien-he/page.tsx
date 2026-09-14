import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SITE_INFO } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Liên hệ | DanaFarm",
    description: "Liên hệ DanaFarm để được tư vấn về trà, cà phê và đặc sản Đà Lạt.",
};

export default async function ContactPage() {
    const settings = await prisma.siteSetting.findFirst();
    const info = settings ?? SITE_INFO;

    return (
        <>
            <Breadcrumb items={[{ label: "Liên hệ" }]} />
            <Container className="py-8 md:py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                    <section>
                        <p className="text-sm font-semibold uppercase tracking-widest text-shop-main">DanaFarm</p>
                        <h1 className="mt-2 text-3xl font-bold text-shop-title">Liên hệ với chúng tôi</h1>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-shop-text/70">
                            DanaFarm luôn sẵn sàng tư vấn và tiếp nhận phản hồi để mang đến trải nghiệm tốt hơn cho khách hàng.
                        </p>
                        <div className="mt-8 space-y-4">
                            <div className="flex gap-4 rounded-xl border border-shop-border bg-white p-4">
                                <MapPin className="mt-0.5 shrink-0 text-shop-main" size={22} />
                                <div><h2 className="font-bold text-shop-title">Địa chỉ</h2><p className="mt-1 text-sm leading-6 text-shop-text/70">{info.addressBusiness}</p></div>
                            </div>
                            <a href={`tel:${info.phone}`} className="flex gap-4 rounded-xl border border-shop-border bg-white p-4 hover:border-shop-main">
                                <Phone className="shrink-0 text-shop-main" size={22} />
                                <div><h2 className="font-bold text-shop-title">Hotline</h2><p className="mt-1 text-sm text-shop-text/70">{info.phone}</p></div>
                            </a>
                            <a href={`mailto:${info.email}`} className="flex gap-4 rounded-xl border border-shop-border bg-white p-4 hover:border-shop-main">
                                <Mail className="shrink-0 text-shop-main" size={22} />
                                <div><h2 className="font-bold text-shop-title">Email</h2><p className="mt-1 text-sm text-shop-text/70">{info.email}</p></div>
                            </a>
                        </div>
                    </section>
                    <section className="rounded-2xl border border-shop-border bg-white p-5 shadow-sm md:p-8">
                        <h2 className="mb-6 text-xl font-bold uppercase text-shop-title">Gửi thông tin liên hệ</h2>
                        <ContactForm />
                    </section>
                </div>
            </Container>
        </>
    );
}
