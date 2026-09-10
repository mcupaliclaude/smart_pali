import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  EDOCS_P,
  listAllAdminDocs,
  listMySubmittedDocs,
  listPendingMyReviewDocs,
  listEligibleApprovers,
} from "@/features/edocs/server";
import { listStaffDepartments } from "@/features/staff/server";
import { EdocsClient } from "./_components/edocs-client";

export default async function EdocsAdminPage() {
  const ctx = await requirePermission(EDOCS_P.edocsRead);
  const [allDocs, myDocs, pendingDocs, departments, approvers] = await Promise.all([
    listAllAdminDocs(ctx.tenantId),
    listMySubmittedDocs(ctx.tenantId, ctx.userId),
    listPendingMyReviewDocs(ctx.tenantId, ctx.userId),
    listStaffDepartments(ctx.tenantId),
    listEligibleApprovers(ctx.tenantId),
  ]);

  return (
    <EdocsClient
      currentUserId={ctx.userId}
      initialAllDocs={allDocs}
      initialMyDocs={myDocs}
      initialPendingDocs={pendingDocs}
      departments={departments}
      approvers={approvers}
      canCreate={hasPermission(ctx, EDOCS_P.edocsCreate)}
      canApprove={hasPermission(ctx, EDOCS_P.edocsApprove)}
      canManage={hasPermission(ctx, EDOCS_P.edocsManage)}
    />
  );
}
