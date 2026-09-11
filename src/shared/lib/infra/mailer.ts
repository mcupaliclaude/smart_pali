import "server-only";
import nodemailer from "nodemailer";
import { env, smtpConfigured } from "./env";
import { logger } from "./logger";

export interface SmtpTransportOptions {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  smtp?: SmtpTransportOptions;
}

/** ไม่มี SMTP → เขียนลง log ระดับ info แล้วคืน delivered:false — ระบบต้องไม่ล้มเพราะส่งอีเมลไม่ได้ */
export async function sendMail(input: MailInput): Promise<{ delivered: boolean }> {
  // หากมี custom SMTP (เช่น Gmail SMTP ขององค์กร) ให้ส่งผ่านบัญชีนั้น
  if (input.smtp && input.smtp.user && input.smtp.pass) {
    try {
      const transport = nodemailer.createTransport(
        input.smtp.service === "gmail"
          ? {
              service: "gmail",
              auth: { user: input.smtp.user, pass: input.smtp.pass.replace(/\s+/g, "") },
            }
          : {
              host: input.smtp.host || "smtp.gmail.com",
              port: input.smtp.port || 465,
              secure: input.smtp.secure ?? true,
              auth: { user: input.smtp.user, pass: input.smtp.pass.replace(/\s+/g, "") },
            },
      );
      const from = input.smtp.fromName
        ? `"${input.smtp.fromName}" <${input.smtp.fromEmail || input.smtp.user}>`
        : input.smtp.fromEmail || input.smtp.user;
      await transport.sendMail({ from, to: input.to, subject: input.subject, text: input.text, html: input.html });
      return { delivered: true };
    } catch (err) {
      logger.error("mail send failed via tenant SMTP", { to: input.to, err: err instanceof Error ? err.message : String(err) });
      return { delivered: false };
    }
  }

  if (!smtpConfigured()) {
    logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }
  const e = env();
  try {
    const transport = nodemailer.createTransport({
      host: e.SMTP_HOST, port: e.SMTP_PORT, secure: e.SMTP_PORT === 465,
      auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: e.SMTP_FROM, to: input.to, subject: input.subject, text: input.text, html: input.html });
    return { delivered: true };
  } catch (err) {
    logger.error("mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
    return { delivered: false };
  }
}

/** ทดสอบการเชื่อมต่อ SMTP และส่งอีเมลทดสอบ 1 ฉบับ */
export async function testSmtpTransport(
  options: SmtpTransportOptions,
  to: string,
): Promise<{ success: boolean; error?: string }> {
  if (!options.user || !options.pass) {
    return { success: false, error: "Missing Gmail address or App Password" };
  }
  try {
    const transport = nodemailer.createTransport(
      options.service === "gmail"
        ? {
            service: "gmail",
            auth: { user: options.user, pass: options.pass.replace(/\s+/g, "") },
          }
        : {
            host: options.host || "smtp.gmail.com",
            port: options.port || 465,
            secure: options.secure ?? true,
            auth: { user: options.user, pass: options.pass.replace(/\s+/g, "") },
          },
    );

    // ทดสอบการเชื่อมต่อ
    await transport.verify();

    // ส่งอีเมลทดสอบ
    const from = options.fromName
      ? `"${options.fromName}" <${options.fromEmail || options.user}>`
      : options.fromEmail || options.user;

    await transport.sendMail({
      from,
      to,
      subject: "Smart Pali - ทดสอบการตั้งค่า Gmail SMTP สำเร็จ (Test Email)",
      text: `การเชื่อมต่อระบบอีเมล Gmail SMTP กับ Smart Pali สำเร็จเรียบร้อย\n\nบัญชีผู้ส่ง: ${options.user}\nเวลา: ${new Date().toLocaleString("th-TH")}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">ทดสอบระบบอีเมล Smart Pali สำเร็จ</h2>
          <p style="color: #334155; line-height: 1.6; font-size: 15px;">
            การตั้งค่าการเชื่อมต่อระบบอีเมลผ่าน <strong>Gmail SMTP</strong> สำหรับองค์กรของคุณทำงานได้อย่างถูกต้องเรียบร้อยแล้ว
          </p>
          <div style="background-color: #f8fafc; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #475569; border: 1px solid #edf2f7;">
            <p style="margin: 4px 0;"><strong>บัญชี Gmail:</strong> ${options.user}</p>
            <p style="margin: 4px 0;"><strong>ชื่อผู้ส่ง:</strong> ${options.fromName || "Smart Pali"}</p>
            <p style="margin: 4px 0;"><strong>ผู้รับทดสอบ:</strong> ${to}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">อีเมลนี้เป็นการทดสอบจากระบบ Smart Pali (VibeCore)</p>
        </div>
      `,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("SMTP test connection failed", { user: options.user, error: msg });
    return { success: false, error: msg };
  }
}

