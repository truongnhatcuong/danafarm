import { PrismaClient } from "@prisma/client";
import blogsJson from "./data/blogs.json";
import pagesJson from "./data/pages.json";
import productsJson from "./data/products.json";

const prisma = new PrismaClient();

type SeedProduct = {
  slug: string;
  title: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
};

type SeedPost = {
  slug: string;
  title: string;
  image: string;
  excerpt: string | null;
  content: string;
};

type CategorySeed = {
  name: string;
  slug: string;
  imageUrl?: string;
  children?: Array<{ name: string; slug: string }>;
};

const categorySeeds: CategorySeed[] = [
  {
    name: "Hộp Quà DanaFarm",
    slug: "hop-qua-tra-ca-phe-dalatfarm",
    imageUrl:
      "https://theme.hstatic.net/200000076583/1001285352/14/categorybanner_1_img.jpg?v=503",
  },
  {
    name: "Trà Ngon",
    slug: "tra",
    imageUrl:
      "https://theme.hstatic.net/200000076583/1001285352/14/categorybanner_2_img.jpg?v=503",
    children: [
      { name: "Trà Oolong", slug: "tra-olong" },
      { name: "Trà Lài", slug: "tra-lai" },
      { name: "Trà Sen", slug: "tra-sen" },
      { name: "Trà Xanh", slug: "tra-xanh" },
      { name: "Trà Xanh Dứa", slug: "tra-xanh-dua" },
      { name: "Trà Hoa - Thảo Mộc", slug: "tra-hoa-thao-moc" },
      {
        name: "Trà Pha Chế Trà Sữa Chuyên Dụng",
        slug: "nguyen-lieu-pha-che",
      },
      { name: "Trà Đen", slug: "tra-den" },
    ],
  },
  {
    name: "Cà Phê Cầu Đất",
    slug: "ca-phe-cau-dat",
    imageUrl:
      "https://theme.hstatic.net/200000076583/1001285352/14/categorybanner_3_img.jpg?v=503",
    children: [
      { name: "Cà Phê Bột Xay Sẵn", slug: "ca-phe-bot" },
      { name: "Cà Phê Phin Giấy Tiện Dụng", slug: "ca-phe-phin-giay" },
      { name: "Cà Phê Dạng Nguyên Hạt", slug: "ca-phe-dang-nguyen-hat" },
    ],
  },
  {
    name: "Bột Matcha",
    slug: "bot-matcha",
    imageUrl:
      "https://theme.hstatic.net/200000076583/1001285352/14/categorybanner_4_img.jpg?v=503",
  },
  {
    name: "Trái Cây Sấy",
    slug: "dac-san-da-lat-1",
    children: [
      { name: "Sấy Giòn", slug: "say-gion" },
      { name: "Sấy Dẻo", slug: "say-deo-1" },
    ],
  },
  { name: "Hạt Dinh Dưỡng", slug: "hat-dinh-duong" },
];

const pageTitles: Record<string, string> = {
  "chinh-sach-bao-mat": "Chính sách bảo mật",
  "chinh-sach-doi-tra": "Chính sách đổi trả",
  "dieu-khoan-dich-vu": "Điều khoản dịch vụ",
  "chinh-sach-giao-hang": "Chính sách giao hàng",
  "cam-ket-trai-nghiem-dich-vu": "Cam kết trải nghiệm dịch vụ",
};

const bannerSeeds = [
  {
    title: "DanaFarm - Kết tinh kỳ diệu từ đất lành",
    imageUrl:
      "https://theme.hstatic.net/200000076583/1001285352/14/homebanner_1_img.jpg?v=503",
    link: "/collections/tra",
    buttonText: "Khám phá ngay",
    position: 0,
  },
  {
    title: "Trà ngon và cà phê sạch từ Cầu Đất",
    imageUrl:
      "https://theme.hstatic.net/200000076583/1001285352/14/homebanner_2_img.jpg?v=503",
    link: "/collections/ca-phe-cau-dat",
    buttonText: "Xem sản phẩm",
    position: 1,
  },
];

