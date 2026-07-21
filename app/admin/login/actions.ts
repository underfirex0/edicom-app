"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function adminLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Merci de renseigner votre email et votre mot de passe." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email ou mot de passe incorrect." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas les droits administrateur." };
  }

  redirect("/admin");
}
