import type { NavItem } from "@/types";

/**
 * Primary navigation, reconstructed from the original DanaFarm sidebar menu.
 * Category `slug` values match Haravan collection slugs 1:1 so that
 * `/collections/[slug]` resolves the same catalog structure as the source site.
 */
export const NAV_ITEMS: NavItem[] = [
    {
        label: "Hộp Quà DanaFarm",
        slug: "hop-qua-tra-ca-phe-dalatfarm",
    },
    {
        label: "Trà Ngon",
        slug: "tra",
        children: [
            { label: "Trà Oolong", slug: "tra-olong" },
            { label: "Trà Lài", slug: "tra-lai" },
            { label: "Trà Sen", slug: "tra-sen" },
            { label: "Trà Xanh", slug: "tra-xanh" },
            { label: "Trà Xanh Dứa", slug: "tra-xanh-dua" },
            { label: "Trà Hoa - Thảo Mộc", slug: "tra-hoa-thao-moc" },
            { label: "Trà Pha Chế Trà Sữa Chuyên Dụng", slug: "nguyen-lieu-pha-che" },
            { label: "Trà Đen", slug: "tra-den" },
        ],
    },
    {
        label: "Cà Phê Cầu Đất",
        slug: "ca-phe-cau-dat",
        children: [
            { label: "Cà Phê Bột Xay Sẵn", slug: "ca-phe-bot" },
            { label: "Cà Phê Phin Giấy Tiện Dụng", slug: "ca-phe-phin-giay" },
            { label: "Cà Phê Dạng Nguyên Hạt", slug: "ca-phe-dang-nguyen-hat" },
        ],
    },
    {
        label: "Bột Matcha",
        slug: "bot-matcha",
    },
    {
        label: "Trái Cây Sấy",
        slug: "dac-san-da-lat-1",
        children: [
            { label: "Sấy Giòn", slug: "say-gion" },
            { label: "Sấy Dẻo", slug: "say-deo-1" },
        ],
    },
    {
        label: "Hạt Dinh Dưỡng",
        slug: "hat-dinh-duong",
    },
];

/** Static policy pages rendered from the `Page` model via /pages/[slug]. */
export const POLICY_PAGES = [
    { label: "Giới thiệu DanaFarm", slug: "gioi-thieu-dalat-farm" },
    { label: "Chính sách bảo mật", slug: "chinh-sach-bao-mat" },
    { label: "Chính sách đổi trả", slug: "chinh-sach-doi-tra" },
    { label: "Điều khoản dịch vụ", slug: "dieu-khoan-dich-vu" },
    { label: "Chính sách giao hàng", slug: "chinh-sach-giao-hang" },
    { label: "Cam kết trải nghiệm dịch vụ", slug: "cam-ket-trai-nghiem-dich-vu" },
    { label: "Liên hệ", slug: "lien-he" },
];

/** Fallback site info, mirrors the default values on the SiteSetting model. */
export const SITE_INFO = {
    companyName: "CÔNG TY TNHH DANAFARM",
    taxCode: "5801501977",
    addressBusiness:
        "ĐĐKD: Tổ 1 Phát Chi, Phường Xuân Trường - Đà Lạt, Tỉnh Lâm Đồng, Việt Nam.",
    addressHeadquarters:
        "Trụ Sở: Số 159 Suối Thông B1, Xã Đơn Dương, Tỉnh Lâm Đồng, Việt Nam",
    phone: "0385250680",
    email: "info@dalatfarm1994.com",
    logoUrl: "https://theme.hstatic.net/200000076583/1001285352/14/logo.png?v=503",
    facebookUrl: "https://www.facebook.com/Dalatfarm1994",
    zaloUrl: "https://zalo.me/0385250680",
    messengerUrl: "https://m.me/Dalatfarmsince1994",
    freeShipThreshold: 350000,
};

export const TOP_BAR_MESSAGES = [
    "Đảm bảo chất lượng",
    "Miễn phí vận chuyển từ 350k",
    "Mở hộp kiểm tra nhận hàng",
];
