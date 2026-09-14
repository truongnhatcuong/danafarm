import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateShippingFee } from "@/lib/shipping";
import { generateOrderCode } from "@/lib/utils";

export const runtime = "nodejs";

const createOrderSchema = z.object({
    addressId: z.number().int().positive("Vui lòng chọn địa chỉ giao hàng."),
    paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
    note: z.string().trim().max(500).optional(),
    items: z
        .array(
            z.object({
                productId: z.number().int().positive(),
                variantId: z.number().int().positive().nullable().optional(),
                quantity: z.number().int().positive().max(999),
            }),
        )
        .min(1, "Giỏ hàng đang trống."),
});

class OrderCreationError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const params = new URL(request.url).searchParams;
    const rawPage = Number(params.get("page"));
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const pageSize = 10;

    const [items, total] = await prisma.$transaction([
        prisma.order.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { items: true },
        }),
        prisma.order.count({ where: { userId: user.id } }),
    ]);

    return Response.json({
        data: items,
        pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
    });
}

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const parsed = createOrderSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return Response.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
    }
    const { addressId, paymentMethod, note, items } = parsed.data;

    try {
        const address = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
        if (!address) throw new OrderCreationError("Địa chỉ giao hàng không hợp lệ.", 404);

        const productIds = [...new Set(items.map((item) => item.productId))];
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { variants: true, images: { orderBy: { position: "asc" }, take: 1 } },
        });

        const orderItemsData = items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product || product.status !== "active") {
                throw new OrderCreationError(`Sản phẩm không còn khả dụng (ID ${item.productId}).`, 400);
            }

            let unitPrice = product.price;
            let variantName: string | null = null;
            if (item.variantId) {
                const variant = product.variants.find((v) => v.id === item.variantId);
                if (!variant) throw new OrderCreationError(`Phân loại sản phẩm không hợp lệ (${product.name}).`, 400);
                unitPrice = variant.price;
                variantName = variant.name;
            }

            return {
                productId: product.id,
                productName: product.name,
                variantId: item.variantId ?? null,
                variantName,
                imageUrl: product.images?.[0]?.url ?? null,
                unitLabel: product.unitLabel ?? null,
                price: unitPrice,
                quantity: item.quantity,
                lineTotal: unitPrice * item.quantity,
            };
        });

        const subtotal = orderItemsData.reduce((sum, item) => sum + item.lineTotal, 0);

        const settings = (await prisma.siteSetting.findFirst()) ?? {
            originLat: 11.8203,
            originLng: 108.483,
            freeShipThreshold: 350000,
            shippingBaseFee: 20000,
            shippingBaseKm: 10,
            shippingPerKmFee: 3500,
        };

        const quote = calculateShippingFee(address.provinceCode, subtotal, settings);
        const shippingFee = quote.shippingFee;
        const total = subtotal + shippingFee;

        let lastError: unknown = null;
        for (let attempt = 0; attempt < 5; attempt++) {
            const code = generateOrderCode();
            try {
                const order = await prisma.$transaction(async (tx) => {
                    for (const item of orderItemsData) {
                        const result = await tx.product.updateMany({
                            where: { id: item.productId, quantity: { gte: item.quantity } },
                            data: { quantity: { decrement: item.quantity } },
                        });
                        if (result.count === 0) {
                            throw new OrderCreationError(`Sản phẩm "${item.productName}" không đủ hàng tồn kho.`, 409);
                        }
                    }

                    return tx.order.create({
                        data: {
                            code,
                            userId: user.id,
                            paymentMethod,
                            recipientName: address.recipientName,
                            phone: address.phone,
                            provinceName: address.provinceName,
                            wardName: address.wardName,
                            addressLine: address.addressLine,
                            latitude: address.latitude,
                            longitude: address.longitude,
                            distanceKm: quote.distanceKm,
                            note: note || null,
                            subtotal,
                            shippingFee,
                            discount: 0,
                            total,
                            items: { create: orderItemsData },
                        },
                        include: { items: true },
                    });
                });

                return Response.json({ data: order }, { status: 201 });
            } catch (error) {
                lastError = error;
                if (error instanceof OrderCreationError) throw error;
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                    continue; // Trùng mã đơn hàng (rất hiếm) — thử sinh mã khác.
                }
                throw error;
            }
        }
        throw lastError instanceof Error ? lastError : new Error("Không thể tạo mã đơn hàng.");
    } catch (error) {
        if (error instanceof OrderCreationError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error("POST /api/orders failed", error);
        return Response.json({ error: "Không thể tạo đơn hàng. Vui lòng thử lại." }, { status: 500 });
    }
}
