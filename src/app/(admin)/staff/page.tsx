import { requirePermission, hasPermission } from "@/features/identity/server";
import { STAFF_P, listAdminStaff, listStaffDepartments } from "@/features/staff/server";
import { StaffClient } from "./_components/staff-client";

export default async function StaffAdminPage() {
  const ctx = await requirePermission(STAFF_P.staffRead);
  const [initialStaff, departments] = await Promise.all([
    listAdminStaff(ctx.tenantId),
    listStaffDepartments(ctx.tenantId),
  ]);

  return (
    <StaffClient
      initialStaff={initialStaff}
      departments={departments}
      canManage={hasPermission(ctx, STAFF_P.staffManage)}
      canCreate={hasPermission(ctx, STAFF_P.staffCreate)}
    />
  );
}
