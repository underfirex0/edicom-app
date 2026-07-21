import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CONFIG } from "@/lib/scoring";
import { Card } from "@/components/ui";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("scoring_config").select("*").eq("id", 1).single();

  const config = data
    ? {
        behavWeight: Number(data.behav_weight),
        sjtWeight: Number(data.sjt_weight),
        thresholdGood: data.threshold_good,
        thresholdWatch: data.threshold_watch,
      }
    : DEFAULT_CONFIG;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-[24px] font-semibold">Réglages du scoring</h1>
        <p className="text-[14px] text-muted mt-1 leading-relaxed">
          Ajustez la pondération entre le profil comportemental et les mises en situation, ainsi que les seuils
          de recommandation. Ces réglages s&apos;appliquent uniquement aux tests soumis après l&apos;enregistrement —
          les résultats déjà enregistrés ne sont pas recalculés.
        </p>
      </div>
      <Card className="p-7">
        <SettingsForm {...config} />
      </Card>
    </div>
  );
}
