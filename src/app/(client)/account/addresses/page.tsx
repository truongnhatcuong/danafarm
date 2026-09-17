import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressList } from "@/components/account/AddressList";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Danh sách địa chỉ | DanaFarm" };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AccountShell
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Tài khoản", href: "/account" },
            { label: "Danh sách địa chỉ" },
          ]}
        />
      }
    >
      <section className="max-w-4xl rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-10">
        <div className="flex items-center gap-3">
          <MapPin className="text-shop-main" size={28} />
          <h1 className="text-2xl font-bold uppercase text-shop-title">
            Danh sách địa chỉ
          </h1>
        </div>
        <div className="my-8">
          <AddressList />
        </div>
        <ButtonLink
          href="/account"
          variant="outline"
          className="text-xs md:text-sm"
        >
          Quay lại tài khoản
        </ButtonLink>
        <Link
          href="/collections/all"
          className="ml-4 text-xs md:text-sm font-semibold text-shop-main hover:underline"
        >
          Tiếp tục mua sắm
        </Link>
      </section>
    </AccountShell>
  );
}
