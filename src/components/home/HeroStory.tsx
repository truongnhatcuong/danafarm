import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const FACTS = [
  "Hái tay từng đọt non",
  "1.650m trên mực nước biển",
  "Sấy khô trong 48 giờ",
  "Không chất bảo quản",
  "Đóng gói ngay tại vườn",
];

export function HeroStory() {
  return (
    <section className="pt-1 md:pt-71">
      <div
        className="hero-rise  overflow-hidden border-y border-shop-border bg-white/60 py-3"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="ticker-track flex w-max shrink-0 gap-10 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className={copy === 1 ? "ticker-copy flex gap-10" : "flex gap-10"}
              aria-hidden={copy === 1 || undefined}
            >
              {FACTS.map((fact) => (
                <span
                  key={fact}
                  className="flex items-center gap-3 text-sm text-shop-title/70"
                >
                  {fact}
                  <span className="text-shop-main">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
