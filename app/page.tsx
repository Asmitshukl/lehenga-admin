import { AdminShell } from "./_components/admin-shell";
import { DashboardOverview } from "./_components/dashboard-overview";

export default function LehengaAdminDashboardPage() {
  return (
    <AdminShell title="Dashboard" eyebrow="Command center">
      <DashboardOverview />
    </AdminShell>
  );
}
