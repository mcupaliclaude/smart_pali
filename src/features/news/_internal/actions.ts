"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import { createNewsArticleSchema, updateNewsArticleSchema } from "./validations";
import {
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  togglePinNewsArticle,
  type NewsArticleDto,
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
    await deleteNewsArticle(ctx.tenantId, id);
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
