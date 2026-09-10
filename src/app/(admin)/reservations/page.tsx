import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  RESERVATIONS_P,
  listAdminReservations,
  listAdminResources,
} from "@/features/reservations/server";
import { ReservationsClient } from "./_components/reservations-client";

export default async function ReservationsAdminPage() {
  const ctx = await requirePermission(RESERVATIONS_P.reservationsRead);
  const [reservations, resources] = await Promise.all([
    listAdminReservations(ctx.tenantId),
    listAdminResources(ctx.tenantId),
  ]);

  return (
    <ReservationsClient
      initialReservations={reservations}
      initialResources={resources}
      canReview={hasPermission(ctx, RESERVATIONS_P.reservationsReview)}
      canManage={hasPermission(ctx, RESERVATIONS_P.reservationsManage)}
      canCreate={hasPermission(ctx, RESERVATIONS_P.reservationsCreate)}
    />
  );
}
