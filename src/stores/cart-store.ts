"use client";

import { create } from "zustand";

export interface CartItemInput {
  productId: number;
  variantId: number | null;
  slug: string;
  name: string;
  variantName: string | null;
  imageUrl: string | null;
  unitLabel: string | null;
  price: number;
}

export interface CartItem extends CartItemInput {
  key: string;
  quantity: number;
}

interface StoredCart {
  version: 1;
  items: CartItem[];
}

interface CartState {
  activeUserId: number | null;
  items: CartItem[];
  hydrated: boolean;
  activateUser: (userId: number | null) => void;
  addItem: (item: CartItemInput, quantity?: number) => boolean;
  setQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const STORAGE_PREFIX = "danafarm-cart-user-";

export function getCartItemKey(productId: number, variantId: number | null) {
  return `${productId}:${variantId ?? "base"}`;
}

function storageKey(userId: number) {
  return `${STORAGE_PREFIX}${userId}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.key === "string" &&
    typeof item.productId === "number" &&
    (typeof item.variantId === "number" || item.variantId === null) &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    (typeof item.variantName === "string" || item.variantName === null) &&
    (typeof item.imageUrl === "string" || item.imageUrl === null) &&
    (typeof item.unitLabel === "string" || item.unitLabel === null) &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function loadItems(userId: number): CartItem[] {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<StoredCart>;
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) return [];
    return parsed.items.filter(isCartItem);
  } catch {
    return [];
  }
}

function saveItems(userId: number, items: CartItem[]) {
  try {
    const value: StoredCart = { version: 1, items };
    window.localStorage.setItem(storageKey(userId), JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode or when the quota is full.
  }
}

function updateAndPersist(
  state: CartState,
  updater: (items: CartItem[]) => CartItem[],
): Pick<CartState, "items"> {
  if (state.activeUserId === null) return { items: state.items };
  const items = updater(state.items);
  saveItems(state.activeUserId, items);
  return { items };
}

export const useCartStore = create<CartState>((set, get) => ({
  activeUserId: null,
  items: [],
  hydrated: false,

  activateUser: (userId) => {
    if (userId === null) {
      set({ activeUserId: null, items: [], hydrated: true });
      return;
    }

    set({ activeUserId: userId, items: loadItems(userId), hydrated: true });
  },

  addItem: (input, quantity = 1) => {
    const state = get();
    if (state.activeUserId === null) return false;

    const key = getCartItemKey(input.productId, input.variantId);
    const amount = Math.max(1, Math.floor(quantity));
    set((current) =>
      updateAndPersist(current, (items) => {
        const existing = items.find((item) => item.key === key);
        if (!existing) return [...items, { ...input, key, quantity: amount }];
        return items.map((item) =>
          item.key === key
            ? { ...item, ...input, quantity: item.quantity + amount }
            : item,
        );
      }),
    );
    return true;
  },

  setQuantity: (key, quantity) => {
    const amount = Math.max(1, Math.floor(quantity));
    set((state) =>
      updateAndPersist(state, (items) =>
        items.map((item) =>
          item.key === key ? { ...item, quantity: amount } : item,
        ),
      ),
    );
  },

  increment: (key) => {
    set((state) =>
      updateAndPersist(state, (items) =>
        items.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      ),
    );
  },

  decrement: (key) => {
    set((state) =>
      updateAndPersist(state, (items) =>
        items.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item,
        ),
      ),
    );
  },

  removeItem: (key) => {
    set((state) =>
      updateAndPersist(state, (items) =>
        items.filter((item) => item.key !== key),
      ),
    );
  },

  clear: () => {
    set((state) => updateAndPersist(state, () => []));
  },
}));

export function deactivateCart() {
  useCartStore.getState().activateUser(null);
}
