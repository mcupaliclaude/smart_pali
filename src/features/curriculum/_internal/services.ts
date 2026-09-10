import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import type {
  CreateCurriculumProgramInput,
  UpdateCurriculumProgramInput,
  CreateCurriculumCourseInput,
} from "./validations";

export interface CurriculumCourseDto {
  id: string;
  programId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  lectureHours: number;
  labHours: number;
  selfStudyHours: number;
  courseCategory: string;
  descriptionTh: string | null;
  descriptionEn: string | null;
  yearLevel: number;
  semester: number;
  seq: number;
}

export interface CurriculumProgramDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  level: "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE";
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  departmentCode: string;
  coordinatorId: string | null;
  coordinatorNameTh: string | null;
  coordinatorNameEn: string | null;
  totalCredits: number;
  durationYears: number;
  tuitionFeeNoteTh: string | null;
  tuitionFeeNoteEn: string | null;
  descriptionTh: string;
  descriptionEn: string;
  careerProspects: string[];
  admissionRequirements: string[];
  brochureUrl: string | null;
  seq: number;
  status: "DRAFT" | "ACTIVE" | "REVISED" | "PHASED_OUT";
  courseCount: number;
  courses?: CurriculumCourseDto[];
  createdAt: string;
  updatedAt: string;
}

type ProgramRow = Prisma.CurriculumProgramGetPayload<{
  include: {
    department: true;
    coordinator: true;
  };
}> & {
  _count?: { courses: number };
  courses?: Prisma.CurriculumCourseGetPayload<Record<string, never>>[];
};

