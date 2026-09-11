import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "@/shared/lib/audit";
import type { CreateEDocumentInput, DecideStepInput } from "./validations";

export interface EDocumentApprovalStepDto {
  id: string;
  documentId: string;
  approverId: string;
  approverName: string;
  approverEmail: string;
  approverRole: string;
  stepOrder: number;
  decision: "PENDING" | "APPROVED" | "REJECTED";
  comment: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface EDocumentDto {
  id: string;
  tenantId: string;
  docNo: string;
  title: string;
  docType: "MEMO" | "PROJECT_PROPOSAL" | "PURCHASE_REQ" | "OFFICIAL_LETTER";
  priority: "NORMAL" | "URGENT" | "VERY_URGENT";
  content: string;
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  attachmentUrl: string | null;
  status: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";
  currentStepOrder: number;
  totalSteps: number;
  approvalSteps: EDocumentApprovalStepDto[];
  createdAt: string;
  updatedAt: string;
}

type DocRowWithRelations = Prisma.EDocumentGetPayload<{
  include: {
    submitter: true;
    department: true;
    approvalSteps: {
      include: {
        approver: true;
      };
      orderBy: {
        stepOrder: "asc";
      };
    };
  };
}>;

function toDocDto(row: DocRowWithRelations): EDocumentDto {
  const steps: EDocumentApprovalStepDto[] = row.approvalSteps.map((s) => ({
    id: s.id,
    documentId: s.documentId,
    approverId: s.approverId,
    approverName: s.approver.name,
    approverEmail: s.approver.email,
    approverRole: s.approverRole,
    stepOrder: s.stepOrder,
    decision: s.decision as "PENDING" | "APPROVED" | "REJECTED",
    comment: s.comment,
    decidedAt: s.decidedAt ? s.decidedAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  }));

  // Find active step
  const activeStep = steps.find((s) => s.decision === "PENDING") || steps[steps.length - 1];

  return {
    id: row.id,
    tenantId: row.tenantId,
    docNo: row.docNo,
    title: row.title,
    docType: row.docType as "MEMO" | "PROJECT_PROPOSAL" | "PURCHASE_REQ" | "OFFICIAL_LETTER",
    priority: row.priority as "NORMAL" | "URGENT" | "VERY_URGENT",
    content: row.content,
    submitterId: row.submitterId,
    submitterName: row.submitter.name,
    submitterEmail: row.submitter.email,
    departmentId: row.departmentId,
    departmentNameTh: row.department.nameTh,
    departmentNameEn: row.department.nameEn,
    attachmentUrl: row.attachmentUrl,
    status: row.status as "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED",
    currentStepOrder: activeStep?.stepOrder ?? 1,
    totalSteps: steps.length,
    approvalSteps: steps,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAllAdminDocs(
  tenantId: string,
  options?: { docType?: string; status?: string; search?: string }
): Promise<EDocumentDto[]> {
  const where: Prisma.EDocumentWhereInput = { tenantId };

  if (
    options?.docType === "MEMO" ||
    options?.docType === "PROJECT_PROPOSAL" ||
    options?.docType === "PURCHASE_REQ" ||
    options?.docType === "OFFICIAL_LETTER"
  ) {
    where.docType = options.docType;
  }

  if (
    options?.status === "DRAFT" ||
    options?.status === "SUBMITTED" ||
    options?.status === "IN_REVIEW" ||
    options?.status === "APPROVED" ||
    options?.status === "REJECTED" ||
    options?.status === "CANCELLED"
  ) {
    where.status = options.status;
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { docNo: { contains: s, mode: "insensitive" } },
      { title: { contains: s, mode: "insensitive" } },
      { submitter: { name: { contains: s, mode: "insensitive" } } },
    ];
  }

  const rows = await prisma.eDocument.findMany({
    where,
    include: {
      submitter: true,
      department: true,
      approvalSteps: {
        include: { approver: true },
        orderBy: { stepOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toDocDto);
}

export async function listMySubmittedDocs(
  tenantId: string,
  userId: string
): Promise<EDocumentDto[]> {
  const rows = await prisma.eDocument.findMany({
    where: { tenantId, submitterId: userId },
    include: {
      submitter: true,
      department: true,
      approvalSteps: {
        include: { approver: true },
        orderBy: { stepOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toDocDto);
}

export async function listPendingMyReviewDocs(
  tenantId: string,
  userId: string
): Promise<EDocumentDto[]> {
  // Find all documents where this user has an approval step that is currently PENDING
  const rows = await prisma.eDocument.findMany({
    where: {
      tenantId,
      status: { in: ["SUBMITTED", "IN_REVIEW"] },
      approvalSteps: {
        some: {
          approverId: userId,
          decision: "PENDING",
        },
      },
    },
    include: {
      submitter: true,
      department: true,
      approvalSteps: {
        include: { approver: true },
        orderBy: { stepOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter only those documents where it is actually this user's turn
  // (i.e. all steps before this user's step are APPROVED)
  const filtered = rows.filter((row) => {
    const userStepIndex = row.approvalSteps.findIndex(
      (s) => s.approverId === userId && s.decision === "PENDING"
    );
    if (userStepIndex === -1) return false;
    for (let i = 0; i < userStepIndex; i++) {
      if (row.approvalSteps[i].decision !== "APPROVED") {
        return false;
      }
    }
    return true;
  });

  return filtered.map(toDocDto);
}

export async function getEDocumentById(
  tenantId: string,
  id: string
): Promise<EDocumentDto | null> {
  const row = await prisma.eDocument.findFirst({
    where: { tenantId, id },
    include: {
      submitter: true,
      department: true,
      approvalSteps: {
        include: { approver: true },
        orderBy: { stepOrder: "asc" },
      },
    },
  });

  return row ? toDocDto(row) : null;
}

export async function createEDocument(
  tenantId: string,
  submitterId: string,
  input: CreateEDocumentInput
): Promise<EDocumentDto> {
  // Generate Running Document Number
  const count = await prisma.eDocument.count({ where: { tenantId } });
  const yearBe = new Date().getFullYear() + 543;
  const docNo = `พธ-${yearBe}/${String(count + 1).padStart(4, "0")}`;

  const row = await prisma.eDocument.create({
    data: {
      tenantId,
      docNo,
      title: input.title,
      docType: input.docType,
      priority: input.priority,
      content: input.content,
      submitterId,
      departmentId: input.departmentId,
      attachmentUrl: input.attachmentUrl ?? null,
      status: "SUBMITTED",
      approvalSteps: {
        create: input.steps.map((step, idx) => ({
          tenantId,
          approverId: step.approverId,
          approverRole: step.approverRole,
          stepOrder: idx + 1,
          decision: "PENDING",
        })),
      },
    },
    include: {
      submitter: true,
      department: true,
      approvalSteps: {
        include: { approver: true },
        orderBy: { stepOrder: "asc" },
      },
    },
  });

  return toDocDto(row);
}

export async function decideApprovalStep(
  tenantId: string,
  userId: string,
  input: DecideStepInput
): Promise<EDocumentDto> {
  const step = await prisma.eDocumentApprovalStep.findFirst({
    where: { id: input.stepId, tenantId },
    include: { document: { include: { approvalSteps: { orderBy: { stepOrder: "asc" } } } } },
  });

  if (!step) {
    throw errors.not_found("edocs.stepNotFound");
  }

  if (step.approverId !== userId) {
    throw errors.forbidden("edocs.unauthorizedStep");
  }

  if (step.decision !== "PENDING") {
    throw errors.conflict("edocs.stepAlreadyDecided");
  }

  // Calculate new document status
  let newStatus: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" = "IN_REVIEW";
  if (input.decision === "REJECTED") {
    newStatus = "REJECTED";
  } else {
    // Check if this was the last step
    const allSteps = step.document.approvalSteps;
    const isLastStep = step.stepOrder === allSteps.length;
    if (isLastStep) {
      newStatus = "APPROVED";
    } else {
      newStatus = "IN_REVIEW";
    }
  }

  // Execute in an atomic transaction
  const updatedDoc = await prisma.$transaction(async (tx) => {
    await tx.eDocumentApprovalStep.update({
      where: { id: step.id, tenantId },
      data: {
        decision: input.decision,
        comment: input.comment ?? null,
        decidedAt: new Date(),
      },
    });

    const doc = await tx.eDocument.update({
      where: { id: step.documentId, tenantId },
      data: { status: newStatus },
      include: {
        submitter: true,
        department: true,
        approvalSteps: {
          include: { approver: true },
          orderBy: { stepOrder: "asc" },
        },
      },
    });

    await writeAudit({
      tenantId,
      actorId: userId,
      action: `edoc.step_${input.decision.toLowerCase()}`,
      entity: "edocument_approval_step",
      entityId: step.id,
      before: { decision: step.decision },
      after: { decision: input.decision, comment: input.comment, documentStatus: newStatus },
    }, tx);

    return doc;
  });

  return toDocDto(updatedDoc);
}

export async function cancelEDocument(
  tenantId: string,
  userId: string,
  docId: string
): Promise<boolean> {
  const doc = await prisma.eDocument.findFirst({
    where: { tenantId, id: docId },
  });

  if (!doc) throw errors.not_found("edocs.docNotFound");
  if (doc.submitterId !== userId) throw errors.forbidden("edocs.unauthorizedCancel");
  if (doc.status === "APPROVED") throw errors.conflict("edocs.cannotCancelApproved");

  await prisma.$transaction(async (tx) => {
    await tx.eDocument.update({
      where: { id: docId, tenantId },
      data: { status: "CANCELLED" },
    });

    await writeAudit({
      tenantId,
      actorId: userId,
      action: "edoc.cancel",
      entity: "edocument",
      entityId: docId,
      before: { status: doc.status },
      after: { status: "CANCELLED" },
    }, tx);
  });

  return true;
}

export interface ApproverOptionDto {
  id: string;
  name: string;
  email: string;
}

export async function listEligibleApprovers(
  tenantId: string
): Promise<ApproverOptionDto[]> {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      userTenants: {
        some: {
          tenantId,
          isActive: true,
        },
      },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name || u.email,
    email: u.email,
  }));
}

