import { z } from "zod";

export const resourceTypeEnum = z.enum(["FACILITY", "VEHICLE"]);
export const resourceStatusEnum = z.enum(["AVAILABLE", "MAINTENANCE", "UNAVAILABLE"]);
export const reservationStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);

export const createResourceSchema = z.object({
  type: resourceTypeEnum.default("FACILITY"),
  code: z.string().trim().min(1, "Code is required"),
  nameTh: z.string().trim().min(1, "nameTh is required"),
  nameEn: z.string().trim().min(1, "nameEn is required"),
  capacity: z.coerce.number().int().positive("Capacity must be positive").default(1),
  location: z.string().trim().min(1, "Location is required"),
  amenities: z.array(z.string()).default([]),
  imageUrl: z.string().trim().optional().nullable(),
  status: resourceStatusEnum.default("AVAILABLE"),
  requiresApproval: z.boolean().default(true),
  seq: z.coerce.number().int().default(1),
});

export const updateResourceSchema = createResourceSchema.extend({
  id: z.string().uuid("Invalid resource ID"),
});

export const createReservationSchema = z
  .object({
    resourceId: z.string().uuid("Invalid resource ID"),
    title: z.string().trim().min(1, "Title is required"),
    applicantName: z.string().trim().min(1, "Applicant name is required"),
    applicantEmail: z.string().email("Invalid email address"),
    applicantPhone: z.string().trim().min(1, "Phone number is required"),
    departmentName: z.string().trim().min(1, "Department name is required"),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    attendeeCount: z.coerce.number().int().positive("Attendee count must be positive").default(1),
    purpose: z.string().trim().min(1, "Purpose is required"),
    needDriver: z.boolean().default(false),
    specialRequests: z.string().trim().optional().nullable(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const reviewReservationSchema = z.object({
  reservationId: z.string().uuid("Invalid reservation ID"),
  status: z.enum(["APPROVED", "REJECTED"]),
  driverName: z.string().trim().optional().nullable(),
  reviewNote: z.string().trim().optional().nullable(),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type ReviewReservationInput = z.infer<typeof reviewReservationSchema>;
