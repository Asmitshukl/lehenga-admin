import { AdminShell } from "../_components/admin-shell";
import { OrdersManager } from "../_components/orders-manager";

export default function LehengaAdminOrdersPage() {
  return (
    <AdminShell title="Orders" eyebrow="Rental activity">
      <OrdersManager />
    </AdminShell>
  );
}
