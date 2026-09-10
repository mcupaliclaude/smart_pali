import { z } from "zod";

export const alumniDegreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL", "DIPLOMA"]);
export const alumniStatusEnum = z.enum(["PENDING", "VERIFIED", "REJECTED"]);

export const createAlumniMemberSchema = z.object({
  studentId: z.string().trim().optional().nullable(),
  fullNameTh: z.string().trim().min(1, "Full name (Thai) is required"),
  fullNameEn: z.string().trim().optional().nullable(),
  graduationYearBe: z.coerce.number().int().min(2450, "Year must be at least 2450").max(2650, "Year is invalid"),
  degreeLevel: alumniDegreeLevelEnum.default("BACHELOR"),
  majorTh: z.string().trim().min(1, "Major (Thai) is required"),
  majorEn: z.string().trim().optional().nullable(),
  currentWorkplace: z.string().trim().optional().nullable(),
  jobTitle: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Invalid email").optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().trim().optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  isPublic: z.boolean().default(true),
  isSpotlight: z.boolean().default(false),
  spotlightQuoteTh: z.string().trim().optional().nullable(),
  spotlightQuoteEn: z.string().trim().optional().nullable(),
  status: alumniStatusEnum.default("PENDING"),
});

export const updateAlumniMemberSchema = z.object({
  id: z.string().uuid("Invalid member ID"),
  studentId: z.string().trim().optional().nullable(),
  fullNameTh: z.string().trim().min(1, "Full name (Thai) is required"),
  fullNameEn: z.string().trim().optional().nullable(),
  graduationYearBe: z.coerce.number().int().min(2450).max(2650),
  degreeLevel: alumniDegreeLevelEnum.default("BACHELOR"),
  majorTh: z.string().trim().min(1, "Major (Thai) is required"),
  majorEn: z.string().trim().optional().nullable(),
  currentWorkplace: z.string().trim().optional().nullable(),
  jobTitle: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Invalid email").optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().trim().optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  isPublic: z.boolean().default(true),
  isSpotlight: z.boolean().default(false),
  spotlightQuoteTh: z.string().trim().optional().nullable(),
  spotlightQuoteEn: z.string().trim().optional().nullable(),
  status: alumniStatusEnum.default("VERIFIED"),
});

export const verifyAlumniMemberSchema = z.object({
  id: z.string().uuid("Invalid member ID"),
  status: z.enum(["VERIFIED", "REJECTED"]),
  isSpotlight: z.boolean().optional(),
  spotlightQuoteTh: z.string().trim().optional().nullable(),
});

export const createAlumniStorySchema = z.object({
  titleTh: z.string().trim().min(1, "titleTh is required"),
  titleEn: z.string().trim().min(1, "titleEn is required"),
  alumniName: z.string().trim().min(1, "alumniName is required"),
  graduationYearBe: z.coerce.number().int().min(2450).max(2650),
  degreeLevel: alumniDegreeLevelEnum.default("BACHELOR"),
  summaryTh: z.string().trim().min(1, "summaryTh is required"),
  summaryEn: z.string().trim().min(1, "summaryEn is required"),
  contentTh: z.string().trim().min(1, "contentTh is required"),
  contentEn: z.string().trim().min(1, "contentEn is required"),
  imageUrl: z.string().trim().optional().nullable(),
  published: z.boolean().default(true),
  seq: z.coerce.number().int().default(1),
});

export const updateAlumniStorySchema = z.object({
  id: z.string().uuid("Invalid story ID"),
  titleTh: z.string().trim().min(1, "titleTh is required"),
  titleEn: z.string().trim().min(1, "titleEn is required"),
  alumniName: z.string().trim().min(1, "alumniName is required"),
  graduationYearBe: z.coerce.number().int().min(2450).max(2650),
  degreeLevel: alumniDegreeLevelEnum.default("BACHELOR"),
  summaryTh: z.string().trim().min(1, "summaryTh is required"),
  summaryEn: z.string().trim().min(1, "summaryEn is required"),
  contentTh: z.string().trim().min(1, "contentTh is required"),
  contentEn: z.string().trim().min(1, "contentEn is required"),
  imageUrl: z.string().trim().optional().nullable(),
  published: z.boolean().default(true),
  seq: z.coerce.number().int().default(1),
});

export type CreateAlumniMemberInput = z.infer<typeof createAlumniMemberSchema>;
export type UpdateAlumniMemberInput = z.infer<typeof updateAlumniMemberSchema>;
export type VerifyAlumniMemberInput = z.infer<typeof verifyAlumniMemberSchema>;
export type CreateAlumniStoryInput = z.infer<typeof createAlumniStorySchema>;
export type UpdateAlumniStoryInput = z.infer<typeof updateAlumniStorySchema>;
