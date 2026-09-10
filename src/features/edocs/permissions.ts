import type { PermissionDef } from "@/shared/lib/permission-def";

export const EDOCS_P = {
  edocsRead: "edocs:read",
  edocsCreate: "edocs:create",
  edocsApprove: "edocs:approve",
  edocsManage: "edocs:manage",
} as const;

export const EDOCS_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: EDOCS_P.edocsRead,
    module: "edocs",
    action: "read",
    description: "ดูรายการเอกสารและประวัติการอนุมัติ",
  },
  {
    code: EDOCS_P.edocsCreate,
    module: "edocs",
    action: "create",
    description: "สร้างและยื่นคำขออนุมัติเอกสารใหม่",
  },
  {
    code: EDOCS_P.edocsApprove,
    module: "edocs",
    action: "approve",
    description: "ลงนามพิจารณาอนุมัติหรือปฏิเสธเอกสาร",
  },
  {
    code: EDOCS_P.edocsManage,
    module: "edocs",
    action: "manage",
    description: "จัดการและควบคุมระบบเอกสารทั้งหมด",
  },
];
