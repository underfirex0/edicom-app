import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-screen flex bg-white">
      <AdminSidebar adminName={profile?.full_name ?? "Administrateur"} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
