import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SUCCESS_STEPS: { key: string; label: string; icon: LucideIcon }[] = [
    { key: "PENDING", label: "Chờ xác nhận", icon: Clock },
    { key: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle2 },
    { key: "PACKING", label: "Đang đóng gói", icon: Package },
    { key: "SHIPPING", label: "Đang giao hàng", icon: Truck },
    { key: "DELIVERED", label: "Đã giao hàng", icon: CheckCircle2 },
];

const SUCCESS_ORDER = SUCCESS_STEPS.map((s) => s.key);

export function OrderStatusTimeline({ status }: { status: string }) {
    if (status === "CANCELLED") {
        return (
            <div className="flex items-center gap-3">
                {[
                    { label: "Chờ xác nhận", icon: Clock },
                    { label: "Đã hủy", icon: XCircle },
                ].map((step, index, all) => (
                    <div key={step.label} className="flex flex-1 items-center gap-3">
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
                                <step.icon size={18} />
                            </span>
                            <span className="whitespace-nowrap text-xs font-medium text-rose-600">{step.label}</span>
                        </div>
                        {index < all.length - 1 && <div className="h-0.5 flex-1 rounded-full bg-rose-200" />}
                    </div>
                ))}
            </div>
        );
    }

    const currentIndex = SUCCESS_ORDER.indexOf(status);

    return (
        <div className="flex items-start gap-1.5 sm:gap-3">
            {SUCCESS_STEPS.map((step, index) => {
                const done = currentIndex >= 0 && index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                    <div key={step.key} className="flex flex-1 items-center gap-1.5 sm:gap-3">
                        <div className="flex flex-col items-center gap-1.5">
                            <span
                                className={cn(
                                    "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                                    done ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400",
                                    isCurrent && "ring-4 ring-emerald-600/20",
                                )}
                            >
                                <step.icon size={18} />
                            </span>
                            <span
                                className={cn(
                                    "whitespace-nowrap text-center text-[11px] font-medium sm:text-xs",
                                    done ? "text-gray-900" : "text-gray-400",
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < SUCCESS_STEPS.length - 1 && (
                            <div className={cn("h-0.5 flex-1 rounded-full", index < currentIndex ? "bg-emerald-600" : "bg-gray-200")} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
