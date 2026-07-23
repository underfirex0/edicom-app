import Link from "next/link";
import { getAllCandidates, getAnalytics } from "@/lib/admin-data";
import { Card, RecoBadge, StatusPill } from "@/components/ui";
import { SignalMeter, pctToBars } from "@/components/SignalMeter";
import { StatBar, BigStat } from "@/components/StatBar";

const STATUS_META: Record<string, { label: string; color: string }> = {
  invited: { label: "Invités", color: "#847E71" },
  in_progress: { label: "Test en cours", color: "#BD8A4F" },
  completed: { label: "Complétés", color: "#2F6F63" },
  interviewed: { label: "Entretien passé", color: "#4A7FB5" },
  hired: { label: "Recrutés", color: "#2F6F63" },
  rejected: { label: "Non retenus", color: "#C1584F" },
};

export default async function AdminDashboardPage() {
  const [analytics, candidates] = await Promise.all([getAnalytics(), getAllCandidates()]);
  const recent = candidates.filter((c) => c.result?.isComplete).slice(0, 6);
  const maxStatus = Math.max(1, ...Object.values(analytics.statusCounts));
  const maxDist = Math.max(1, ...analytics.scoreDistribution.map((b) => b.count));

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-[24px] font-semibold">Tableau de bord</h1>
        <p className="text-[14px] text-muted mt-1">
          Vue d&apos;ensemble et analytics du pipeline de qualification commerciale — mis à jour en direct.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <BigStat value={analytics.totalCandidates} label="Candidats au total" />
        </Card>
        <Card className="p-5">
          <BigStat value={analytics.completedCount} label="Tests complétés" />
        </Card>
        <Card className="p-5">
          <BigStat value={analytics.avgGlobalScore} suffix="/100" label="Score moyen" color="#BD8A4F" />
        </Card>
        <Card className="p-5">
          <BigStat value={`${analytics.conversionRate}%`} label="Taux de complétion" color="#2F6F63" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="font-mono text-[11.5px] uppercase tracking-wide text-muted mb-4">
            Répartition du pipeline
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.statusCounts).map(([key, count]) => (
              <StatBar
                key={key}
                label={STATUS_META[key]?.label ?? key}
                value={count}
                max={maxStatus}
                color={STATUS_META[key]?.color}
              />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-mono text-[11.5px] uppercase tracking-wide text-muted mb-4">
            Recommandations (candidats testés)
          </h2>
          {analytics.completedCount === 0 ? (
            <p className="text-[13.5px] text-muted py-4">Pas encore de résultats.</p>
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden mb-4">
                {(["good", "watch", "risk"] as const).map((k) => {
                  const pct = (analytics.recommendationCounts[k] / analytics.completedCount) * 100;
                  const color = k === "good" ? "#2F6F63" : k === "watch" ? "#CE9A45" : "#C1584F";
                  return pct > 0 ? <div key={k} style={{ width: `${pct}%`, backgroundColor: color }} /> : null;
                })}
              </div>
              <div className="space-y-2.5">
                <StatBar label="Recommandés" value={analytics.recommendationCounts.good} max={analytics.completedCount} color="#2F6F63" />
                <StatBar label="À creuser" value={analytics.recommendationCounts.watch} max={analytics.completedCount} color="#CE9A45" />
                <StatBar label="À risque" value={analytics.recommendationCounts.risk} max={analytics.completedCount} color="#C1584F" />
              </div>
            </>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-mono text-[11.5px] uppercase tracking-wide text-muted mb-1">
            Score moyen par compétence
          </h2>
          <p className="text-[12px] text-muted mb-4">
            Tous candidats testés confondus — utile pour repérer une faiblesse systémique dans le sourcing.
          </p>
          {analytics.avgDimensions.length === 0 ? (
            <p className="text-[13.5px] text-muted py-4">Pas encore de résultats.</p>
          ) : (
            <div className="space-y-3">
              {analytics.avgDimensions.map((d) => (
                <StatBar
                  key={d.key}
                  label={d.label}
                  value={d.avgPct}
                  max={100}
                  displayValue={`${d.avgPct}%`}
                  color={d.avgPct < 50 ? "#C1584F" : d.avgPct < 70 ? "#CE9A45" : "#2F6F63"}
                />
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-mono text-[11.5px] uppercase tracking-wide text-muted mb-4">
            Distribution des scores globaux
          </h2>
          {analytics.completedCount === 0 ? (
            <p className="text-[13.5px] text-muted py-4">Pas encore de résultats.</p>
          ) : (
            <div className="flex items-end gap-2.5 h-32">
              {analytics.scoreDistribution.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-copper transition-all"
                      style={{ height: `${Math.max(4, (b.count / maxDist) * 100)}%` }}
                    />
                  </div>
                  <div className="font-mono text-[10.5px] text-muted">{b.count}</div>
                  <div className="font-mono text-[10px] text-muted">{b.label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {analytics.topCandidates.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[17px] font-semibold">Meilleurs profils</h2>
          </div>
          <Card className="divide-y divide-line mb-10 overflow-hidden">
            {analytics.topCandidates.map((c, i) => (
              <Link
                key={c.id}
                href={`/admin/candidates/${c.id}`}
                className="focus-ring flex items-center gap-4 px-5 py-3.5 hover:bg-paper transition-colors"
              >
                <span className="font-mono text-[13px] text-muted w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium truncate">{c.fullName}</div>
                </div>
                <span className="font-mono text-[13.5px] text-ink/80">{c.result!.globalScore!}/100</span>
                <RecoBadge reco={c.result!.recommendation!} />
              </Link>
            ))}
          </Card>
        </>
      )}

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
              <SignalMeter litBars={pctToBars(c.result!.globalScore!)} color="#2F6F63" />
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-medium truncate">{c.fullName}</div>
                <div className="text-[12px] text-muted font-mono mt-0.5">
                  {new Date(c.result!.submittedAt!).toLocaleDateString("fr-FR")} · score {c.result!.globalScore!}/100
                </div>
              </div>
              <StatusPill status={c.status} />
              <RecoBadge reco={c.result!.recommendation!} />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
