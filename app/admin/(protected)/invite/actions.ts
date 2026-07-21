"use server";

import { requireAdmin } from "@/lib/auth";
import { createCandidateAccount } from "@/lib/create-candidate";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string; link?: string } | null;

export async function inviteCandidateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const position = String(formData.get("position") || "Commercial(e) Terrain B2B").trim();

  if (!fullName || !email) {
    return { error: "Merci de renseigner le nom et l'email du candidat." };
  }

  const result = await createCandidateAccount({ fullName, email, position, invitedBy: profile!.id });
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
  revalidatePath("/admin/interviews");

  return { success: "Candidat créé avec succès.", link: result.link };
}
