import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { reviewMeditationRegistration, cancelMeditationRegistration } from "./services";

vi.mock("@/shared/lib/infra/prisma", () => ({
  prisma: {
    meditationRegistration: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/shared/lib/audit", () => ({
  writeAudit: vi.fn(),
}));

describe("meditation.services", () => {
  const tenantId = "11111111-1111-1111-1111-111111111111";
  const reviewerId = "reviewer-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reviewMeditationRegistration", () => {
    it("โยน AppError not_found เมื่อไม่พบใบสมัคร", async () => {
      vi.mocked(prisma.meditationRegistration.findFirst).mockResolvedValueOnce(null);

      await expect(
        reviewMeditationRegistration(tenantId, reviewerId, {
          registrationId: "missing-reg-id",
          status: "CONFIRMED",
        })
      ).rejects.toMatchObject({
        code: "not_found",
        message: "meditation.registrationNotFound",
      });
    });

    it("อัปเดตสถานะเป็น CONFIRMED พร้อมจัดสรรกุฏิที่พักสำเร็จ", async () => {
      vi.mocked(prisma.meditationRegistration.findFirst).mockResolvedValueOnce({
        id: "reg-1",
        tenantId,
        status: "PENDING",
        roomAssigned: null,
      } as never);

      vi.mocked(prisma.meditationRegistration.update).mockResolvedValueOnce({
        id: "reg-1",
        tenantId,
        courseId: "course-1",
        registrationNo: "MED-2570/0001",
        fullNameTh: "ประสิทธิ์ ใจสงบ",
        fullNameEn: "Prasit Jaisangob",
        nationalId: "1234567890123",
        gender: "MALE",
        age: 35,
        phone: "0891234567",
        email: "prasit@app.local",
        occupation: "ข้าราชการ",
        address: "กรุงเทพฯ",
        emergencyContactName: "สมศรี",
        emergencyContactPhone: "0897654321",
        medicalConditions: null,
        dietaryRequirements: null,
        experience: "เคยปฏิบัติ 7 วัน",
        roomAssigned: "กุฏิ 12",
        status: "CONFIRMED",
        reviewedById: reviewerId,
        reviewedAt: new Date("2026-09-11T09:00:00Z"),
        reviewNote: "ผ่านคุณสมบัติครบถ้วน",
        createdAt: new Date("2026-09-11T09:00:00Z"),
        updatedAt: new Date("2026-09-11T09:00:00Z"),
        course: {
          code: "MED-01",
          titleTh: "อบรมวิปัสสนาเบื้องต้น",
          titleEn: "Basic Vipassana",
          startDate: new Date("2026-10-01"),
          endDate: new Date("2026-10-03"),
        },
        reviewedBy: {
          name: "พระอาจารย์ผู้ตรวจ",
        },
      } as never);

      const result = await reviewMeditationRegistration(tenantId, reviewerId, {
        registrationId: "reg-1",
        status: "CONFIRMED",
        roomAssigned: "กุฏิ 12",
      });

      expect(result.status).toBe("CONFIRMED");
      expect(result.roomAssigned).toBe("กุฏิ 12");
      expect(prisma.meditationRegistration.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("cancelMeditationRegistration", () => {
    it("โยน AppError not_found เมื่อไม่พบใบสมัครเพื่อยกเลิก", async () => {
      vi.mocked(prisma.meditationRegistration.findFirst).mockResolvedValueOnce(null);

      await expect(
        cancelMeditationRegistration(tenantId, "non-existent")
      ).rejects.toMatchObject({
        code: "not_found",
        message: "meditation.registrationNotFound",
      });
    });
  });
});
