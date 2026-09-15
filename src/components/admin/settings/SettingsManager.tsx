"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import {
  Phone,
  Mail,
  Share2,
  Building2,
  Truck,
  Loader2,
  MapPinned,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing-client";

type SiteSetting = {
  id: number;
  companyName: string;
  taxCode: string | null;
  addressBusiness: string | null;
  addressHeadquarters: string | null;
  phone: string;
  email: string;
  logoUrl: string | null;
  logoUploadKey: string | null;
  facebookUrl: string | null;
  zaloUrl: string | null;
  messengerUrl: string | null;
  freeShipThreshold: number | null;
  originLat: number | null;
  originLng: number | null;
  shippingBaseFee: number;
  shippingBaseKm: number;
  shippingPerKmFee: number;
};

const fieldClass =
  "w-full rounded-lg border border-admin-border bg-admin-surface px-3.5 py-2.5 text-sm text-admin-ink outline-none focus:border-admin-accent transition";
const labelClass = "block text-sm font-medium text-admin-ink";

export function SettingsManager() {
  const [form, setForm] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/settings")
      .then((response) => response.json())
      .then((result) => {
        if (cancelled) return;
        setForm(result.data ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Không thể tải cài đặt website.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;

    setBusy(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    setBusy(false);

    if (!res.ok) {
      toast.error(result.error ?? "Có lỗi xảy ra khi lưu cài đặt.");
      return;
    }

    toast.success("Đã cập nhật thông tin cửa hàng thành công!");
    setForm(result.data);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-admin-muted">
        <Loader2 size={24} className="animate-spin" />
        <span className="ml-2 text-sm font-medium">
          Đang tải cài đặt hệ thống...
        </span>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-admin-ink">
            Cài đặt website & Thông tin liên hệ
          </h1>
          <p className="text-sm text-admin-muted">
            Quản lý hotline, email, mạng xã hội, địa chỉ và thông tin hiển thị
            trên chân trang (Footer).
          </p>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-6">
        {/* Logo website */}
        <section className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs md:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-admin-border pb-4">
            <span className="grid size-9 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
              <ImageIcon size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-admin-ink">
                Logo website
              </h2>
              <p className="text-xs text-admin-muted">
                Logo này được hiển thị ở đầu trang (Header) phía khách hàng.
              </p>
            </div>
          </div>

          <div className="grid items-center gap-5 md:grid-cols-[minmax(260px,420px)_1fr]">
            <div className="flex min-h-32 items-center justify-center rounded-xl border border-admin-border bg-shop-main p-5">
              {form.logoUrl ? (
                <Image
                  src={form.logoUrl}
                  alt="Logo website hiện tại"
                  width={320}
                  height={120}
                  quality={95}
                  className="max-h-24 w-auto max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-sm text-white/70">
                  <ImageIcon size={30} className="mx-auto mb-2" />
                  Chưa có logo
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-sm leading-6 text-admin-muted">
                Nên dùng ảnh PNG hoặc WebP nền trong suốt, tỷ lệ ngang và dung
                lượng nhỏ để Header tải nhanh.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <UploadButton
                  endpoint="adminImage"
                  appearance={{
                    button:
                      "bg-admin-accent text-white text-xs font-semibold px-4 py-2 rounded-lg hover:brightness-95 transition",
                    allowedContent: "text-[11px] text-admin-muted mt-1",
                  }}
                  content={{
                    button({ ready, isUploading }) {
                      if (isUploading) return "Đang tải logo...";
                      return ready
                        ? form.logoUrl
                          ? "Thay logo khác"
                          : "Tải logo lên"
                        : "Đang chuẩn bị...";
                    },
                    allowedContent: "PNG, JPG, WebP tối đa 8MB",
                  }}
                  onClientUploadComplete={(files) => {
                    const file = files[0];
                    if (!file) return;
                    setForm({
                      ...form,
                      logoUrl: file.url,
                      logoUploadKey: file.key,
                    });
                    toast.success(
                      "Đã tải logo lên. Hãy bấm Lưu cài đặt để áp dụng.",
                    );
                  }}
                  onUploadError={(error) => {
                    toast.error(error.message);
                  }}
                />
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        logoUrl: null,
                        logoUploadKey: null,
                      })
                    }
                    className="rounded-lg cursor-pointer border mb-7 border-rose-200 px-4 py-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Gỡ logo
                  </button>
                )}
              </div>
              {form.logoUrl && (
                <p className="mt-3 break-all text-[11px] text-admin-muted">
                  {form.logoUrl}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 1. Thông tin liên hệ & Hotline */}
        <section className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs md:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-admin-border pb-4">
            <span className="grid size-9 place-items-center rounded-lg bg-admin-accent-soft text-admin-accent">
              <Phone size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-admin-ink">
                Thông tin liên hệ (Hiển thị Footer)
              </h2>
              <p className="text-xs text-admin-muted">
                Số điện thoại hotline và email nhận phản hồi từ khách hàng.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Số điện thoại Hotline <span className="text-rose-500">*</span>
              <div className="relative mt-1.5">
                <input
                  required
                  placeholder="0385250680"
                  className={`${fieldClass} pl-9`}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Phone
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
                />
              </div>
            </label>

            <label className={labelClass}>
              Email liên hệ <span className="text-rose-500">*</span>
              <div className="relative mt-1.5">
                <input
                  required
                  type="email"
                  placeholder="info@dalatfarm1994.com"
                  className={`${fieldClass} pl-9`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Mail
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
                />
              </div>
            </label>
          </div>
        </section>

        {/* 2. Mạng xã hội & Kênh chat (Facebook, Zalo, Messenger) */}
        <section className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs md:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-admin-border pb-4">
            <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Share2 size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-admin-ink">
                Mạng xã hội & Kênh tương tác
              </h2>
              <p className="text-xs text-admin-muted">
                Các icon Facebook, Zalo, Messenger xuất hiện ở chân trang.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Link Trang Facebook
              <input
                placeholder="https://www.facebook.com/Dalatfarm1994"
                className={`${fieldClass} mt-1.5`}
                value={form.facebookUrl ?? ""}
                onChange={(e) =>
                  setForm({ ...form, facebookUrl: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Link Chat Zalo
              <input
                placeholder="https://zalo.me/0385250680"
                className={`${fieldClass} mt-1.5`}
                value={form.zaloUrl ?? ""}
                onChange={(e) => setForm({ ...form, zaloUrl: e.target.value })}
              />
            </label>

            <label className={labelClass}>
              Link Messenger
              <input
                placeholder="https://m.me/Dalatfarmsince1994"
                className={`${fieldClass} mt-1.5`}
                value={form.messengerUrl ?? ""}
                onChange={(e) =>
                  setForm({ ...form, messengerUrl: e.target.value })
                }
              />
            </label>
          </div>
        </section>

        {/* 3. Doanh nghiệp & Vận chuyển */}
        <section className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs md:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-admin-border pb-4">
            <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <Building2 size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-admin-ink">
                Thông tin doanh nghiệp & Vận chuyển
              </h2>
              <p className="text-xs text-admin-muted">
                Tên công ty, mã số thuế, địa chỉ và chính sách miễn phí ship.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Tên doanh nghiệp / Công ty
              <input
                placeholder="CÔNG TY TNHH DANAFARM"
                className={`${fieldClass} mt-1.5`}
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Mã số thuế
              <input
                placeholder="5801501977"
                className={`${fieldClass} mt-1.5`}
                value={form.taxCode ?? ""}
                onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
              />
            </label>

            <label className={labelClass}>
              Địa chỉ kinh doanh
              <textarea
                rows={2}
                className={`${fieldClass} mt-1.5 resize-y`}
                value={form.addressBusiness ?? ""}
                onChange={(e) =>
                  setForm({ ...form, addressBusiness: e.target.value })
                }
              />
            </label>

            <label className={labelClass}>
              Địa chỉ trụ sở chính
              <textarea
                rows={2}
                className={`${fieldClass} mt-1.5 resize-y`}
                value={form.addressHeadquarters ?? ""}
                onChange={(e) =>
                  setForm({ ...form, addressHeadquarters: e.target.value })
                }
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Ngưỡng miễn phí vận chuyển (Freeship - VNĐ)
              <div className="relative mt-1.5 max-w-sm">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  placeholder="350000"
                  className={`${fieldClass} pl-9`}
                  value={form.freeShipThreshold ?? 350000}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      freeShipThreshold: Number(e.target.value),
                    })
                  }
                />
                <Truck
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
                />
              </div>
              <span className="mt-1 block text-xs text-admin-muted">
                Đơn hàng đạt từ mức giá này trở lên sẽ được áp dụng miễn phí
                giao hàng.
              </span>
            </label>
          </div>
        </section>

        {/* 4. Vận chuyển theo khoảng cách */}
        <section className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-xs md:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-admin-border pb-4">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <MapPinned size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-admin-ink">
                Phí vận chuyển theo khoảng cách
              </h2>
              <p className="text-xs text-admin-muted">
                Toạ độ kho hàng và bậc phí ship áp dụng khi đơn hàng chưa đạt
                ngưỡng miễn phí ship ở trên.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Vĩ độ kho hàng (Latitude)
              <input
                type="number"
                step="0.0001"
                placeholder="11.8203"
                className={`${fieldClass} mt-1.5`}
                value={form.originLat ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    originLat:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>
            <label className={labelClass}>
              Kinh độ kho hàng (Longitude)
              <input
                type="number"
                step="0.0001"
                placeholder="108.4830"
                className={`${fieldClass} mt-1.5`}
                value={form.originLng ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    originLng:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>

            <label className={labelClass}>
              Phí cơ bản (VNĐ)
              <input
                type="number"
                min={0}
                step={1000}
                className={`${fieldClass} mt-1.5`}
                value={form.shippingBaseFee}
                onChange={(e) =>
                  setForm({ ...form, shippingBaseFee: Number(e.target.value) })
                }
              />
              <span className="mt-1 block text-xs text-admin-muted">
                Áp dụng cho quãng đường đầu tiên bên dưới.
              </span>
            </label>
            <label className={labelClass}>
              Quãng đường cơ bản (km)
              <input
                type="number"
                min={0}
                step={0.5}
                className={`${fieldClass} mt-1.5`}
                value={form.shippingBaseKm}
                onChange={(e) =>
                  setForm({ ...form, shippingBaseKm: Number(e.target.value) })
                }
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Phí mỗi km vượt quá (VNĐ/km)
              <input
                type="number"
                min={0}
                step={500}
                className={`${fieldClass} mt-1.5 max-w-sm`}
                value={form.shippingPerKmFee}
                onChange={(e) =>
                  setForm({ ...form, shippingPerKmFee: Number(e.target.value) })
                }
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-admin-accent px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:brightness-95 disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? "Đang lưu thay đổi..." : "Lưu cài đặt"}
          </button>
        </div>
      </form>
    </div>
  );
}
