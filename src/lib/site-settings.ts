import "server-only";

import { cache } from "react";
import { SITE_INFO } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export interface PublicSiteSettings {
  companyName: string;
  taxCode: string;
  addressBusiness: string;
  addressHeadquarters: string;
  phone: string;
  email: string;
  logoUrl: string;
  facebookUrl: string;
  zaloUrl: string;
  messengerUrl: string;
  freeShipThreshold: number;
}

export const getPublicSiteSettings = cache(
  async (): Promise<PublicSiteSettings> => {
    try {
      const setting = await prisma.siteSetting.findFirst({
        orderBy: { id: "asc" },
        select: {
          companyName: true,
          taxCode: true,
          addressBusiness: true,
          addressHeadquarters: true,
          phone: true,
          email: true,
          logoUrl: true,
          facebookUrl: true,
          zaloUrl: true,
          messengerUrl: true,
          freeShipThreshold: true,
        },
      });

      if (!setting) return SITE_INFO;

      return {
        companyName: setting.companyName || SITE_INFO.companyName,
        taxCode: setting.taxCode || SITE_INFO.taxCode,
        addressBusiness: setting.addressBusiness || SITE_INFO.addressBusiness,
        addressHeadquarters:
          setting.addressHeadquarters || SITE_INFO.addressHeadquarters,
        phone: setting.phone || SITE_INFO.phone,
        email: setting.email || SITE_INFO.email,
        logoUrl: setting.logoUrl || SITE_INFO.logoUrl,
        facebookUrl: setting.facebookUrl || SITE_INFO.facebookUrl,
        zaloUrl: setting.zaloUrl || SITE_INFO.zaloUrl,
        messengerUrl: setting.messengerUrl || SITE_INFO.messengerUrl,
        freeShipThreshold:
          setting.freeShipThreshold ?? SITE_INFO.freeShipThreshold,
      };
    } catch (error) {
      console.error("Unable to load public site settings", error);
      return SITE_INFO;
    }
  },
);
