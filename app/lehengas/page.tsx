import { AdminShell } from "../_components/admin-shell";
import { LehengasManager } from "../_components/lehengas-manager";

export default function LehengaAdminLehengasPage() {
  return (
    <AdminShell title="Lehengas" eyebrow="Rental inventory">
      <LehengasManager />
    </AdminShell>
  );
}
