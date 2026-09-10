import { z } from "zod";

export const staffTypeEnum = z.enum(["ACADEMIC", "SUPPORT"]);
export const staffStatusEnum = z.enum(["ACTIVE", "LEAVE", "RETIRED"]);

export const createStaffProfileSchema = z.object({
  prefixTh: z.string().trim().min(1, "prefixTh is required"),
  prefixEn: z.string().trim().min(1, "prefixEn is required"),
  firstNameTh: z.string().trim().min(1, "firstNameTh is required"),
  lastNameTh: z.string().trim().min(1, "lastNameTh is required"),
  firstNameEn: z.string().trim().min(1, "firstNameEn is required"),
  lastNameEn: z.string().trim().min(1, "lastNameEn is required"),
  staffType: staffTypeEnum.default("ACADEMIC"),
  academicRank: z.string().trim().optional().nullable(),
  administrativePositionTh: z.string().trim().optional().nullable(),
  administrativePositionEn: z.string().trim().optional().nullable(),
  departmentId: z.string().uuid("Invalid department ID"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional().nullable(),
  roomNo: z.string().trim().optional().nullable(),
  education: z.array(z.string()).optional().nullable(),
  researchInterests: z.array(z.string()).optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  seq: z.coerce.number().int().default(0),
  status: staffStatusEnum.default("ACTIVE"),
});

export const updateStaffProfileSchema = createStaffProfileSchema.extend({
  id: z.string().uuid("Invalid staff profile ID"),
});

export type CreateStaffProfileInput = z.infer<typeof createStaffProfileSchema>;
export type UpdateStaffProfileInput = z.infer<typeof updateStaffProfileSchema>;
