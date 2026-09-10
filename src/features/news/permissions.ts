import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  newsRead: "news:read",
  newsCreate: "news:create",
  newsManage: "news:manage",
  newsPublish: "news:publish",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.newsRead, module: "news", action: "read", description: "ดูรายการข่าวสารภายใน" },
  { code: NEWS_P.newsCreate, module: "news", action: "create", description: "สร้างและร่างข่าวประชาสัมพันธ์" },
  { code: NEWS_P.newsManage, module: "news", action: "manage", description: "แก้ไขและจัดการข่าวประชาสัมพันธ์" },
  { code: NEWS_P.newsPublish, module: "news", action: "publish", description: "อนุมัติเผยแพร่และปักหมุดข่าว" },
];
