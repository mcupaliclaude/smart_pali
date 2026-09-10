import { describe, it, expect } from "vitest";
import {
  createMeditationCourseSchema,
  createMeditationRegistrationSchema,
  reviewMeditationRegistrationSchema,
} from "./validations";

describe("Meditation Validations", () => {
  it("validates valid course payload and rejects if endDate < startDate", () => {
    const valid = {
      code: "MED-01",
      titleTh: "คอร์สวิปัสสนา 3 วัน",
      titleEn: "3-Day Vipassana",
      format: "RESIDENTIAL",
      level: "BEGINNER",
      startDate: "2026-10-01T00:00:00.000Z",
      endDate: "2026-10-03T00:00:00.000Z",
      location: "ศาลาปฏิบัติธรรม",
      maxParticipants: 50,
      instructors: ["พระอาจารย์สุเทพ"],
      descriptionTh: "รายละเอียดคอร์ส",
      descriptionEn: "Course details",
    };

    const parsed = createMeditationCourseSchema.parse(valid);
    expect(parsed.code).toBe("MED-01");
    expect(parsed.maxParticipants).toBe(50);

    const invalidDates = {
      ...valid,
      startDate: "2026-10-05T00:00:00.000Z",
      endDate: "2026-10-01T00:00:00.000Z",
    };
    expect(() => createMeditationCourseSchema.parse(invalidDates)).toThrow();
  });

  it("validates valid registration payload", () => {
    const input = {
      courseId: "123e4567-e89b-12d3-a456-426614174000",
      fullNameTh: "นายวิศรุต สันติธรรม",
      email: "wissarut@example.com",
      phone: "0819987766",
      emergencyContactName: "สมใจ สันติธรรม",
      emergencyContactPhone: "0891112233",
    };

    const parsed = createMeditationRegistrationSchema.parse(input);
    expect(parsed.fullNameTh).toBe("นายวิศรุต สันติธรรม");
    expect(parsed.email).toBe("wissarut@example.com");
  });

  it("validates review registration payload", () => {
    const input = {
      registrationId: "123e4567-e89b-12d3-a456-426614174000",
      status: "CONFIRMED",
      roomAssigned: "กุฏิ 102",
      reviewNote: "ยืนยันสิทธิ์เรียบร้อย",
    };

    const parsed = reviewMeditationRegistrationSchema.parse(input);
    expect(parsed.status).toBe("CONFIRMED");
    expect(parsed.roomAssigned).toBe("กุฏิ 102");
  });
});
