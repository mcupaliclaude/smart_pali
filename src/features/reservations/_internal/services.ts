import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import type {
  CreateResourceInput,
  UpdateResourceInput,
  CreateReservationInput,
  ReviewReservationInput,
} from "./validations";

export interface ReservableResourceDto {
  id: string;
  tenantId: string;
  type: "FACILITY" | "VEHICLE";
  code: string;
  nameTh: string;
  nameEn: string;
  capacity: number;
  location: string;
  amenities: string[];
  imageUrl: string | null;
  status: "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE";
  requiresApproval: boolean;
  seq: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceReservationDto {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceCode: string;
  resourceNameTh: string;
  resourceNameEn: string;
  resourceType: "FACILITY" | "VEHICLE";
  resourceLocation: string;
  reservationNo: string;
  title: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  departmentName: string;
  userId: string | null;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  purpose: string;
  needDriver: boolean;
  driverName: string | null;
  specialRequests: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewedById: string | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

type ReservationRowWithRelations = Prisma.ResourceReservationGetPayload<{
  include: {
    resource: true;
    reviewedBy: true;
  };
}>;

function toResourceDto(r: Prisma.ReservableResourceGetPayload<object>): ReservableResourceDto {
  const amenities = Array.isArray(r.amenities) ? (r.amenities as string[]) : [];
  return {
    id: r.id,
    tenantId: r.tenantId,
    type: r.type as "FACILITY" | "VEHICLE",
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    capacity: r.capacity,
    location: r.location,
    amenities,
    imageUrl: r.imageUrl,
    status: r.status as "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE",
    requiresApproval: r.requiresApproval,
    seq: r.seq,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toReservationDto(row: ReservationRowWithRelations): ResourceReservationDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    resourceId: row.resourceId,
    resourceCode: row.resource.code,
    resourceNameTh: row.resource.nameTh,
    resourceNameEn: row.resource.nameEn,
    resourceType: row.resource.type as "FACILITY" | "VEHICLE",
    resourceLocation: row.resource.location,
    reservationNo: row.reservationNo,
    title: row.title,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
    applicantPhone: row.applicantPhone,
    departmentName: row.departmentName,
    userId: row.userId,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    attendeeCount: row.attendeeCount,
    purpose: row.purpose,
    needDriver: row.needDriver,
    driverName: row.driverName,
    specialRequests: row.specialRequests,
    status: row.status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED",
    reviewedById: row.reviewedById,
    reviewerName: row.reviewedBy?.name ?? null,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Resource Services
// ---------------------------------------------------------------------------
export async function listPublicResources(
  tenantId: string,
  options?: { type?: string }
): Promise<ReservableResourceDto[]> {
  const where: Prisma.ReservableResourceWhereInput = {
    tenantId,
    status: { in: ["AVAILABLE", "MAINTENANCE"] },
  };

  if (options?.type === "FACILITY" || options?.type === "VEHICLE") {
    where.type = options.type;
  }

  const rows = await prisma.reservableResource.findMany({
    where,
    orderBy: [{ seq: "asc" }, { nameTh: "asc" }],
  });

  return rows.map(toResourceDto);
}

export async function listAdminResources(
  tenantId: string,
  options?: { type?: string; status?: string }
): Promise<ReservableResourceDto[]> {
  const where: Prisma.ReservableResourceWhereInput = { tenantId };

  if (options?.type === "FACILITY" || options?.type === "VEHICLE") {
    where.type = options.type;
  }
  if (
    options?.status === "AVAILABLE" ||
    options?.status === "MAINTENANCE" ||
    options?.status === "UNAVAILABLE"
  ) {
    where.status = options.status;
  }

  const rows = await prisma.reservableResource.findMany({
    where,
    orderBy: [{ seq: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(toResourceDto);
}

export async function getResourceById(
  tenantId: string,
  id: string
): Promise<ReservableResourceDto | null> {
  const row = await prisma.reservableResource.findFirst({
    where: { tenantId, id },
  });
  return row ? toResourceDto(row) : null;
}

export async function createResource(
  tenantId: string,
  input: CreateResourceInput
): Promise<ReservableResourceDto> {
  const created = await prisma.reservableResource.create({
    data: {
      tenantId,
      type: input.type,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      capacity: input.capacity,
      location: input.location,
      amenities: input.amenities,
      imageUrl: input.imageUrl ?? null,
      status: input.status,
      requiresApproval: input.requiresApproval,
      seq: input.seq,
    },
  });

  return toResourceDto(created);
}

export async function updateResource(
  tenantId: string,
  input: UpdateResourceInput
): Promise<ReservableResourceDto> {
  const updated = await prisma.reservableResource.update({
    where: { id: input.id },
    data: {
      type: input.type,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      capacity: input.capacity,
      location: input.location,
      amenities: input.amenities,
      imageUrl: input.imageUrl ?? null,
      status: input.status,
      requiresApproval: input.requiresApproval,
      seq: input.seq,
    },
  });

  return toResourceDto(updated);
}

export async function deleteResource(
  tenantId: string,
  id: string
): Promise<boolean> {
  await prisma.reservableResource.delete({
    where: { id },
  });
  return true;
}

// ---------------------------------------------------------------------------
// Reservation Services
// ---------------------------------------------------------------------------
export async function listPublicReservations(
  tenantId: string,
  options?: { resourceId?: string; fromDate?: Date; toDate?: Date }
): Promise<ResourceReservationDto[]> {
  const where: Prisma.ResourceReservationWhereInput = {
    tenantId,
    status: { in: ["APPROVED", "PENDING"] },
  };

  if (options?.resourceId) {
    where.resourceId = options.resourceId;
  }
  if (options?.fromDate) {
    where.endTime = { gte: options.fromDate };
  }
  if (options?.toDate) {
    where.startTime = { lte: options.toDate };
  }

  const rows = await prisma.resourceReservation.findMany({
    where,
    include: { resource: true, reviewedBy: true },
    orderBy: { startTime: "asc" },
  });

  return rows.map(toReservationDto);
}

export async function listAdminReservations(
  tenantId: string,
  options?: { status?: string; type?: string; search?: string }
): Promise<ResourceReservationDto[]> {
  const where: Prisma.ResourceReservationWhereInput = { tenantId };

  if (
    options?.status === "PENDING" ||
    options?.status === "APPROVED" ||
    options?.status === "REJECTED" ||
    options?.status === "CANCELLED"
  ) {
    where.status = options.status;
  }

  if (options?.type === "FACILITY" || options?.type === "VEHICLE") {
    where.resource = { type: options.type };
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { reservationNo: { contains: s, mode: "insensitive" } },
      { title: { contains: s, mode: "insensitive" } },
      { applicantName: { contains: s, mode: "insensitive" } },
      { departmentName: { contains: s, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.resourceReservation.findMany({
    where,
    include: { resource: true, reviewedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toReservationDto);
}

export async function createReservation(
  tenantId: string,
  input: CreateReservationInput,
  userId?: string
): Promise<ResourceReservationDto> {
  // Check conflict with APPROVED bookings
  const conflict = await prisma.resourceReservation.findFirst({
    where: {
      tenantId,
      resourceId: input.resourceId,
      status: "APPROVED",
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    },
  });

  if (conflict) {
    throw new Error("reservations.conflictError");
  }

  // Running number RES-2570/xxxx
  const count = await prisma.resourceReservation.count({ where: { tenantId } });
  const yearBe = new Date().getFullYear() + 543;
  const reservationNo = `RES-${yearBe}/${String(count + 1).padStart(4, "0")}`;

  const row = await prisma.resourceReservation.create({
    data: {
      tenantId,
      resourceId: input.resourceId,
      reservationNo,
      title: input.title,
      applicantName: input.applicantName,
      applicantEmail: input.applicantEmail,
      applicantPhone: input.applicantPhone,
      departmentName: input.departmentName,
      userId: userId ?? null,
      startTime: input.startTime,
      endTime: input.endTime,
      attendeeCount: input.attendeeCount,
      purpose: input.purpose,
      needDriver: input.needDriver,
      specialRequests: input.specialRequests ?? null,
      status: "PENDING",
    },
    include: { resource: true, reviewedBy: true },
  });

  return toReservationDto(row);
}

export async function reviewReservation(
  tenantId: string,
  reviewerId: string,
  input: ReviewReservationInput
): Promise<ResourceReservationDto> {
  const updated = await prisma.resourceReservation.update({
    where: { id: input.reservationId },
    data: {
      status: input.status,
      driverName: input.driverName ?? null,
      reviewNote: input.reviewNote ?? null,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
    include: { resource: true, reviewedBy: true },
  });

  return toReservationDto(updated);
}

export async function cancelReservation(
  tenantId: string,
  reservationId: string,
  userId?: string
): Promise<boolean> {
  const booking = await prisma.resourceReservation.findFirst({
    where: { id: reservationId, tenantId },
  });

  if (!booking) throw new Error("Reservation not found");
  if (userId && booking.userId && booking.userId !== userId) {
    throw new Error("Unauthorized to cancel this booking");
  }

  await prisma.resourceReservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  return true;
}
