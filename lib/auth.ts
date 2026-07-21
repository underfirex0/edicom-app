import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getSessionProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile || profile.role !== "admin") {
    redirect("/admin/login");
  }
  return { user, profile };
}

export async function requireCandidate() {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) {
    redirect("/login");
  }
  return { user, profile };
}
