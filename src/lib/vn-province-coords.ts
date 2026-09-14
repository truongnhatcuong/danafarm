/**
 * Tọa độ trung tâm (thành phố/thị xã tỉnh lỵ) của 34 tỉnh/thành phố Việt Nam
 * sau sáp nhập 2025, dùng để ước lượng khoảng cách giao hàng khi chưa có
 * geocoding địa chỉ chi tiết. Key là `code` của tỉnh theo provinces.open-api.vn.
 *
 * Đây là toạ độ xấp xỉ (trung tâm hành chính), đủ để phân bậc phí ship theo
 * khoảng cách chứ không nhằm định vị chính xác từng địa chỉ.
 */
export const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  "1": { lat: 21.0285, lng: 105.8542 }, // Hà Nội
  "4": { lat: 22.6667, lng: 106.25 }, // Cao Bằng
  "8": { lat: 21.8233, lng: 105.228 }, // Tuyên Quang
  "11": { lat: 21.3856, lng: 103.0169 }, // Điện Biên
  "12": { lat: 22.3964, lng: 103.4703 }, // Lai Châu
  "14": { lat: 21.3256, lng: 103.9188 }, // Sơn La
  "15": { lat: 22.4856, lng: 103.9707 }, // Lào Cai
  "19": { lat: 21.5928, lng: 105.8442 }, // Thái Nguyên
  "20": { lat: 21.853, lng: 106.761 }, // Lạng Sơn
  "22": { lat: 20.9599, lng: 107.0425 }, // Quảng Ninh
  "24": { lat: 21.1861, lng: 106.0763 }, // Bắc Ninh
  "25": { lat: 21.3227, lng: 105.402 }, // Phú Thọ
  "31": { lat: 20.8449, lng: 106.6881 }, // Hải Phòng
  "33": { lat: 20.6464, lng: 106.0511 }, // Hưng Yên
  "37": { lat: 20.2506, lng: 105.9744 }, // Ninh Bình
  "38": { lat: 19.8067, lng: 105.7852 }, // Thanh Hóa
  "40": { lat: 18.6796, lng: 105.6813 }, // Nghệ An
  "42": { lat: 18.3428, lng: 105.9057 }, // Hà Tĩnh
  "44": { lat: 16.8163, lng: 107.1005 }, // Quảng Trị
  "46": { lat: 16.4637, lng: 107.5909 }, // Huế
  "48": { lat: 16.0544, lng: 108.2022 }, // Đà Nẵng
  "51": { lat: 15.1214, lng: 108.8044 }, // Quảng Ngãi
  "52": { lat: 13.9833, lng: 108.0 }, // Gia Lai
  "56": { lat: 12.2388, lng: 109.1967 }, // Khánh Hòa
  "66": { lat: 12.6667, lng: 108.05 }, // Đắk Lắk
  "68": { lat: 11.9404, lng: 108.4583 }, // Lâm Đồng
  "75": { lat: 10.9574, lng: 106.8426 }, // Đồng Nai
  "79": { lat: 10.7769, lng: 106.7009 }, // TP. Hồ Chí Minh
  "80": { lat: 11.31, lng: 106.0989 }, // Tây Ninh
  "82": { lat: 10.4593, lng: 105.632 }, // Đồng Tháp
  "86": { lat: 10.2537, lng: 105.9722 }, // Vĩnh Long
  "91": { lat: 10.386, lng: 105.435 }, // An Giang
  "92": { lat: 10.0452, lng: 105.7469 }, // Cần Thơ
  "96": { lat: 9.1769, lng: 105.15 }, // Cà Mau
};

export function getProvinceCoords(provinceCode: string) {
  return PROVINCE_COORDS[provinceCode] ?? null;
}
