import Link from "next/link";
import { getAllCandidates } from "@/lib/admin-data";
import { Card, RecoBadge, StatusPill } from "@/components/ui";

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; reco?: string };
}) {
  const all = await getAllCandidates();
  const q = (searchParams.q ?? "").toLowerCase().trim();
  const statusFilter = searchParams.status ?? "all";
  const recoFilter = searchParams.reco ?? "all";

  const filtered = all.filter((c) => {
    if (q && !c.fullName.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (recoFilter !== "all" && c.result?.recommendation !== recoFilter) return false;
    return true;
  });

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({ q: searchParams.q ?? "", status: statusFilter, reco: recoFilter, ...overrides });
    return `/admin/candidates?${params.toString()}`;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-[24px] font-semibold">Candidats</h1>
        <p className="text-[14px] text-muted mt-1">{all.length} candidat{all.length > 1 ? "s" : ""} au total.</p>
      </div>

      <form className="flex flex-wrap gap-3 mb-6" action="/admin/candidates">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Rechercher un nom ou un email…"
          className="focus-ring flex-1 min-w-[220px] rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px]"
        />
        <input type="hidden" name="status" value={statusFilter} />
        <input type="hidden" name="reco" value={recoFilter} />
        <button className="focus-ring rounded-xl border border-line bg-white px-4 py-2.5 text-[13.5px] font-medium hover:bg-paper">
          Rechercher
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "Tous les statuts" },
          { key: "invited", label: "Invités" },
          { key: "in_progress", label: "Test en cours" },
          { key: "completed", label: "Complétés" },
          { key: "interviewed", label: "Entretien passé" },
          { key: "hired", label: "Recrutés" },
          { key: "rejected", label: "Non retenus" },
        ].map((s) => (
          <Link
            key={s.key}
            href={buildUrl({ status: s.key })}
            className={
              "focus-ring rounded-full px-3.5 py-1.5 text-[12.5px] font-medium border " +
              (statusFilter === s.key ? "bg-ink text-white border-ink" : "bg-white text-ink/70 border-line hover:border-ink/40")
            }
          >
            {s.label}
          </Link>
        ))}
        <span className="w-px bg-line mx-1" />
        {[
          { key: "all", label: "Toutes recommandations" },
          { key: "good", label: "Recommandé" },
          { key: "watch", label: "À creuser" },
          { key: "risk", label: "À risque" },
        ].map((s) => (
          <Link
            key={s.key}
            href={buildUrl({ reco: s.key })}
            className={
              "focus-ring rounded-full px-3.5 py-1.5 text-[12.5px] font-medium border " +
              (recoFilter === s.key ? "bg-ink text-white border-ink" : "bg-white text-ink/70 border-line hover:border-ink/40")
            }
          >
            {s.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-[14px] text-muted">Aucun candidat ne correspond à ces filtres.</Card>
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_120px_170px] gap-4 px-5 py-3 text-[11.5px] font-mono uppercase tracking-wide text-muted bg-paper">
            <span>Candidat</span>
            <span>Statut</span>
            <span>Score</span>
            <span>Recommandation</span>
          </div>
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/admin/candidates/${c.id}`}
              className="focus-ring grid grid-cols-[1fr_140px_120px_170px] gap-4 items-center px-5 py-4 hover:bg-paper transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[14.5px] font-medium truncate">{c.fullName}</div>
                <div className="text-[12px] text-muted truncate">{c.email}</div>
              </div>
              <StatusPill status={c.status} />
              <span className="font-mono text-[13.5px] text-ink/80">
                {c.result ? `${c.result.globalScore}/100` : "—"}
              </span>
              {c.result ? <RecoBadge reco={c.result.recommendation} /> : <span className="text-muted text-[13px]">—</span>}
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
