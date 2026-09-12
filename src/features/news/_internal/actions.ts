"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, getTenantGeminiConfig } from "@/features/identity/server";
import { errors } from "@/shared/lib/errors";
import { NEWS_P } from "../permissions";
import { createNewsArticleSchema, updateNewsArticleSchema, translateNewsSchema } from "./validations";
import {
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  togglePinNewsArticle,
  translateNewsWithGemini,
  type NewsArticleDto,
  type TranslatedNewsResult,
} from "./services";

export async function createNewsAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const parsed = createNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return result;
  });
}

export async function updateNewsAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNewsArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return result;
  });
}

export async function deleteNewsAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await deleteNewsArticle(ctx.tenantId, id, ctx.userId);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
  });
}

export async function togglePinNewsAction(id: string): Promise<ActionResult<boolean>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    const isPinned = await togglePinNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return isPinned;
  });
}

export async function translateNewsWithGeminiAction(input: unknown): Promise<ActionResult<TranslatedNewsResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const locale = await getLocale();
    const parsed = translateNewsSchema.parse(input, { error: zodErrorMap(locale) });
    const aiConfig = await getTenantGeminiConfig(ctx.tenantId);

    if (!aiConfig.apiKey) {
      throw errors.validation("validation", {
        _form: [
          locale === "th"
            ? "ยังไม่ได้ตั้งค่า Google Gemini API Key กรุณาไปที่เมนูตั้งค่าระบบเพื่อระบุ API Key ก่อนใช้งานฟังก์ชันนี้"
            : "Google Gemini API Key is not configured. Please set it in System Settings before using this feature",
        ],
      });
    }

    return translateNewsWithGemini({ apiKey: aiConfig.apiKey, model: aiConfig.model }, parsed);
  });
}

