"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function setPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirm) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Votre lien d'invitation a expiré. Merci de demander un nouveau lien au recruteur." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Impossible d'enregistrer le mot de passe. Réessayez." };

  // Mark the candidate's test session as started (service role — bypasses RLS).
  const admin = createAdminClient();
  await admin
    .from("candidates")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", user.id)
    .eq("status", "invited");

  redirect("/test");
}
