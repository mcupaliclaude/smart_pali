import Link from "next/link";
import { Globe, ExternalLink } from "lucide-react";
import { requireSession, getDashboardStats } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { LiyonCard } from "@/shared/components/liyon";

export default async function DashboardPage() {
  const ctx = await requireSession();
  const [t, stats] = await Promise.all([getT(), getDashboardStats(ctx.tenantId)]);
  const cards = [
    { label: t("dash.users"), value: stats.users },
    { label: t("dash.activeUsers"), value: stats.activeUsers },
    { label: t("dash.roles"), value: stats.roles },
  ];
  return (
    <>
      <header className="ph">
        <div>
          <h1>{t("dash.title")}</h1>
          <p className="sub">{t("dash.welcome", { name: ctx.userName })}</p>
        </div>
        <div className="acts">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm transition-all hover:scale-[1.02]"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t("nav.viewPortal")}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </Link>
        </div>
      </header>
      <div className="kpis">
        {cards.map((c) => (
          <LiyonCard key={c.label} className="kpi">
            <span className="lab">{c.label}</span>
            <b className="val num">{c.value}</b>
          </LiyonCard>
        ))}
      </div>
    </>
  );
}
