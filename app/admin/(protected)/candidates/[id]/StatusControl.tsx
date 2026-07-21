"use client";

import { useState, useTransition } from "react";
import { updateStatusAction } from "./actions";

const OPTIONS = [
  { value: "completed", label: "Test complété" },
  { value: "interviewed", label: "Entretien passé" },
  { value: "hired", label: "Recruté(e)" },
  { value: "rejected", label: "Non retenu(e)" },
];

export default function StatusControl({ candidateId, current }: { candidateId: string; current: string }) {
  const [status, setStatus] = useState(current);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value;
          setStatus(v);
          startTransition(() => updateStatusAction(candidateId, v));
        }}
        className="focus-ring rounded-xl border border-line bg-white px-3 py-2 text-[13.5px] font-medium"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {pending && <span className="text-[11.5px] text-muted">Mise à jour…</span>}
    </div>
  );
}