function toProgramDto(row: ProgramRow): CurriculumProgramDto {
  const careerProspects = Array.isArray(row.careerProspects)
    ? (row.careerProspects as string[])
    : [];
  const admissionRequirements = Array.isArray(row.admissionRequirements)
    ? (row.admissionRequirements as string[])
    : [];

  let coordinatorNameTh: string | null = null;
  let coordinatorNameEn: string | null = null;
  if (row.coordinator) {
    coordinatorNameTh = [
      row.coordinator.academicRank,
      row.coordinator.prefixTh,
      row.coordinator.firstNameTh,
      row.coordinator.lastNameTh,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    coordinatorNameEn = [
      row.coordinator.prefixEn,
      row.coordinator.firstNameEn,
      row.coordinator.lastNameEn,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  const courses: CurriculumCourseDto[] | undefined = row.courses?.map((c) => ({
    id: c.id,
    programId: c.programId,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    credits: c.credits,
    lectureHours: c.lectureHours,
    labHours: c.labHours,
    selfStudyHours: c.selfStudyHours,
    courseCategory: c.courseCategory,
    descriptionTh: c.descriptionTh,
    descriptionEn: c.descriptionEn,
    yearLevel: c.yearLevel,
    semester: c.semester,
    seq: c.seq,
  }));

  return {
    id: row.id,
    tenantId: row.tenantId,
    code: row.code,
    nameTh: row.nameTh,
    nameEn: row.nameEn,
    degreeTh: row.degreeTh,
    degreeEn: row.degreeEn,
    level: row.level as "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE",
    departmentId: row.departmentId,
    departmentNameTh: row.department.nameTh,
    departmentNameEn: row.department.nameEn,
    departmentCode: row.department.code,
    coordinatorId: row.coordinatorId,
    coordinatorNameTh,
    coordinatorNameEn,
    totalCredits: row.totalCredits,
    durationYears: row.durationYears,
    tuitionFeeNoteTh: row.tuitionFeeNoteTh,
    tuitionFeeNoteEn: row.tuitionFeeNoteEn,
    descriptionTh: row.descriptionTh,
    descriptionEn: row.descriptionEn,
    careerProspects,
    admissionRequirements,
    brochureUrl: row.brochureUrl,
    seq: row.seq,
    status: row.status as "DRAFT" | "ACTIVE" | "REVISED" | "PHASED_OUT",
    courseCount: row._count?.courses ?? (courses?.length || 0),
    courses,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAdminPrograms(tenantId: string): Promise<CurriculumProgramDto[]> {
  const rows = await prisma.curriculumProgram.findMany({
    where: { tenantId },
    include: {
      department: true,
      coordinator: true,
      _count: { select: { courses: true } },
    },
    orderBy: [
      { seq: "asc" },
      { code: "asc" },
    ],
  });
  return rows.map(toProgramDto);
}

export async function listPublicPrograms(
  tenantId: string,
  options?: { level?: string; departmentCode?: string; search?: string }
): Promise<CurriculumProgramDto[]> {
  const where: Prisma.CurriculumProgramWhereInput = {
    tenantId,
    status: { in: ["ACTIVE", "REVISED"] },
  };

  if (
    options?.level === "BACHELOR" ||
    options?.level === "MASTER" ||
    options?.level === "DOCTORATE" ||
    options?.level === "CERTIFICATE"
  ) {
    where.level = options.level;
  }

  if (options?.departmentCode) {
    where.department = { code: options.departmentCode };
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { nameTh: { contains: s, mode: "insensitive" } },
      { nameEn: { contains: s, mode: "insensitive" } },
      { code: { contains: s, mode: "insensitive" } },
      { degreeTh: { contains: s, mode: "insensitive" } },
      { degreeEn: { contains: s, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.curriculumProgram.findMany({
    where,
    include: {
      department: true,
      coordinator: true,
      _count: { select: { courses: true } },
    },
    orderBy: [
      { seq: "asc" },
      { code: "asc" },
    ],
  });
  return rows.map(toProgramDto);
}

export async function getProgramById(
  tenantId: string,
  id: string
): Promise<CurriculumProgramDto | null> {
  const row = await prisma.curriculumProgram.findFirst({
    where: { tenantId, id },
    include: {
      department: true,
      coordinator: true,
      _count: { select: { courses: true } },
      courses: {
        orderBy: [
          { yearLevel: "asc" },
          { semester: "asc" },
          { seq: "asc" },
          { code: "asc" },
        ],
      },
    },
  });
  return row ? toProgramDto(row) : null;
}

export async function createProgram(
  tenantId: string,
  input: CreateCurriculumProgramInput
): Promise<CurriculumProgramDto> {
  const row = await prisma.curriculumProgram.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      level: input.level,
      departmentId: input.departmentId,
      coordinatorId: input.coordinatorId ?? null,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      tuitionFeeNoteTh: input.tuitionFeeNoteTh ?? null,
      tuitionFeeNoteEn: input.tuitionFeeNoteEn ?? null,
      descriptionTh: input.descriptionTh,
      descriptionEn: input.descriptionEn,
      careerProspects: input.careerProspects ?? [],
      admissionRequirements: input.admissionRequirements ?? [],
      brochureUrl: input.brochureUrl ?? null,
      seq: input.seq,
      status: input.status,
    },
    include: {
      department: true,
      coordinator: true,
      _count: { select: { courses: true } },
    },
  });
  return toProgramDto(row);
}

export async function updateProgram(
  tenantId: string,
  input: UpdateCurriculumProgramInput
): Promise<CurriculumProgramDto> {
  const row = await prisma.curriculumProgram.update({
    where: { tenantId_code: { tenantId, code: input.code } },
    data: {
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      level: input.level,
      departmentId: input.departmentId,
      coordinatorId: input.coordinatorId ?? null,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      tuitionFeeNoteTh: input.tuitionFeeNoteTh ?? null,
      tuitionFeeNoteEn: input.tuitionFeeNoteEn ?? null,
      descriptionTh: input.descriptionTh,
      descriptionEn: input.descriptionEn,
      careerProspects: input.careerProspects ?? [],
      admissionRequirements: input.admissionRequirements ?? [],
      brochureUrl: input.brochureUrl ?? null,
      seq: input.seq,
      status: input.status,
    },
    include: {
      department: true,
      coordinator: true,
      _count: { select: { courses: true } },
    },
  });
  return toProgramDto(row);
}

export async function deleteProgram(tenantId: string, id: string): Promise<boolean> {
  await prisma.curriculumProgram.delete({
    where: { tenantId, id },
  });
  return true;
}

export async function addCourse(
  tenantId: string,
  input: CreateCurriculumCourseInput
): Promise<CurriculumCourseDto> {
  const course = await prisma.curriculumCourse.create({
    data: {
      tenantId,
      programId: input.programId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      credits: input.credits,
      lectureHours: input.lectureHours,
      labHours: input.labHours,
      selfStudyHours: input.selfStudyHours,
      courseCategory: input.courseCategory,
      descriptionTh: input.descriptionTh ?? null,
      descriptionEn: input.descriptionEn ?? null,
      yearLevel: input.yearLevel,
      semester: input.semester,
      seq: input.seq,
    },
  });
  return {
    id: course.id,
    programId: course.programId,
    code: course.code,
    nameTh: course.nameTh,
    nameEn: course.nameEn,
    credits: course.credits,
    lectureHours: course.lectureHours,
    labHours: course.labHours,
    selfStudyHours: course.selfStudyHours,
    courseCategory: course.courseCategory,
    descriptionTh: course.descriptionTh,
    descriptionEn: course.descriptionEn,
    yearLevel: course.yearLevel,
    semester: course.semester,
    seq: course.seq,
  };
}

export async function deleteCourse(tenantId: string, id: string): Promise<boolean> {
  await prisma.curriculumCourse.delete({
    where: { id, tenantId },
  });
  return true;
}
