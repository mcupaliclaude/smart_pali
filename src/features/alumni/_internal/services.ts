import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import type {
  CreateAlumniMemberInput,
  UpdateAlumniMemberInput,
  VerifyAlumniMemberInput,
  CreateAlumniStoryInput,
  UpdateAlumniStoryInput,
} from "./validations";

export interface AlumniMemberDto {
  id: string;
  tenantId: string;
  studentId: string | null;
  fullNameTh: string;
  fullNameEn: string | null;
  graduationYearBe: number;
  degreeLevel: "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA";
  majorTh: string;
  majorEn: string | null;
  currentWorkplace: string | null;
  jobTitle: string | null;
  phone: string | null;
  email: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  isSpotlight: boolean;
  spotlightQuoteTh: string | null;
  spotlightQuoteEn: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface AlumniStoryDto {
  id: string;
  tenantId: string;
  titleTh: string;
  titleEn: string;
  alumniName: string;
  graduationYearBe: number;
  degreeLevel: "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA";
  summaryTh: string;
  summaryEn: string;
  contentTh: string;
  contentEn: string;
  imageUrl: string | null;
  published: boolean;
  seq: number;
  createdAt: string;
  updatedAt: string;
}

type MemberModel = Prisma.AlumniMemberGetPayload<object>;
type StoryModel = Prisma.AlumniStoryGetPayload<object>;

function toMemberDto(m: MemberModel): AlumniMemberDto {
  return {
    id: m.id,
    tenantId: m.tenantId,
    studentId: m.studentId,
    fullNameTh: m.fullNameTh,
    fullNameEn: m.fullNameEn,
    graduationYearBe: m.graduationYearBe,
    degreeLevel: m.degreeLevel as "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA",
    majorTh: m.majorTh,
    majorEn: m.majorEn,
    currentWorkplace: m.currentWorkplace,
    jobTitle: m.jobTitle,
    phone: m.phone,
    email: m.email,
    linkedinUrl: m.linkedinUrl,
    avatarUrl: m.avatarUrl,
    isPublic: m.isPublic,
    isSpotlight: m.isSpotlight,
    spotlightQuoteTh: m.spotlightQuoteTh,
    spotlightQuoteEn: m.spotlightQuoteEn,
    status: m.status as "PENDING" | "VERIFIED" | "REJECTED",
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

function toStoryDto(s: StoryModel): AlumniStoryDto {
  return {
    id: s.id,
    tenantId: s.tenantId,
    titleTh: s.titleTh,
    titleEn: s.titleEn,
    alumniName: s.alumniName,
    graduationYearBe: s.graduationYearBe,
    degreeLevel: s.degreeLevel as "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA",
    summaryTh: s.summaryTh,
    summaryEn: s.summaryEn,
    contentTh: s.contentTh,
    contentEn: s.contentEn,
    imageUrl: s.imageUrl,
    published: s.published,
    seq: s.seq,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Member Services
// ---------------------------------------------------------------------------
export async function listPublicAlumni(
  tenantId: string,
  options?: { degreeLevel?: string; yearBe?: number; search?: string }
): Promise<AlumniMemberDto[]> {
  const where: Prisma.AlumniMemberWhereInput = {
    tenantId,
    status: "VERIFIED",
    isPublic: true,
  };

  if (
    options?.degreeLevel === "BACHELOR" ||
    options?.degreeLevel === "MASTER" ||
    options?.degreeLevel === "DOCTORAL" ||
    options?.degreeLevel === "DIPLOMA"
  ) {
    where.degreeLevel = options.degreeLevel;
  }

  if (options?.yearBe) {
    where.graduationYearBe = options.yearBe;
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { fullNameTh: { contains: s, mode: "insensitive" } },
      { fullNameEn: { contains: s, mode: "insensitive" } },
      { majorTh: { contains: s, mode: "insensitive" } },
      { currentWorkplace: { contains: s, mode: "insensitive" } },
      { jobTitle: { contains: s, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.alumniMember.findMany({
    where,
    orderBy: [{ graduationYearBe: "desc" }, { fullNameTh: "asc" }],
  });

  return rows.map(toMemberDto);
}

export async function listSpotlightAlumni(tenantId: string): Promise<AlumniMemberDto[]> {
  const rows = await prisma.alumniMember.findMany({
    where: {
      tenantId,
      status: "VERIFIED",
      isSpotlight: true,
    },
    orderBy: { graduationYearBe: "desc" },
  });

  return rows.map(toMemberDto);
}

export async function listAdminAlumni(
  tenantId: string,
  options?: { status?: string; search?: string }
): Promise<AlumniMemberDto[]> {
  const where: Prisma.AlumniMemberWhereInput = { tenantId };

  if (
    options?.status === "PENDING" ||
    options?.status === "VERIFIED" ||
    options?.status === "REJECTED"
  ) {
    where.status = options.status;
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { fullNameTh: { contains: s, mode: "insensitive" } },
      { fullNameEn: { contains: s, mode: "insensitive" } },
      { studentId: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
      { majorTh: { contains: s, mode: "insensitive" } },
      { currentWorkplace: { contains: s, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.alumniMember.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toMemberDto);
}

export async function createAlumniMember(
  tenantId: string,
  input: CreateAlumniMemberInput
): Promise<AlumniMemberDto> {
  const row = await prisma.alumniMember.create({
    data: {
      tenantId,
      studentId: input.studentId ?? null,
      fullNameTh: input.fullNameTh,
      fullNameEn: input.fullNameEn ?? null,
      graduationYearBe: input.graduationYearBe,
      degreeLevel: input.degreeLevel,
      majorTh: input.majorTh,
      majorEn: input.majorEn ?? null,
      currentWorkplace: input.currentWorkplace ?? null,
      jobTitle: input.jobTitle ?? null,
      phone: input.phone ?? null,
      email: input.email || null,
      linkedinUrl: input.linkedinUrl ?? null,
      avatarUrl: input.avatarUrl ?? null,
      isPublic: input.isPublic,
      isSpotlight: input.isSpotlight,
      spotlightQuoteTh: input.spotlightQuoteTh ?? null,
      spotlightQuoteEn: input.spotlightQuoteEn ?? null,
      status: input.status,
    },
  });

  return toMemberDto(row);
}

export async function updateAlumniMember(
  tenantId: string,
  input: UpdateAlumniMemberInput
): Promise<AlumniMemberDto> {
  const row = await prisma.alumniMember.update({
    where: { id: input.id },
    data: {
      studentId: input.studentId ?? null,
      fullNameTh: input.fullNameTh,
      fullNameEn: input.fullNameEn ?? null,
      graduationYearBe: input.graduationYearBe,
      degreeLevel: input.degreeLevel,
      majorTh: input.majorTh,
      majorEn: input.majorEn ?? null,
      currentWorkplace: input.currentWorkplace ?? null,
      jobTitle: input.jobTitle ?? null,
      phone: input.phone ?? null,
      email: input.email || null,
      linkedinUrl: input.linkedinUrl ?? null,
      avatarUrl: input.avatarUrl ?? null,
      isPublic: input.isPublic,
      isSpotlight: input.isSpotlight,
      spotlightQuoteTh: input.spotlightQuoteTh ?? null,
      spotlightQuoteEn: input.spotlightQuoteEn ?? null,
      status: input.status,
    },
  });

  return toMemberDto(row);
}

export async function verifyAlumniMember(
  tenantId: string,
  input: VerifyAlumniMemberInput
): Promise<AlumniMemberDto> {
  const data: Prisma.AlumniMemberUpdateInput = {
    status: input.status,
  };

  if (typeof input.isSpotlight === "boolean") {
    data.isSpotlight = input.isSpotlight;
  }
  if (input.spotlightQuoteTh !== undefined) {
    data.spotlightQuoteTh = input.spotlightQuoteTh;
  }

  const row = await prisma.alumniMember.update({
    where: { id: input.id },
    data,
  });

  return toMemberDto(row);
}

export async function deleteAlumniMember(
  tenantId: string,
  id: string
): Promise<boolean> {
  await prisma.alumniMember.delete({
    where: { id },
  });
  return true;
}

// ---------------------------------------------------------------------------
// Story Services
// ---------------------------------------------------------------------------
export async function listPublicStories(tenantId: string): Promise<AlumniStoryDto[]> {
  const rows = await prisma.alumniStory.findMany({
    where: { tenantId, published: true },
    orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(toStoryDto);
}

export async function getPublicStoryById(
  tenantId: string,
  id: string
): Promise<AlumniStoryDto | null> {
  const row = await prisma.alumniStory.findFirst({
    where: { tenantId, id, published: true },
  });

  return row ? toStoryDto(row) : null;
}

export async function listAdminStories(tenantId: string): Promise<AlumniStoryDto[]> {
  const rows = await prisma.alumniStory.findMany({
    where: { tenantId },
    orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(toStoryDto);
}

export async function createAlumniStory(
  tenantId: string,
  input: CreateAlumniStoryInput
): Promise<AlumniStoryDto> {
  const row = await prisma.alumniStory.create({
    data: {
      tenantId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      alumniName: input.alumniName,
      graduationYearBe: input.graduationYearBe,
      degreeLevel: input.degreeLevel,
      summaryTh: input.summaryTh,
      summaryEn: input.summaryEn,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      imageUrl: input.imageUrl ?? null,
      published: input.published,
      seq: input.seq,
    },
  });

  return toStoryDto(row);
}

export async function updateAlumniStory(
  tenantId: string,
  input: UpdateAlumniStoryInput
): Promise<AlumniStoryDto> {
  const row = await prisma.alumniStory.update({
    where: { id: input.id },
    data: {
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      alumniName: input.alumniName,
      graduationYearBe: input.graduationYearBe,
      degreeLevel: input.degreeLevel,
      summaryTh: input.summaryTh,
      summaryEn: input.summaryEn,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      imageUrl: input.imageUrl ?? null,
      published: input.published,
      seq: input.seq,
    },
  });

  return toStoryDto(row);
}

export async function deleteAlumniStory(
  tenantId: string,
  id: string
): Promise<boolean> {
  await prisma.alumniStory.delete({
    where: { id },
  });
  return true;
}
