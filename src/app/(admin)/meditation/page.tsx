import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  MEDITATION_P,
  listAdminCourses,
  listAdminRegistrations,
} from "@/features/meditation/server";
import { MeditationClient } from "./_components/meditation-client";

export default async function MeditationAdminPage() {
  const ctx = await requirePermission(MEDITATION_P.meditationRead);
  const [courses, registrations] = await Promise.all([
    listAdminCourses(ctx.tenantId),
    listAdminRegistrations(ctx.tenantId),
  ]);

  return (
    <MeditationClient
      initialCourses={courses}
      initialRegistrations={registrations}
      canReview={hasPermission(ctx, MEDITATION_P.meditationReview)}
      canManage={hasPermission(ctx, MEDITATION_P.meditationManage)}
    />
  );
}
