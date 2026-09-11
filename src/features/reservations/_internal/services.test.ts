import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { createReservation, reviewReservation, cancelReservation } from "./services";

vi.mock("@/shared/lib/infra/prisma", () => ({
  prisma: {
    resourceReservation: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
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

describe("reservations.services", () => {
  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "22222222-2222-2222-2222-222222222222";
  const resourceId = "33333333-3333-3333-3333-333333333333";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReservation", () => {
    const input = {
      resourceId,
      title: "การประชุมคณะ",
      applicantName: "ดร.สมชาย",
      applicantEmail: "somchai@app.local",
      applicantPhone: "0812345678",
      departmentName: "ภาควิชาพุทธศาสตร์",
      startTime: new Date("2026-10-01T09:00:00Z"),
      endTime: new Date("2026-10-01T12:00:00Z"),
      attendeeCount: 15,
      purpose: "ประชุมวางแผนหลักสูตร",
      needDriver: false,
    };

    it("โยน AppError code conflict เมื่อช่วงเวลาชนกับการจองที่อนุมัติแล้ว", async () => {
      vi.mocked(prisma.resourceReservation.findFirst).mockResolvedValueOnce({
        id: "conflict-id",
      } as never);

      await expect(createReservation(tenantId, input, userId)).rejects.toMatchObject({
        code: "conflict",
        message: "reservations.conflictError",
      });
    });

    it("สร้างการจองสำเร็จและสร้างเลขที่ใบจอง Running Number เมื่อไม่มี Conflict", async () => {
      vi.mocked(prisma.resourceReservation.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.resourceReservation.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.resourceReservation.create).mockResolvedValueOnce({
        id: "new-booking-id",
        tenantId,
        resourceId,
        reservationNo: "RES-2570/0001",
        title: input.title,
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        applicantPhone: input.applicantPhone,
        departmentName: input.departmentName,
        userId,
        startTime: input.startTime,
        endTime: input.endTime,
        attendeeCount: input.attendeeCount,
        purpose: input.purpose,
        needDriver: false,
        driverName: null,
        specialRequests: null,
        status: "PENDING",
        reviewedById: null,
        reviewedAt: null,
        reviewNote: null,
        createdAt: new Date("2026-09-11T09:00:00Z"),
        updatedAt: new Date("2026-09-11T09:00:00Z"),
        resource: {
          code: "ROOM-101",
          nameTh: "ห้องประชุมสารภี",
          nameEn: "Saraphi Room",
          type: "FACILITY",
          location: "ชั้น 2",
        },
        reviewedBy: null,
      } as never);

      const result = await createReservation(tenantId, input, userId);
      expect(result.reservationNo).toMatch(/^RES-\d{4}\/0001$/);
      expect(result.status).toBe("PENDING");
      expect(prisma.resourceReservation.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("reviewReservation", () => {
    it("โยน AppError code not_found เมื่อไม่พบใบจอง", async () => {
      vi.mocked(prisma.resourceReservation.findFirst).mockResolvedValueOnce(null);

      await expect(
        reviewReservation(tenantId, userId, {
          reservationId: "missing-id",
          status: "APPROVED",
        })
      ).rejects.toMatchObject({
        code: "not_found",
        message: "reservations.notFound",
      });
    });
  });

  describe("cancelReservation", () => {
    it("โยน AppError code forbidden เมื่อผู้ใช้ไม่ใช่เจ้าของการจอง", async () => {
      vi.mocked(prisma.resourceReservation.findFirst).mockResolvedValueOnce({
        id: "booking-1",
        tenantId,
        userId: "other-user-id",
        status: "PENDING",
      } as never);

      await expect(cancelReservation(tenantId, "booking-1", userId)).rejects.toMatchObject({
        code: "forbidden",
        message: "reservations.unauthorized",
      });
    });
  });
});
