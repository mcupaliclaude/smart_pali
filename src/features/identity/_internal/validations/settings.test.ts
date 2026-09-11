import { describe, it, expect, vi } from "vitest";
import { updateSettingsSchema, smtpSettingsSchema, testSmtpSchema } from "./settings";
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

  it("ยอมรับไฟล์ SVG ที่ปลอดภัย", async () => {
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined as never);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined as never);

    const safeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
    const mockFile = {
      name: "safe.svg",
      size: safeSvg.length,
      type: "image/svg+xml",
      arrayBuffer: async () => Buffer.from(safeSvg),
    };

    const res = await saveUploadedLogo(mockFile, "tenant-123-uuid");
    expect(res.url).toMatch(/^\/uploads\/logos\/logo-tenant-1-[0-9]+-[a-f0-9]+\.svg$/);
    vi.restoreAllMocks();
  });

  it("ปฏิเสธไฟล์ SVG ที่มีสคริปต์หรือโค้ดอันตราย (Stored XSS Prevention)", async () => {
    const maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
    const mockFile = {
      name: "evil.svg",
      size: maliciousSvg.length,
      type: "image/svg+xml",
      arrayBuffer: async () => Buffer.from(maliciousSvg),
    };

    await expect(saveUploadedLogo(mockFile, "tenant-123")).rejects.toThrow();
  });
});

describe("smtpSettingsSchema", () => {
  it("ยอมรับการปิดใช้งาน SMTP เมื่อฟิลด์ว่างเปล่า", () => {
    const data = {
      enabled: false,
      user: "",
      pass: "",
      fromName: "",
      fromEmail: "",
    };
    const parsed = smtpSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("ยอมรับการเปิดใช้งาน SMTP เมื่อระบุ Gmail ที่ถูกต้อง", () => {
    const data = {
      enabled: true,
      user: "admin@gmail.com",
      pass: "abcd efgh ijkl mnop",
      fromName: "Smart Pali",
      fromEmail: "admin@gmail.com",
    };
    const parsed = smtpSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.user).toBe("admin@gmail.com");
      expect(parsed.data.enabled).toBe(true);
    }
  });

  it("ปฏิเสธการเปิดใช้งาน SMTP หากไม่ได้ระบุอีเมลหรืออีเมลผิดรูปแบบ", () => {
    const dataNoEmail = {
      enabled: true,
      user: "",
      pass: "somepassword",
    };
    expect(smtpSettingsSchema.safeParse(dataNoEmail).success).toBe(false);

    const dataInvalidEmail = {
      enabled: true,
      user: "not-an-email",
      pass: "somepassword",
    };
    expect(smtpSettingsSchema.safeParse(dataInvalidEmail).success).toBe(false);
  });

  it("ปฏิเสธหาก fromEmail ผิดรูปแบบ (ถ้ามีระบุไว้)", () => {
    const data = {
      enabled: true,
      user: "admin@gmail.com",
      pass: "somepassword",
      fromEmail: "invalid-email-address",
    };
    const parsed = smtpSettingsSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });
});

describe("testSmtpSchema", () => {
  it("ยอมรับข้อมูลทดสอบ SMTP ที่ถูกต้อง", () => {
    const data = {
      user: "admin@gmail.com",
      pass: "abcdefghijklmnop",
      to: "test@example.com",
      fromName: "Admin",
    };
    const parsed = testSmtpSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("ปฏิเสธหาก to ไม่ใช่อีเมล", () => {
    const data = {
      user: "admin@gmail.com",
      to: "not-an-email",
    };
    const parsed = testSmtpSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });
});

