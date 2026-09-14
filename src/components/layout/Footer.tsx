import Link from "next/link";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { POLICY_PAGES, NAV_ITEMS } from "@/lib/constants";
import { getPublicSiteSettings } from "@/lib/site-settings";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export async function Footer() {
  const siteInfo = await getPublicSiteSettings();

  return (
    <footer className="mt-16 bg-footer-bg-1 border-t border-shop-border">
      <Container className="py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-bold text-footer-title mb-3">
            {siteInfo.companyName}
          </h3>
          <p className="text-sm text-footer-text/80 mb-1">
            MST: {siteInfo.taxCode}
          </p>
          <p className="text-sm text-footer-text/80 flex gap-2 mb-2">
            <MapPin size={16} className="shrink-0 mt-0.5" />
            <span>{siteInfo.addressBusiness}</span>
          </p>
          <p className="text-sm text-footer-text/80 flex gap-2">
            <MapPin size={16} className="shrink-0 mt-0.5" />
            <span>{siteInfo.addressHeadquarters}</span>
          </p>
        </div>

        <div>
          <h3 className="font-bold text-footer-title mb-3">
            Danh mục sản phẩm
          </h3>
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/collections/${item.slug}`}
                  className="text-sm text-footer-text/80 hover:text-footer-hover transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-footer-title mb-3">Chính sách</h3>
          <ul className="space-y-2">
            {POLICY_PAGES.map((page) => (
              <li key={page.slug}>
                <Link
                  href={
                    page.slug === "lien-he"
                      ? "/pages/lien-he"
                      : `/pages/${page.slug}`
                  }
                  className="text-sm text-footer-text/80 hover:text-footer-hover transition-colors"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-footer-title mb-3">Liên hệ</h3>
          <ul className="space-y-2 text-sm text-footer-text/80">
            <li className="flex items-center gap-2">
              <Phone size={16} />
              <a
                href={`tel:${siteInfo.phone}`}
                className="hover:text-footer-hover"
              >
                {siteInfo.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} />
              <a
                href={`mailto:${siteInfo.email}`}
                className="hover:text-footer-hover"
              >
                {siteInfo.email}
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-3 mt-4">
            <a
              href={siteInfo.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-shop-main/10 text-shop-main flex items-center justify-center hover:bg-shop-main hover:text-white transition-colors"
            >
              <FacebookIcon size={16} />
            </a>
            <a
              href={siteInfo.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zalo"
              className="w-9 h-9 rounded-full bg-shop-main/10 text-shop-main flex items-center justify-center hover:bg-shop-main hover:text-white transition-colors text-xs font-bold"
            >
              Zalo
            </a>
            <a
              href={siteInfo.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Messenger"
              className="w-9 h-9 rounded-full bg-shop-main/10 text-shop-main flex items-center justify-center hover:bg-shop-main hover:text-white transition-colors"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </Container>

      <div className="bg-footer-bg-copyright py-4">
        <Container>
          <p className="text-center text-xs text-footer-text/70">
            © {new Date().getFullYear()} {siteInfo.companyName}. All rights
            reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
