import type { PermissionDef } from "@/shared/lib/permission-def";

export const RESERVATIONS_P = {
  reservationsRead: "reservations:read",
  reservationsCreate: "reservations:create",
  reservationsReview: "reservations:review",
  reservationsManage: "reservations:manage",
} as const;

export const RESERVATIONS_PERMISSIONS: PermissionDef[] = [
  {
    code: RESERVATIONS_P.reservationsRead,
    module: "reservations",
    action: "read",
    description: "ดูรายการห้องประชุม ยานพาหนะ และประวัติการจอง",
  },
  {
    code: RESERVATIONS_P.reservationsCreate,
    module: "reservations",
    action: "create",
    description: "ยื่นคำขอจองห้องประชุมหรือยานพาหนะ",
  },
  {
    code: RESERVATIONS_P.reservationsReview,
    module: "reservations",
    action: "review",
    description: "พิจารณาอนุมัติหรือปฏิเสธคำขอจอง",
  },
  {
    code: RESERVATIONS_P.reservationsManage,
    module: "reservations",
    action: "manage",
    description: "จัดการข้อมูลห้องประชุม ยานพาหนะ และควบคุมระบบจองทั้งหมด",
  },
];
