import { requirePermission, P, getTenantSettings } from "@/features/identity/server";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const ctx = await requirePermission(P.settingsManage);
  const settings = await getTenantSettings(ctx.tenantId);
  return (
    <SettingsForm
      key={`${settings.code}-${settings.logoUrl ?? ""}-${settings.palette}-${settings.smtp?.enabled ? "1" : "0"}-${settings.smtp?.user ?? ""}-${settings.smtp?.hasPassword ? "p" : "np"}`}
      initial={settings}
    />
  );
}

