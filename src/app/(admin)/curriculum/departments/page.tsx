import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listAdminDepartmentsWithCounts } from "@/features/curriculum/server";
import { DepartmentsClient } from "./_components/departments-client";

export default async function CurriculumDepartmentsAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const departments = await listAdminDepartmentsWithCounts(ctx.tenantId);

  return (
    <DepartmentsClient
      initialDepartments={departments}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
    />
  );
}
