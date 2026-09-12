import { requirePermission, P } from "@/features/identity/server";
import { UserImportClient } from "./_components/user-import-client";

export default async function UserImportPage() {
  await requirePermission(P.usersManage);
  return <UserImportClient />;
}
