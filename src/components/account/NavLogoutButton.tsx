"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deactivateCart } from "@/stores/cart-store";

export function NavLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      deactivateCart();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-shop-bg hover:text-shop-main disabled:opacity-60"
    >
      {loading ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
