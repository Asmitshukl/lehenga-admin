import { AdminShell } from "../_components/admin-shell";
import { CustomersManager } from "../_components/customers-manager";

export default function LehengaAdminCustomersPage() {
  return (
    <AdminShell title="Customers" eyebrow="Customer relationships">
      <CustomersManager />
    </AdminShell>
  );
}
