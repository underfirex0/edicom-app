"use server";

import { requireAdmin } from "@/lib/auth";
import { generateTestLink } from "@/lib/generate-test-link";

export type CopyLinkState = { error?: string; link?: string } | null;

export async function copyTestLinkAction(_prev: CopyLinkState, formData: FormData): Promise<CopyLinkState> {
  await requireAdmin();
  const email = String(formData.get("email") || "");
  if (!email) return { error: "Email manquant." };

  const result = await generateTestLink(email);
  if (!result.ok) return { error: result.error };
  return { link: result.link };
}
