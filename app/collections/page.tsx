import { AdminShell } from "../_components/admin-shell";
import { CollectionsManager } from "../_components/collections-manager";

export default function LehengaAdminCollectionsPage() {
  return (
    <AdminShell title="Collections" eyebrow="Season and event edits">
      <CollectionsManager />
    </AdminShell>
  );
}
