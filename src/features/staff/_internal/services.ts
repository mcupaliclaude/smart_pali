import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import type { CreateStaffProfileInput, UpdateStaffProfileInput } from "./validations";

export interface StaffDepartmentDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  seq: number;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  userId: string | null;
  prefixTh: string;
  prefixEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  staffType: "ACADEMIC" | "SUPPORT";
  academicRank: string | null;
  administrativePositionTh: string | null;
  administrativePositionEn: string | null;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  departmentCode: string;
  email: string;
  phone: string | null;
  roomNo: string | null;
  education: string[];
  researchInterests: string[];
  avatarUrl: string | null;
  seq: number;
  status: "ACTIVE" | "LEAVE" | "RETIRED";
  createdAt: string;
  updatedAt: string;
}

type StaffProfileWithDept = Prisma.StaffProfileGetPayload<{ include: { department: true } }>;

function toDto(row: StaffProfileWithDept): StaffProfileDto {
  const education = Array.isArray(row.education) ? (row.education as string[]) : [];
  const researchInterests = Array.isArray(row.researchInterests) ? (row.researchInterests as string[]) : [];

  const fullNameTh = [row.academicRank, row.prefixTh, row.firstNameTh, row.lastNameTh].filter(Boolean).join(" ").trim();
  const fullNameEn = [row.prefixEn, row.firstNameEn, row.lastNameEn].filter(Boolean).join(" ").trim();

  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    prefixTh: row.prefixTh,
    prefixEn: row.prefixEn,
    firstNameTh: row.firstNameTh,
    lastNameTh: row.lastNameTh,
    firstNameEn: row.firstNameEn,
    lastNameEn: row.lastNameEn,
    fullNameTh,
    fullNameEn,
    staffType: row.staffType as "ACADEMIC" | "SUPPORT",
    academicRank: row.academicRank,
    administrativePositionTh: row.administrativePositionTh,
    administrativePositionEn: row.administrativePositionEn,
    departmentId: row.departmentId,
    departmentNameTh: row.department.nameTh,
    departmentNameEn: row.department.nameEn,
    departmentCode: row.department.code,
    email: row.email,
    phone: row.phone,
    roomNo: row.roomNo,
    education,
    researchInterests,
    avatarUrl: row.avatarUrl,
    seq: row.seq,
    status: row.status as "ACTIVE" | "LEAVE" | "RETIRED",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listStaffDepartments(tenantId: string): Promise<StaffDepartmentDto[]> {
  const deps = await prisma.staffDepartment.findMany({
    where: { tenantId, isActive: true },
    orderBy: { seq: "asc" },
  });
  return deps.map((d) => ({
    id: d.id,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    seq: d.seq,
  }));
}

export async function listAdminStaff(tenantId: string): Promise<StaffProfileDto[]> {
  const staff = await prisma.staffProfile.findMany({
    where: { tenantId },
    include: { department: true },
    orderBy: [
      { seq: "asc" },
      { createdAt: "desc" },
    ],
  });
  return staff.map(toDto);
}

export async function listPublicStaff(
  tenantId: string,
  options?: { departmentCode?: string; staffType?: string; search?: string }
): Promise<StaffProfileDto[]> {
  const where: Prisma.StaffProfileWhereInput = {
    tenantId,
    status: { in: ["ACTIVE", "LEAVE"] },
  };

  if (options?.departmentCode) {
    where.department = { code: options.departmentCode };
  }

  if (options?.staffType === "ACADEMIC" || options?.staffType === "SUPPORT") {
    where.staffType = options.staffType;
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { firstNameTh: { contains: s, mode: "insensitive" } },
      { lastNameTh: { contains: s, mode: "insensitive" } },
      { firstNameEn: { contains: s, mode: "insensitive" } },
      { lastNameEn: { contains: s, mode: "insensitive" } },
      { administrativePositionTh: { contains: s, mode: "insensitive" } },
      { administrativePositionEn: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
    ];
  }

  const staff = await prisma.staffProfile.findMany({
    where,
    include: { department: true },
    orderBy: [
      { seq: "asc" },
      { createdAt: "asc" },
    ],
  });
  return staff.map(toDto);
}

export async function getStaffProfileById(tenantId: string, id: string): Promise<StaffProfileDto | null> {
  const staff = await prisma.staffProfile.findFirst({
    where: { tenantId, id },
    include: { department: true },
  });
  return staff ? toDto(staff) : null;
}

export async function createStaffProfile(
  tenantId: string,
  input: CreateStaffProfileInput
): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      staffType: input.staffType,
      academicRank: input.academicRank ?? null,
      administrativePositionTh: input.administrativePositionTh ?? null,
      administrativePositionEn: input.administrativePositionEn ?? null,
      departmentId: input.departmentId,
      email: input.email.toLowerCase(),
      phone: input.phone ?? null,
      roomNo: input.roomNo ?? null,
      education: input.education ?? [],
      researchInterests: input.researchInterests ?? [],
      avatarUrl: input.avatarUrl ?? null,
      seq: input.seq,
      status: input.status,
    },
    include: { department: true },
  });
  return toDto(created);
}

export async function updateStaffProfile(
  tenantId: string,
  input: UpdateStaffProfileInput
): Promise<StaffProfileDto> {
  const updated = await prisma.staffProfile.update({
    where: { id: input.id, tenantId },
    data: {
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      staffType: input.staffType,
      academicRank: input.academicRank ?? null,
      administrativePositionTh: input.administrativePositionTh ?? null,
      administrativePositionEn: input.administrativePositionEn ?? null,
      departmentId: input.departmentId,
      email: input.email.toLowerCase(),
      phone: input.phone ?? null,
      roomNo: input.roomNo ?? null,
      education: input.education ?? [],
      researchInterests: input.researchInterests ?? [],
      avatarUrl: input.avatarUrl ?? null,
      seq: input.seq,
      status: input.status,
    },
    include: { department: true },
  });
  return toDto(updated);
}

export async function deleteStaffProfile(tenantId: string, id: string): Promise<void> {
  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });
}
