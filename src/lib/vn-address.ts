// Vietnam administrative divisions — post 07/2025 reform (34 provinces, 2-tier: province -> ward).
// Data source: https://provinces.open-api.vn/api/v2/ (free, no key required).
const VN_ADDRESS_API = "https://provinces.open-api.vn/api/v2";

export type VnProvince = {
    code: number;
    name: string;
    division_type: string;
};

export type VnWard = {
    code: number;
    name: string;
    division_type: string;
};

export async function fetchProvinces(): Promise<VnProvince[]> {
    const res = await fetch(`${VN_ADDRESS_API}/p/`);
    if (!res.ok) throw new Error("Không thể tải danh sách tỉnh/thành phố.");
    return res.json();
}

export async function fetchWardsByProvince(provinceCode: string): Promise<VnWard[]> {
    const res = await fetch(`${VN_ADDRESS_API}/p/${provinceCode}?depth=2`);
    if (!res.ok) throw new Error("Không thể tải danh sách phường/xã.");
    const data = await res.json();
    return data.wards ?? [];
}
