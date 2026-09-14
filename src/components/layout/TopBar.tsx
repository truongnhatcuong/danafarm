import { ShieldCheck, Truck, PackageCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TOP_BAR_MESSAGES } from "@/lib/constants";

const icons = [ShieldCheck, Truck, PackageCheck];

export function TopBar() {
    return (
        <div className="hidden md:block bg-shop-main text-white text-xs">
            <Container className="flex items-center justify-center gap-8 py-2">
                {TOP_BAR_MESSAGES.map((msg, i) => {
                    const Icon = icons[i] ?? ShieldCheck;
                    return (
                        <div key={msg} className="flex items-center gap-1.5">
                            <Icon size={14} />
                            <span>{msg}</span>
                        </div>
                    );
                })}
            </Container>
        </div>
    );
}
