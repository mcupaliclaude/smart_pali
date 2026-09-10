import type { Dictionary } from "@/shared/lib/i18n/translate";
import { MESSAGES as core } from "./messages/core";
import { MESSAGES as identity } from "@/features/identity/messages";
import { MESSAGES as sample } from "@/features/sample/messages";
import { MESSAGES as news } from "@/features/news/messages";
import { MESSAGES as staff } from "@/features/staff/messages";
import { MESSAGES as curriculum } from "@/features/curriculum/messages";
import { MESSAGES as edocs } from "@/features/edocs/messages";
import { MESSAGES as reservations } from "@/features/reservations/messages";
import { MESSAGES as meditation } from "@/features/meditation/messages";
import { MESSAGES as alumni } from "@/features/alumni/messages";

/** พจนานุกรม UI ทั้งระบบ — feature ใหม่เพิ่มบรรทัด import ที่นี่ · key ต้องไม่ซ้ำข้าม feature */
export const UI_MESSAGES: Dictionary = { ...core, ...identity, ...sample, ...news, ...staff, ...curriculum, ...edocs, ...reservations, ...meditation, ...alumni };
