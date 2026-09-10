import { describe, it, expect } from "vitest";
import {
  createAlumniMemberSchema,
  verifyAlumniMemberSchema,
  createAlumniStorySchema,
} from "./validations";

describe("Alumni Validations", () => {
  it("validates valid alumni member registration input", () => {
    const input = {
      fullNameTh: "พระมหาพงศ์พันธุ์ ธมฺมโชโต",
      fullNameEn: "Phra Maha Pongphan Dhammachoto",
      graduationYearBe: 2565,
      degreeLevel: "BACHELOR",
      majorTh: "สาขาวิชาภาษาบาลีและพุทธศาสนา",
      majorEn: "Pali and Buddhist Studies",
      currentWorkplace: "วัดเบญจมบพิตรดุสิตวนาราม",
      jobTitle: "อาจารย์ใหญ่ฝ่ายบาลีศึกษา",
      phone: "082-998-1144",
      email: "pongphan@example.org",
      isPublic: true,
    };

    const parsed = createAlumniMemberSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.graduationYearBe).toBe(2565);
      expect(parsed.data.degreeLevel).toBe("BACHELOR");
      expect(parsed.data.status).toBe("PENDING");
    }
  });

  it("fails when required fields are missing", () => {
    const input = {
      fullNameEn: "Only English",
      graduationYearBe: 2560,
    };

    const parsed = createAlumniMemberSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates verify member input", () => {
    const input = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "VERIFIED",
      isSpotlight: true,
      spotlightQuoteTh: "ความเพียรเป็นเลิศ",
    };

    const parsed = verifyAlumniMemberSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("validates story creation input", () => {
    const story = {
      titleTh: "เรื่องราวศิษย์เก่าดีเด่น",
      titleEn: "Outstanding Alumni Story",
      alumniName: "ดร.สมชาย",
      graduationYearBe: 2555,
      degreeLevel: "MASTER",
      summaryTh: "สรุปย่อ",
      summaryEn: "Summary",
      contentTh: "เนื้อหา",
      contentEn: "Content",
    };

    const parsed = createAlumniStorySchema.safeParse(story);
    expect(parsed.success).toBe(true);
  });
});
