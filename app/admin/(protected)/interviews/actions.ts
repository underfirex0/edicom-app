"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCandidateAccount } from "@/lib/create-candidate";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string; link?: string } | null;

function revalidateAll(candidateId?: string) {
  revalidatePath("/admin/interviews");
  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
  if (candidateId) revalidatePath(`/admin/candidates/${candidateId}`);
}

export async function scheduleInterviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin();
  const candidateId = String(formData.get("candidateId") || "");
  const scheduledAt = String(formData.get("scheduledAt") || "");
  const location = String(formData.get("location") || "").trim();
  const interviewer = String(formData.get("interviewer") || "").trim();

  if (!candidateId || !scheduledAt) {
    return { error: "La date de l'entretien est obligatoire." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("interviews").insert({
    candidate_id: candidateId,
    scheduled_at: new Date(scheduledAt).toISOString(),
    location: location || null,
    interviewer: interviewer || profile?.full_name || null,
    status: "scheduled",
    created_by: profile!.id,
  });
  if (error) return { error: "Impossible de planifier l'entretien : " + error.message };

  revalidateAll(candidateId);
  return { success: "Entretien planifié." };
}

export async function rescheduleInterviewAction(interviewId: string, candidateId: string, newDateTime: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("interviews")
    .update({ scheduled_at: new Date(newDateTime).toISOString(), updated_at: new Date().toISOString() })
    .eq("id", interviewId);
  revalidateAll(candidateId);
}

export async function cancelInterviewAction(interviewId: string, candidateId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("interviews")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", interviewId);
  revalidateAll(candidateId);
}

export async function markNoShowAction(interviewId: string, candidateId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("interviews")
    .update({ status: "no_show", updated_at: new Date().toISOString() })
    .eq("id", interviewId);
  revalidateAll(candidateId);
}

export async function completeInterviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const interviewId = String(formData.get("interviewId") || "");
  const candidateId = String(formData.get("candidateId") || "");
  const outcome = String(formData.get("outcome") || "");
  const outcomeNotes = String(formData.get("outcomeNotes") || "").trim();

  if (!["hire", "second_round", "reject"].includes(outcome)) {
    return { error: "Merci de choisir une décision." };
  }

  const admin = createAdminClient();

  const { error: interviewErr } = await admin
    .from("interviews")
    .update({
      status: "completed",
      outcome,
      outcome_notes: outcomeNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", interviewId);
  if (interviewErr) return { error: "Impossible d'enregistrer le résultat de l'entretien." };

  const candidateStatus = outcome === "hire" ? "hired" : outcome === "reject" ? "rejected" : "interviewed";
  await admin.from("candidates").update({ status: candidateStatus }).eq("id", candidateId);

  revalidateAll(candidateId);
  return { success: "Résultat de l'entretien enregistré." };
}

export async function addAndScheduleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const position = String(formData.get("position") || "Commercial(e) Terrain B2B").trim();
  const scheduledAt = String(formData.get("scheduledAt") || "");
  const location = String(formData.get("location") || "").trim();
  const interviewer = String(formData.get("interviewer") || "").trim();

  if (!fullName || !email) {
    return { error: "Merci de renseigner le nom et l'email du candidat." };
  }

  const result = await createCandidateAccount({ fullName, email, position, invitedBy: profile!.id });
  if (!result.ok) return { error: result.error };

  if (scheduledAt) {
    const admin = createAdminClient();
    const { error } = await admin.from("interviews").insert({
      candidate_id: result.candidateId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      location: location || null,
      interviewer: interviewer || profile?.full_name || null,
      status: "scheduled",
      created_by: profile!.id,
    });
    if (error) {
      revalidateAll(result.candidateId);
      return {
        success: "Candidat créé, mais l'entretien n'a pas pu être planifié : " + error.message,
        link: result.link,
      };
    }
  }

  revalidateAll(result.candidateId);
  return {
    success: scheduledAt ? "Candidat créé et entretien planifié." : "Candidat créé.",
    link: result.link,
  };
}
