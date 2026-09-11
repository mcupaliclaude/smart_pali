"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { resolvePublicTenantId } from "@/shared/lib/tenant";
import { requirePermission, getSessionContext } from "@/features/identity/server";
import { RESERVATIONS_P } from "../permissions";
import {
  createResourceSchema,
  updateResourceSchema,
  createReservationSchema,
  reviewReservationSchema,
} from "./validations";
import {
  createResource,
  updateResource,
  deleteResource,
  createReservation,
  reviewReservation,
  cancelReservation,
  type ReservableResourceDto,
  type ResourceReservationDto,
} from "./services";

export async function createResourceAction(
  input: unknown
): Promise<ActionResult<ReservableResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.reservationsManage);
    const parsed = createResourceSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createResource(ctx.tenantId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
    return result;
  });
}

export async function updateResourceAction(
  input: unknown
): Promise<ActionResult<ReservableResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.reservationsManage);
    const parsed = updateResourceSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateResource(ctx.tenantId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
    return result;
  });
}

export async function deleteResourceAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.reservationsManage);
    await deleteResource(ctx.tenantId, id);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
  });
}

export async function createReservationAction(
  input: unknown
): Promise<ActionResult<ResourceReservationDto>> {
  return runAction(async () => {
    const session = await getSessionContext();
    const tenantId = await resolvePublicTenantId(session?.tenantId);
    const userId = session?.userId;

    const parsed = createReservationSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });

    const result = await createReservation(tenantId, parsed, userId);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
    return result;
  });
}

export async function reviewReservationAction(
  input: unknown
): Promise<ActionResult<ResourceReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.reservationsReview);
    const parsed = reviewReservationSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await reviewReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
    return result;
  });
}

export async function cancelReservationAction(
  reservationId: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const session = await getSessionContext();
    const tenantId = await resolvePublicTenantId(session?.tenantId);
    await cancelReservation(tenantId, reservationId, session?.userId);
    revalidatePath("/reservations");
    revalidatePath("/portal/reservations");
  });
}
