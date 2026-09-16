import "server-only";

import nodemailer from "nodemailer";

export interface ContactEmailInput {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

function escapeHtml(value: string) {
    const entities: Record<string, string> = {
        "&": "&" + "amp;",
        "<": "&" + "lt;",
        ">": "&" + "gt;",
        "\u0022": "&" + "quot;",
        "\u0027": "&" + "#039;",
    };
    return value.replace(/[&<>\u0022\u0027]/g, (character) => entities[character]);
}

function getContactMailConfig() {
    const user = process.env.CONTACT_EMAIL_USER?.trim();
    const password = process.env.GOOGLE_APP_PASSWORD?.trim();

    if (!user || !password) {
        throw new Error(
            "Thiếu cấu hình CONTACT_EMAIL_USER hoặc GOOGLE_APP_PASSWORD.",
        );
    }

    return { user, password };
}

export async function sendContactEmail(input: ContactEmailInput) {
    const { user, password } = getContactMailConfig();
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass: password },
    });

    const safeName = escapeHtml(input.name);
    const safeEmail = escapeHtml(input.email);
    const safePhone = escapeHtml(input.phone || "Không cung cấp");
    const safeMessage = escapeHtml(input.message).replaceAll("\n", "<br />");

    await transporter.sendMail({
        from: `DanaFarm Website <${user}>`,
        to: user,
        replyTo: input.email,
        subject: `[DanaFarm] Liên hệ mới từ ${input.name}`,
        text: [
            `Họ tên: ${input.name}`,
            `Email: ${input.email}`,
            `Số điện thoại: ${input.phone || "Không cung cấp"}`,
            "",
            "Nội dung:",
            input.message,
        ].join("\n"),
        html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#27231d">
        <h2 style="color:#d9763d">Liên hệ mới từ website DanaFarm</h2>
        <table style="border-collapse:collapse;width:100%;max-width:640px">
          <tr><td style="padding:8px;border:1px solid #e7e2d5"><strong>Họ tên</strong></td><td style="padding:8px;border:1px solid #e7e2d5">${safeName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e7e2d5"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e7e2d5">${safeEmail}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e7e2d5"><strong>Số điện thoại</strong></td><td style="padding:8px;border:1px solid #e7e2d5">${safePhone}</td></tr>
        </table>
        <h3 style="margin-top:20px">Nội dung</h3>
        <div style="padding:16px;background:#f7f4ed;border-radius:10px">${safeMessage}</div>
      </div>
    `,
    });
}

