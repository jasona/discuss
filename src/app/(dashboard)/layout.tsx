import { requireOrg } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, orgId, orgSlug, orgName, role } = await requireOrg();

  return (
    <AppShell
      user={{
        id: user.id!,
        email: user.email || "",
        fullName: user.name || null,
      }}
      orgId={orgId}
      orgSlug={orgSlug}
      orgName={orgName}
      role={role}
    >
      {children}
    </AppShell>
  );
}
