"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { EDOCS_P } from "../permissions";
import {
  createEDocumentSchema,
  decideStepSchema,
} from "./validations";
import {
  createEDocument,
  decideApprovalStep,
  cancelEDocument,
  type EDocumentDto,
} from "./services";

export async function createEDocumentAction(
  input: unknown
): Promise<ActionResult<EDocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCS_P.edocsCreate);
    const parsed = createEDocumentSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createEDocument(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/edocs");
    return result;
  });
}

export async function decideApprovalStepAction(
  input: unknown
): Promise<ActionResult<EDocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCS_P.edocsApprove);
    const parsed = decideStepSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await decideApprovalStep(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/edocs");
    return result;
  });
}

export async function cancelEDocumentAction(
  docId: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCS_P.edocsCreate);
    await cancelEDocument(ctx.tenantId, ctx.userId, docId);
    revalidatePath("/edocs");
  });
}
