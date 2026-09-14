"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { deactivateCart } from "@/stores/cart-store";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    deactivateCart();
    router.push("/login");
    router.refresh();
  }
  return (
    <Button variant="outline" onClick={logout} disabled={loading}>
      {loading ? "Đang đăng xuất..." : "Đăng xuất"}
    </Button>
  );
}
