"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, type TenantSettings } from "../services/tenant.service";

import { errors } from "@/shared/lib/errors";
import { saveUploadedLogo, type UploadableFile } from "../services/logo-upload.service";
import { testSmtpSchema, testGeminiApiSchema } from "../validations/settings";
import { getRawTenantSmtp, getRawTenantGeminiApiKey } from "../services/tenant.service";
import { testSmtpTransport } from "@/shared/lib/infra/mailer";

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}
export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file");
    if (!file || typeof file === "string" || typeof (file as Blob).arrayBuffer !== "function") {
      throw errors.validation("validation", { file: ["File is required"] });
    }
    return saveUploadedLogo(file as unknown as UploadableFile, ctx.tenantId);
  });
}

export async function testSmtpAction(input: unknown): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const locale = await getLocale();
    const data = testSmtpSchema.parse(input, { error: zodErrorMap(locale) });

    let pass = data.pass?.trim() || "";
    if (!pass) {
      const existing = await getRawTenantSmtp(ctx.tenantId);
      if (existing?.pass) {
        pass = existing.pass;
      }
    }

    if (!pass) {
      throw errors.validation("validation", {
        pass: [locale === "th" ? "กรุณาระบุ Google App Password (รหัสผ่านสำหรับแอป 16 หลัก)" : "Google App Password is required"],
      });
    }

    const result = await testSmtpTransport(
      {
        service: "gmail",
        user: data.user,
        pass,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
      },
      data.to,
    );

    if (!result.success) {
      throw errors.validation("validation", {
        _form: [result.error || (locale === "th" ? "ไม่สามารถเชื่อมต่อ Gmail ได้" : "Failed to connect to Gmail")],
      });
    }

    return { success: true };
  });
}

export async function testGeminiApiAction(input: unknown): Promise<ActionResult<{ success: boolean; message: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const locale = await getLocale();
    const data = testGeminiApiSchema.parse(input, { error: zodErrorMap(locale) });

    let key = data.apiKey?.trim() || "";
    if (!key) {
      key = (await getRawTenantGeminiApiKey(ctx.tenantId)) || "";
    }

    if (!key) {
      throw errors.validation("validation", {
        apiKey: [locale === "th" ? "กรุณาระบุ Gemini API Key ก่อนทดสอบ" : "Gemini API Key is required"],
      });
    }

    const model = data.model || "gemini-2.5-flash";
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Ping test. Respond with: OK" }] }],
          }),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        throw errors.validation("validation", {
          _form: [locale === "th" ? `การเชื่อมต่อล้มเหลว: ${errMsg}` : `Connection failed: ${errMsg}`],
        });
      }

      return {
        success: true,
        message: locale === "th" ? "เชื่อมต่อ Google Gemini API สำเร็จพร้อมใช้งาน" : "Google Gemini API connected successfully",
      };
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "validation") {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.validation("validation", {
        _form: [locale === "th" ? `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${msg}` : `Connection error: ${msg}`],
      });
    }
  });
}



