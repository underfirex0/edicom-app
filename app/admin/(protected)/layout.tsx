import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import LiveRefresher from "@/components/LiveRefresher";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-screen flex bg-white">
      <LiveRefresher />
      <AdminSidebar adminName={profile?.full_name ?? "Administrateur"} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-end px-8 pt-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-teal">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            EN DIRECT
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
