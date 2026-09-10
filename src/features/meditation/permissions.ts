import type { PermissionDef } from "@/shared/lib/permission-def";

export const MEDITATION_P = {
  meditationRead: "meditation:read",
  meditationRegister: "meditation:register",
  meditationReview: "meditation:review",
  meditationManage: "meditation:manage",
} as const;

export const MEDITATION_PERMISSIONS: PermissionDef[] = [
  {
    code: MEDITATION_P.meditationRead,
    module: "meditation",
    action: "read",
    description: "ดูรายการคอร์สปฏิบัติธรรมและรายชื่อผู้ลงทะเบียน",
  },
  {
    code: MEDITATION_P.meditationRegister,
    module: "meditation",
    action: "register",
    description: "สมัครและลงทะเบียนเข้าร่วมคอร์สปฏิบัติธรรม",
  },
  {
    code: MEDITATION_P.meditationReview,
    module: "meditation",
    action: "review",
    description: "พิจารณาอนุมัติ จัดสรรที่พัก และตรวจสอบคุณสมบัติผู้สมัคร",
  },
  {
    code: MEDITATION_P.meditationManage,
    module: "meditation",
    action: "manage",
    description: "สร้าง แก้ไข ปิดรับสมัคร และจัดการคอร์สปฏิบัติธรรมทั้งหมด",
  },
];
