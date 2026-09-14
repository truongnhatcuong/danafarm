"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { fetchProvinces, fetchWardsByProvince, type VnProvince, type VnWard } from "@/lib/vn-address";

const inputClass =
    "w-full rounded-lg border border-shop-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-shop-main";

export function AddressForm({ onSaved }: { onSaved: (createdId?: number) => void }) {
    const [provinces, setProvinces] = useState<VnProvince[]>([]);
    const [wards, setWards] = useState<VnWard[]>([]);
    const [provinceCode, setProvinceCode] = useState("");
    const [wardCode, setWardCode] = useState("");
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingWards, setLoadingWards] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProvinces()
            .then((data) => setProvinces(data.sort((a, b) => a.name.localeCompare(b.name))))
            .catch(() => setError("Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại."))
            .finally(() => setLoadingProvinces(false));
    }, []);

    useEffect(() => {
        if (!provinceCode) {
            setWards([]);
            setWardCode("");
            return;
        }
        setLoadingWards(true);
        setWardCode("");
        fetchWardsByProvince(provinceCode)
            .then((data) => setWards(data.sort((a, b) => a.name.localeCompare(b.name))))
            .catch(() => setError("Không thể tải danh sách phường/xã. Vui lòng thử lại."))
            .finally(() => setLoadingWards(false));
    }, [provinceCode]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const province = provinces.find((p) => String(p.code) === provinceCode);
        const ward = wards.find((w) => String(w.code) === wardCode);
        if (!province || !ward) {
            setError("Vui lòng chọn đầy đủ tỉnh/thành phố và phường/xã.");
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload = {
            recipientName: formData.get("recipientName"),
            phone: formData.get("phone"),
            provinceCode,
            provinceName: province.name,
            wardCode,
            wardName: ward.name,
            addressLine: formData.get("addressLine"),
            isDefault: formData.get("isDefault") === "on",
        };

        setSubmitting(true);
        try {
            const response = await fetch("/api/account/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body?.error ?? "Không thể lưu địa chỉ.");

            toast.success("Đã lưu địa chỉ mới.");
            form.reset();
            setProvinceCode("");
            setWardCode("");
            onSaved(body?.data?.id);
        } catch (cause) {
            const message = cause instanceof Error ? cause.message : "Không thể kết nối tới máy chủ.";
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-shop-border bg-shop-bg p-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="recipientName" className="mb-1.5 block text-sm font-semibold text-shop-title">Họ và tên người nhận</label>
                    <input id="recipientName" name="recipientName" required minLength={2} className={inputClass} placeholder="Nguyễn Văn A" />
                </div>
                <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-shop-title">Số điện thoại</label>
                    <input id="phone" name="phone" inputMode="numeric" pattern="[0-9]{9,12}" required className={inputClass} placeholder="0901234567" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="provinceCode" className="mb-1.5 block text-sm font-semibold text-shop-title">Tỉnh/Thành phố</label>
                    <select
                        id="provinceCode"
                        required
                        className={inputClass}
                        value={provinceCode}
                        onChange={(event) => setProvinceCode(event.target.value)}
                        disabled={loadingProvinces}
                    >
                        <option value="">{loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
                        {provinces.map((p) => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="wardCode" className="mb-1.5 block text-sm font-semibold text-shop-title">Phường/Xã</label>
                    <select
                        id="wardCode"
                        required
                        className={inputClass}
                        value={wardCode}
                        onChange={(event) => setWardCode(event.target.value)}
                        disabled={!provinceCode || loadingWards}
                    >
                        <option value="">{loadingWards ? "Đang tải..." : "Chọn phường/xã"}</option>
                        {wards.map((w) => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="addressLine" className="mb-1.5 block text-sm font-semibold text-shop-title">Địa chỉ cụ thể</label>
                <input id="addressLine" name="addressLine" required minLength={3} className={inputClass} placeholder="Số nhà, tên đường, thôn/xóm..." />
            </div>

            <label className="flex items-center gap-2 text-sm text-shop-text/80">
                <input type="checkbox" name="isDefault" className="size-4 accent-shop-main" />
                Đặt làm địa chỉ mặc định
            </label>

            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <Button type="submit" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
        </form>
    );
}
