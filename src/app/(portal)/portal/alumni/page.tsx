import { getLocale } from "@/shared/lib/i18n/server";
import { prisma } from "@/shared/lib/infra/prisma";
import {
  listPublicAlumni,
  listPublicStories,
  listSpotlightAlumni,
} from "@/features/alumni/server";
import { PortalAlumniClient } from "./_components/portal-alumni-client";

export default async function PortalAlumniPage() {
  const locale = await getLocale();

  const defaultTenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  const tenantId = defaultTenant?.id ?? "";

  const [members, stories, spotlight] = await Promise.all([
    listPublicAlumni(tenantId),
    listPublicStories(tenantId),
    listSpotlightAlumni(tenantId),
  ]);

  return (
    <PortalAlumniClient
      initialMembers={members}
      initialStories={stories}
      initialSpotlight={spotlight}
      locale={locale}
    />
  );
}
