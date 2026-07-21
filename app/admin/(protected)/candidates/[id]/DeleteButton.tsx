"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCandidateAction } from "./actions";

export default function DeleteButton({ candidateId }: { candidateId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer définitivement ce candidat et toutes ses données ? Cette action est irréversible.")) return;
        startTransition(async () => {
          await deleteCandidateAction(candidateId);
          router.push("/admin/candidates");
        });
      }}
      className="focus-ring font-mono text-[12px] text-muted hover:text-coral disabled:opacity-40"
    >
      {pending ? "Suppression…" : "Supprimer ce candidat"}
    </button>
  );
}
