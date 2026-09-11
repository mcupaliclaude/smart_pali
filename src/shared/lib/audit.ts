import { prisma, type Db } from "@/shared/lib/infra/prisma";

export interface AuditEntry {
  tenantId: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}

/**
 * บันทึกประวัติการกระทำลงใน audit_logs รองรับทั้งการเรียกผ่าน prisma ปกติ หรือ transaction (tx)
 */
export async function writeAudit(entry: AuditEntry, db: Db = prisma): Promise<void> {
  await db.auditLog.create({
    data: {
      tenantId: entry.tenantId,
      actorId: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      before: entry.before === undefined ? undefined : (entry.before as object),
      after: entry.after === undefined ? undefined : (entry.after as object),
      ip: entry.ip ?? null,
    },
  });
}
