import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAdminUser } from "@/lib/auth";

const upload = createUploadthing();

export const uploadRouter = {
    adminImage: upload({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 10,
        },
    })
        .middleware(async () => {
            const user = await getAdminUser();
            if (!user) throw new UploadThingError("Bạn không có quyền tải ảnh lên.");

            return { adminId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => ({
            adminId: metadata.adminId,
            key: file.key,
            url: file.ufsUrl,
        })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
