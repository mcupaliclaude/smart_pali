import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { errors } from "@/shared/lib/errors";

export const ALLOWED_LOGO_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
export const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface UploadableFile {
  name: string;
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export async function saveUploadedLogo(file: UploadableFile, tenantId: string): Promise<{ url: string }> {
  if (!file || file.size === 0) {
    throw errors.validation("validation", { file: ["File is required"] });
  }
  const ext = ALLOWED_LOGO_MIME_TYPES[file.type];
  if (!ext) {
    throw errors.validation("validation", { file: ["Invalid file type. Only PNG, JPG, WEBP, and SVG are allowed."] });
  }
  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw errors.validation("validation", { file: ["File size exceeds 2MB limit."] });
  }

  const hash = crypto.randomBytes(6).toString("hex");
  const filename = `logo-${tenantId.slice(0, 8)}-${Date.now()}-${hash}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

  await fs.mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());

  // Prevent Stored XSS via malicious SVG content
  if (file.type === "image/svg+xml") {
    const text = buffer.toString("utf-8").toLowerCase();
    const dangerousPatterns = [
      "<script",
      "javascript:",
      "onload=",
      "onerror=",
      "onclick=",
      "onmouseover=",
      "onfocus=",
      "<foreignobject",
      "<iframe",
      "<embed",
      "<object",
    ];
    if (dangerousPatterns.some((pattern) => text.includes(pattern))) {
      throw errors.validation("validation", {
        file: ["SVG contains potentially malicious or executable content."],
      });
    }
  }

  await fs.writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/uploads/logos/${filename}` };
}
