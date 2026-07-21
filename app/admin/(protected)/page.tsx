import Link from "next/link";
import { getAllCandidates } from "@/lib/admin-data";
import { Card, RecoBadge, StatusPill } from "@/components/ui";
import { SignalMeter, pctToBars } from "@/components/SignalMeter";

export default async function AdminDashboardPage() {
  const candidates = await getAllCandidates();

  const total = candidates.length;
  const pending = candidates.filter((c) => c.status === "invited" || c.status === "in_progress").length;
  const completed = candidates.filter((c) => c.result).length;
  const good = candidates.filter((c) => c.result?.recommendation === "good").length;
  const watch = candidates.filter((c) => c.result?.recommendation === "watch").length;
  const risk = candidates.filter((c) => c.result?.recommendation === "risk").length;

  const recent = candidates.filter((c) => c.result).slice(0, 6);

  const stats = [
    { label: "Candidats au total", value: total },
    { label: "En attente de test", value: pending },
    { label: "Tests complétés", value: completed },
    { label: "Profils recommandés", value: good, color: "text-teal" },
    { label: "À creuser en entretien", value: watch, color: "text-amber" },
    { label: "Profils à risque", value: risk, color: "text-coral" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-[24px] font-semibold">Tableau de bord</h1>
        <p className="text-[14px] text-muted mt-1">Vue d&apos;ensemble du pipeline de qualification commerciale.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className={"font-display text-[30px] font-semibold " + (s.color ?? "")}>{s.value}</div>
            <div className="text-[13px] text-muted mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[17px] font-semibold">Derniers résultats</h2>
        <Link href="/admin/candidates" className="focus-ring font-mono text-[12px] text-muted hover:text-ink">
          Voir tous les candidats →
        </Link>
      </div>

      {recent.length === 0 ? (
        <Card className="p-10 text-center text-[14px] text-muted">
          Aucun test complété pour le moment. Invitez votre premier candidat depuis l&apos;onglet « Inviter ».
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          {recent.map((c) => (
            <Link
              key={c.id}
              href={`/admin/candidates/${c.id}`}
              className="focus-ring flex items-center gap-5 px-5 py-4 hover:bg-paper transition-colors"
            >
              <SignalMeter litBars={pctToBars(c.result!.globalScore)} color="#2F6F63" />
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-medium truncate">{c.fullName}</div>
                <div className="text-[12px] text-muted font-mono mt-0.5">
                  {new Date(c.result!.submittedAt).toLocaleDateString("fr-FR")} · score {c.result!.globalScore}/100
                </div>
              </div>
              <StatusPill status={c.status} />
              <RecoBadge reco={c.result!.recommendation} />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
