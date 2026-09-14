import type { ReactNode } from "react";
import { CartSessionBridge } from "@/components/cart/CartSessionBridge";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, settings] = await Promise.all([getCurrentUser(), getPublicSiteSettings()]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.companyName,
    url: SITE_URL,
    logo: settings.logoUrl,
    image: settings.logoUrl,
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressHeadquarters || settings.addressBusiness,
      addressCountry: "VN",
    },
    ...(settings.originLat != null && settings.originLng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: settings.originLat,
            longitude: settings.originLng,
          },
        }
      : {}),
    sameAs: [settings.facebookUrl, settings.zaloUrl].filter(Boolean),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DanaFarm",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <CartSessionBridge userId={user?.id ?? null} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
