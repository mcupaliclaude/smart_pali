import type { PermissionDef } from "@/shared/lib/permission-def";

export const ALUMNI_P = {
  alumniRead: "alumni:read",
  alumniRegister: "alumni:register",
  alumniVerify: "alumni:verify",
  alumniManage: "alumni:manage",
} as const;

export const ALUMNI_PERMISSIONS: PermissionDef[] = [
  {
    code: ALUMNI_P.alumniRead,
    module: "alumni",
    action: "read",
    description: "ดูทำเนียบศิษย์เก่าและเรื่องราวความสำเร็จ",
  },
  {
    code: ALUMNI_P.alumniRegister,
    module: "alumni",
    action: "register",
    description: "ลงทะเบียนและปรับปรุงข้อมูลประวัติศิษย์เก่า",
  },
  {
    code: ALUMNI_P.alumniVerify,
    module: "alumni",
    action: "verify",
    description: "ตรวจสอบและรับรองความถูกต้องของข้อมูลศิษย์เก่า",
  },
  {
    code: ALUMNI_P.alumniManage,
    module: "alumni",
    action: "manage",
    description: "จัดการสารบบศิษย์เก่า สปอตไลต์ และเรื่องราวความสำเร็จทั้งหมด",
  },
];
