"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { useAppSession } from "@/hooks/use-session";
import { useT } from "@/shared/lib/i18n/client";
import { visibleGroups, getActiveNavChain, type NavItem } from "./sidebar-nav";
import { useSidebarStore } from "./sidebar-store";

/* ============================================================
 * AdminSidebarNav — เนื้อหาเมนูของ AdminShell (ตัว `.grp`/`.ng`/`.ni` จริง)
 *
 * แยกออกจาก AdminShell (shared/components/liyon) เพราะต้องพึ่ง hook เฉพาะแอป
 * (useAppSession, useSidebarStore) ซึ่ง shared/ ไม่ควรรู้จัก
 * โครงเมนูมาจาก sidebar-nav.ts — กรองด้วย visibleGroups ตามสิทธิ์ของผู้ใช้จริง
 * (การกรองนี้เป็นแค่ความสะดวกทางสายตา ไม่ใช่ตัวกันสิทธิ์ — ทุก Server Action
 * ยังเรียก requirePermission ของตัวเองเสมอ)
 *
 * โหมดย่อ (การ์ดกว้าง 64) ไม่ต้องมี state แยก — CSS จัดการ flyout ตอนชี้/โฟกัส
 * เองทั้งหมด (ดู `.adm.narrow .ng:hover > .sub` ใน liyon-admin.css) ยกเว้น
 * "คลิกกลุ่มตอนย่ออยู่" ซึ่งของจริงควรขยาย sidebar กลับแล้วเปิดกลุ่มนั้น
 * (พฤติกรรมเดียวกับ liyon-admin.js — ปุ่มลอยมีไว้ชี้ ไม่ใช่กด)
 * ============================================================ */

function isWideViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth > 1020;
}

export function AdminSidebarNav() {
  const pathname = usePathname();
  const t = useT();
  const { collapsed, setCollapsed, openGroup, setOpenGroup } = useSidebarStore();
  const { roles, permissions, isSuperAdmin } = useAppSession();
  const groups = visibleGroups({ roles, permissions, isSuperAdmin });
  const activeChain = getActiveNavChain(pathname);
  const activeHref = activeChain[activeChain.length - 1]?.href;

  // Auto-open the group containing the active route
  useEffect(() => {
    for (const group of groups) {
      for (const item of group.items) {
        if (
          item.children?.some(
            (child) => pathname === child.href || pathname.startsWith(child.href + "/"),
          )
        ) {
          setOpenGroup(item.href);
          return;
        }
      }
    }
    if (openGroup) return;
    for (const group of groups) {
      const withChildren = group.items.find((item) => item.children);
      if (withChildren) { setOpenGroup(withChildren.href); return; }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function handleGroupToggle(href: string) {
    if (collapsed && isWideViewport()) {
      setCollapsed(false);
      setOpenGroup(href);
      return;
    }
    setOpenGroup(openGroup === href ? null : href);
  }

  return (
    <>
      {groups.map((group, groupIdx) => (
        <div className="grp" key={group.label || `group-${groupIdx}`}>
          {group.label && !collapsed && (
            <div className="px-2.5 pt-2 pb-0.5 text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase select-none opacity-80">
              {t(group.label)}
            </div>
          )}
          {group.items.map((item) =>
            item.children ? (
              <NavGroup
                key={item.href}
                item={item}
                isOpen={openGroup === item.href}
                onToggle={() => handleGroupToggle(item.href)}
                pathname={pathname}
                t={t}
                activeHref={activeHref}
              />
            ) : (
              <NavLeaf key={item.href} item={item} pathname={pathname} t={t} activeHref={activeHref} />
            ),
          )}
        </div>
      ))}
    </>
  );
}

function NavLeaf({
  item,
  pathname,
  t,
  nested = false,
  activeHref,
}: {
  item: NavItem;
  pathname: string;
  t: (key: string) => string;
  nested?: boolean;
  activeHref?: string;
}) {
  const Icon = item.icon;
  const isActive = activeHref
    ? item.href === activeHref
    : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={nested ? "ni sub" : "ni"}
      aria-current={isActive ? "page" : undefined}
      title={nested ? undefined : t(item.title)}
    >
      {!nested && Icon && <Icon aria-hidden="true" />}
      <span className="t">{t(item.title)}</span>
      {item.external && (
        <svg
          className="chev opacity-60 w-3.5 h-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )}
    </Link>
  );
}

function NavGroup({
  item,
  isOpen,
  onToggle,
  pathname,
  t,
  activeHref,
}: {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  t: (key: string) => string;
  activeHref?: string;
}) {
  const Icon = item.icon;
  const children = item.children ?? [];
  const isActive = children.some(
    (child) => child.href === activeHref || pathname === child.href || pathname.startsWith(child.href + "/"),
  );

  return (
    <div className={cn("ng", isActive && "on")} data-open={isOpen ? "" : undefined}>
      <button type="button" className="ni" aria-expanded={isOpen} title={t(item.title)} onClick={onToggle}>
        {Icon && <Icon aria-hidden="true" />}
        <span className="t">{t(item.title)}</span>
        <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
      <div className="sub">
        <div className="hd">{t(item.title)}</div>
        {children.map((child) => (
          <NavLeaf key={child.href} item={child} pathname={pathname} t={t} nested activeHref={activeHref} />
        ))}
      </div>
    </div>
  );
}
