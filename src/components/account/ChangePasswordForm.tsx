"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-lg border border-shop-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-shop-main";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body?.error ?? "Không thể đổi mật khẩu.");

      toast.success("Đã đổi mật khẩu thành công.");
      form.reset();
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Không thể kết nối tới máy chủ.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-1.5 block text-sm font-semibold text-shop-title"
        >
          Mật khẩu hiện tại
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu hiện tại"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="mb-1.5 block text-sm font-semibold text-shop-title"
        >
          Mật khẩu mới
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Tối thiểu 8 ký tự"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-semibold text-shop-title"
        >
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Tối thiểu 8 ký tự"
          minLength={8}
          className={inputClass}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Đang lưu..." : "Đổi mật khẩu"}
      </Button>
    </form>
  );
}
