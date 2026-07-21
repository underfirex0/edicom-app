"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string; link?: string } | null;

export async function inviteCandidateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const position = String(formData.get("position") || "Commercial(e) B2B").trim();

  if (!fullName || !email) {
    return { error: "Merci de renseigner le nom et l'email du candidat." };
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created.user) {
    return { error: createErr?.message?.includes("already been registered")
      ? "Un candidat avec cet email existe déjà."
      : createErr?.message ?? "Impossible de créer le candidat." };
  }

  const { error: profileErr } = await admin.from("profiles").insert({
    id: created.user.id,
    role: "candidate",
    full_name: fullName,
    email,
  });
  if (profileErr) return { error: "Candidat créé mais le profil n'a pas pu être enregistré." };

  const { error: candidateErr } = await admin.from("candidates").insert({
    id: created.user.id,
    position,
    status: "invited",
    invited_by: profile!.id,
  });
  if (candidateErr) return { error: "Candidat créé mais la fiche candidat n'a pas pu être enregistrée." };

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${siteUrl}/auth/callback?next=/set-password` },
  });

  revalidatePath("/admin/candidates");
  revalidatePath("/admin");

  if (linkErr || !linkData) {
    return { success: "Candidat créé. Un email d'invitation a été envoyé si votre projet Supabase a l'envoi de mail configuré." };
  }

  return {
    success: "Candidat créé avec succès.",
    link: linkData.properties.action_link,
  };
}
