import { createAdminClient } from "@/lib/supabase/admin";
import SetupForm from "./SetupForm";
import Link from "next/link";
import { Card } from "@/components/ui";

export default async function AdminSetupPage() {
  const admin = createAdminClient();
  const { count } = await admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin");

  if (count && count > 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-ink">
        <Card className="p-8 max-w-sm text-center">
          <p className="text-[14.5px] text-ink/80">
            Un compte administrateur existe déjà pour cette installation.
          </p>
          <Link href="/admin/login" className="focus-ring inline-block mt-5 text-teal font-medium text-[14px]">
            Aller à la connexion →
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ink">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-3">
            EDICOM · Première configuration
          </div>
          <h1 className="font-display text-[22px] font-semibold text-white">Créer le compte administrateur</h1>
          <p className="text-[13px] text-white/50 mt-2">Cette page ne fonctionne qu&apos;une seule fois.</p>
        </div>
        <Card className="p-7">
          <SetupForm />
        </Card>
      </div>
    </main>
  );
}
