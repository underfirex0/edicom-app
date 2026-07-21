"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string } | null;

export async function updateSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const behavWeight = Number(formData.get("behavWeight"));
  const sjtWeight = Number(formData.get("sjtWeight"));
  const thresholdGood = Number(formData.get("thresholdGood"));
  const thresholdWatch = Number(formData.get("thresholdWatch"));

  if (Math.round((behavWeight + sjtWeight) * 100) !== 100) {
    return { error: "Les deux pondérations doivent totaliser 100%." };
  }
  if (thresholdWatch >= thresholdGood) {
    return { error: "Le seuil « à creuser » doit être inférieur au seuil « recommandé »." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("scoring_config")
    .update({
      behav_weight: behavWeight / 100,
      sjt_weight: sjtWeight / 100,
      threshold_good: thresholdGood,
      threshold_watch: thresholdWatch,
    })
    .eq("id", 1);

  if (error) return { error: "Impossible d'enregistrer les réglages." };

  revalidatePath("/admin/settings");
  return { success: "Réglages enregistrés. Ils s'appliquent aux prochains tests soumis." };
}
