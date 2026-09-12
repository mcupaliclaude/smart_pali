import { resolvePublicTenantId } from "@/shared/lib/tenant";
import { getTenantSettings } from "@/features/identity/server";
import { PortalNavbar } from "./_components/portal-navbar";
import { PortalFooter } from "./_components/portal-footer";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const tenantId = await resolvePublicTenantId();
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
      <PortalFooter
        brandLogoUrl={tenant?.logoUrl}
        brandName={tenant?.nameTh}
        brandTagline={tenant?.nameEn}
        contact={tenant?.contact}
      />
    </div>
  );
}
