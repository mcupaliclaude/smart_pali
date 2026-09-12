import { prisma } from "@/shared/lib/infra/prisma";
import { env } from "@/shared/lib/infra/env";
import { sendMail } from "@/shared/lib/infra/mailer";
import { generateCsv, parseCsv, type CsvColumn } from "@/shared/lib/csv";
import { SUPER_ADMIN_CODE } from "../../permissions";
import { issueToken, TOKEN_TTL } from "../tokens";
import { writeAudit } from "../audit";
import { passwordSetupEmail } from "../email-templates";
import { getTenantSmtpConfig } from "./tenant.service";
import type { ListUsersQuery } from "../validations/users";

export interface Actor {
  tenantId: string;
  actorId: string;
  isSuperAdmin: boolean;
  permissions: string[];
}

export interface ValidatedUserRow {
  rowNumber: number;
  name: string;
  email: string;
  roleCode: string;
  roleName: string;
  roleId: string;
  status: "active" | "inactive";
  valid: boolean;
  errors: string[];
}

export interface UserImportValidationResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rows: ValidatedUserRow[];
  roleOptions: { id: string; code: string; name: string }[];
}

export interface UserImportExecutionResult {
  total: number;
  successCount: number;
  failCount: number;
  results: {
    rowNumber: number;
    name: string;
    email: string;
    success: boolean;
    error?: string;
    link?: string;
  }[];
}

const roleSelect = {
  role: { select: { id: true, code: true, nameTh: true, nameEn: true } },
  scopeType: true,
  scopeId: true,
} as const;

/**
 * Export tenant users to CSV string formatted for Excel (UTF-8 BOM)
 */
