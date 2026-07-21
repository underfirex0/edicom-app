"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function bootstrapAdminAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || password.length < 8) {
    return { error: "Merci de remplir tous les champs (mot de passe : 8 caractères minimum)." };
  }

  const admin = createAdminClient();

  const { count } = await admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin");
  if (count && count > 0) {
    return { error: "Un compte administrateur existe déjà. Contactez-le pour obtenir un accès." };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createErr || !created.user) {
    return { error: createErr?.message ?? "Impossible de créer le compte." };
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .insert({ id: created.user.id, role: "admin", full_name: fullName, email });
  if (profileErr) {
    return { error: "Compte créé mais le profil n'a pas pu être enregistré : " + profileErr.message };
  }

  const supabase = createClient();
  await supabase.auth.signInWithPassword({ email, password });

  redirect("/admin");
}
