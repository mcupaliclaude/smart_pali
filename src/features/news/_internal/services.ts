import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "@/shared/lib/audit";
import type { CreateNewsArticleInput, UpdateNewsArticleInput, TranslateNewsInput } from "./validations";

export interface NewsCategoryDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  seq: number;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  titleTh: string;
  titleEn: string;
  slug: string;
  categoryId: string;
  categoryNameTh: string;
  categoryNameEn: string;
  categoryCode: string;
  excerptTh: string | null;
  excerptEn: string | null;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string | null;
  viewCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type ArticleWithCategory = Prisma.NewsArticleGetPayload<{ include: { category: true } }>;

function toArticleDto(a: ArticleWithCategory): NewsArticleDto {
  return {
    id: a.id,
    tenantId: a.tenantId,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categoryCode: a.category.code,
    excerptTh: a.excerptTh,
    excerptEn: a.excerptEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    viewCount: a.viewCount,
    isPinned: a.isPinned,
    isFeatured: a.isFeatured,
    status: a.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function listNewsCategories(tenantId: string): Promise<NewsCategoryDto[]> {
  const categories = await prisma.newsCategory.findMany({
    where: { tenantId, isActive: true },
    orderBy: { seq: "asc" },
  });
  return categories.map((c) => ({
    id: c.id,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    seq: c.seq,
  }));
}

export async function listAdminNews(tenantId: string): Promise<NewsArticleDto[]> {
  const articles = await prisma.newsArticle.findMany({
    where: { tenantId },
    include: { category: true },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
  });

  return articles.map(toArticleDto);
}

export async function listPublishedNews(
  tenantId: string,
  options?: { categoryCode?: string; search?: string; limit?: number }
): Promise<NewsArticleDto[]> {
  const now = new Date();
  const where: Prisma.NewsArticleWhereInput = {
    tenantId,
    status: "PUBLISHED",
    OR: [
      { publishedAt: null },
      { publishedAt: { lte: now } },
    ],
  };

  if (options?.categoryCode) {
    where.category = { code: options.categoryCode };
  }

  if (options?.search) {
    const s = options.search.trim();
    where.AND = [
      {
        OR: [
          { titleTh: { contains: s, mode: "insensitive" } },
          { titleEn: { contains: s, mode: "insensitive" } },
          { excerptTh: { contains: s, mode: "insensitive" } },
          { excerptEn: { contains: s, mode: "insensitive" } },
        ],
      },
    ];
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: { category: true },
    orderBy: [
      { isPinned: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: options?.limit ?? 30,
  });

  return articles.map(toArticleDto);
}

export async function getNewsBySlug(
  tenantId: string,
  slug: string,
  incrementView = false
): Promise<NewsArticleDto | null> {
  const article = await prisma.newsArticle.findFirst({
    where: { tenantId, slug, status: "PUBLISHED" },
    include: { category: true },
  });

  if (!article) return null;

  if (incrementView) {
    await prisma.newsArticle.update({
      where: { id: article.id, tenantId },
      data: { viewCount: { increment: 1 } },
    });
    article.viewCount += 1;
  }

  return toArticleDto(article);
}

export async function createNewsArticle(
  tenantId: string,
  authorId: string,
  input: CreateNewsArticleInput
): Promise<NewsArticleDto> {
  const publishedAt = input.status === "PUBLISHED"
    ? (input.publishedAt ? new Date(input.publishedAt) : new Date())
    : (input.publishedAt ? new Date(input.publishedAt) : null);

  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      authorId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: input.slug,
      categoryId: input.categoryId,
      excerptTh: input.excerptTh ?? null,
      excerptEn: input.excerptEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl ?? null,
      isPinned: input.isPinned,
      isFeatured: input.isFeatured,
      status: input.status,
      publishedAt,
    },
    include: { category: true },
  });

  return toArticleDto(created);
}

export async function updateNewsArticle(
  tenantId: string,
  input: UpdateNewsArticleInput
): Promise<NewsArticleDto> {
  const publishedAt = input.status === "PUBLISHED"
    ? (input.publishedAt ? new Date(input.publishedAt) : new Date())
    : (input.publishedAt ? new Date(input.publishedAt) : null);

  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: {
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: input.slug,
      categoryId: input.categoryId,
      excerptTh: input.excerptTh ?? null,
      excerptEn: input.excerptEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl ?? null,
      isPinned: input.isPinned,
      isFeatured: input.isFeatured,
      status: input.status,
      publishedAt,
    },
    include: { category: true },
  });

  return toArticleDto(updated);
}

export async function deleteNewsArticle(
  tenantId: string,
  id: string,
  actorId?: string | null
): Promise<void> {
  const existing = await prisma.newsArticle.findFirst({
    where: { id, tenantId },
  });

  if (!existing) {
    throw errors.not_found("news.notFound");
  }

  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });

  await writeAudit({
    tenantId,
    actorId: actorId ?? null,
    action: "news.delete",
    entity: "news_article",
    entityId: id,
    before: { titleTh: existing.titleTh, slug: existing.slug },
  });
}

export async function togglePinNewsArticle(tenantId: string, id: string): Promise<boolean> {
  const current = await prisma.newsArticle.findUniqueOrThrow({
    where: { id, tenantId },
    select: { isPinned: true },
  });
  const updated = await prisma.newsArticle.update({
    where: { id, tenantId },
    data: { isPinned: !current.isPinned },
    select: { isPinned: true },
  });
  return updated.isPinned;
}

export interface TranslatedNewsResult {
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  slug: string;
}

export async function translateNewsWithGemini(
  config: { apiKey: string; model: string },
  input: TranslateNewsInput
): Promise<TranslatedNewsResult> {
  const apiKey = config.apiKey;
  const model = config.model || "gemini-2.5-flash";

  const prompt = `You are a professional bilingual translator for a prestigious Buddhist university in Thailand (Mahachulalongkornrajavidyalaya University / MCU).
Translate the provided Thai news information into English with an academic, elegant, and professional tone suitable for public news releases and portal announcements.

Thai Title:
${input.titleTh}

${input.excerptTh ? `Thai Excerpt:\n${input.excerptTh}\n` : ""}
${input.contentTh ? `Thai Content:\n${input.contentTh}\n` : ""}

Generate the English version in JSON format with exactly the following fields:
- "titleEn": Professional, appealing English headline (capitalized appropriately).
- "excerptEn": Concise English summary / excerpt (1-2 sentences suitable for news cards).
- "contentEn": Full English news article translation. If no Thai content was provided, write a 2-3 paragraph professional article based on the title and excerpt. Preserve clear paragraph breaks.
- "slug": URL-friendly slug in lowercase using only English letters, numbers, and hyphens (max 60 chars, no spaces, no special characters).

Return ONLY raw JSON, with no markdown formatting or backticks.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    }
  );

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(`Google Gemini API error: ${errMsg}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("No translation response received from Gemini");
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      titleEn: String(parsed.titleEn || "").trim(),
      excerptEn: String(parsed.excerptEn || "").trim(),
      contentEn: String(parsed.contentEn || "").trim(),
      slug: String(parsed.slug || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    };
  } catch {
    throw new Error("Failed to parse translation response from Gemini");
  }
}

