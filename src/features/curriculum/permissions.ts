import type { PermissionDef } from "@/shared/lib/permission-def";

export const CURRICULUM_P = {
  curriculumRead: "curriculum:read",
  curriculumCreate: "curriculum:create",
  curriculumManage: "curriculum:manage",
} as const;

export const CURRICULUM_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: CURRICULUM_P.curriculumRead,
    module: "curriculum",
    action: "read",
    description: "ดูข้อมูลหลักสูตรและรายวิชาภายใน",
  },
  {
    code: CURRICULUM_P.curriculumCreate,
    module: "curriculum",
    action: "create",
    description: "สร้างข้อมูลหลักสูตรการศึกษา",
  },
  {
    code: CURRICULUM_P.curriculumManage,
    module: "curriculum",
    action: "manage",
    description: "แก้ไขและจัดการหลักสูตรและรายวิชา",
  },
];
