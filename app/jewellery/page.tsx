import { AdminShell } from "../_components/admin-shell";
import { JewelleryManager } from "../_components/jewellery-manager";

export default function LehengaAdminJewelleryPage() {
  return (
    <AdminShell title="Jewellery" eyebrow="Accessory catalog">
      <JewelleryManager />
    </AdminShell>
  );
}
