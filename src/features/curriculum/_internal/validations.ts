import { z } from "zod";

export const curriculumLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE"]);
export const curriculumStatusEnum = z.enum(["DRAFT", "ACTIVE", "REVISED", "PHASED_OUT"]);

export const createCurriculumProgramSchema = z.object({
  code: z.string().trim().min(1, "code is required"),
  nameTh: z.string().trim().min(1, "nameTh is required"),
  nameEn: z.string().trim().min(1, "nameEn is required"),
  degreeTh: z.string().trim().min(1, "degreeTh is required"),
  degreeEn: z.string().trim().min(1, "degreeEn is required"),
  level: curriculumLevelEnum.default("BACHELOR"),
  departmentId: z.string().uuid("Invalid department ID"),
  coordinatorId: z.string().uuid("Invalid coordinator ID").optional().nullable(),
  totalCredits: z.coerce.number().int().min(0).default(0),
  durationYears: z.coerce.number().int().min(1).default(4),
  tuitionFeeNoteTh: z.string().trim().optional().nullable(),
  tuitionFeeNoteEn: z.string().trim().optional().nullable(),
  descriptionTh: z.string().trim().min(1, "descriptionTh is required"),
  descriptionEn: z.string().trim().min(1, "descriptionEn is required"),
  careerProspects: z.array(z.string()).optional().nullable(),
  admissionRequirements: z.array(z.string()).optional().nullable(),
  brochureUrl: z.string().trim().optional().nullable(),
  seq: z.coerce.number().int().default(1),
  status: curriculumStatusEnum.default("ACTIVE"),
});

export const updateCurriculumProgramSchema = createCurriculumProgramSchema.extend({
  id: z.string().uuid("Invalid curriculum program ID"),
});

export const createCurriculumCourseSchema = z.object({
  programId: z.string().uuid("Invalid program ID"),
  code: z.string().trim().min(1, "code is required"),
  nameTh: z.string().trim().min(1, "nameTh is required"),
  nameEn: z.string().trim().min(1, "nameEn is required"),
  credits: z.coerce.number().int().min(1).default(3),
  lectureHours: z.coerce.number().int().min(0).default(3),
  labHours: z.coerce.number().int().min(0).default(0),
  selfStudyHours: z.coerce.number().int().min(0).default(6),
  courseCategory: z.string().trim().default("MAJOR"),
  descriptionTh: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().optional().nullable(),
  yearLevel: z.coerce.number().int().min(1).max(8).default(1),
  semester: z.coerce.number().int().min(1).max(3).default(1),
  seq: z.coerce.number().int().default(1),
});

export const createDepartmentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "code must be at least 2 characters")
    .max(50, "code must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "code must contain only alphanumeric characters, underscores, or hyphens"),
  nameTh: z.string().trim().min(2, "nameTh is required").max(100),
  nameEn: z.string().trim().min(2, "nameEn is required").max(100),
  seq: z.coerce.number().int().min(0).default(1),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid("Invalid department ID"),
});

export type CreateCurriculumProgramInput = z.infer<typeof createCurriculumProgramSchema>;
export type UpdateCurriculumProgramInput = z.infer<typeof updateCurriculumProgramSchema>;
export type CreateCurriculumCourseInput = z.infer<typeof createCurriculumCourseSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