export async function exportUsersToCsv(
  tenantId: string,
  query?: Partial<ListUsersQuery>,
): Promise<{ filename: string; content: string; total: number }> {
  const where = {
    tenantId,
    ...(query?.status === "active"
      ? { isActive: true, user: { isActive: true } }
      : query?.status === "inactive"
        ? { OR: [{ isActive: false }, { user: { isActive: false } }] }
        : {}),
    ...(query?.roleId ? { userRoles: { some: { roleId: query.roleId } } } : {}),
    ...(query?.search
      ? {
          user: {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { email: { contains: query.search, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const rows = await prisma.userTenant.findMany({
    where,
    orderBy: { user: { name: "asc" } },
    include: {
      user: true,
      userRoles: { select: roleSelect },
    },
  });

  const columns: CsvColumn<{
    name: string;
    email: string;
    roleNames: string;
    roleCodes: string;
    status: string;
    lastLogin: string;
    createdAt: string;
  }>[] = [
    { key: "name", label: "ชื่อ-นามสกุล (Name)" },
    { key: "email", label: "อีเมล (Email)" },
    { key: "roleNames", label: "บทบาท (Roles)" },
    { key: "roleCodes", label: "รหัสบทบาท (Role Codes)" },
    { key: "status", label: "สถานะ (Status)" },
    { key: "lastLogin", label: "เข้าสู่ระบบล่าสุด (Last Login)" },
    { key: "createdAt", label: "วันที่สร้าง (Created At)" },
  ];

  const exportData = rows.map((r) => {
    const isActive = r.isActive && r.user.isActive;
    return {
      name: r.user.name,
      email: r.user.email,
      roleNames: r.userRoles.map((ur) => ur.role.nameTh || ur.role.nameEn || ur.role.code).join(", "),
      roleCodes: r.userRoles.map((ur) => ur.role.code).join(", "),
      status: isActive ? "active" : "inactive",
      lastLogin: r.user.lastLoginAt ? r.user.lastLoginAt.toISOString().slice(0, 19).replace("T", " ") : "-",
      createdAt: r.user.createdAt.toISOString().slice(0, 10),
    };
  });

  const csvContent = generateCsv(columns, exportData, { includeBom: true });
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `users-export-${timestamp}.csv`;

  return { filename, content: csvContent, total: rows.length };
}

/**
 * Generate a sample CSV template for importing users
 */
export function getUserImportTemplateCsv(): { filename: string; content: string } {
  const columns = [
    { key: "name", label: "name" },
    { key: "email", label: "email" },
    { key: "role", label: "role" },
    { key: "status", label: "status" },
  ];

  const sampleData = [
    { name: "สมชาย ใจดี", email: "somchai.j@example.com", role: "STAFF", status: "active" },
    { name: "สมหญิง มุ่งมั่น", email: "somying.m@example.com", role: "VIEWER", status: "active" },
    { name: "พระมหาทดสอบ สุทธิญาโณ", email: "pali.student@example.com", role: "VIEWER", status: "active" },
  ];

  const content = generateCsv(columns, sampleData, { includeBom: true });
  return { filename: "users-import-template.csv", content };
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate CSV text before importing
 */
export async function validateUserImport(
  actor: Actor,
  csvText: string,
): Promise<UserImportValidationResult> {
  const { headers, rows } = parseCsv(csvText);

  // Normalize column matching
  const findHeader = (candidates: string[]) => {
    return headers.find((h) => candidates.includes(h.trim().toLowerCase()));
  };

  const nameKey = findHeader(["name", "ชื่อ", "ชื่อ-นามสกุล", "ชื่อที่แสดง", "fullname"]);
  const emailKey = findHeader(["email", "อีเมล", "e-mail", "email address"]);
  const roleKey = findHeader(["role", "roles", "บทบาท", "รหัสบทบาท", "สิทธิ์"]);
  const statusKey = findHeader(["status", "สถานะ", "การใช้งาน"]);

  // Fetch available roles in tenant
  const tenantRoles = await prisma.role.findMany({
    where: { tenantId: actor.tenantId },
    select: {
      id: true,
      code: true,
      nameTh: true,
      nameEn: true,
      rolePermissions: { select: { permission: { select: { code: true } } } },
    },
  });

  const roleOptions = tenantRoles.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.nameTh || r.nameEn || r.code,
  }));

  // Find default fallback role (prefer VIEWER, then STAFF, then first non-superadmin)
  const defaultRole =
    tenantRoles.find((r) => r.code === "VIEWER") ||
    tenantRoles.find((r) => r.code === "STAFF") ||
    tenantRoles.find((r) => r.code !== SUPER_ADMIN_CODE) ||
    tenantRoles[0];

  // Helper map for role lookup
  const roleLookup = new Map<string, typeof tenantRoles[0]>();
  for (const r of tenantRoles) {
    roleLookup.set(r.code.toLowerCase(), r);
    if (r.nameTh) roleLookup.set(r.nameTh.toLowerCase().trim(), r);
    if (r.nameEn) roleLookup.set(r.nameEn.toLowerCase().trim(), r);
  }

  // Find existing emails in DB
  const rawEmails = rows
    .map((r) => (emailKey ? r[emailKey]?.trim().toLowerCase() : ""))
    .filter((e): e is string => Boolean(e && EMAIL_REGEX.test(e)));

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: rawEmails } },
    select: { email: true },
  });
  const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase()));

  // Track seen emails in file for duplicate detection
  const seenFileEmails = new Set<string>();
  const validatedRows: ValidatedUserRow[] = [];

  let rowIdx = 0;
  for (const rawRow of rows) {
    rowIdx++;
    const errors: string[] = [];

    const name = (nameKey ? rawRow[nameKey] : "")?.trim() || "";
    const email = (emailKey ? rawRow[emailKey] : "")?.trim().toLowerCase() || "";
    const roleInput = (roleKey ? rawRow[roleKey] : "")?.trim() || "";
    const statusInput = (statusKey ? rawRow[statusKey] : "")?.trim().toLowerCase() || "active";

    // Validate Name
    if (!name) {
      errors.push("กรุณาระบุชื่อ-นามสกุล");
    }

    // Validate Email
    if (!email) {
      errors.push("กรุณาระบุอีเมล");
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push("รูปแบบอีเมลไม่ถูกต้อง");
    } else if (seenFileEmails.has(email)) {
      errors.push("อีเมลซ้ำกับแถวอื่นในไฟล์");
    } else if (existingEmailSet.has(email)) {
      errors.push("อีเมลนี้มีอยู่ในระบบแล้ว");
    }
    if (email && EMAIL_REGEX.test(email)) {
      seenFileEmails.add(email);
    }

    // Validate Role
    let matchedRole = defaultRole;
    if (roleInput) {
      const found = roleLookup.get(roleInput.toLowerCase());
      if (found) {
        matchedRole = found;
      } else {
        errors.push(`ไม่พบบทบาท "${roleInput}" ในระบบ`);
      }
    }

    if (matchedRole) {
      // Permission guards
      if (matchedRole.code === SUPER_ADMIN_CODE && !actor.isSuperAdmin) {
        errors.push("ไม่อนุญาตให้มอบบทบาทผู้ดูแลสูงสุด (Super Admin)");
      } else if (!actor.isSuperAdmin) {
        const heldPerms = new Set(actor.permissions);
        const unheld = matchedRole.rolePermissions.filter((rp) => !heldPerms.has(rp.permission.code));
        if (unheld.length > 0) {
          errors.push(`บทบาทนี้มีสิทธิ์ที่ท่านไม่มี (${unheld.length} สิทธิ์)`);
        }
      }
    }

    // Validate Status
    let status: "active" | "inactive" = "active";
    if (statusInput === "inactive" || statusInput === "ระงับ" || statusInput === "ปิด" || statusInput === "false" || statusInput === "0") {
      status = "inactive";
    }

    const isValid = errors.length === 0 && matchedRole !== undefined;

    validatedRows.push({
      rowNumber: rowIdx,
      name,
      email,
      roleCode: matchedRole?.code ?? "UNKNOWN",
      roleName: matchedRole?.nameTh || matchedRole?.nameEn || matchedRole?.code || "UNKNOWN",
      roleId: matchedRole?.id ?? "",
      status,
      valid: isValid,
      errors,
    });
  }

  const validCount = validatedRows.filter((r) => r.valid).length;
  const invalidCount = validatedRows.length - validCount;

  return {
    totalRows: validatedRows.length,
    validCount,
    invalidCount,
    rows: validatedRows,
    roleOptions,
  };
}

