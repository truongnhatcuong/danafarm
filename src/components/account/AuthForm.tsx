"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isRegister = mode === "register";

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload = {
            ...(isRegister ? { name: formData.get("name"), phone: formData.get("phone") } : {}),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const contentType = response.headers.get("content-type");
            const body = contentType?.includes("application/json")
                ? await response.json()
                : null;
            if (!response.ok) throw new Error(body?.error ?? "Máy chủ không thể xử lý yêu cầu.");

            toast.success(isRegister ? "Đăng ký tài khoản thành công." : "Đăng nhập thành công.");
            router.push(body?.data?.role === "ADMIN" ? "/admin" : "/account");
            router.refresh();
        } catch (cause) {
            const message = cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full rounded-lg border border-shop-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-shop-main";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
                <>
                    <div><label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-shop-title">Họ và tên</label><input id="name" name="name" required minLength={2} className={inputClass} placeholder="Nguyễn Văn A" /></div>
                    <div><label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-shop-title">Số điện thoại</label><input id="phone" name="phone" inputMode="numeric" pattern="[0-9]{9,12}" className={inputClass} placeholder="0901234567" /></div>
                </>
            )}
            <div><label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-shop-title">Email</label><input id="email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder="ban@example.com" /></div>
            <div><label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-shop-title">Mật khẩu</label><input id="password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : 1} className={inputClass} placeholder={isRegister ? "Tối thiểu 8 ký tự" : "Nhập mật khẩu"} /></div>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}</Button>
            <p className="text-center text-sm text-shop-text/65">
                {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                <Link href={isRegister ? "/login" : "/register"} className="font-bold text-shop-main hover:underline">{isRegister ? "Đăng nhập" : "Đăng ký ngay"}</Link>
            </p>
        </form>
    );
}
