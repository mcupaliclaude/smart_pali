"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { STAFF_P } from "../permissions";
import { createStaffProfileSchema, updateStaffProfileSchema } from "./validations";
import {
  createStaffProfile,
  updateStaffProfile,
  deleteStaffProfile,
  type StaffProfileDto,
} from "./services";

export async function createStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffCreate);
    const parsed = createStaffProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    return result;
  });
}

export async function updateStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = updateStaffProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    return result;
  });
}

export async function deleteStaffAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    await deleteStaffProfile(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
  });
}