/**
 * Execute import for validated rows
 */
export async function executeUserImport(
  actor: Actor,
  rows: ValidatedUserRow[],
  options: { sendEmail?: boolean } = {},
): Promise<UserImportExecutionResult> {
  const validRows = rows.filter((r) => r.valid && r.roleId);
  const results: UserImportExecutionResult["results"] = [];
  let successCount = 0;
  let failCount = 0;

  const tenantSmtp = options.sendEmail ? await getTenantSmtpConfig(actor.tenantId) : null;

  for (const item of validRows) {
    try {
      const email = item.email.toLowerCase();
      // Double check in DB to avoid race conditions
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        results.push({
          rowNumber: item.rowNumber,
          name: item.name,
          email,
          success: false,
          error: "อีเมลนี้มีอยู่ในระบบแล้ว",
        });
        failCount++;
        continue;
      }

      const isActive = item.status === "active";

      const { rawToken } = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name: item.name,
            isActive,
          },
        });

        const ut = await tx.userTenant.create({
          data: {
            userId: user.id,
            tenantId: actor.tenantId,
            isActive,
          },
        });

        await tx.userRole.create({
          data: {
            userTenantId: ut.id,
            roleId: item.roleId,
            scopeType: "ALL",
            scopeId: null,
          },
        });

        const { raw } = await issueToken(
          { userId: user.id, purpose: "PASSWORD_RESET", ttlMs: TOKEN_TTL.PASSWORD_SETUP },
          tx,
        );

        await writeAudit(
          {
            tenantId: actor.tenantId,
            actorId: actor.actorId,
            action: "user.import",
            entity: "user",
            entityId: user.id,
            after: {
              email,
              name: item.name,
              roleId: item.roleId,
              roleCode: item.roleCode,
              status: item.status,
            },
          },
          tx,
        );

        return { rawToken: raw };
      });


      const setupUrl = `${env().APP_URL}/reset-password/${rawToken}`;

      if (options.sendEmail) {
        try {
          await sendMail({
            to: email,
            ...passwordSetupEmail("th", { name: item.name, link: setupUrl, hours: 72 }),
            smtp: tenantSmtp ?? undefined,
          });
        } catch {
          // SMTP failure should not fail the user creation
        }
      }

      results.push({
        rowNumber: item.rowNumber,
        name: item.name,
        email,
        success: true,
        link: setupUrl,
      });
      successCount++;
    } catch (err: unknown) {
      results.push({
        rowNumber: item.rowNumber,
        name: item.name,
        email: item.email,
        success: false,
        error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก",
      });
      failCount++;
    }
  }

  return {
    total: validRows.length,
    successCount,
    failCount,
    results,
  };
}
