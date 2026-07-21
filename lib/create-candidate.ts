import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateCandidateResult =
  | { ok: true; candidateId: string; link: string }
  | { ok: false; error: string };

// Shared by the "Inviter" page and the "Entretiens" page (quick-add), so a
// candidate created either way ends up identical everywhere in the app.
export async function createCandidateAccount({
  fullName,
  email,
  position,
  invitedBy,
}: {
  fullName: string;
  email: string;
  position: string;
  invitedBy: string;
}): Promise<CreateCandidateResult> {
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
      redirectTo: `${siteUrl}/auth/confirm?next=/set-password`,
      data: { full_name: fullName },
    },
  });

  if (linkErr || !linkData?.user) {
    return {
      ok: false,
      error: linkErr?.message?.toLowerCase().includes("already")
        ? "Un candidat avec cet email existe déjà. Ouvrez sa fiche depuis la liste des candidats."
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
  if (profileErr) {
    return { ok: false, error: "Compte créé mais le profil n'a pas pu être enregistré : " + profileErr.message };
  }

  const { error: candidateErr } = await admin.from("candidates").insert({
    id: userId,
    position,
    status: "invited",
    invited_by: invitedBy,
  });
  if (candidateErr) {
    return {
      ok: false,
      error: "Compte créé mais la fiche candidat n'a pas pu être enregistrée : " + candidateErr.message,
    };
  }

  return { ok: true, candidateId: userId, link: linkData.properties.action_link };
}
