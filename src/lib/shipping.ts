import { getProvinceCoords } from "@/lib/vn-province-coords";

const EARTH_RADIUS_KM = 6371;

/** Khoảng cách đường chim bay giữa 2 toạ độ (km), theo công thức Haversine. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export interface ShippingConfig {
  originLat: number | null;
  originLng: number | null;
  freeShipThreshold: number | null;
  shippingBaseFee: number;
  shippingBaseKm: number;
  shippingPerKmFee: number;
}

export interface ShippingQuote {
  distanceKm: number | null;
  shippingFee: number;
  isFreeShip: boolean;
}

/**
 * Ước lượng khoảng cách từ kho hàng đến trung tâm tỉnh/thành của khách,
 * rồi tính phí ship theo bậc: `shippingBaseFee` cho `shippingBaseKm` km đầu,
 * cộng thêm `shippingPerKmFee` cho mỗi km vượt quá. Đơn hàng đạt
 * `freeShipThreshold` được miễn phí ship hoàn toàn.
 */
export function calculateShippingFee(
  provinceCode: string,
  subtotal: number,
  config: ShippingConfig,
): ShippingQuote {
  if (config.freeShipThreshold && subtotal >= config.freeShipThreshold) {
    const destination = getProvinceCoords(provinceCode);
    const distanceKm =
      destination && config.originLat != null && config.originLng != null
        ? Math.round(
            haversineKm(config.originLat, config.originLng, destination.lat, destination.lng) * 10,
          ) / 10
        : null;
    return { distanceKm, shippingFee: 0, isFreeShip: true };
  }

  const destination = getProvinceCoords(provinceCode);
  if (!destination || config.originLat == null || config.originLng == null) {
    return { distanceKm: null, shippingFee: config.shippingBaseFee, isFreeShip: false };
  }

  const distanceKm =
    Math.round(haversineKm(config.originLat, config.originLng, destination.lat, destination.lng) * 10) / 10;
  const extraKm = Math.max(0, distanceKm - config.shippingBaseKm);
  const rawFee = config.shippingBaseFee + extraKm * config.shippingPerKmFee;
  const shippingFee = Math.round(rawFee / 500) * 500;

  return { distanceKm, shippingFee, isFreeShip: false };
}
