export function animateProductToCart(source: HTMLElement | null, imageUrl?: string | null) {
    if (!source || typeof document === "undefined") return;

    const target = document.querySelector<HTMLElement>("[data-cart-target]:not([hidden])");
    if (!target) return;

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const size = Math.min(72, Math.max(44, sourceRect.width));
    const flyer = document.createElement("div");

    flyer.setAttribute("aria-hidden", "true");
    Object.assign(flyer.style, {
        position: "fixed",
        zIndex: "9999",
        pointerEvents: "none",
        left: `${sourceRect.left + sourceRect.width / 2 - size / 2}px`,
        top: `${sourceRect.top + sourceRect.height / 2 - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "9999px",
        border: "2px solid white",
        boxShadow: "0 12px 30px rgba(0,0,0,.25)",
        backgroundColor: "white",
        backgroundImage: imageUrl ? `url(${JSON.stringify(imageUrl).slice(1, -1)})` : "none",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
    });
    document.body.appendChild(flyer);

    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    const animation = flyer.animate(
        [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${deltaX * 0.55}px, ${deltaY * 0.25 - 80}px) scale(.8)`, opacity: 0.95, offset: 0.55 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(.2)`, opacity: 0.15 },
        ],
        { duration: 720, easing: "cubic-bezier(.2,.8,.2,1)" },
    );

    animation.finished.finally(() => {
        flyer.remove();
        target.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.22)" },
                { transform: "scale(1)" },
            ],
            { duration: 320, easing: "ease-out" },
        );
    });
}
