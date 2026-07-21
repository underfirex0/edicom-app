"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // A single generateLink(type: "invite") call both creates the auth user and
  // returns a usable action link. (Calling createUser() first and then
  // generateLink() on the same email fails, because Supabase refuses to
  // "invite" an email that's already registered.)
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/set-password`,
      data: { full_name: fullName },
    },
  });

  if (linkErr || !linkData?.user) {
    return {
      error: linkErr?.message?.toLowerCase().includes("already")
        ? "Un candidat avec cet email existe déjà. Ouvrez sa fiche depuis la liste des candidats pour renvoyer un lien."
        : linkErr?.message ?? "Impossible de créer le candidat.",
    };
  }

  const userId = linkData.user.id;

  const { error: profileErr } = await admin.from("profiles").insert({
    id: userId,
    role: "candidate",
    full_name: fullName,
    email,
  });
  if (profileErr) return { error: "Compte créé mais le profil n'a pas pu être enregistré : " + profileErr.message };

  const { error: candidateErr } = await admin.from("candidates").insert({
    id: userId,
    position,
    status: "invited",
    invited_by: profile!.id,
  });
  if (candidateErr) return { error: "Compte créé mais la fiche candidat n'a pas pu être enregistrée : " + candidateErr.message };

  revalidatePath("/admin/candidates");
  revalidatePath("/admin");

  return {
    success: "Candidat créé avec succès.",
    link: linkData.properties.action_link,
  };
}
