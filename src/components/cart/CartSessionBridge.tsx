"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function CartSessionBridge({ userId }: { userId: number | null }) {
  const activateUser = useCartStore((state) => state.activateUser);

  useEffect(() => {
    activateUser(userId);
  }, [activateUser, userId]);

  return null;
}
