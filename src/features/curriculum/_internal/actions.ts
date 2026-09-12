"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createCurriculumProgramSchema,
  updateCurriculumProgramSchema,
  createCurriculumCourseSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./validations";
import {
  createProgram,
  updateProgram,
  deleteProgram,
  addCourse,
  deleteCourse,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  syncProgramCourses,
  type ImportCourseItem,
  type CurriculumProgramDto,
  type CurriculumCourseDto,
  type DepartmentWithCountsDto,
} from "./services";


export async function createProgramAction(
  input: unknown
): Promise<ActionResult<CurriculumProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumCreate);
    const parsed = createCurriculumProgramSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createProgram(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateProgramAction(
  input: unknown
): Promise<ActionResult<CurriculumProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateCurriculumProgramSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateProgram(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteProgramAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteProgram(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}

export async function addCourseAction(
  input: unknown
): Promise<ActionResult<CurriculumCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createCurriculumCourseSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await addCourse(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteCourseAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteCourse(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}

export async function syncProgramCoursesAction(input: {
  programId: string;
  courses: ImportCourseItem[];
}): Promise<ActionResult<CurriculumCourseDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const result = await syncProgramCourses(ctx.tenantId, input.programId, input.courses);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}


export async function createDepartmentAction(
  input: unknown
): Promise<ActionResult<DepartmentWithCountsDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createDepartmentSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createDepartment(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/curriculum");
    revalidatePath("/curriculum/departments");
    revalidatePath("/portal/curriculum");
    revalidatePath("/staff");
    return result;
  });
}

export async function updateDepartmentAction(
  input: unknown
): Promise<ActionResult<DepartmentWithCountsDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateDepartmentSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateDepartment(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/curriculum");
    revalidatePath("/curriculum/departments");
    revalidatePath("/portal/curriculum");
    revalidatePath("/staff");
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteDepartment(ctx.tenantId, id, ctx.userId);
    revalidatePath("/curriculum");
    revalidatePath("/curriculum/departments");
    revalidatePath("/portal/curriculum");
    revalidatePath("/staff");
  });
}

