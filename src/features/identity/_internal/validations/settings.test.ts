import { describe, it, expect, vi } from "vitest";
import { updateSettingsSchema } from "./settings";
import { saveUploadedLogo, MAX_LOGO_FILE_SIZE } from "../services/logo-upload.service";
import fs from "node:fs/promises";

describe("updateSettingsSchema", () => {
  it("ยอมรับ payload ที่มี logoUrl เป็น relative path /uploads/...", () => {
    const data = {
      nameTh: "คณะพุทธศาสตร์",
      nameEn: "Faculty of Buddhism",
      logoUrl: "/uploads/logos/logo-test-123.png",
      palette: "blue",
    };
    const parsed = updateSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logoUrl).toBe("/uploads/logos/logo-test-123.png");
    }
  });

  it("ยอมรับ payload ที่มี logoUrl เป็น full URL", () => {
    const data = {
      nameTh: "คณะพุทธศาสตร์",
      nameEn: "Faculty of Buddhism",
      logoUrl: "https://example.com/logo.png",
      palette: "coral",
    };
    const parsed = updateSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logoUrl).toBe("https://example.com/logo.png");
    }
  });

  it("ยอมรับ payload ที่มี logoUrl เป็นค่าว่าง", () => {
    const data = {
      nameTh: "คณะพุทธศาสตร์",
      nameEn: "Faculty of Buddhism",
      logoUrl: "",
      palette: "green",
    };
    const parsed = updateSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logoUrl).toBe("");
    }
  });

  it("ปฏิเสธ logoUrl ที่ไม่ใช่ URL หรือ path ที่ถูกต้อง", () => {
    const data = {
      nameTh: "คณะพุทธศาสตร์",
      nameEn: "Faculty of Buddhism",
      logoUrl: "not-a-valid-url-or-path",
      palette: "purple",
    };
    const parsed = updateSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it("ปฏิเสธ logoUrl ที่ยาวเกิน 500 ตัวอักษร", () => {
    const data = {
      nameTh: "คณะพุทธศาสตร์",
      nameEn: "Faculty of Buddhism",
      logoUrl: "/" + "a".repeat(505),
      palette: "blue",
    };
    const parsed = updateSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });
});

describe("saveUploadedLogo service", () => {
  it("บันทึกไฟล์ภาพสำเร็จและคืนค่า path สัมพัทธ์ /uploads/logos/...", async () => {
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined as never);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined as never);

    const mockFile = {
      name: "logo.png",
      size: 1024,
      type: "image/png",
      arrayBuffer: async () => new ArrayBuffer(1024),
    };

    const res = await saveUploadedLogo(mockFile, "tenant-123-uuid");
    expect(res.url).toMatch(/^\/uploads\/logos\/logo-tenant-1-[0-9]+-[a-f0-9]+\.png$/);
    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("ปฏิเสธประเภทไฟล์ที่ไม่ได้รับอนุญาต", async () => {
    const mockFile = {
      name: "doc.pdf",
      size: 1024,
      type: "application/pdf",
      arrayBuffer: async () => new ArrayBuffer(1024),
    };

    await expect(saveUploadedLogo(mockFile, "tenant-123")).rejects.toThrow();
  });

  it("ปฏิเสธไฟล์ที่มีขนาดเกิน MAX_LOGO_FILE_SIZE (2MB)", async () => {
    const mockFile = {
      name: "huge.jpg",
      size: MAX_LOGO_FILE_SIZE + 1,
      type: "image/jpeg",
      arrayBuffer: async () => new ArrayBuffer(10),
    };

    await expect(saveUploadedLogo(mockFile, "tenant-123")).rejects.toThrow();
  });

  it("ปฏิเสธไฟล์ที่ว่างเปล่า (size = 0)", async () => {
    const mockFile = {
      name: "empty.png",
      size: 0,
      type: "image/png",
      arrayBuffer: async () => new ArrayBuffer(0),
    };

    await expect(saveUploadedLogo(mockFile, "tenant-123")).rejects.toThrow();
  });
});
