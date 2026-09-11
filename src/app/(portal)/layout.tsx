import { GraduationCap } from "lucide-react";
import { getT } from "@/i18n/server";
import { resolvePublicTenantId } from "@/shared/lib/tenant";
import { getTenantSettings } from "@/features/identity/server";
import { PortalNavbar } from "./_components/portal-navbar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [t, tenantId] = await Promise.all([getT(), resolvePublicTenantId()]);
  const tenant = tenantId ? await getTenantSettings(tenantId).catch(() => null) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner / Navbar */}
      <PortalNavbar
        brandLogoUrl={tenant?.logoUrl}
        brandName={tenant?.nameTh}
        brandTagline={tenant?.nameEn}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--glass)] backdrop-blur-md border-t border-[var(--glass-border)] py-10 mt-12 text-sm text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[var(--r-sm)] bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center overflow-hidden shrink-0">
              {tenant?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
              ) : (
                <GraduationCap className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="font-semibold text-[var(--text)]">
              {t("portal.footer.brand")}
            </span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Faculty Management System. Built with VibeCore Framework.
          </p>
        </div>
      </footer>
    </div>
  );
}
