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
  smtp: smtpSettingsSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

