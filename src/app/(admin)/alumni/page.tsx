import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  ALUMNI_P,
  listAdminAlumni,
  listAdminStories,
} from "@/features/alumni/server";
import { AlumniClient } from "./_components/alumni-client";

export default async function AlumniAdminPage() {
  const ctx = await requirePermission(ALUMNI_P.alumniRead);
  const [members, stories] = await Promise.all([
    listAdminAlumni(ctx.tenantId),
    listAdminStories(ctx.tenantId),
  ]);

  return (
    <AlumniClient
      initialMembers={members}
      initialStories={stories}
      canVerify={hasPermission(ctx, ALUMNI_P.alumniVerify)}
      canManage={hasPermission(ctx, ALUMNI_P.alumniManage)}
    />
  );
}
