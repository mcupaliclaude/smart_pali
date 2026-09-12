import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/shared/lib/audit";
import type { Prisma } from "@/generated/prisma";
import type {
  CreateCurriculumProgramInput,
  UpdateCurriculumProgramInput,
  CreateCurriculumCourseInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
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

export interface DepartmentProgramSummaryDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  level: "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE";
  status: "DRAFT" | "ACTIVE" | "REVISED" | "PHASED_OUT";
}

export interface DepartmentWithCountsDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  seq: number;
  isActive: boolean;
  programCount: number;
  staffCount: number;
  programs: DepartmentProgramSummaryDto[];
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
      courses: {
        orderBy: [
          { yearLevel: "asc" },
          { semester: "asc" },
          { seq: "asc" },
          { code: "asc" },
        ],
      },
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

export interface ImportCourseItem {
  code: string;
  nameTh: string;
  nameEn: string;
  credits?: number;
  lectureHours?: number;
  labHours?: number;
  selfStudyHours?: number;
  courseCategory?: string;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  yearLevel?: number;
  semester?: number;
  seq?: number;
}

export async function syncProgramCourses(
  tenantId: string,
  programId: string,
  courses: ImportCourseItem[]
): Promise<CurriculumCourseDto[]> {
  const results: CurriculumCourseDto[] = [];
  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    if (!c.code || !c.nameTh) continue;

    const row = await prisma.curriculumCourse.upsert({
      where: {
        programId_code: {
          programId,
          code: c.code.trim(),
        },
      },
      update: {
        nameTh: c.nameTh.trim(),
        nameEn: c.nameEn?.trim() || c.nameTh.trim(),
        credits: typeof c.credits === "number" ? c.credits : 3,
        lectureHours: typeof c.lectureHours === "number" ? c.lectureHours : 3,
        labHours: typeof c.labHours === "number" ? c.labHours : 0,
        selfStudyHours: typeof c.selfStudyHours === "number" ? c.selfStudyHours : 6,
        courseCategory: c.courseCategory || "COMPULSORY",
        descriptionTh: c.descriptionTh ?? null,
        descriptionEn: c.descriptionEn ?? null,
        yearLevel: typeof c.yearLevel === "number" ? c.yearLevel : 1,
        semester: typeof c.semester === "number" ? c.semester : 1,
        seq: typeof c.seq === "number" ? c.seq : i + 1,
      },
      create: {
        tenantId,
        programId,
        code: c.code.trim(),
        nameTh: c.nameTh.trim(),
        nameEn: c.nameEn?.trim() || c.nameTh.trim(),
        credits: typeof c.credits === "number" ? c.credits : 3,
        lectureHours: typeof c.lectureHours === "number" ? c.lectureHours : 3,
        labHours: typeof c.labHours === "number" ? c.labHours : 0,
        selfStudyHours: typeof c.selfStudyHours === "number" ? c.selfStudyHours : 6,
        courseCategory: c.courseCategory || "COMPULSORY",
        descriptionTh: c.descriptionTh ?? null,
        descriptionEn: c.descriptionEn ?? null,
        yearLevel: typeof c.yearLevel === "number" ? c.yearLevel : 1,
        semester: typeof c.semester === "number" ? c.semester : 1,
        seq: typeof c.seq === "number" ? c.seq : i + 1,
      },
    });

    results.push({
      id: row.id,
      programId: row.programId,
      code: row.code,
      nameTh: row.nameTh,
      nameEn: row.nameEn,
      credits: row.credits,
      lectureHours: row.lectureHours,
      labHours: row.labHours,
      selfStudyHours: row.selfStudyHours,
      courseCategory: row.courseCategory,
      descriptionTh: row.descriptionTh,
      descriptionEn: row.descriptionEn,
      yearLevel: row.yearLevel,
      semester: row.semester,
      seq: row.seq,
    });
  }
  return results;
}


/* ============================================================
 * Department & Division Management (บริหารจัดการภาควิชา/ส่วนงาน)
 * ============================================================ */

type DepartmentRowWithRelations = Prisma.StaffDepartmentGetPayload<{
  include: {
    _count: {
      select: {
        curriculumPrograms: true;
        profiles: true;
      };
    };
    curriculumPrograms: {
      select: {
        id: true;
        code: true;
        nameTh: true;
        nameEn: true;
        level: true;
        status: true;
      };
    };
  };
}>;

function toDepartmentDto(d: DepartmentRowWithRelations): DepartmentWithCountsDto {
  return {
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    seq: d.seq,
    isActive: d.isActive,
    programCount: d._count.curriculumPrograms,
    staffCount: d._count.profiles,
    programs: (d.curriculumPrograms ?? []).map((p) => ({
      id: p.id,
      code: p.code,
      nameTh: p.nameTh,
      nameEn: p.nameEn,
      level: p.level as "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE",
      status: p.status as "DRAFT" | "ACTIVE" | "REVISED" | "PHASED_OUT",
    })),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export async function listAdminDepartmentsWithCounts(
  tenantId: string
): Promise<DepartmentWithCountsDto[]> {
  const departments = await prisma.staffDepartment.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: {
          curriculumPrograms: true,
          profiles: true,
        },
      },
      curriculumPrograms: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
          level: true,
          status: true,
        },
        orderBy: { seq: "asc" },
      },
    },
    orderBy: [
      { seq: "asc" },
      { code: "asc" },
    ],
  });

  return departments.map(toDepartmentDto);
}

