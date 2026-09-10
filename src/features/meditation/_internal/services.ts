import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import type {
  CreateMeditationCourseInput,
  UpdateMeditationCourseInput,
  CreateMeditationRegistrationInput,
  ReviewMeditationRegistrationInput,
} from "./validations";

export interface MeditationCourseDto {
  id: string;
  tenantId: string;
  code: string;
  titleTh: string;
  titleEn: string;
  format: "RESIDENTIAL" | "ONE_DAY";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  instructors: string[];
  descriptionTh: string;
  descriptionEn: string;
  schedule: Array<{ time: string; activity: string }>;
  guidelines: string[];
  feeNote: string | null;
  imageUrl: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED";
  seq: number;
  confirmedCount: number;
  pendingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MeditationRegistrationDto {
  id: string;
  tenantId: string;
  courseId: string;
  courseCode: string;
  courseTitleTh: string;
  courseTitleEn: string;
  courseStartDate: string;
  courseEndDate: string;
  registrationNo: string;
  fullNameTh: string;
  fullNameEn: string | null;
  nationalId: string | null;
  gender: string;
  age: number | null;
  phone: string;
  email: string;
  occupation: string | null;
  address: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string | null;
  dietaryRequirements: string | null;
  experience: string | null;
  roomAssigned: string | null;
  status: "PENDING" | "CONFIRMED" | "WAITLIST" | "CANCELLED";
  reviewedById: string | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

type CourseWithRelations = Prisma.MeditationCourseGetPayload<{
  include: {
    registrations: {
      select: {
        id: true;
        status: true;
      };
    };
  };
}>;

type RegWithRelations = Prisma.MeditationRegistrationGetPayload<{
  include: {
    course: true;
    reviewedBy: true;
  };
}>;

function toCourseDto(c: CourseWithRelations): MeditationCourseDto {
  const instructors = Array.isArray(c.instructors) ? (c.instructors as string[]) : [];
  const schedule = Array.isArray(c.schedule) ? (c.schedule as Array<{ time: string; activity: string }>) : [];
  const guidelines = Array.isArray(c.guidelines) ? (c.guidelines as string[]) : [];

  const confirmedCount = c.registrations.filter((r) => r.status === "CONFIRMED").length;
  const pendingCount = c.registrations.filter((r) => r.status === "PENDING").length;

  return {
    id: c.id,
    tenantId: c.tenantId,
    code: c.code,
    titleTh: c.titleTh,
    titleEn: c.titleEn,
    format: c.format as "RESIDENTIAL" | "ONE_DAY",
    level: c.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    location: c.location,
    maxParticipants: c.maxParticipants,
    instructors,
    descriptionTh: c.descriptionTh,
    descriptionEn: c.descriptionEn,
    schedule,
    guidelines,
    feeNote: c.feeNote,
    imageUrl: c.imageUrl,
    status: c.status as "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED",
    seq: c.seq,
    confirmedCount,
    pendingCount,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

function toRegistrationDto(r: RegWithRelations): MeditationRegistrationDto {
  return {
    id: r.id,
    tenantId: r.tenantId,
    courseId: r.courseId,
    courseCode: r.course.code,
    courseTitleTh: r.course.titleTh,
    courseTitleEn: r.course.titleEn,
    courseStartDate: r.course.startDate.toISOString(),
    courseEndDate: r.course.endDate.toISOString(),
    registrationNo: r.registrationNo,
    fullNameTh: r.fullNameTh,
    fullNameEn: r.fullNameEn,
    nationalId: r.nationalId,
    gender: r.gender,
    age: r.age,
    phone: r.phone,
    email: r.email,
    occupation: r.occupation,
    address: r.address,
    emergencyContactName: r.emergencyContactName,
    emergencyContactPhone: r.emergencyContactPhone,
    medicalConditions: r.medicalConditions,
    dietaryRequirements: r.dietaryRequirements,
    experience: r.experience,
    roomAssigned: r.roomAssigned,
    status: r.status as "PENDING" | "CONFIRMED" | "WAITLIST" | "CANCELLED",
    reviewedById: r.reviewedById,
    reviewerName: r.reviewedBy?.name ?? null,
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    reviewNote: r.reviewNote,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Course Services
// ---------------------------------------------------------------------------
export async function listPublicCourses(
  tenantId: string,
  options?: { format?: string; level?: string }
): Promise<MeditationCourseDto[]> {
  const where: Prisma.MeditationCourseWhereInput = {
    tenantId,
    status: { in: ["OPEN", "CLOSED"] },
  };

  if (options?.format === "RESIDENTIAL" || options?.format === "ONE_DAY") {
    where.format = options.format;
  }
  if (
    options?.level === "BEGINNER" ||
    options?.level === "INTERMEDIATE" ||
    options?.level === "ADVANCED"
  ) {
    where.level = options.level;
  }

  const rows = await prisma.meditationCourse.findMany({
    where,
    include: {
      registrations: { select: { id: true, status: true } },
    },
    orderBy: [{ seq: "asc" }, { startDate: "asc" }],
  });

  return rows.map(toCourseDto);
}

export async function getPublicCourseById(
  tenantId: string,
  id: string
): Promise<MeditationCourseDto | null> {
  const row = await prisma.meditationCourse.findFirst({
    where: { tenantId, id },
    include: {
      registrations: { select: { id: true, status: true } },
    },
  });

  return row ? toCourseDto(row) : null;
}

export async function listAdminCourses(
  tenantId: string,
  options?: { status?: string; search?: string }
): Promise<MeditationCourseDto[]> {
  const where: Prisma.MeditationCourseWhereInput = { tenantId };

  if (
    options?.status === "DRAFT" ||
    options?.status === "OPEN" ||
    options?.status === "CLOSED" ||
    options?.status === "COMPLETED"
  ) {
    where.status = options.status;
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { code: { contains: s, mode: "insensitive" } },
      { titleTh: { contains: s, mode: "insensitive" } },
      { titleEn: { contains: s, mode: "insensitive" } },
      { location: { contains: s, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.meditationCourse.findMany({
    where,
    include: {
      registrations: { select: { id: true, status: true } },
    },
    orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(toCourseDto);
}

export async function createMeditationCourse(
  tenantId: string,
  input: CreateMeditationCourseInput
): Promise<MeditationCourseDto> {
  const row = await prisma.meditationCourse.create({
    data: {
      tenantId,
      code: input.code,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      format: input.format,
      level: input.level,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      maxParticipants: input.maxParticipants,
      instructors: input.instructors,
      descriptionTh: input.descriptionTh,
      descriptionEn: input.descriptionEn,
      schedule: input.schedule,
      guidelines: input.guidelines,
      feeNote: input.feeNote ?? null,
      imageUrl: input.imageUrl ?? null,
      status: input.status,
      seq: input.seq,
    },
    include: {
      registrations: { select: { id: true, status: true } },
    },
  });

  return toCourseDto(row);
}

export async function updateMeditationCourse(
  tenantId: string,
  input: UpdateMeditationCourseInput
): Promise<MeditationCourseDto> {
  const row = await prisma.meditationCourse.update({
    where: { id: input.id },
    data: {
      code: input.code,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      format: input.format,
      level: input.level,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      maxParticipants: input.maxParticipants,
      instructors: input.instructors,
      descriptionTh: input.descriptionTh,
      descriptionEn: input.descriptionEn,
      schedule: input.schedule,
      guidelines: input.guidelines,
      feeNote: input.feeNote ?? null,
      imageUrl: input.imageUrl ?? null,
      status: input.status,
      seq: input.seq,
    },
    include: {
      registrations: { select: { id: true, status: true } },
    },
  });

  return toCourseDto(row);
}

export async function deleteMeditationCourse(
  tenantId: string,
  id: string
): Promise<boolean> {
  await prisma.meditationCourse.delete({
    where: { id },
  });
  return true;
}

// ---------------------------------------------------------------------------
// Registration Services
// ---------------------------------------------------------------------------
export async function listAdminRegistrations(
  tenantId: string,
  options?: { courseId?: string; status?: string; search?: string }
): Promise<MeditationRegistrationDto[]> {
  const where: Prisma.MeditationRegistrationWhereInput = { tenantId };

  if (options?.courseId) {
    where.courseId = options.courseId;
  }
  if (
    options?.status === "PENDING" ||
    options?.status === "CONFIRMED" ||
    options?.status === "WAITLIST" ||
    options?.status === "CANCELLED"
  ) {
    where.status = options.status;
  }
  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { registrationNo: { contains: s, mode: "insensitive" } },
      { fullNameTh: { contains: s, mode: "insensitive" } },
      { fullNameEn: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.meditationRegistration.findMany({
    where,
    include: { course: true, reviewedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toRegistrationDto);
}

export async function createMeditationRegistration(
  tenantId: string,
  input: CreateMeditationRegistrationInput
): Promise<MeditationRegistrationDto> {
  const count = await prisma.meditationRegistration.count({ where: { tenantId } });
  const yearBe = new Date().getFullYear() + 543;
  const registrationNo = `REG-MED-${yearBe}/${String(count + 1).padStart(4, "0")}`;

  const row = await prisma.meditationRegistration.create({
    data: {
      tenantId,
      courseId: input.courseId,
      registrationNo,
      fullNameTh: input.fullNameTh,
      fullNameEn: input.fullNameEn ?? null,
      nationalId: input.nationalId ?? null,
      gender: input.gender,
      age: input.age ?? null,
      phone: input.phone,
      email: input.email,
      occupation: input.occupation ?? null,
      address: input.address ?? null,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      medicalConditions: input.medicalConditions ?? null,
      dietaryRequirements: input.dietaryRequirements ?? null,
      experience: input.experience ?? null,
      status: "PENDING",
    },
    include: { course: true, reviewedBy: true },
  });

  return toRegistrationDto(row);
}

export async function reviewMeditationRegistration(
  tenantId: string,
  reviewerId: string,
  input: ReviewMeditationRegistrationInput
): Promise<MeditationRegistrationDto> {
  const row = await prisma.meditationRegistration.update({
    where: { id: input.registrationId },
    data: {
      status: input.status,
      roomAssigned: input.roomAssigned ?? null,
      reviewNote: input.reviewNote ?? null,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
    include: { course: true, reviewedBy: true },
  });

  return toRegistrationDto(row);
}

export async function cancelMeditationRegistration(
  tenantId: string,
  registrationId: string
): Promise<boolean> {
  await prisma.meditationRegistration.update({
    where: { id: registrationId },
    data: { status: "CANCELLED" },
  });
  return true;
}
