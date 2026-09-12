"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Mail, Layers } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";

export function SettingsTabs() {
  const pathname = usePathname();
  const t = useT();

  const tabs = [
    {
      href: "/settings",
      label: t("settings.nav.org"),
      icon: Building2,
      active: pathname === "/settings",
    },
    {
      href: "/settings/email",
      label: t("settings.nav.email"),
      icon: Mail,
      active: pathname === "/settings/email",
    },
    {
      href: "/sample",
      label: t("sample.nav"),
      icon: Layers,
      active: pathname === "/sample",
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors ${
              tab.active
                ? "bg-primary/10 text-primary font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
