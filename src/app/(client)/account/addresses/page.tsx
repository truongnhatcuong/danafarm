import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Danh sách địa chỉ | DanaFarm" };

export default async function AddressesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return (
        <>
            <Breadcrumb items={[{ label: "Tài khoản", href: "/account" }, { label: "Danh sách địa chỉ" }]} />
            <Container className="py-10 md:py-14">
                <section className="mx-auto max-w-2xl rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-10">
                    <div className="flex items-center gap-3">
                        <MapPin className="text-shop-main" size={28} />
                        <h1 className="text-2xl font-bold uppercase text-shop-title">Danh sách địa chỉ</h1>
                    </div>
                    <div className="my-8 rounded-xl border border-dashed border-shop-border bg-shop-bg p-8 text-center">
                        <p className="font-semibold text-shop-title">Bạn chưa có địa chỉ giao hàng.</p>
                        <p className="mt-2 text-sm text-shop-text/60">Tính năng thêm địa chỉ sẽ được bổ sung trong bước quản lý đơn hàng.</p>
                    </div>
                    <ButtonLink href="/account" variant="outline">Quay lại tài khoản</ButtonLink>
                    <Link href="/collections/all" className="ml-4 text-sm font-semibold text-shop-main hover:underline">Tiếp tục mua sắm</Link>
                </section>
            </Container>
        </>
    );
}
