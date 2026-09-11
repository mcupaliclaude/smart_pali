import { prisma } from "@/shared/lib/infra/prisma";
import { errors } from "./errors";

/**
 * ดึง tenantId สำหรับการทำงานฝั่งสาธารณะ (Public Portal)
 * 1. หากผู้ใช้ล็อกอินอยู่แล้วและมี tenantId ในเซสชัน ให้ใช้ค่านั้น
 * 2. หากเป็นบุคคลภายนอก ให้ค้นหา Tenant หลักที่สถานะ isActive = true
 * 3. หากไม่พบ Tenant ใด ๆ ให้ throw AppError not_found
 */
export async function resolvePublicTenantId(sessionTenantId?: string | null): Promise<string> {
  if (sessionTenantId) return sessionTenantId;

  const defaultTenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  if (!defaultTenant) {
    throw errors.not_found("tenant.notFound");
  }

  return defaultTenant.id;
}
