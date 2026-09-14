import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tài khoản của tôi | DanaFarm" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const joined = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <AccountShell
      breadcrumb={<Breadcrumb items={[{ label: "Tài khoản của tôi" }]} />}
    >
      <section className="max-w-4xl rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-shop-main/10 text-shop-main">
            <UserRound size={32} />
          </div>
          <div>
            <p className="text-sm text-shop-text/60">Xin chào,</p>
            <h1 className="text-2xl font-bold text-shop-title">{user.name}</h1>
          </div>
        </div>

        <div className="space-y-4 rounded-xl bg-shop-bg p-5 text-sm">
          <p className="flex items-center gap-3">
            <Mail size={19} className="text-shop-main" />
            <span>
              <b>Email:</b> {user.email}
            </span>
          </p>
          {user.phone && (
            <p className="flex items-center gap-3">
              <Phone size={19} className="text-shop-main" />
              <span>
                <b>Số điện thoại:</b> {user.phone}
              </span>
            </p>
          )}
          <p className="flex items-center gap-3">
            <CalendarDays size={19} className="text-shop-main" />
            <span>
              <b>Thành viên từ:</b> {joined}
            </span>
          </p>
        </div>
      </section>

      <section className="max-w-4xl rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-10">
        <h2 className="mb-6 text-xl font-bold text-shop-title">Đổi mật khẩu</h2>
        <ChangePasswordForm />
      </section>
    </AccountShell>
  );
}
