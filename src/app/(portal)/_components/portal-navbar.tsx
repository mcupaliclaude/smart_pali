"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import {
  GraduationCap,
  LogIn,
  LogOut,
  Newspaper,
  BookOpen,
  Users,
  Calendar,
  Sparkles,
  Award,
  Home,
  Menu,
  X,
  LayoutDashboard,
  User,
  Settings,
  PhoneCall,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useT } from "@/shared/lib/i18n/client";
import { useAppSession } from "@/hooks/use-session";
import { hasPermission, P } from "@/features/identity";
import { cn } from "@/shared/lib/utils";

export interface PortalNavbarProps {
  brandLogoUrl?: string | null;
  brandName?: string | null;
  brandTagline?: string | null;
}

export function PortalNavbar({
  brandLogoUrl,
  brandName,
  brandTagline,
}: PortalNavbarProps) {
  const pathname = usePathname();
  const t = useT();
  const { theme, setTheme } = useTheme();
  const { user, roles, permissions, isSuperAdmin, isAuthenticated, isLoading } = useAppSession();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const [prevPath, setPrevPath] = React.useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setDrawerOpen(false);
  }

  const displayName = brandName || t("portal.brand.title");
  const displayTagline = brandTagline || t("portal.brand.subtitle");

  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const ctx = { roles, permissions, isSuperAdmin };
  const canManageSettings = hasPermission(ctx, P.settingsManage);

  const navItems = [
    { href: "/portal", label: t("portal.nav.home"), icon: Home },
    { href: "/portal/news", label: t("portal.nav.news"), icon: Newspaper },
    { href: "/portal/curriculum", label: t("portal.nav.curriculum"), icon: BookOpen },
    { href: "/portal/staff", label: t("portal.nav.staff"), icon: Users },
    { href: "/portal/reservations", label: t("portal.nav.reservations"), icon: Calendar },
    { href: "/portal/meditation", label: t("portal.nav.meditation"), icon: Sparkles },
    { href: "/portal/alumni", label: t("portal.nav.alumni"), icon: Award },
    { href: "/portal/contact", label: t("portal.nav.contact"), icon: PhoneCall },
  ];

  const isActive = (href: string) => {
    if (href === "/portal") {
      return pathname === "/portal";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--glass)] backdrop-blur-[18px] backdrop-saturate-[140%] border-b border-[var(--glass-border)] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Block (Left) - matching Admin .brand-blk styling */}
        <Link href="/portal" className="brand-blk !w-auto max-w-[260px] sm:max-w-xs shrink-0 group">
          <i>
            {brandLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandLogoUrl}
                alt={displayName}
                className="w-full h-full object-contain p-0.5 rounded-[inherit]"
              />
            ) : (
              <GraduationCap className="w-5 h-5" />
            )}
          </i>
          <div className="t min-w-0">
            <b className="truncate">{displayName}</b>
            <span className="truncate">{displayTagline}</span>
          </div>
        </Link>

        {/* Desktop Navigation Tabs (Center) - all 7 items preserved with active highlight */}
        <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "h-9 px-3 rounded-[var(--r-md)] flex items-center gap-1.5 text-[0.84rem] transition-colors whitespace-nowrap",
                  active
                    ? "bg-[var(--side-active-bg)] text-[var(--side-active-ink)] font-semibold shadow-xs"
                    : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-strong)] font-medium"
                )}
              >
                <Icon className="w-4 h-4 flex-none" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions - Theme toggle, Language switcher, Account avatar/Staff Console, Mobile drawer */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Switcher (sun/moon) */}
          <button
            type="button"
            className="icon-btn"
            aria-label={t("nav.themeToggle")}
            title={t("nav.themeToggle")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
            </svg>
            <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
            </svg>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher className="lang" />

          {/* Account Avatar Menu (when signed in) or Staff Console CTA (when guest) */}
          {!mounted || isLoading ? (
            <div
              aria-hidden="true"
              className="h-[34px] w-[34px] animate-pulse rounded-full bg-[var(--glass-strong)]"
            />
          ) : isAuthenticated && user ? (
            <div className="acct">
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button type="button" aria-label={user.name ?? "User Account"}>
                    <span className="who" aria-hidden="true">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </span>
                    <span className="nm hidden md:inline">{user.name}</span>
                    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="menu-list"
                    align="end"
                    sideOffset={8}
                    style={{ position: "static" }}
                  >
                    <DropdownMenuPrimitive.Label asChild>
                      <div className="px-2.5 py-2">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuPrimitive.Label>
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="w-4 h-4 opacity-80" />
                        <span>{t("portal.nav.adminConsole")}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/me">
                        <User className="w-4 h-4 opacity-80" />
                        <span>{t("account.profile")}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    {canManageSettings && (
                      <DropdownMenuPrimitive.Item asChild>
                        <Link href="/settings">
                          <Settings className="w-4 h-4 opacity-80" />
                          <span>{t("nav.settings")}</span>
                        </Link>
                      </DropdownMenuPrimitive.Item>
                    )}
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item
                      asChild
                      onSelect={() => signOut({ callbackUrl: "/portal" })}
                    >
                      <button type="button" className="danger">
                        <LogOut className="w-4 h-4 opacity-80" />
                        <span>{t("account.logout")}</span>
                      </button>
                    </DropdownMenuPrimitive.Item>
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-pri h-[34px] px-3 text-xs font-semibold inline-flex items-center gap-1.5"
              title={t("portal.nav.adminConsole")}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("portal.nav.adminConsole")}</span>
            </Link>
          )}

          {/* Mobile/Tablet Drawer Toggle */}
          <button
            type="button"
            className="icon-btn xl:hidden"
            aria-label={drawerOpen ? t("common.close") : t("nav.menu")}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Panel */}
      {drawerOpen && (
        <div className="xl:hidden border-t border-[var(--glass-border)] bg-[var(--glass-strong)] backdrop-blur-xl shadow-lg px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "ni h-10 px-3 rounded-lg flex items-center gap-2.5 text-sm transition-colors",
                    active
                      ? "bg-[var(--side-active-bg)] text-[var(--side-active-ink)] font-semibold"
                      : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                  )}
                >
                  <Icon className="w-4 h-4 flex-none" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Account Section */}
            <div className="pt-2.5 mt-2 border-t border-[var(--glass-border)]">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 px-2 py-1">
                    <span className="w-8 h-8 rounded-full bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">{user.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="btn-pri h-8 px-2.5 text-xs inline-flex items-center justify-center gap-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>{t("portal.nav.adminConsole")}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        signOut({ callbackUrl: "/portal" });
                      }}
                      className="btn-sm h-8 px-2.5 text-xs text-destructive inline-flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t("account.logout")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between sm:hidden">
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {t("portal.nav.adminConsole")}
                  </span>
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="btn-pri h-8 px-3 text-xs inline-flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t("portal.nav.adminConsole")}</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
