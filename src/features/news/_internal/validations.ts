import { z } from "zod";

export const newsStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createNewsArticleSchema = z.object({
  titleTh: z.string().trim().min(3, "titleTh is required"),
  titleEn: z.string().trim().min(3, "titleEn is required"),
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  categoryId: z.string().uuid("Invalid category ID"),
  excerptTh: z.string().trim().optional().nullable(),
  excerptEn: z.string().trim().optional().nullable(),
  contentTh: z.string().trim().min(1, "contentTh is required"),
  contentEn: z.string().trim().min(1, "contentEn is required"),
  coverImageUrl: z.string().trim().optional().nullable(),
  isPinned: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  status: newsStatusEnum.default("DRAFT"),
  publishedAt: z.string().optional().nullable(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid("Invalid news article ID"),
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
