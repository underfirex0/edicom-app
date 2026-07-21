"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string; link?: string } | null;

export async function updateStatusAction(candidateId: string, status: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("candidates").update({ status }).eq("id", candidateId);
  revalidatePath(`/admin/candidates/${candidateId}`);
  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
}

export async function addNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin();
  const candidateId = String(formData.get("candidateId") || "");
  const note = String(formData.get("note") || "").trim();
  if (!note) return { error: "La note ne peut pas être vide." };

  const admin = createAdminClient();
  const { error } = await admin.from("candidate_notes").insert({
    candidate_id: candidateId,
    admin_id: profile!.id,
    note,
  });
  if (error) return { error: "Impossible d'enregistrer la note." };

  revalidatePath(`/admin/candidates/${candidateId}`);
  return { success: "Note ajoutée." };
}

export async function deleteCandidateAction(candidateId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(candidateId);
  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
}

export async function resendInviteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const email = String(formData.get("email") || "");
  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${siteUrl}/auth/callback?next=/set-password` },
  });
  if (error || !data) return { error: "Impossible de générer un nouveau lien." };

  return { success: "Nouveau lien généré.", link: data.properties.action_link };
}