const voucherSeeds = [
  {
    code: "DANA5K",
    title: "Giảm 5K cho đơn từ 150K",
    description: "Ưu đãi áp dụng cho toàn bộ sản phẩm trong đơn hàng.",
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 5000,
    minOrderValue: 150000,
    maxDiscount: null,
    usageLimit: 500,
    startsAt: new Date("2026-01-01T00:00:00+07:00"),
    expiresAt: new Date("2026-12-31T23:59:59+07:00"),
    isActive: true,
    showOnHomepage: true,
    position: 0,
  },
  {
    code: "DANA10K",
    title: "Giảm 10K cho đơn từ 250K",
    description: "Ưu đãi áp dụng cho toàn bộ sản phẩm trong đơn hàng.",
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 10000,
    minOrderValue: 250000,
    maxDiscount: null,
    usageLimit: 500,
    startsAt: new Date("2026-01-01T00:00:00+07:00"),
    expiresAt: new Date("2026-12-31T23:59:59+07:00"),
    isActive: true,
    showOnHomepage: true,
    position: 1,
  },
  {
    code: "DANA15K",
    title: "Giảm 15K cho đơn từ 350K",
    description: "Ưu đãi áp dụng cho toàn bộ sản phẩm trong đơn hàng.",
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 15000,
    minOrderValue: 350000,
    maxDiscount: null,
    usageLimit: 300,
    startsAt: new Date("2026-01-01T00:00:00+07:00"),
    expiresAt: new Date("2026-12-31T23:59:59+07:00"),
    isActive: true,
    showOnHomepage: true,
    position: 2,
  },
  {
    code: "DANA50K",
    title: "Giảm 10% tối đa 50K",
    description: "Giảm 10% cho đơn từ 500K, tối đa 50K trên toàn bộ sản phẩm.",
    discountType: "PERCENTAGE" as const,
    discountValue: 10,
    minOrderValue: 500000,
    maxDiscount: 50000,
    usageLimit: 200,
    startsAt: new Date("2026-01-01T00:00:00+07:00"),
    expiresAt: new Date("2026-12-31T23:59:59+07:00"),
    isActive: true,
    showOnHomepage: true,
    position: 3,
  },
  {
    code: "DANASHIP",
    title: "Miễn phí vận chuyển cho đơn từ 300K",
    description: "Miễn toàn bộ phí vận chuyển cho đơn hàng đủ điều kiện.",
    discountType: "FREE_SHIPPING" as const,
    discountValue: 0,
    minOrderValue: 300000,
    maxDiscount: null,
    usageLimit: 300,
    startsAt: new Date("2026-01-01T00:00:00+07:00"),
    expiresAt: new Date("2026-12-31T23:59:59+07:00"),
    isActive: true,
    showOnHomepage: true,
    position: 4,
  },
];

async function clearSeededContent() {
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.post.deleteMany();
  await prisma.page.deleteMany();
  await prisma.siteSetting.deleteMany();
}

async function seedCategories() {
  const idsBySlug = new Map<string, number>();

  for (const [position, category] of categorySeeds.entries()) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl,
        position,
      },
    });
    idsBySlug.set(category.slug, created.id);

    for (const [childPosition, child] of (category.children ?? []).entries()) {
      const createdChild = await prisma.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          position: childPosition,
          parentId: created.id,
        },
      });
      idsBySlug.set(child.slug, createdChild.id);
    }
  }

  return idsBySlug;
}

