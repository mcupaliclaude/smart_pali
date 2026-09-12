import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import type { UpdateSettingsInput } from "../validations/settings";

export interface SmtpSettings {
  enabled: boolean;
  user: string;
  hasPassword?: boolean;
  fromName?: string;
  fromEmail?: string;
}

export interface TenantContact {
  addressTh?: string;
  addressEn?: string;
  phone?: string;
  email?: string;
  hoursTh?: string;
  hoursEn?: string;
  facebook?: string;
  line?: string;
  mapUrl?: string;
}

export interface AiTenantSettings {
  hasGeminiApiKey: boolean;
  geminiModel: string;
  geminiApiKeyMasked?: string;
}

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  contact?: TenantContact;
  smtp?: SmtpSettings;
  ai?: AiTenantSettings;
}

export interface FullSmtpConfig {
  enabled: boolean;
  service: string;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
}

interface DbTenantSettings {
  palette?: unknown;
  contact?: TenantContact;
  smtp?: {
    enabled?: boolean;
    service?: string;
    user?: string;
    pass?: string;
    fromName?: string;
    fromEmail?: string;
  };
  ai?: {
    geminiApiKey?: string;
    geminiModel?: string;
  };
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const s = (t.settings ?? {}) as DbTenantSettings;
  const p = s.palette;
  const contact = s.contact;
  const smtpRaw = s.smtp;
  const smtp: SmtpSettings | undefined = smtpRaw
    ? {
        enabled: Boolean(smtpRaw.enabled),
        user: smtpRaw.user ?? "",
        hasPassword: Boolean(smtpRaw.pass && smtpRaw.pass.length > 0),
        fromName: smtpRaw.fromName ?? "",
        fromEmail: smtpRaw.fromEmail ?? "",
      }
    : undefined;

  const aiRaw = s.ai;
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0);
  const hasDbKey = Boolean(aiRaw?.geminiApiKey && aiRaw.geminiApiKey.length > 0);
  const activeKey = aiRaw?.geminiApiKey || (hasEnvKey ? process.env.GEMINI_API_KEY : "");
  const ai: AiTenantSettings = {
    hasGeminiApiKey: hasDbKey || hasEnvKey,
    geminiModel: aiRaw?.geminiModel || "gemini-2.5-flash",
    geminiApiKeyMasked: activeKey && activeKey.length > 8 ? `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}` : undefined,
  };

  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    contact,
    smtp,
    ai,
  };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

export async function getTenantSmtpConfig(tenantId: string): Promise<FullSmtpConfig | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings ?? {}) as DbTenantSettings;
  if (!s.smtp || !s.smtp.enabled || !s.smtp.user || !s.smtp.pass) {
    return null;
  }
  return {
    enabled: s.smtp.enabled,
    service: s.smtp.service || "gmail",
    user: s.smtp.user,
    pass: s.smtp.pass,
    fromName: s.smtp.fromName,
    fromEmail: s.smtp.fromEmail,
  };
}

export async function getRawTenantSmtp(tenantId: string): Promise<FullSmtpConfig | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings ?? {}) as DbTenantSettings;
  if (!s.smtp) return null;
  return {
    enabled: Boolean(s.smtp.enabled),
    service: s.smtp.service || "gmail",
    user: s.smtp.user ?? "",
    pass: s.smtp.pass ?? "",
    fromName: s.smtp.fromName,
    fromEmail: s.smtp.fromEmail,
  };
}

export async function getTenantGeminiConfig(tenantId: string): Promise<{ apiKey: string | null; model: string }> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings ?? {}) as DbTenantSettings;
  const dbKey = s.ai?.geminiApiKey?.trim() || null;
  const envKey = process.env.GEMINI_API_KEY?.trim() || null;
  const apiKey = dbKey || envKey;
  const model = s.ai?.geminiModel?.trim() || "gemini-2.5-flash";
  return { apiKey, model };
}

export async function getRawTenantGeminiApiKey(tenantId: string): Promise<string | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings ?? {}) as DbTenantSettings;
  return s.ai?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || null;
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge เฉพาะ palette, smtp และ ai ที่เปลี่ยน ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // อ่านผ่าน tx เดียวกัน ไม่ใช่ client กลาง — ไม่งั้นทรานแซกชันนี้กินคอนเนกชันจากพูลเพิ่มอีกเส้นเพื่ออ่าน
    // ค่าเดิม และค่าที่อ่านได้ก็อยู่นอกสแนปช็อตของทรานแซกชัน (ค่า before ของ audit อาจไม่ตรงกับที่กำลังจะทับ)
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const currentSettings = (t.settings ?? {}) as DbTenantSettings;

    let updatedSmtp = currentSettings.smtp;
    if (input.smtp) {
      const cleanedPass = input.smtp.pass ? input.smtp.pass.replace(/\s+/g, "") : "";
      const existingPass = currentSettings.smtp?.pass ?? "";
      const finalPass = cleanedPass || existingPass;

      updatedSmtp = {
        enabled: input.smtp.enabled,
        service: "gmail",
        user: input.smtp.user,
        pass: finalPass,
        fromName: input.smtp.fromName || "",
        fromEmail: input.smtp.fromEmail || "",
      };
    }

    let updatedAi = currentSettings.ai;
    if (input.ai) {
      const cleanedKey = input.ai.geminiApiKey ? input.ai.geminiApiKey.trim() : "";
      const existingKey = currentSettings.ai?.geminiApiKey ?? "";
      const finalKey = cleanedKey === "__CLEAR__" ? "" : (cleanedKey || existingKey);
      updatedAi = {
        geminiApiKey: finalKey,
        geminiModel: input.ai.geminiModel || currentSettings.ai?.geminiModel || "gemini-2.5-flash",
      };
    }

    const newSettings = {
      ...currentSettings,
      palette: input.palette,
      ...(input.contact !== undefined ? { contact: input.contact } : {}),
      ...(input.smtp ? { smtp: updatedSmtp } : {}),
      ...(input.ai !== undefined ? { ai: updatedAi } : {}),
    };

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: newSettings as object,
      },
    });

    const auditAfter = {
      ...input,
      smtp: input.smtp
        ? {
            ...input.smtp,
            pass: input.smtp.pass ? "[REDACTED]" : (currentSettings.smtp?.pass ? "[UNCHANGED]" : "[EMPTY]"),
          }
        : undefined,
      ai: input.ai
        ? {
            ...input.ai,
            geminiApiKey: input.ai.geminiApiKey ? "[REDACTED]" : (currentSettings.ai?.geminiApiKey ? "[UNCHANGED]" : "[EMPTY]"),
          }
        : undefined,
    };

    await writeAudit(
      {
        tenantId: input.tenantId,
        actorId: input.actorId,
        action: "tenant.settings_update",
        entity: "tenant",
        entityId: input.tenantId,
        before,
        after: auditAfter,
      },
      tx,
    );
  });
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId = (await sessionTenantId()) || (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});
