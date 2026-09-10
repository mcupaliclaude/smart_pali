import { describe, it, expect } from "vitest";
import {
  createResourceSchema,
  createReservationSchema,
  reviewReservationSchema,
} from "./validations";

describe("Reservations Validations", () => {
  it("validates valid resource payload", () => {
    const input = {
      type: "FACILITY",
      code: "ROOM-201",
      nameTh: "ห้องประชุม 201",
      nameEn: "Meeting Room 201",
      capacity: 30,
      location: "อาคาร 1 ชั้น 2",
      amenities: ["Projector", "WiFi"],
      status: "AVAILABLE",
    };

    const parsed = createResourceSchema.parse(input);
    expect(parsed.code).toBe("ROOM-201");
    expect(parsed.capacity).toBe(30);
    expect(parsed.amenities).toEqual(["Projector", "WiFi"]);
  });

  it("validates valid reservation payload and rejects if endTime <= startTime", () => {
    const valid = {
      resourceId: "123e4567-e89b-12d3-a456-426614174000",
      title: "การประชุมคณาจารย์",
      applicantName: "พระมหาสมชาย",
      applicantEmail: "somchai@app.local",
      applicantPhone: "0812345678",
      departmentName: "ภาควิชาพระพุทธศาสนา",
      startTime: "2026-10-01T09:00:00.000Z",
      endTime: "2026-10-01T12:00:00.000Z",
      attendeeCount: 15,
      purpose: "ประชุมวางแผนหลักสูตร",
    };

    const parsed = createReservationSchema.parse(valid);
    expect(parsed.attendeeCount).toBe(15);

    // Invalid time
    const invalidTime = {
      ...valid,
      startTime: "2026-10-01T12:00:00.000Z",
      endTime: "2026-10-01T09:00:00.000Z",
    };

    expect(() => createReservationSchema.parse(invalidTime)).toThrow();
  });

  it("validates review reservation payload", () => {
    const input = {
      reservationId: "123e4567-e89b-12d3-a456-426614174000",
      status: "APPROVED",
      reviewNote: "อนุมัติเรียบร้อย",
    };

    const parsed = reviewReservationSchema.parse(input);
    expect(parsed.status).toBe("APPROVED");
    expect(parsed.reviewNote).toBe("อนุมัติเรียบร้อย");
  });
});
