import { describe, it, expect } from "vitest";
import { createStaffProfileSchema, updateStaffProfileSchema } from "./validations";

describe("staff validations", () => {
  const validPayload = {
    prefixTh: "ศ.ดร.",
    prefixEn: "Prof. Dr.",
    firstNameTh: "สมชาย",
    lastNameTh: "ใจดี",
    firstNameEn: "Somchai",
    lastNameEn: "Jaidee",
    staffType: "ACADEMIC" as const,
    academicRank: "ศาสตราจารย์",
    administrativePositionTh: "คณบดี",
    administrativePositionEn: "Dean",
    departmentId: "123e4567-e89b-12d3-a456-426614174000",
    email: "somchai.j@faculty.ac.th",
    phone: "02-123-4567",
    roomNo: "401",
    education: ["Ph.D. in Buddhist Studies, Oxford University"],
    researchInterests: ["Pali Philology", "Early Buddhist Epistemology"],
    avatarUrl: "https://example.com/avatar.jpg",
    seq: 1,
    status: "ACTIVE" as const,
  };

  it("passes with valid data", () => {
    const result = createStaffProfileSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("fails with invalid email", () => {
    const result = createStaffProfileSchema.safeParse({
      ...validPayload,
      email: "invalid-email",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid department UUID", () => {
    const result = createStaffProfileSchema.safeParse({
      ...validPayload,
      departmentId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("validates update schema requires UUID id", () => {
    const result = updateStaffProfileSchema.safeParse({
      ...validPayload,
      id: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result.success).toBe(true);

    const invalid = updateStaffProfileSchema.safeParse({
      ...validPayload,
      id: "not-a-uuid",
    });
    expect(invalid.success).toBe(false);
  });
});
