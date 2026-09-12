import { requirePermission, P, getTenantSettings } from "@/features/identity/server";
import { SettingsEmailForm } from "../_components/settings-email-form";

export default async function SettingsEmailPage() {
  const ctx = await requirePermission(P.settingsManage);
  const settings = await getTenantSettings(ctx.tenantId);
  return (
    <SettingsEmailForm
      key={`${settings.code}-${settings.smtp?.enabled ? "1" : "0"}-${settings.smtp?.user ?? ""}-${settings.smtp?.hasPassword ? "p" : "np"}`}
      initial={settings}
    />
  );
}
