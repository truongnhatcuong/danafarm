import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
    title: "Thanh toán | DanaFarm",
    description: "Xác nhận địa chỉ, phương thức thanh toán và hoàn tất đặt hàng.",
};

export default async function CheckoutPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/checkout");

    const now = new Date();
    const [settings, voucherRows, usages] = await Promise.all([
        getPublicSiteSettings(),
        prisma.voucher.findMany({
            where: {
                isActive: true,
                startsAt: { lte: now },
                expiresAt: { gte: now },
            },
            orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        }),
        prisma.voucherUsage.findMany({
            where: { userId: user.id },
            select: { voucherId: true },
        }),
    ]);
    const usedVoucherIds = new Set(usages.map((usage) => usage.voucherId));
    const vouchers = voucherRows
        .filter(
            (voucher) =>
                !usedVoucherIds.has(voucher.id) &&
                (voucher.usageLimit == null || voucher.usedCount < voucher.usageLimit),
        )
        .map((voucher) => ({
            id: voucher.id,
            code: voucher.code,
            title: voucher.title,
            description: voucher.description,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            minOrderValue: voucher.minOrderValue,
            maxDiscount: voucher.maxDiscount,
            expiresAt: voucher.expiresAt.toISOString(),
        }));

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
                    vouchers={vouchers}
                />
            </Container>
        </>
    );
}
