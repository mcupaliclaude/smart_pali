import { LayoutDashboard, Users, Settings, Layers, Newspaper, UserCheck, BookOpen, FileCheck, CalendarClock, Sparkles, GraduationCap, type LucideIcon } from "lucide-react";
import { hasPermission, P } from "@/features/identity";
import { SAMPLE_P } from "@/features/sample";
import { NEWS_P } from "@/features/news";
import { STAFF_P } from "@/features/staff";
import { CURRICULUM_P } from "@/features/curriculum";
import { EDOCS_P } from "@/features/edocs";
import { RESERVATIONS_P } from "@/features/reservations";
import { MEDITATION_P } from "@/features/meditation";
import { ALUMNI_P } from "@/features/alumni";

export interface NavItem {
  /** i18n key */
  title: string;
  href: string;
  icon?: LucideIcon;
  /** ต้องมีสิทธิ์นี้ถึงเห็น — ไม่มี = ทุกคนที่ login เห็น */
  permission?: string;
  children?: NavItem[];
}
export interface NavGroup { label: string; items: NavItem[] }
export interface NavCrumb { title: string; href: string }

export const sidebarGroups: NavGroup[] = [
  { label: "nav.group.overview", items: [{ title: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "nav.group.news",
    items: [{ title: "news.nav", href: "/news", icon: Newspaper, permission: NEWS_P.newsRead }],
  },
  {
    label: "nav.group.staff",
    items: [{ title: "staff.nav", href: "/staff", icon: UserCheck, permission: STAFF_P.staffRead }],
  },
  {
    label: "nav.group.curriculum",
    items: [{ title: "curriculum.title", href: "/curriculum", icon: BookOpen, permission: CURRICULUM_P.curriculumRead }],
  },
  {
    label: "nav.group.edocs",
    items: [{ title: "edocs.title", href: "/edocs", icon: FileCheck, permission: EDOCS_P.edocsRead }],
  },
  {
    label: "nav.group.reservations",
    items: [{ title: "reservations.title", href: "/reservations", icon: CalendarClock, permission: RESERVATIONS_P.reservationsRead }],
  },
  {
    label: "nav.group.meditation",
    items: [{ title: "meditation.title", href: "/meditation", icon: Sparkles, permission: MEDITATION_P.meditationRead }],
  },
  {
    label: "nav.group.alumni",
    items: [{ title: "alumni.title", href: "/alumni", icon: GraduationCap, permission: ALUMNI_P.alumniRead }],
  },
  {
    label: "nav.group.sample",
    items: [{ title: "sample.nav", href: "/sample", icon: Layers, permission: SAMPLE_P.sampleRead }],
  },
  {
    label: "nav.group.users",
    items: [{
      title: "nav.users", href: "/users", icon: Users, permission: P.usersRead,
      children: [
        { title: "nav.users", href: "/users", permission: P.usersRead },
        { title: "nav.roles", href: "/users/roles", permission: P.rolesManage },
      ],
    }],
  },
  { label: "nav.group.settings", items: [{ title: "nav.settings", href: "/settings", icon: Settings, permission: P.settingsManage }] },
];

type Ctx = Parameters<typeof hasPermission>[0];

function visibleItem(item: NavItem, ctx: Ctx): NavItem | null {
  if (item.permission && !hasPermission(ctx, item.permission)) return null;
  if (!item.children) return item;
  const children = item.children.filter((c) => !c.permission || hasPermission(ctx, c.permission));
  return children.length ? { ...item, children } : null;
}

export function visibleGroups(ctx: Ctx): NavGroup[] {
  return sidebarGroups
    .map((g) => ({ ...g, items: g.items.map((i) => visibleItem(i, ctx)).filter((i): i is NavItem => i !== null) }))
    .filter((g) => g.items.length > 0);
}

/** สายเมนูสำหรับ breadcrumb — จับ href ที่ยาวที่สุดที่ตรง (ลูกชนะแม่) */
export function getActiveNavChain(pathname: string): NavCrumb[] {
  let best: { parent: NavItem | null; item: NavItem } | null = null;
  const consider = (item: NavItem, parent: NavItem | null) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.item.href.length || (item.href.length === best.item.href.length && parent)) best = { parent, item };
    }
  };
  for (const g of sidebarGroups) for (const i of g.items) { consider(i, null); for (const c of i.children ?? []) consider(c, i); }
  if (!best) return [];
  const { parent, item } = best as { parent: NavItem | null; item: NavItem };
  const chain: NavCrumb[] = [];
  if (parent && parent.href !== item.href) chain.push({ title: parent.title, href: parent.href });
  chain.push({ title: item.title, href: item.href });
  return chain;
}
