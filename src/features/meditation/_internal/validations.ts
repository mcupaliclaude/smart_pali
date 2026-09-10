import { z } from "zod";

export const meditationFormatEnum = z.enum(["RESIDENTIAL", "ONE_DAY"]);
export const meditationLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export const meditationCourseStatusEnum = z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED"]);
export const meditationRegistrationStatusEnum = z.enum(["PENDING", "CONFIRMED", "WAITLIST", "CANCELLED"]);

export const scheduleItemSchema = z.object({
  time: z.string().trim(),
  activity: z.string().trim(),
});

export const createMeditationCourseSchema = z
  .object({
    code: z.string().trim().min(1, "Code is required"),
    titleTh: z.string().trim().min(1, "titleTh is required"),
    titleEn: z.string().trim().min(1, "titleEn is required"),
    format: meditationFormatEnum.default("RESIDENTIAL"),
    level: meditationLevelEnum.default("BEGINNER"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    location: z.string().trim().min(1, "Location is required"),
    maxParticipants: z.coerce.number().int().positive("Max participants must be positive").default(50),
    instructors: z.array(z.string()).default([]),
    descriptionTh: z.string().trim().min(1, "descriptionTh is required"),
    descriptionEn: z.string().trim().min(1, "descriptionEn is required"),
    schedule: z.array(scheduleItemSchema).default([]),
    guidelines: z.array(z.string()).default([]),
    feeNote: z.string().trim().optional().nullable(),
    imageUrl: z.string().trim().optional().nullable(),
    status: meditationCourseStatusEnum.default("OPEN"),
    seq: z.coerce.number().int().default(1),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const updateMeditationCourseSchema = z
  .object({
    id: z.string().uuid("Invalid course ID"),
    code: z.string().trim().min(1, "Code is required"),
    titleTh: z.string().trim().min(1, "titleTh is required"),
    titleEn: z.string().trim().min(1, "titleEn is required"),
    format: meditationFormatEnum.default("RESIDENTIAL"),
    level: meditationLevelEnum.default("BEGINNER"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    location: z.string().trim().min(1, "Location is required"),
    maxParticipants: z.coerce.number().int().positive().default(50),
    instructors: z.array(z.string()).default([]),
    descriptionTh: z.string().trim().min(1, "descriptionTh is required"),
    descriptionEn: z.string().trim().min(1, "descriptionEn is required"),
    schedule: z.array(scheduleItemSchema).default([]),
    guidelines: z.array(z.string()).default([]),
    feeNote: z.string().trim().optional().nullable(),
    imageUrl: z.string().trim().optional().nullable(),
    status: meditationCourseStatusEnum.default("OPEN"),
    seq: z.coerce.number().int().default(1),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const createMeditationRegistrationSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  fullNameTh: z.string().trim().min(1, "fullNameTh is required"),
  fullNameEn: z.string().trim().optional().nullable(),
  nationalId: z.string().trim().optional().nullable(),
  gender: z.string().trim().default("OTHER"),
  age: z.coerce.number().int().positive().optional().nullable(),
  phone: z.string().trim().min(1, "phone is required"),
  email: z.string().email("Invalid email address"),
  occupation: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  emergencyContactName: z.string().trim().min(1, "emergencyContactName is required"),
  emergencyContactPhone: z.string().trim().min(1, "emergencyContactPhone is required"),
  medicalConditions: z.string().trim().optional().nullable(),
  dietaryRequirements: z.string().trim().optional().nullable(),
  experience: z.string().trim().optional().nullable(),
});

export const reviewMeditationRegistrationSchema = z.object({
  registrationId: z.string().uuid("Invalid registration ID"),
  status: z.enum(["CONFIRMED", "WAITLIST", "CANCELLED"]),
  roomAssigned: z.string().trim().optional().nullable(),
  reviewNote: z.string().trim().optional().nullable(),
});

export type CreateMeditationCourseInput = z.infer<typeof createMeditationCourseSchema>;
export type UpdateMeditationCourseInput = z.infer<typeof updateMeditationCourseSchema>;
export type CreateMeditationRegistrationInput = z.infer<typeof createMeditationRegistrationSchema>;
export type ReviewMeditationRegistrationInput = z.infer<typeof reviewMeditationRegistrationSchema>;
