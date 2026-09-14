"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "@/components/account/AddressForm";

type Address = {
    id: number;
    recipientName: string;
    phone: string;
    provinceName: string;
    wardName: string;
    addressLine: string;
    isDefault: boolean;
};

export function AddressList() {
    const [addresses, setAddresses] = useState<Address[] | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    const loadAddresses = useCallback(async () => {
        try {
            const response = await fetch("/api/account/addresses");
            const body = await response.json();
            if (!response.ok) throw new Error(body?.error ?? "Không thể tải địa chỉ.");
            setAddresses(body.data);
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
            setAddresses([]);
        }
    }, []);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    async function setDefault(id: number) {
        setBusyId(id);
        try {
            const response = await fetch(`/api/account/addresses/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDefault: true }),
            });
            if (!response.ok) throw new Error((await response.json())?.error ?? "Không thể đặt mặc định.");
            toast.success("Đã đặt làm địa chỉ mặc định.");
            await loadAddresses();
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
        } finally {
            setBusyId(null);
        }
    }

    async function removeAddress(id: number) {
        setBusyId(id);
        try {
            const response = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error((await response.json())?.error ?? "Không thể xoá địa chỉ.");
            toast.success("Đã xoá địa chỉ.");
            await loadAddresses();
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.");
        } finally {
            setBusyId(null);
        }
    }

    if (addresses === null) {
        return <p className="text-sm text-shop-text/60">Đang tải địa chỉ...</p>;
    }

    return (
        <div className="space-y-4">
            {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-shop-border bg-shop-bg p-8 text-center">
                    <p className="font-semibold text-shop-title">Bạn chưa có địa chỉ giao hàng.</p>
                    <p className="mt-2 text-sm text-shop-text/60">Thêm địa chỉ để đặt hàng nhanh hơn ở lần mua tiếp theo.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {addresses.map((address) => (
                        <li key={address.id} className="rounded-xl border border-shop-border bg-white p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex gap-3">
                                    <MapPin className="mt-0.5 shrink-0 text-shop-main" size={20} />
                                    <div>
                                        <p className="font-semibold text-shop-title">
                                            {address.recipientName} <span className="font-normal text-shop-text/60">· {address.phone}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-shop-text/80">
                                            {address.addressLine}, {address.wardName}, {address.provinceName}
                                        </p>
                                    </div>
                                </div>
                                {address.isDefault && (
                                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-shop-button/40 px-2.5 py-1 text-xs font-semibold text-shop-title">
                                        <Star size={13} /> Mặc định
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 flex gap-3">
                                {!address.isDefault && (
                                    <button
                                        type="button"
                                        onClick={() => setDefault(address.id)}
                                        disabled={busyId === address.id}
                                        className="text-sm font-semibold text-shop-main hover:underline disabled:opacity-50"
                                    >
                                        Đặt làm mặc định
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeAddress(address.id)}
                                    disabled={busyId === address.id}
                                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                                >
                                    Xoá
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {showForm ? (
                <AddressForm
                    onSaved={() => {
                        setShowForm(false);
                        loadAddresses();
                    }}
                />
            ) : (
                <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2">
                    <Plus size={17} /> Thêm địa chỉ mới
                </Button>
            )}
        </div>
    );
}
