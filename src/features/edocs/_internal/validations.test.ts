import { describe, it, expect } from "vitest";
import {
  createEDocumentSchema,
  decideStepSchema,
} from "./validations";

describe("e-Document Validations", () => {
  const validDoc = {
    title: "ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการพุทธนวัตกรรม",
    docType: "PROJECT_PROPOSAL" as const,
    priority: "URGENT" as const,
    content: "เนื่องด้วยภาควิชามีความประสงค์จะจัดโครงการสัมมนา...",
    departmentId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
    steps: [
      {
        approverId: "b1c2d3e4-f5a6-4b2c-9d3e-4f5a6b7c8d9e",
        approverRole: "หัวหน้าภาควิชา",
      },
      {
        approverId: "c1d2e3f4-a5b6-4c3d-8e4f-5a6b7c8d9e0f",
        approverRole: "คณบดี",
      },
    ],
  };

  it("validates a complete valid document with approval steps", () => {
    const result = createEDocumentSchema.safeParse(validDoc);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการพุทธนวัตกรรม");
      expect(result.data.steps).toHaveLength(2);
    }
  });

  it("fails when steps array is empty", () => {
    const result = createEDocumentSchema.safeParse({
      ...validDoc,
      steps: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates decideStepSchema for approve or reject", () => {
    const validDecision = {
      stepId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      decision: "APPROVED" as const,
      comment: "เห็นควรอนุมัติตามเสนอ",
    };
    const result = decideStepSchema.safeParse(validDecision);
    expect(result.success).toBe(true);
  });
});
