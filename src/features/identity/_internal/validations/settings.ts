import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const smtpSettingsSchema = z
  .object({
    enabled: z.boolean().default(false),
    user: z.string().trim().max(255).default(""),
    pass: z.string().trim().max(255).optional().default(""),
    fromName: z.string().trim().max(255).optional().default(""),
    fromEmail: z.string().trim().max(255).optional().default(""),
  })
  .refine(
    (data) => {
      if (!data.enabled) return true;
      return data.user.length > 0 && z.string().email().safeParse(data.user).success;
    },
    {
      message: "Invalid Gmail address",
      path: ["user"],
    },
  )
  .refine(
    (data) => {
      if (!data.fromEmail || data.fromEmail === "") return true;
      return z.string().email().safeParse(data.fromEmail).success;
    },
    {
      message: "Invalid sender email address",
      path: ["fromEmail"],
    },
  );

export const testSmtpSchema = z.object({
  user: z.string().trim().email(),
  pass: z.string().trim().optional().default(""),
  to: z.string().trim().email(),
  fromName: z.string().trim().optional().default(""),
  fromEmail: z.string().trim().optional().default(""),
});

export const contactSettingsSchema = z.object({
  addressTh: z.string().trim().max(500).optional().default(""),
  addressEn: z.string().trim().max(500).optional().default(""),
  phone: z.string().trim().max(100).optional().default(""),
  email: z
    .string()
    .trim()
    .max(255)
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Invalid email address",
    })
    .optional()
    .default(""),
  hoursTh: z.string().trim().max(255).optional().default(""),
  hoursEn: z.string().trim().max(255).optional().default(""),
  facebook: z.string().trim().max(255).optional().default(""),
  line: z.string().trim().max(255).optional().default(""),
  mapUrl: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (val) => val === "" || val.startsWith("/") || z.string().url().safeParse(val).success,
      { message: "Invalid URL or path" },
    )
    .optional()
    .default(""),
});

export const aiSettingsSchema = z.object({
  geminiApiKey: z.string().trim().max(255).optional().default(""),
  geminiModel: z.string().trim().max(100).optional().default("gemini-2.5-flash"),
});

export const testGeminiApiSchema = z.object({
  apiKey: z.string().trim().optional().default(""),
  model: z.string().trim().optional().default("gemini-2.5-flash"),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (val) => val === "" || val.startsWith("/") || z.string().url().safeParse(val).success,
      { message: "Invalid URL or path" },
    )
    .default(""),
  palette: z.enum(PALETTE_IDS),
  contact: contactSettingsSchema.optional(),
  smtp: smtpSettingsSchema.optional(),
  ai: aiSettingsSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
export type AiSettingsInput = z.infer<typeof aiSettingsSchema>;
export type TestGeminiApiInput = z.infer<typeof testGeminiApiSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;


