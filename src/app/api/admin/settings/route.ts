import { authorizeAdminApi } from "@/lib/admin";
import { SITE_INFO } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  let setting = await prisma.siteSetting.findFirst();
  if (!setting) {
    // Tự động khởi tạo bản ghi đầu tiên theo SITE_INFO nếu chưa có
    setting = await prisma.siteSetting.create({
      data: {
        companyName: SITE_INFO.companyName,
        taxCode: SITE_INFO.taxCode,
        addressBusiness: SITE_INFO.addressBusiness,
        addressHeadquarters: SITE_INFO.addressHeadquarters,
        phone: SITE_INFO.phone,
        email: SITE_INFO.email,
        logoUrl: SITE_INFO.logoUrl,
        logoUploadKey: null,
        facebookUrl: SITE_INFO.facebookUrl,
        zaloUrl: SITE_INFO.zaloUrl,
        messengerUrl: SITE_INFO.messengerUrl,
        freeShipThreshold: SITE_INFO.freeShipThreshold,
      },
    });
  }

  return Response.json({ data: setting });
}

export async function PUT(request: Request) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const first = await prisma.siteSetting.findFirst();
  const data = {
    companyName: String(body.companyName || SITE_INFO.companyName).trim(),
    taxCode: body.taxCode ? String(body.taxCode).trim() : null,
    addressBusiness: body.addressBusiness
      ? String(body.addressBusiness).trim()
      : null,
    addressHeadquarters: body.addressHeadquarters
      ? String(body.addressHeadquarters).trim()
      : null,
    phone: String(body.phone || SITE_INFO.phone).trim(),
    email: String(body.email || SITE_INFO.email).trim(),
    logoUrl: body.logoUrl ? String(body.logoUrl).trim() : null,
    logoUploadKey: body.logoUploadKey
      ? String(body.logoUploadKey).trim()
      : null,
    facebookUrl: body.facebookUrl ? String(body.facebookUrl).trim() : null,
    zaloUrl: body.zaloUrl ? String(body.zaloUrl).trim() : null,
    messengerUrl: body.messengerUrl ? String(body.messengerUrl).trim() : null,
    freeShipThreshold: body.freeShipThreshold
      ? Number(body.freeShipThreshold)
      : 350000,
    originLat:
      body.originLat !== undefined &&
      body.originLat !== null &&
      body.originLat !== ""
        ? Number(body.originLat)
        : null,
    originLng:
      body.originLng !== undefined &&
      body.originLng !== null &&
      body.originLng !== ""
        ? Number(body.originLng)
        : null,
    shippingBaseFee: body.shippingBaseFee
      ? Number(body.shippingBaseFee)
      : 20000,
    shippingBaseKm: body.shippingBaseKm ? Number(body.shippingBaseKm) : 10,
    shippingPerKmFee: body.shippingPerKmFee
      ? Number(body.shippingPerKmFee)
      : 3500,
  };

  try {
    let setting;
    if (first) {
      setting = await prisma.siteSetting.update({
        where: { id: first.id },
        data,
      });
    } else {
      setting = await prisma.siteSetting.create({ data });
    }
    return Response.json({ data: setting });
  } catch (error) {
    console.error("PUT /api/admin/settings failed", error);
    return Response.json({ error: "Không thể lưu cài đặt." }, { status: 500 });
  }
}
