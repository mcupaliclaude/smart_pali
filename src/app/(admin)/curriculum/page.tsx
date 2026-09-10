import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listAdminPrograms } from "@/features/curriculum/server";
import { listStaffDepartments } from "@/features/staff/server";
import { CurriculumClient } from "./_components/curriculum-client";

export default async function CurriculumAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [initialPrograms, departments] = await Promise.all([
    listAdminPrograms(ctx.tenantId),
    listStaffDepartments(ctx.tenantId),
  ]);

  return (
    <CurriculumClient
      initialPrograms={initialPrograms}
      departments={departments}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
    />
  );
}
