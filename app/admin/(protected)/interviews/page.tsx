import { getInterviewsBoard } from "@/lib/admin-data";
import { Card } from "@/components/ui";
import AddCandidateForm from "./AddCandidateForm";
import ScheduleRow from "./ScheduleRow";
import InterviewCard from "./InterviewCard";

const OUTCOME_META: Record<string, { label: string; color: string; bg: string }> = {
  hire: { label: "Recruté(e)", color: "text-teal", bg: "bg-teal-soft" },
  second_round: { label: "À revoir", color: "text-amber", bg: "bg-amber-soft" },
  reject: { label: "Non retenu(e)", color: "text-coral", bg: "bg-coral-soft" },
};

const STATUS_LABELS: Record<string, string> = {
  no_show: "Absent(e)",
  cancelled: "Annulé",
};

export default async function InterviewsPage() {
  const board = await getInterviewsBoard();

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-[24px] font-semibold">Entretiens</h1>
        <p className="text-[14px] text-muted mt-1">
          Planifiez les entretiens des candidats testés, suivez les rendez-vous à venir, et enregistrez la
          décision une fois l&apos;entretien passé.
        </p>
      </div>

      <AddCandidateForm />

      <SectionHeader title="À planifier" count={board.toSchedule.length} />
      {board.toSchedule.length === 0 ? (
        <Card className="p-8 text-center text-[14px] text-muted mb-10">
          Aucun candidat en attente de planification pour le moment.
        </Card>
      ) : (
        <Card className="divide-y divide-line mb-10">
          {board.toSchedule.map((c) => (
            <ScheduleRow
              key={c.id}
              candidateId={c.id}
              fullName={c.fullName}
              email={c.email}
              status={c.status}
              score={c.result?.globalScore ?? null}
              recommendation={c.result?.recommendation ?? null}
            />
          ))}
        </Card>
      )}

      <SectionHeader title="Entretiens à venir" count={board.upcoming.length} />
      {board.upcoming.length === 0 ? (
        <Card className="p-8 text-center text-[14px] text-muted mb-10">Aucun entretien planifié.</Card>
      ) : (
        <Card className="divide-y divide-line mb-10">
          {board.upcoming.map((iv) => (
            <InterviewCard
              key={iv.id}
              interviewId={iv.id}
              candidateId={iv.candidateId}
              candidateName={iv.candidateName}
              candidateEmail={iv.candidateEmail}
              score={iv.candidateScore}
              recommendation={iv.candidateRecommendation}
              scheduledAt={iv.scheduledAt}
              location={iv.location}
              interviewer={iv.interviewer}
            />
          ))}
        </Card>
      )}

      <SectionHeader title="Historique" count={board.history.length} />
      {board.history.length === 0 ? (
        <Card className="p-8 text-center text-[14px] text-muted">Aucun entretien passé pour le moment.</Card>
      ) : (
        <Card className="divide-y divide-line">
          {board.history.map((iv) => (
            <div key={iv.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-medium truncate">{iv.candidateName}</div>
                <div className="text-[12px] text-muted font-mono mt-0.5">
                  {new Date(iv.scheduledAt).toLocaleDateString("fr-FR")}
                  {iv.location ? ` · ${iv.location}` : ""}
                </div>
                {iv.outcomeNotes && <p className="text-[13px] text-ink/70 mt-1.5">{iv.outcomeNotes}</p>}
              </div>
              {iv.outcome ? (
                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-medium ${OUTCOME_META[iv.outcome].bg} ${OUTCOME_META[iv.outcome].color}`}
                >
                  {OUTCOME_META[iv.outcome].label}
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center rounded-full border border-line bg-paper px-3 py-1 text-[12.5px] font-mono text-ink/60">
                  {STATUS_LABELS[iv.status] ?? iv.status}
                </span>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <h2 className="font-display text-[17px] font-semibold">{title}</h2>
      <span className="font-mono text-[12px] text-muted">{count}</span>
    </div>
  );
}
