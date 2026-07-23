import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidateById, getNotesForCandidate, getInterviewsForCandidate } from "@/lib/admin-data";
import { FOLLOWUP_QUESTIONS, ITEM_FOLLOWUPS, BEHAVIORAL_ITEMS, SJT_SCENARIOS } from "@/lib/scoring";
import { Card, RecoBadge, StatusPill, BackLink, recoMeta } from "@/components/ui";
import { SignalMeter, pctToBars } from "@/components/SignalMeter";
import StatusControl from "./StatusControl";
import NoteForm from "./NoteForm";
import ResendInvite from "./ResendInvite";
import DeleteButton from "./DeleteButton";
import AiBriefPanel from "./AiBriefPanel";
import LiveCandidateWatcher from "@/components/LiveCandidateWatcher";

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = await getCandidateById(params.id);
  if (!candidate) notFound();

  const notes = await getNotesForCandidate(candidate.id);
  const interviews = await getInterviewsForCandidate(candidate.id);
  const r = candidate.result;

  const suggestedQuestions: string[] = [];
  if (r?.isComplete) {
    (r.dims ?? [])
      .filter((d) => d.pct < 50)
      .forEach((d) => {
        const itemsInDim = BEHAVIORAL_ITEMS.filter((it) => it.dimKey === d.key);
        const weakItemIds = itemsInDim
          .filter((it) => {
            const ans = r.behavioralAnswers.find((a) => a.id === it.id);
            if (!ans) return false;
            const adjusted = it.reverse ? 6 - ans.val : ans.val;
            return adjusted <= 2;
          })
          .map((it) => it.id);

        if (weakItemIds.length) {
          weakItemIds.forEach((id) => suggestedQuestions.push(ITEM_FOLLOWUPS[id]));
        } else {
          suggestedQuestions.push(FOLLOWUP_QUESTIONS[d.key]);
        }
      });

    r.sjtAnswers.forEach((a) => {
      const scenario = SJT_SCENARIOS.find((s) => s.id === a.id);
      const opt = scenario?.options.find((o) => o.id === a.optionId);
      if (scenario && opt && opt.score <= 1) {
        suggestedQuestions.push(`« ${scenario.theme} » — ${opt.note ?? "la réponse choisie était perfectible."}`);
      }
    });
  }

  const personalInfo = r?.applicationInfo?.personalInfo ?? null;
  const background = r?.applicationInfo?.background ?? null;
  const motivation = r?.applicationInfo?.motivation ?? null;

  return (
    <div className="p-8 max-w-4xl">
      <BackLink href="/admin/candidates" label="Tous les candidats" />

      <div className="flex items-start justify-between mt-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[24px] font-semibold">{candidate.fullName}</h1>
            <LiveCandidateWatcher candidateId={candidate.id} />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] text-muted">{candidate.email}</span>
            <span className="text-line">·</span>
            <StatusPill status={candidate.status} />
          </div>
        </div>
        {r?.isComplete && <StatusControl candidateId={candidate.id} current={candidate.status} />}
      </div>

      {!r ? (
        <Card className="p-8">
          <p className="text-[14.5px] text-ink/80 mb-1">
            {candidate.status === "invited"
              ? "Ce candidat n'a pas encore ouvert son lien d'invitation."
              : "Ce candidat a commencé le test mais aucune réponse n'est encore arrivée."}
          </p>
          <p className="text-[13px] text-muted mb-5">Invité le {new Date(candidate.createdAt).toLocaleString("fr-FR")}</p>
          <ResendInvite email={candidate.email} />
        </Card>
      ) : (
        <>
          {r.isComplete ? (
            <Card className="p-6 flex items-center gap-6 mb-8">
              <SignalMeter litBars={pctToBars(r.globalScore!)} color={recoMeta(r.recommendation!).hex} />
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
                <div className="mt-1">
                  Mises en situation&nbsp; {r.sjtScore}/{r.sjtTotal}
                </div>
              </div>
              <RecoBadge reco={r.recommendation!} />
            </Card>
          ) : (
            <Card className="p-5 mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-copper animate-pulse shrink-0" />
                <div>
                  <p className="text-[14px] font-medium">Test en cours de remplissage</p>
                  <p className="text-[12.5px] text-muted mt-0.5">
                    Les réponses ci-dessous arrivent en direct, au fur et à mesure — dernière mise à jour{" "}
                    {new Date(r.updatedAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
              <ResendInvite email={candidate.email} />
            </Card>
          )}

          {personalInfo && (
            <>
              <SectionTitle>Informations personnelles</SectionTitle>
              <Card className="p-5 mb-8 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4">
                <InfoItem label="Téléphone" value={personalInfo.phone} />
                <InfoItem label="Ville" value={personalInfo.city} />
                <InfoItem label="Âge" value={personalInfo.age} />
                <InfoItem label="Situation familiale" value={FAMILY_LABELS[personalInfo.familyStatus] ?? personalInfo.familyStatus} />
                <InfoItem label="Permis de conduire" value={personalInfo.drivingLicense ? "Oui" : "Non"} />
                <InfoItem label="Véhicule" value={personalInfo.vehicle ? "Oui" : "Non"} />
                <InfoItem label="Disponibilité" value={AVAILABILITY_LABELS[personalInfo.availability] ?? personalInfo.availability} />
                <InfoItem label="Salaire fixe souhaité" value={`${personalInfo.desiredSalary} MAD`} />
                <InfoItem
                  label="Date d'embauche possible"
                  value={personalInfo.startDate ? new Date(personalInfo.startDate).toLocaleDateString("fr-FR") : ""}
                />
              </Card>
            </>
          )}

          {background && (
            <>
              <SectionTitle>Parcours professionnel</SectionTitle>
              <Card className="p-5 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4 mb-4">
                  <InfoItem label="Dernier poste" value={background.lastPosition} />
                  <InfoItem label="Entreprise" value={background.company} />
                  <InfoItem label="Durée" value={background.duration} />
                </div>
                <div className="space-y-3 border-t border-line pt-4">
                  <TextBlock label="Pourquoi il/elle a quitté cette entreprise" value={background.leavingReason} />
                  <TextBlock label="Sa plus belle réussite commerciale" value={background.bestSale} />
                  <TextBlock label="Son plus gros échec commercial" value={background.biggestFailure} />
                  <TextBlock label="Ce qu'il/elle en a appris" value={background.failureLesson} />
                </div>
              </Card>
            </>
          )}

          {motivation && (
            <>
              <SectionTitle>Motivation</SectionTitle>
              <Card className="p-5 mb-8 space-y-3">
                <TextBlock label="Pourquoi rejoindre EDICOM" value={motivation.whyEdicom} />
                <TextBlock label="Ce qui le/la motive le plus" value={motivation.whatMotivates} />
              </Card>
            </>
          )}

          {r.isComplete ? (
            <>
              <SectionTitle>Profil comportemental</SectionTitle>
              <Card className="p-5 mb-8 space-y-3">
                {r.dims!.map((d) => {
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
                  const ic =
                    opt.score >= 3 ? { c: "#2F6F63", s: "✓" } : opt.score >= 2 ? { c: "#CE9A45", s: "–" } : { c: "#C1584F", s: "!" };
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
            </>
          ) : (
            (r.behavioralAnswers.length > 0 || r.sjtAnswers.length > 0) && (
              <>
                <SectionTitle>Progression du questionnaire</SectionTitle>
                <Card className="p-5 mb-8 flex gap-8">
                  <div>
                    <div className="font-mono text-[18px] font-semibold">{r.behavioralAnswers.length}/15</div>
                    <div className="text-[12px] text-muted mt-0.5">Profil comportemental</div>
                  </div>
                  <div>
                    <div className="font-mono text-[18px] font-semibold">{r.sjtAnswers.length}/6</div>
                    <div className="text-[12px] text-muted mt-0.5">Mises en situation</div>
                  </div>
                </Card>
              </>
            )
          )}

          {r.openResponses?.pitch && (
            <>
              <SectionTitle>Mise en situation orale (1 minute chronométrée)</SectionTitle>
              <Card className="p-5 mb-8">
                <p className="text-[12.5px] text-muted mb-2 italic">
                  « Présentez Télécontact.ma à un dirigeant d&apos;entreprise qui ne connaît pas nos services. »
                </p>
                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{r.openResponses.pitch}</p>
              </Card>
            </>
          )}

          {r.openResponses?.whyHireYou && (
            <>
              <SectionTitle>Pourquoi le/la recruter</SectionTitle>
              <Card className="p-5 mb-8">
                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{r.openResponses.whyHireYou}</p>
              </Card>
            </>
          )}

          {r.isComplete && (
            <>
              <AiBriefPanel candidateId={candidate.id} existing={r.aiBrief} />

              <SectionTitle>Points à explorer en entretien (générés automatiquement)</SectionTitle>
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
        </>
      )}

      <SectionTitle>Entretiens</SectionTitle>
      {interviews.length === 0 ? (
        <Card className="p-5 mb-8 flex items-center justify-between">
          <p className="text-[13.5px] text-muted">Aucun entretien planifié pour ce candidat.</p>
          <Link href="/admin/interviews" className="focus-ring font-mono text-[12px] text-teal shrink-0">
            Planifier →
          </Link>
        </Card>
      ) : (
        <Card className="p-5 mb-8 divide-y divide-line">
          {interviews.map((iv) => {
            const outcomeMeta =
              iv.outcome === "hire"
                ? { label: "Recruté(e)", color: "#2F6F63" }
                : iv.outcome === "second_round"
                ? { label: "À revoir", color: "#CE9A45" }
                : iv.outcome === "reject"
                ? { label: "Non retenu(e)", color: "#C1584F" }
                : iv.status === "no_show"
                ? { label: "Absent(e)", color: "#C1584F" }
                : iv.status === "cancelled"
                ? { label: "Annulé", color: "#847E71" }
                : { label: "Planifié", color: "#BD8A4F" };
            return (
              <div key={iv.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[13.5px]">
                    {new Date(iv.scheduledAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                    {iv.location ? ` · ${iv.location}` : ""}
                  </div>
                  {iv.outcomeNotes && <p className="text-[12.5px] text-muted mt-1">{iv.outcomeNotes}</p>}
                </div>
                <span className="shrink-0 text-[12px] font-medium" style={{ color: outcomeMeta.color }}>
                  {outcomeMeta.label}
                </span>
              </div>
            );
          })}
          <div className="pt-3">
            <Link href="/admin/interviews" className="focus-ring font-mono text-[12px] text-teal">
              Gérer les entretiens →
            </Link>
          </div>
        </Card>
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-wide text-muted mb-1">{label}</div>
      <div className="text-[14px]">{value || "—"}</div>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-wide text-muted mb-1">{label}</div>
      <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

const FAMILY_LABELS: Record<string, string> = {
  celibataire: "Célibataire",
  marie_sans_enfants: "Marié(e) sans enfants",
  marie_avec_enfants: "Marié(e) avec enfants",
  autre: "Autre",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  immediate: "Immédiate",
  "1_2_semaines": "1 à 2 semaines",
  "1_mois": "Sous 1 mois",
  plus_1_mois: "Plus d'un mois",
};
