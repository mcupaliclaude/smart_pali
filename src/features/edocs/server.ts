import "server-only";

export { EDOCS_P, EDOCS_PERMISSIONS } from "./permissions";
export {
  listAllAdminDocs,
  listMySubmittedDocs,
  listPendingMyReviewDocs,
  getEDocumentById,
  listEligibleApprovers,
  type EDocumentDto,
  type EDocumentApprovalStepDto,
  type ApproverOptionDto,
} from "./_internal/services";
