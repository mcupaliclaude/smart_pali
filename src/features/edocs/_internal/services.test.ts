import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { decideApprovalStep, cancelEDocument } from "./services";

vi.mock("@/shared/lib/infra/prisma", () => ({
  prisma: {
    eDocument: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    eDocumentApprovalStep: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      return callback({
        eDocument: {
          update: vi.fn().mockImplementation((args) => ({
            id: args.where.id,
            tenantId: args.where.tenantId,
            docNo: "พธ-2570/0001",
            title: "บันทึกข้อความ",
            docType: "MEMO",
            priority: "NORMAL",
            content: "เนื้อหา",
            submitterId: "sub-1",
            departmentId: "dept-1",
            attachmentUrl: null,
            status: args.data.status,
            createdAt: new Date("2026-09-11T09:00:00Z"),
            updatedAt: new Date("2026-09-11T09:00:00Z"),
            submitter: { name: "สมชาย", email: "somchai@app.local" },
            department: { nameTh: "ภาควิชาพุทธศาสตร์", nameEn: "Buddhism" },
            approvalSteps: [],
          })),
        },
        eDocumentApprovalStep: {
          update: vi.fn(),
        },
        auditLog: {
          create: vi.fn(),
        },
      });
    }),
  },
}));

vi.mock("@/shared/lib/audit", () => ({
  writeAudit: vi.fn(),
}));

describe("edocs.services", () => {
  const tenantId = "11111111-1111-1111-1111-111111111111";
  const userId = "approver-user-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("decideApprovalStep", () => {
    it("โยน AppError not_found เมื่อไม่พบขั้นตอนการอนุมัติ", async () => {
      vi.mocked(prisma.eDocumentApprovalStep.findFirst).mockResolvedValueOnce(null);

      await expect(
        decideApprovalStep(tenantId, userId, {
          stepId: "missing-step",
          decision: "APPROVED",
        })
      ).rejects.toMatchObject({
        code: "not_found",
        message: "edocs.stepNotFound",
      });
    });

    it("โยน AppError forbidden เมื่อผู้ใช้ไม่ใช่ผู้อนุมัติในขั้นตอนนี้", async () => {
      vi.mocked(prisma.eDocumentApprovalStep.findFirst).mockResolvedValueOnce({
        id: "step-1",
        tenantId,
        approverId: "another-approver",
        decision: "PENDING",
      } as never);

      await expect(
        decideApprovalStep(tenantId, userId, {
          stepId: "step-1",
          decision: "APPROVED",
        })
      ).rejects.toMatchObject({
        code: "forbidden",
        message: "edocs.unauthorizedStep",
      });
    });

    it("โยน AppError conflict เมื่อขั้นตอนนี้ได้รับการตัดสินไปแล้ว", async () => {
      vi.mocked(prisma.eDocumentApprovalStep.findFirst).mockResolvedValueOnce({
        id: "step-1",
        tenantId,
        approverId: userId,
        decision: "APPROVED",
      } as never);

      await expect(
        decideApprovalStep(tenantId, userId, {
          stepId: "step-1",
          decision: "APPROVED",
        })
      ).rejects.toMatchObject({
        code: "conflict",
        message: "edocs.stepAlreadyDecided",
      });
    });
  });

  describe("cancelEDocument", () => {
    it("โยน AppError conflict เมื่อพยายามยกเลิกเอกสารที่ได้รับอนุมัติแล้ว", async () => {
      vi.mocked(prisma.eDocument.findFirst).mockResolvedValueOnce({
        id: "doc-1",
        tenantId,
        submitterId: userId,
        status: "APPROVED",
      } as never);

      await expect(cancelEDocument(tenantId, userId, "doc-1")).rejects.toMatchObject({
        code: "conflict",
        message: "edocs.cannotCancelApproved",
      });
    });

    it("โยน AppError forbidden เมื่อผู้ขอยกเลิกไม่ใช่ผู้ยื่นเอกสาร", async () => {
      vi.mocked(prisma.eDocument.findFirst).mockResolvedValueOnce({
        id: "doc-1",
        tenantId,
        submitterId: "different-user",
        status: "SUBMITTED",
      } as never);

      await expect(cancelEDocument(tenantId, userId, "doc-1")).rejects.toMatchObject({
        code: "forbidden",
        message: "edocs.unauthorizedCancel",
      });
    });
  });
});