async function seedProducts(categoryIds: Map<string, number>) {
  const collections = productsJson as Record<string, SeedProduct[]>;
  const productsBySlug = new Map<
    string,
    SeedProduct & { categorySlugs: Set<string> }
  >();

  for (const [categorySlug, products] of Object.entries(collections)) {
    for (const product of products) {
      const existing = productsBySlug.get(product.slug);
      if (existing) {
        existing.categorySlugs.add(categorySlug);
      } else {
        productsBySlug.set(product.slug, {
          ...product,
          categorySlugs: new Set([categorySlug]),
        });
      }
    }
  }

  const demoProducts = [...productsBySlug.values()].slice(0, 3);
  let position = 0;
  for (const product of demoProducts) {
    const categoryConnections = [...product.categorySlugs]
      .map((slug) => categoryIds.get(slug))
      .filter((id): id is number => id !== undefined)
      .map((id) => ({ id }));

    await prisma.product.create({
      data: {
        name: product.title,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice || null,
        quantity: 100,
        isFeatured: position < 8,
        isBestSeller: position < 4,
        isNew: position >= 8 && position < 16,
        isOnSale:
          product.compareAtPrice !== null &&
          product.compareAtPrice > product.price,
        categories: { connect: categoryConnections },
        images: {
          create: product.image
            ? [{ url: product.image, alt: product.title, position: 0 }]
            : [],
        },
        variants: {
          create: [
            {
              name: "Mặc định",
              price: product.price,
              compareAtPrice: product.compareAtPrice || null,
              position: 0,
            },
          ],
        },
      },
    });
    position += 1;
  }

  return demoProducts.length;
}

async function seedPosts() {
  const posts = (blogsJson as SeedPost[]).slice(0, 3);

  for (const [index, post] of posts.entries()) {
    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.image,
        author: "DanaFarm",
        isFeatured: index < 3,
        publishedAt: new Date(Date.UTC(2026, 0, 5 - index)),
      },
    });
  }

  return posts.length;
}

async function seedPages() {
  const pages = pagesJson as Record<string, string>;

  for (const [slug, content] of Object.entries(pages)) {
    await prisma.page.create({
      data: {
        slug,
        title: pageTitles[slug] ?? slug,
        content,
      },
    });
  }

  await prisma.page.create({
    data: {
      slug: "gioi-thieu-dalat-farm",
      title: "Giới thiệu DanaFarm",
      content:
        "<p>DanaFarm mang những sản phẩm trà ngon, cà phê sạch và đặc sản chất lượng từ vùng đất Cầu Đất, Đà Lạt đến với khách hàng.</p><p>Nội dung giới thiệu chi tiết có thể được cập nhật sau trong cơ sở dữ liệu.</p>",
    },
  });

  return Object.keys(pages).length + 1;
}

async function main() {
  console.log("Starting DanaFarm database seed...");
  await clearSeededContent();

  const categoryIds = await seedCategories();
  const productCount = await seedProducts(categoryIds);
  const postCount = await seedPosts();
  const pageCount = await seedPages();

  await prisma.banner.createMany({ data: bannerSeeds });
  await Promise.all(
    voucherSeeds.map((voucher) =>
      prisma.voucher.upsert({
        where: { code: voucher.code },
        update: voucher,
        create: voucher,
      }),
    ),
  );
  await prisma.siteSetting.create({
    data: {
      companyName: "CÔNG TY TNHH DANAFARM",
      taxCode: "5801501977",
      addressBusiness:
        "ĐĐKD: Tổ 1 Phát Chi, Phường Xuân Trường - Đà Lạt, Tỉnh Lâm Đồng, Việt Nam.",
      addressHeadquarters:
        "Trụ Sở: Số 159 Suối Thông B1, Xã Đơn Dương, Tỉnh Lâm Đồng, Việt Nam",
      phone: "0385250680",
      email: "info@dalatfarm1994.com",
      logoUrl: "/logo.png",
      logoUploadKey: null,
      facebookUrl: "https://www.facebook.com/Dalatfarm1994",
      zaloUrl: "https://zalo.me/0385250680",
      messengerUrl: "https://m.me/Dalatfarmsince1994",
      freeShipThreshold: 350000,
    },
  });

  console.log(
    `Seed complete: ${categoryIds.size} categories, ${productCount} products, ${postCount} posts, ${pageCount} pages, ${bannerSeeds.length} banners, ${voucherSeeds.length} vouchers.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