export async function getDepartmentById(
  tenantId: string,
  id: string
): Promise<DepartmentWithCountsDto | null> {
  const department = await prisma.staffDepartment.findUnique({
    where: { id, tenantId },
    include: {
      _count: {
        select: {
          curriculumPrograms: true,
          profiles: true,
        },
      },
      curriculumPrograms: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
          level: true,
          status: true,
        },
        orderBy: { seq: "asc" },
      },
    },
  });

  return department ? toDepartmentDto(department) : null;
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput,
  actorId?: string
): Promise<DepartmentWithCountsDto> {
  const existing = await prisma.staffDepartment.findFirst({
    where: { tenantId, code: input.code },
  });
  if (existing) {
    throw new Error("รหัสภาควิชานี้ถูกใช้งานแล้วในระบบ (Department code already exists)");
  }

  const created = await prisma.staffDepartment.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      seq: input.seq,
      isActive: input.isActive,
    },
    include: {
      _count: {
        select: {
          curriculumPrograms: true,
          profiles: true,
        },
      },
      curriculumPrograms: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
          level: true,
          status: true,
        },
      },
    },
  });

  await writeAudit({
    tenantId,
    actorId: actorId ?? null,
    action: "department.create",
    entity: "staff_department",
    entityId: created.id,
    after: {
      code: created.code,
      nameTh: created.nameTh,
      nameEn: created.nameEn,
      seq: created.seq,
      isActive: created.isActive,
    },
  });

  return toDepartmentDto(created);
}

export async function updateDepartment(
  tenantId: string,
  input: UpdateDepartmentInput,
  actorId?: string
): Promise<DepartmentWithCountsDto> {
  const before = await prisma.staffDepartment.findUnique({
    where: { id: input.id, tenantId },
  });
  if (!before) {
    throw new Error("ไม่พบข้อมูลภาควิชาที่ต้องการแก้ไข (Department not found)");
  }

  const duplicate = await prisma.staffDepartment.findFirst({
    where: {
      tenantId,
      code: input.code,
      NOT: { id: input.id },
    },
  });
  if (duplicate) {
    throw new Error("รหัสภาควิชานี้ถูกใช้งานแล้วในระบบ (Department code already exists)");
  }

  const updated = await prisma.staffDepartment.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      seq: input.seq,
      isActive: input.isActive,
    },
    include: {
      _count: {
        select: {
          curriculumPrograms: true,
          profiles: true,
        },
      },
      curriculumPrograms: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
          level: true,
          status: true,
        },
        orderBy: { seq: "asc" },
      },
    },
  });

  await writeAudit({
    tenantId,
    actorId: actorId ?? null,
    action: "department.update",
    entity: "staff_department",
    entityId: updated.id,
    before: {
      code: before.code,
      nameTh: before.nameTh,
      nameEn: before.nameEn,
      seq: before.seq,
      isActive: before.isActive,
    },
    after: {
      code: updated.code,
      nameTh: updated.nameTh,
      nameEn: updated.nameEn,
      seq: updated.seq,
      isActive: updated.isActive,
    },
  });

  return toDepartmentDto(updated);
}

export async function deleteDepartment(
  tenantId: string,
  id: string,
  actorId?: string
): Promise<boolean> {
  const dept = await prisma.staffDepartment.findUnique({
    where: { id, tenantId },
    include: {
      _count: {
        select: {
          curriculumPrograms: true,
          profiles: true,
          edocuments: true,
        },
      },
    },
  });

  if (!dept) {
    throw new Error("ไม่พบข้อมูลภาควิชาที่ต้องการลบ (Department not found)");
  }

  if (dept._count.curriculumPrograms > 0) {
    throw new Error(
      "ไม่สามารถลบภาควิชานี้ได้ เนื่องจากมีหลักสูตรการศึกษาในสังกัด กรุณาย้ายหรือลบหลักสูตรออกก่อน"
    );
  }

  if (dept._count.profiles > 0) {
    throw new Error(
      "ไม่สามารถลบภาควิชานี้ได้ เนื่องจากมีบุคลากรในสังกัด กรุณาย้ายบุคลากรออกก่อน"
    );
  }

  if (dept._count.edocuments > 0) {
    throw new Error(
      "ไม่สามารถลบภาควิชานี้ได้ เนื่องจากมีเอกสารอิเล็กทรอนิกส์ในสังกัด กรุณาย้ายเอกสารออกก่อน"
    );
  }

  await prisma.staffDepartment.delete({
    where: { id, tenantId },
  });

  await writeAudit({
    tenantId,
    actorId: actorId ?? null,
    action: "department.delete",
    entity: "staff_department",
    entityId: id,
    before: {
      code: dept.code,
      nameTh: dept.nameTh,
      nameEn: dept.nameEn,
    },
  });

  return true;
}

