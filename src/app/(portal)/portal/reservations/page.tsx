import { getLocale } from "@/shared/lib/i18n/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicResources, listPublicReservations } from "@/features/reservations/server";
import { PortalReservationsClient } from "./_components/portal-reservations-client";

export default async function PortalReservationsPage() {
  const locale = await getLocale();
  const defaultTenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  const tenantId = defaultTenant?.id ?? "";
  const [resources, reservations] = await Promise.all([
    listPublicResources(tenantId),
    listPublicReservations(tenantId),
  ]);

  return (
    <PortalReservationsClient
      initialResources={resources}
      initialReservations={reservations}
      locale={locale}
    />
  );
}
