"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "@/components/account/AddressForm";

export type CheckoutAddress = {
    id: number;
    recipientName: string;
    phone: string;
    provinceCode: string;
    provinceName: string;
    wardName: string;
    addressLine: string;
    isDefault: boolean;
};

export function AddressSelector({
    onSelect,
}: {
    onSelect: (address: CheckoutAddress | null) => void;
}) {
    const [addresses, setAddresses] = useState<CheckoutAddress[] | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    const loadAddresses = useCallback(
        async (preferId?: number) => {
            try {
                const response = await fetch("/api/account/addresses");
                const body = await response.json();
                if (!response.ok) throw new Error(body?.error ?? "Không thể tải địa chỉ.");
                const list: CheckoutAddress[] = body.data;
                setAddresses(list);

                const preferred =
                    (preferId ? list.find((a) => a.id === preferId) : undefined) ??
                    list.find((a) => a.isDefault) ??
                    list[0] ??
                    null;
                setSelectedId(preferred?.id ?? null);
                onSelect(preferred);
            } catch (cause) {
                toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
                setAddresses([]);
                onSelect(null);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    function selectAddress(address: CheckoutAddress) {
        setSelectedId(address.id);
        onSelect(address);
    }

    if (addresses === null) {
        return <p className="text-sm text-shop-text/60">Đang tải địa chỉ...</p>;
    }

    return (
        <div className="space-y-3">
            {addresses.length === 0 && !showForm && (
                <div className="rounded-xl border border-dashed border-shop-border bg-shop-bg p-6 text-center">
                    <p className="font-semibold text-shop-title">Bạn chưa có địa chỉ giao hàng.</p>
                    <p className="mt-1 text-sm text-shop-text/60">Thêm địa chỉ để tiếp tục đặt hàng.</p>
                </div>
            )}

            {addresses.length > 0 && (
                <ul className="space-y-3">
                    {addresses.map((address) => (
                        <li key={address.id}>
                            <label
                                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                                    selectedId === address.id
                                        ? "border-shop-main bg-shop-main/5"
                                        : "border-shop-border bg-white hover:border-shop-main/40"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="checkout-address"
                                    className="mt-1 size-4 accent-shop-main"
                                    checked={selectedId === address.id}
                                    onChange={() => selectAddress(address)}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <MapPin className="shrink-0 text-shop-main" size={16} />
                                        <p className="font-semibold text-shop-title">
                                            {address.recipientName}{" "}
                                            <span className="font-normal text-shop-text/60">· {address.phone}</span>
                                        </p>
                                        {address.isDefault && (
                                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-shop-button/40 px-2 py-0.5 text-xs font-semibold text-shop-title">
                                                <Star size={12} /> Mặc định
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-shop-text/80">
                                        {address.addressLine}, {address.wardName}, {address.provinceName}
                                    </p>
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>
            )}

            {showForm ? (
                <AddressForm
                    onSaved={(createdId) => {
                        setShowForm(false);
                        loadAddresses(createdId);
                    }}
                />
            ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-2">
                    <Plus size={16} /> Thêm địa chỉ mới
                </Button>
            )}
        </div>
    );
}
