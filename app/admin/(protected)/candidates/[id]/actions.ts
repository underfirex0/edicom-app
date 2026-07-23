"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCandidateById } from "@/lib/admin-data";
import { generateAiBrief, type AiBriefResult } from "@/lib/ai-brief";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string; link?: string } | null;
export type AiBriefState = { error?: string; brief?: AiBriefResult } | null;

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

  // The candidate's account already exists at this point, so we use a
  // "recovery" link (not "invite" — that type only works for brand-new
  // emails) to give them a fresh way to set their password and sign in.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl}/auth/confirm?next=/set-password` },
  });
  if (error || !data) return { error: error?.message ?? "Impossible de générer un nouveau lien." };

  return { success: "Nouveau lien généré.", link: data.properties.action_link };
}

export async function generateAiBriefAction(candidateId: string): Promise<AiBriefState> {
  await requireAdmin();

  const candidate = await getCandidateById(candidateId);
  if (!candidate || !candidate.result?.isComplete) {
    return { error: "Ce candidat n'a pas encore de résultat de test." };
  }

  const result = await generateAiBrief(candidate);
  if (!result.ok) {
    return { error: result.error };
  }

  const admin = createAdminClient();
  await admin
    .from("test_results")
    .update({ ai_brief: { ...result.brief, generatedAt: new Date().toISOString() } })
    .eq("candidate_id", candidateId);

  revalidatePath(`/admin/candidates/${candidateId}`);

  return { brief: result.brief };
}
