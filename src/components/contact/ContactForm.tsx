"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("submitting");
        setError(null);

        const form = e.currentTarget;
        const data = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
            message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error ?? "Gửi liên hệ thất bại, vui lòng thử lại.");
            }
            setStatus("success");
            form.reset();
        } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
        }
    }

    if (status === "success") {
        return (
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 p-4 text-sm">
                Cảm ơn bạn đã liên hệ! DanaFarm sẽ phản hồi sớm nhất có thể.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-shop-title mb-1">
                    Họ và tên
                </label>
                <input
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-lg border border-shop-border px-4 py-2.5 text-sm outline-none focus:border-shop-main"
                    placeholder="Nhập họ và tên"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-shop-title mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-lg border border-shop-border px-4 py-2.5 text-sm outline-none focus:border-shop-main"
                        placeholder="Nhập email"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-shop-title mb-1">
                        Số điện thoại
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        pattern="[0-9]{9,12}"
                        className="w-full rounded-lg border border-shop-border px-4 py-2.5 text-sm outline-none focus:border-shop-main"
                        placeholder="Nhập số điện thoại"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-shop-title mb-1">
                    Nội dung
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full rounded-lg border border-shop-border px-4 py-2.5 text-sm outline-none focus:border-shop-main resize-none"
                    placeholder="Nhập nội dung liên hệ"
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Đang gửi..." : "Gửi liên hệ"}
            </Button>
        </form>
    );
}
