import { requireSession, getTenantSettings } from "@/features/identity/server";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const tenant = await getTenantSettings(session.tenantId).catch(() => null);

  return (
    <AdminLayoutClient
      brandLogoUrl={tenant?.logoUrl}
      brandName={tenant?.nameTh}
      brandTagline={tenant?.nameEn}
    >
      {children}
    </AdminLayoutClient>
  );
}
