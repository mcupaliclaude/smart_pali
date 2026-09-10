import { describe, it, expect } from "vitest";
import {
  createCurriculumProgramSchema,
  updateCurriculumProgramSchema,
  createCurriculumCourseSchema,
} from "./validations";

describe("Curriculum Validations", () => {
  const validProgram = {
    code: "BA-PALI",
    nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาภาษาบาลี",
    nameEn: "Bachelor of Arts Program in Pali",
    degreeTh: "พุทธศาสตรบัณฑิต (ภาษาบาลี)",
    degreeEn: "Bachelor of Arts (Pali)",
    level: "BACHELOR" as const,
    departmentId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
    totalCredits: 120,
    durationYears: 4,
    descriptionTh: "หลักสูตรมุ่งเน้นการศึกษาคัมภีร์พระไตรปิฎกภาษาบาลี",
    descriptionEn: "Focuses on the study of Pali canonical texts",
  };

  it("validates a complete valid curriculum program", () => {
    const result = createCurriculumProgramSchema.safeParse(validProgram);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("BA-PALI");
      expect(result.data.level).toBe("BACHELOR");
      expect(result.data.status).toBe("ACTIVE");
      expect(result.data.seq).toBe(1);
    }
  });

  it("fails when required fields are missing", () => {
    const result = createCurriculumProgramSchema.safeParse({
      ...validProgram,
      nameTh: "",
    });
    expect(result.success).toBe(false);
  });

  it("validates update curriculum program schema requires valid UUID id", () => {
    const result = updateCurriculumProgramSchema.safeParse({
      ...validProgram,
      id: "not-a-uuid",
    });
    expect(result.success).toBe(false);

    const validResult = updateCurriculumProgramSchema.safeParse({
      ...validProgram,
      id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
    });
    expect(validResult.success).toBe(true);
  });

  it("validates course schema", () => {
    const validCourse = {
      programId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      code: "PL101",
      nameTh: "ไวยากรณ์บาลี ๑",
      nameEn: "Pali Grammar I",
      credits: 3,
    };
    const result = createCurriculumCourseSchema.safeParse(validCourse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lectureHours).toBe(3);
      expect(result.data.labHours).toBe(0);
      expect(result.data.selfStudyHours).toBe(6);
    }
  });
});
