import { Container } from "@/components/ui/Container";

const STATS = [
  { value: "1.650m", label: "Độ cao vườn trà, nơi sương mù giữ hương" },
  { value: "48 giờ", label: "Từ lúc hái đến khi đóng gói thành phẩm" },
  { value: "100%", label: "Trà, cà phê nguyên chất, không pha trộn" },
];

export function OriginBand() {
  return (
    <section className="relative overflow-hidden bg-terrain-deep py-14 md:py-20">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 500"
        aria-hidden="true"
      >
        <path
          d="M0 90 Q 200 40 400 90 T 800 90 T 1200 90"
          fill="none"
          stroke="var(--terrain-line)"
          strokeWidth="2"
        />
        <path
          d="M0 190 Q 220 130 440 190 T 860 190 T 1200 190"
          fill="none"
          stroke="var(--terrain-line)"
          strokeWidth="2"
        />
        <path
          d="M0 300 Q 240 230 480 300 T 900 300 T 1200 300"
          fill="none"
          stroke="var(--terrain-line)"
          strokeWidth="2"
        />
        <path
          d="M0 410 Q 260 340 520 410 T 940 410 T 1200 410"
          fill="none"
          stroke="var(--terrain-line)"
          strokeWidth="2"
        />
      </svg>

      <Container className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-14">
        <p className="font-display text-2xl italic leading-snug text-white/95 md:text-3xl">
          &ldquo;Ở độ cao hơn một nghìn rưỡi mét, sương mù giữ cho từng đọt
          trà chậm lớn và đậm hương hơn dưới đồng bằng.&rdquo;
          <span className="mt-4 block font-sans text-sm italic text-white/60">
            — Vườn trà DanaFarm, Cầu Đất
          </span>
        </p>

        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
          {STATS.map((stat) => (
            <div
              key={stat.value}
              className="rounded-xl border border-white/15 bg-terrain-card p-4 backdrop-blur-sm"
            >
              <p className="font-display text-2xl text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
