"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { resolvePublicTenantId } from "@/shared/lib/tenant";
import { requirePermission, getSessionContext } from "@/features/identity/server";
import { MEDITATION_P } from "../permissions";
import {
  createMeditationCourseSchema,
  updateMeditationCourseSchema,
  createMeditationRegistrationSchema,
  reviewMeditationRegistrationSchema,
} from "./validations";
import {
  createMeditationCourse,
  updateMeditationCourse,
  deleteMeditationCourse,
  createMeditationRegistration,
  reviewMeditationRegistration,
  cancelMeditationRegistration,
  type MeditationCourseDto,
  type MeditationRegistrationDto,
} from "./services";

export async function createMeditationCourseAction(
  input: unknown
): Promise<ActionResult<MeditationCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(MEDITATION_P.meditationManage);
    const parsed = createMeditationCourseSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createMeditationCourse(ctx.tenantId, parsed);
    revalidatePath("/meditation");
    revalidatePath("/portal/meditation");
    return result;
  });
}

export async function updateMeditationCourseAction(
  input: unknown
): Promise<ActionResult<MeditationCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(MEDITATION_P.meditationManage);
    const parsed = updateMeditationCourseSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateMeditationCourse(ctx.tenantId, parsed);
    revalidatePath("/meditation");
    revalidatePath("/portal/meditation");
    return result;
  });
}

export async function deleteMeditationCourseAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(MEDITATION_P.meditationManage);
    await deleteMeditationCourse(ctx.tenantId, id);
    revalidatePath("/meditation");
    revalidatePath("/portal/meditation");
  });
}

export async function createMeditationRegistrationAction(
  input: unknown
): Promise<ActionResult<MeditationRegistrationDto>> {
  return runAction(async () => {
    const session = await getSessionContext();
    const tenantId = await resolvePublicTenantId(session?.tenantId);

    const parsed = createMeditationRegistrationSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });

    const result = await createMeditationRegistration(tenantId, parsed);
    revalidatePath("/meditation");
    revalidatePath("/portal/meditation");
    return result;
  });
}

export async function reviewMeditationRegistrationAction(
  input: unknown
): Promise<ActionResult<MeditationRegistrationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(MEDITATION_P.meditationReview);
    const parsed = reviewMeditationRegistrationSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await reviewMeditationRegistration(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/meditation");
    revalidatePath("/portal/meditation");
    return result;
  });
}

export async function cancelMeditationRegistrationAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const session = await getSessionContext();
    const tenantId = await resolvePublicTenantId(session?.tenantId);
    await cancelMeditationRegistration(tenantId, id);
    revalidatePath("/meditation");
    revalidatePath("/portal/meditation");
  });
}
