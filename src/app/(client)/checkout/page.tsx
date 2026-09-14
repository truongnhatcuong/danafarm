import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
    title: "Thanh toán | DanaFarm",
    description: "Xác nhận địa chỉ, phương thức thanh toán và hoàn tất đặt hàng.",
};

export default async function CheckoutPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/checkout");

    const settings = await getPublicSiteSettings();

    return (
        <>
            <Breadcrumb items={[{ label: "Giỏ hàng", href: "/cart" }, { label: "Thanh toán" }]} />
            <Container className="py-8 md:py-12">
                <h1 className="mb-6 text-2xl font-bold uppercase text-shop-title md:text-3xl">Thanh toán</h1>
                <CheckoutClient
                    shippingConfig={{
                        originLat: settings.originLat,
                        originLng: settings.originLng,
                        freeShipThreshold: settings.freeShipThreshold,
                        shippingBaseFee: settings.shippingBaseFee,
                        shippingBaseKm: settings.shippingBaseKm,
                        shippingPerKmFee: settings.shippingPerKmFee,
                    }}
                />
            </Container>
        </>
    );
}
