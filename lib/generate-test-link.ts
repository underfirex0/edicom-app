import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Generates a fresh sign-in link for an existing candidate account, usable at
// any time (not just right after creating the candidate) — e.g. when they
// physically show up for their interview and need the test link handed to
// them on a tablet.
export async function generateTestLink(email: string): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl}/auth/confirm?next=/set-password` },
  });
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Impossible de générer le lien." };
  }
  return { ok: true, link: data.properties.action_link };
}
