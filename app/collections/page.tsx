import { AdminShell } from "../_components/admin-shell";
import { CollectionsManager } from "../_components/collections-manager";

export default function LehengaAdminCollectionsPage() {
  return (
    <AdminShell title="Categories" eyebrow="Client-facing category edits">
      <CollectionsManager />
    </AdminShell>
  );
}
