import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "@/shared/lib/audit";
import type { CreateNewsArticleInput, UpdateNewsArticleInput } from "./validations";

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
