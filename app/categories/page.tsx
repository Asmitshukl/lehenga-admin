import { CategoriesManager } from "../_components/categories-manager";
import { AdminShell } from "../_components/admin-shell";

export default function LehengaAdminCategoriesPage() {
  return (
    <AdminShell title="Categories" eyebrow="Category control">
      <CategoriesManager />
    </AdminShell>
  );
}
