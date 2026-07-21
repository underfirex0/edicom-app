import { notFound } from "next/navigation";
import { getCandidateById, getNotesForCandidate } from "@/lib/admin-data";
import { FOLLOWUP_QUESTIONS, SJT_SCENARIOS } from "@/lib/scoring";
import { Card, RecoBadge, StatusPill, BackLink, recoMeta } from "@/components/ui";
import { SignalMeter, pctToBars } from "@/components/SignalMeter";
import StatusControl from "./StatusControl";
import NoteForm from "./NoteForm";
import ResendInvite from "./ResendInvite";
import DeleteButton from "./DeleteButton";

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = await getCandidateById(params.id);
  if (!candidate) notFound();

  const notes = await getNotesForCandidate(candidate.id);
  const r = candidate.result;

  const suggestedQuestions: string[] = [];
  if (r) {
    r.dims.filter((d) => d.pct < 50).forEach((d) => suggestedQuestions.push(FOLLOWUP_QUESTIONS[d.key]));
    r.sjtAnswers.forEach((a) => {
      const scenario = SJT_SCENARIOS.find((s) => s.id === a.id);
      const opt = scenario?.options.find((o) => o.id === a.optionId);
      if (scenario && opt && opt.score <= 1) {
        suggestedQuestions.push(`Revenir sur « ${scenario.theme} » — la réponse choisie était perfectible.`);
      }
    });
  }

  return (
    <div className="p-8 max-w-4xl">
      <BackLink href="/admin/candidates" label="Tous les candidats" />

      <div className="flex items-start justify-between mt-4 mb-8">
        <div>
          <h1 className="font-display text-[24px] font-semibold">{candidate.fullName}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] text-muted">{candidate.email}</span>
            <span className="text-line">·</span>
            <StatusPill status={candidate.status} />
          </div>
        </div>
        {r && <StatusControl candidateId={candidate.id} current={candidate.status} />}
      </div>

      {!r ? (
        <Card className="p-8">
          <p className="text-[14.5px] text-ink/80 mb-1">
            {candidate.status === "invited"
              ? "Ce candidat n'a pas encore ouvert son lien d'invitation."
              : "Ce candidat a commencé le test mais ne l'a pas encore terminé."}
          </p>
          <p className="text-[13px] text-muted mb-5">Invité le {new Date(candidate.createdAt).toLocaleString("fr-FR")}</p>
          <ResendInvite email={candidate.email} />
        </Card>
      ) : (
        <>
          <Card className="p-6 flex items-center gap-6 mb-8">
            <SignalMeter litBars={pctToBars(r.globalScore)} color={recoMeta(r.recommendation).hex} />
            <div>
              <div className="font-display text-[32px] font-semibold leading-none">
                {r.globalScore}
                <span className="text-[15px] text-muted font-sans">/100</span>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wide text-muted mt-1">Score global</div>
            </div>
            <div className="flex-1" />
            <div className="text-right text-[13px] font-mono text-ink/70">
              <div>Comportemental&nbsp; {r.behavAvg}/100</div>
              <div className="mt-1">Mises en situation&nbsp; {r.sjtScore}/{r.sjtTotal}</div>
            </div>
            <RecoBadge reco={r.recommendation} />
          </Card>

          <SectionTitle>Profil comportemental</SectionTitle>
          <Card className="p-5 mb-8 space-y-3">
            {r.dims.map((d) => {
              const color = d.pct < 50 ? "#C1584F" : d.pct < 70 ? "#CE9A45" : "#2F6F63";
              return (
                <div key={d.key} className="flex items-center gap-4">
                  <div className="w-[190px] text-[13.5px] shrink-0">{d.label}</div>
                  <SignalMeter litBars={pctToBars(d.pct)} color={color} />
                  <div className="w-11 text-right font-mono text-[13px]" style={{ color }}>
                    {d.pct}%
                  </div>
                </div>
              );
            })}
          </Card>

          <SectionTitle>Mises en situation</SectionTitle>
          <Card className="p-5 mb-8 divide-y divide-line">
            {r.sjtAnswers.map((a, i) => {
              const scenario = SJT_SCENARIOS.find((s) => s.id === a.id);
              const opt = scenario?.options.find((o) => o.id === a.optionId);
              if (!scenario || !opt) return null;
              const ic = opt.score >= 3 ? { c: "#2F6F63", s: "✓" } : opt.score >= 2 ? { c: "#CE9A45", s: "–" } : { c: "#C1584F", s: "!" };
              return (
                <div key={i} className="flex gap-3 py-3 text-[13.5px]">
                  <span className="w-4 text-center font-bold shrink-0" style={{ color: ic.c }}>
                    {ic.s}
                  </span>
                  <div>
                    <div className="font-medium">{scenario.theme}</div>
                    <div className="text-muted mt-0.5">{opt.text}</div>
                  </div>
                </div>
              );
            })}
          </Card>

          <SectionTitle>Questions suggérées pour l&apos;entretien</SectionTitle>
          {suggestedQuestions.length ? (
            <ul className="space-y-2 mb-8">
              {suggestedQuestions.map((q, i) => (
                <li key={i} className="bg-paper border border-line rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed">
                  {q}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] text-muted mb-8">
              Aucun point d&apos;alerte particulier — profil homogène sur l&apos;ensemble des dimensions.
            </p>
          )}
        </>
      )}

      <SectionTitle>Notes internes</SectionTitle>
      <Card className="p-5 mb-6">
        <NoteForm candidateId={candidate.id} />
      </Card>
      {notes.length > 0 && (
        <div className="space-y-3 mb-10">
          {notes.map((n) => (
            <div key={n.id} className="bg-paper border border-line rounded-2xl px-4 py-3">
              <p className="text-[13.5px] leading-relaxed">{n.note}</p>
              <p className="text-[11.5px] text-muted font-mono mt-2">
                {n.authorName} · {new Date(n.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-line pt-5">
        <DeleteButton candidateId={candidate.id} />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-mono text-[11.5px] uppercase tracking-wide text-muted mb-3">{children}</h2>;
}
