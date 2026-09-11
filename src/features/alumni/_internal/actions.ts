"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { resolvePublicTenantId } from "@/shared/lib/tenant";
import { requirePermission, getSessionContext } from "@/features/identity/server";
import { ALUMNI_P } from "../permissions";
import {
  createAlumniMemberSchema,
  updateAlumniMemberSchema,
  verifyAlumniMemberSchema,
  createAlumniStorySchema,
  updateAlumniStorySchema,
} from "./validations";
import {
  createAlumniMember,
  updateAlumniMember,
  verifyAlumniMember,
  deleteAlumniMember,
  createAlumniStory,
  updateAlumniStory,
  deleteAlumniStory,
  type AlumniMemberDto,
  type AlumniStoryDto,
} from "./services";

export async function createAlumniMemberAction(
  input: unknown
): Promise<ActionResult<AlumniMemberDto>> {
  return runAction(async () => {
    const session = await getSessionContext();
    const tenantId = await resolvePublicTenantId(session?.tenantId);

    const parsed = createAlumniMemberSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });

    const result = await createAlumniMember(tenantId, parsed);
    revalidatePath("/alumni");
    revalidatePath("/portal/alumni");
    return result;
  });
}

export async function updateAlumniMemberAction(
  input: unknown
): Promise<ActionResult<AlumniMemberDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    const parsed = updateAlumniMemberSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateAlumniMember(ctx.tenantId, parsed);
    revalidatePath("/alumni");
    revalidatePath("/portal/alumni");
    return result;
  });
}

export async function verifyAlumniMemberAction(
  input: unknown
): Promise<ActionResult<AlumniMemberDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniVerify);
    const parsed = verifyAlumniMemberSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await verifyAlumniMember(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/alumni");
    revalidatePath("/portal/alumni");
    return result;
  });
}

export async function deleteAlumniMemberAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    await deleteAlumniMember(ctx.tenantId, id, ctx.userId);
    revalidatePath("/alumni");
    revalidatePath("/portal/alumni");
  });
}

export async function createAlumniStoryAction(
  input: unknown
): Promise<ActionResult<AlumniStoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    const parsed = createAlumniStorySchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createAlumniStory(ctx.tenantId, parsed);
    revalidatePath("/alumni");
    revalidatePath("/portal/alumni");
    return result;
  });
}

export async function updateAlumniStoryAction(
  input: unknown
): Promise<ActionResult<AlumniStoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    const parsed = updateAlumniStorySchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateAlumniStory(ctx.tenantId, parsed);
    revalidatePath("/alumni");
    revalidatePath("/portal/alumni");
    return result;
  });
}

export async function deleteAlumniStoryAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    await deleteAlumniStory(ctx.tenantId, id);
    revalidatePath("/alumni");
    revalidatePath("/portal/alumni");
  });
}
