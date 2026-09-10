import { describe, it, expect } from "vitest";
import { createNewsArticleSchema, updateNewsArticleSchema } from "./validations";

describe("news validations", () => {
  const validPayload = {
    titleTh: "เปิดรับสมัครนักศึกษาใหม่ 2570",
    titleEn: "Admission Open 2027",
    slug: "admission-open-2027",
    categoryId: "123e4567-e89b-12d3-a456-426614174000",
    excerptTh: "รายละเอียดการรับสมัคร",
    excerptEn: "Admission details",
    contentTh: "เนื้อหาข่าวภาษาไทยฉบับสมบูรณ์",
    contentEn: "Full english content",
    coverImageUrl: "https://example.com/cover.jpg",
    isPinned: true,
    isFeatured: true,
    status: "PUBLISHED" as const,
  };

  it("passes with valid data", () => {
    const result = createNewsArticleSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("fails when slug contains uppercase or spaces", () => {
    const result = createNewsArticleSchema.safeParse({
      ...validPayload,
      slug: "Invalid Slug!",
    });
    expect(result.success).toBe(false);
  });

  it("fails when title is too short", () => {
    const result = createNewsArticleSchema.safeParse({
      ...validPayload,
      titleTh: "ก",
    });
    expect(result.success).toBe(false);
  });

  it("validates update schema requires UUID id", () => {
    const result = updateNewsArticleSchema.safeParse({
      ...validPayload,
      id: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result.success).toBe(true);

    const invalid = updateNewsArticleSchema.safeParse({
      ...validPayload,
      id: "not-a-uuid",
    });
    expect(invalid.success).toBe(false);
  });
});
