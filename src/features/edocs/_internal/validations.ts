import { z } from "zod";

export const documentTypeEnum = z.enum(["MEMO", "PROJECT_PROPOSAL", "PURCHASE_REQ", "OFFICIAL_LETTER"]);
export const documentPriorityEnum = z.enum(["NORMAL", "URGENT", "VERY_URGENT"]);
export const documentStatusEnum = z.enum(["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "CANCELLED"]);
export const approvalDecisionEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const approvalStepInputSchema = z.object({
  approverId: z.string().uuid("Invalid approver ID"),
  approverRole: z.string().trim().min(1, "Role is required"),
});

export const createEDocumentSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  docType: documentTypeEnum.default("MEMO"),
  priority: documentPriorityEnum.default("NORMAL"),
  content: z.string().trim().min(1, "content is required"),
  departmentId: z.string().uuid("Invalid department ID"),
  attachmentUrl: z.string().trim().optional().nullable(),
  steps: z.array(approvalStepInputSchema).min(1, "At least one approver step is required"),
});

export const decideStepSchema = z.object({
  stepId: z.string().uuid("Invalid step ID"),
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().trim().optional().nullable(),
});

export type CreateEDocumentInput = z.infer<typeof createEDocumentSchema>;
export type DecideStepInput = z.infer<typeof decideStepSchema>;
