import type { PermissionDef } from "@/shared/lib/permission-def";

export const STAFF_P = {
  staffRead: "staff:read",
  staffCreate: "staff:create",
  staffManage: "staff:manage",
} as const;

export const STAFF_PERMISSIONS: readonly PermissionDef[] = [
  { code: STAFF_P.staffRead, module: "staff", action: "read", description: "ดูข้อมูลบุคลากรภายใน" },
  { code: STAFF_P.staffCreate, module: "staff", action: "create", description: "เพิ่มข้อมูลบุคลากรใหม่" },
  { code: STAFF_P.staffManage, module: "staff", action: "manage", description: "แก้ไขและจัดการข้อมูลบุคลากร" },
];
