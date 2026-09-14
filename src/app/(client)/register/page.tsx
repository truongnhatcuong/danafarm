import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/account/AuthForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đăng ký | DanaFarm" };

export default async function RegisterPage() {
    if (await getCurrentUser()) redirect("/account");
    return <><Breadcrumb items={[{ label: "Đăng ký" }]} /><Container className="py-10 md:py-16"><section className="mx-auto max-w-md rounded-2xl border border-shop-border bg-white p-6 shadow-sm md:p-9"><h1 className="text-center text-2xl font-bold uppercase text-shop-title">Tạo tài khoản</h1><p className="mb-7 mt-2 text-center text-sm text-shop-text/60">Đăng ký thành viên DanaFarm</p><AuthForm mode="register" /></section></Container></>;
}
