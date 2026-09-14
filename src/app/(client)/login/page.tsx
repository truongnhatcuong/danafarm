import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/account/AuthForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đăng nhập | DanaFarm" };

export default async function LoginPage() {
    const user = await getCurrentUser();
    if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");
    return <><Breadcrumb items={[{ label: "Đăng nhập" }]} /><Container className="py-10 md:py-16"><section className="mx-auto max-w-md rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-9"><h1 className="text-center text-2xl font-bold uppercase text-shop-title">Đăng nhập</h1><p className="mb-7 mt-2 text-center text-sm text-shop-text/60">Đăng nhập để quản lý tài khoản DanaFarm</p><AuthForm mode="login" /></section></Container></>;
}
