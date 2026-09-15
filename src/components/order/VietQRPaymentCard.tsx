"use client";

import { useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface VietQRPaymentCardProps {
  orderCode: string;
  total: number;
  bankId: string;
  bankAccountNo: string;
  bankAccountName: string;
}

export function VietQRPaymentCard({
  orderCode,
  total,
  bankId,
  bankAccountNo,
  bankAccountName,
}: VietQRPaymentCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankAccountNo}-compact2.png?amount=${total}&addInfo=${orderCode}&accountName=${encodeURIComponent(
    bankAccountName,
  )}`;

  function copyToClipboard(text: string, key: string, label: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`Đã sao chép ${label}`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-shop-main/40 bg-gradient-to-br from-shop-bg to-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center gap-2.5 border-b border-shop-border/80 pb-3.5">
        <span className="grid size-9 place-items-center rounded-lg bg-shop-main text-white shadow-xs">
          <QrCode size={20} />
        </span>
        <div>
          <h3 className="text-base font-bold text-shop-title">
            Thanh toán chuyển khoản qua mã QR (VietQR)
          </h3>
          <p className="text-xs text-shop-text/65">
            Quét mã QR bằng ứng dụng ngân hàng bất kỳ để tự động điền đúng số
            tiền và nội dung.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr] md:items-center">
        {/* Khung mã QR */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-shop-border bg-white p-3 text-center shadow-xs">
          <div className="relative size-56 overflow-hidden rounded-lg bg-white">
            <img
              src={qrUrl}
              alt={`VietQR thanh toán đơn hàng ${orderCode}`}
              className="size-full object-contain"
            />
          </div>
          <span className="mt-2 text-[11px] font-semibold text-shop-main">
            Quét mã để thanh toán nhanh
          </span>
        </div>

        {/* Thông tin chuyển khoản chi tiết */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-shop-border/60 bg-white p-2.5">
            <div>
              <span className="text-xs text-shop-text/60">
                Ngân hàng thụ hưởng:
              </span>
              <p className="font-bold text-shop-title">{bankId}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-shop-border/60 bg-white p-2.5">
            <div>
              <span className="text-xs text-shop-text/60">Số tài khoản:</span>
              <p className="font-mono text-base font-bold text-shop-main">
                {bankAccountNo}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(bankAccountNo, "accNo", "Số tài khoản")
              }
              className="flex items-center gap-1 rounded-md border border-shop-border px-2.5 py-1 text-xs font-semibold text-shop-title hover:border-shop-main hover:text-shop-main"
            >
              {copiedKey === "accNo" ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
              {copiedKey === "accNo" ? "Đã chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-shop-border/60 bg-white p-2.5">
            <div>
              <span className="text-xs text-shop-text/60">Chủ tài khoản:</span>
              <p className="font-semibold text-shop-title">{bankAccountName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-shop-border/60 bg-white p-2.5">
            <div>
              <span className="text-xs text-shop-text/60">
                Số tiền thanh toán:
              </span>
              <p className="text-base font-bold text-rose-600">
                {formatCurrency(total)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(String(total), "amount", "Số tiền")
              }
              className="flex items-center gap-1 rounded-md border border-shop-border px-2.5 py-1 text-xs font-semibold text-shop-title hover:border-shop-main hover:text-shop-main"
            >
              {copiedKey === "amount" ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
              {copiedKey === "amount" ? "Đã chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/70 p-2.5">
            <div>
              <span className="text-xs text-amber-800">
                Nội dung chuyển khoản (bắt buộc):
              </span>
              <p className="font-mono text-base font-bold text-amber-900">
                {orderCode}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(orderCode, "code", "Nội dung chuyển khoản")
              }
              className="flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              {copiedKey === "code" ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
              {copiedKey === "code" ? "Đã chép" : "Sao chép"}
            </button>
          </div>

          <p className="text-xs leading-5 text-shop-text/65">
            * Sau khi nhận được chuyển khoản, nhân viên DanaFarm sẽ đối soát và
            xác nhận đơn hàng của bạn trong ít phút.
          </p>
        </div>
      </div>
    </div>
  );
}
