import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "danafarm_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
    const [salt, keyHex] = storedHash.split(":");
    if (!salt || !keyHex) return false;

    const storedKey = Buffer.from(keyHex, "hex");
    const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;
    return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

function hashSessionToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.session.create({
        data: { userId, tokenHash: hashSessionToken(token), expiresAt },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
    });
}

export async function destroySession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
        await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
    }
    cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    try {
        const session = await prisma.session.findUnique({
            where: { tokenHash: hashSessionToken(token) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!session || session.expiresAt <= new Date()) {
            if (session) await prisma.session.delete({ where: { id: session.id } });
            cookieStore.delete(SESSION_COOKIE);
            return null;
        }

        return session.user;
    } catch (error) {
        // An invalid/stale cookie must never make shared layouts such as Header crash.
        console.error("Unable to resolve the current session", error);
        cookieStore.delete(SESSION_COOKIE);
        return null;
    }
}

export async function requireAdmin() {
    const user = await getCurrentUser();

    if (!user) redirect("/login?next=/admin");
    if (user.role !== "ADMIN") redirect("/account");

    return user;
}

export async function getAdminUser() {
    const user = await getCurrentUser();
    return user?.role === "ADMIN" ? user : null;
}
