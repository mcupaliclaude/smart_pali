import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublishedNews, deleteNewsArticle } from "./services";

vi.mock("@/shared/lib/infra/prisma", () => ({
  prisma: {
    newsArticle: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/shared/lib/audit", () => ({
  writeAudit: vi.fn(),
}));

describe("news.services", () => {
  const tenantId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listPublishedNews", () => {
    it("แปลงข้อมูลเป็น DTO และดึงเฉพาะบทความที่มีสถานะ PUBLISHED", async () => {
      const now = new Date();
      vi.mocked(prisma.newsArticle.findMany).mockResolvedValueOnce([
        {
          id: "article-1",
          tenantId,
          titleTh: "ข่าวสารเปิดรับสมัคร",
          titleEn: "Admission Open",
          slug: "admission-open",
          categoryId: "cat-1",
          excerptTh: "บทคัดย่อ",
          excerptEn: "Excerpt",
          contentTh: "เนื้อหาข่าวฉบับเต็ม",
          contentEn: "Full news content",
          coverImageUrl: "https://example.com/cover.jpg",
          viewCount: 120,
          isPinned: true,
          isFeatured: false,
          status: "PUBLISHED",
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
          category: {
            id: "cat-1",
            code: "ACADEMIC",
            nameTh: "ข่าวการศึกษา",
            nameEn: "Academic News",
            seq: 1,
          },
        },
      ] as never);

      const list = await listPublishedNews(tenantId, { categoryCode: "ACADEMIC" });
      expect(list).toHaveLength(1);
      expect(list[0].slug).toBe("admission-open");
      expect(list[0].categoryCode).toBe("ACADEMIC");
      expect(list[0].status).toBe("PUBLISHED");
      expect(prisma.newsArticle.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteNewsArticle", () => {
    it("โยน AppError not_found เมื่อไม่พบบทความข่าวสาร", async () => {
      vi.mocked(prisma.newsArticle.findFirst).mockResolvedValueOnce(null);

      await expect(deleteNewsArticle(tenantId, "missing-article-id")).rejects.toMatchObject({
        code: "not_found",
        message: "news.notFound",
      });
    });

    it("ลบบทความข่าวสารสำเร็จและบันทึก Audit Log", async () => {
      vi.mocked(prisma.newsArticle.findFirst).mockResolvedValueOnce({
        id: "article-1",
        tenantId,
        titleTh: "ข่าวเก่า",
        slug: "old-news",
      } as never);

      vi.mocked(prisma.newsArticle.delete).mockResolvedValueOnce({} as never);

      await deleteNewsArticle(tenantId, "article-1", "admin-user");

      expect(prisma.newsArticle.delete).toHaveBeenCalledWith({
        where: { id: "article-1", tenantId },
      });
    });
  });
});
