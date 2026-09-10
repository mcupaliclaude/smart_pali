import { getLocale } from "@/shared/lib/i18n/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicCourses } from "@/features/meditation/server";
import { PortalMeditationClient } from "./_components/portal-meditation-client";

export default async function PortalMeditationPage() {
  const locale = await getLocale();
  const defaultTenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  const tenantId = defaultTenant?.id ?? "";
  const courses = await listPublicCourses(tenantId);

  return (
    <PortalMeditationClient
      initialCourses={courses}
      locale={locale}
    />
  );
}
