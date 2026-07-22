"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TestShell, TestTopLine, SectionEyebrow } from "@/components/TestShell";
import { PrimaryButton } from "@/components/ui";
import EdicomPresentation from "@/components/EdicomPresentation";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import BackgroundStep from "./steps/BackgroundStep";
import MotivationStep from "./steps/MotivationStep";
import PitchStep from "./steps/PitchStep";
import FinalQuestionStep from "./steps/FinalQuestionStep";
import { submitTestAction, type SubmitPayload } from "./actions";
import type { PersonalInfo, ProfessionalBackground, Motivation } from "@/lib/types";

interface PublicQuestions {
  behavioral: { id: string; text: string }[];
  sjt: { id: string; theme: string; text: string; options: { id: string; text: string }[] }[];
}

type Screen =
  | "intro"
  | "personalInfo"
  | "background"
  | "motivation"
  | "behav"
  | "sjt"
  | "presentation"
  | "pitch"
  | "finalQuestion"
  | "submitting"
  | "error";

const EMPTY_PERSONAL = (name: string, email: string): PersonalInfo => ({
  fullName: name,
  phone: "",
  email,
  city: "",
  age: "",
  familyStatus: "",
  drivingLicense: null,
  vehicle: null,
  availability: "",
  desiredSalary: "",
  startDate: "",
});

const EMPTY_BACKGROUND: ProfessionalBackground = {
  lastPosition: "",
  company: "",
  duration: "",
  leavingReason: "",
  bestSale: "",
  biggestFailure: "",
  failureLesson: "",
};

const EMPTY_MOTIVATION: Motivation = { whyEdicom: "", whatMotivates: "" };

export default function TestWizard({
  candidateName,
  candidateEmail,
  questions,
}: {
  candidateName: string;
  candidateEmail: string;
  questions: PublicQuestions;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("intro");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(EMPTY_PERSONAL(candidateName, candidateEmail));
  const [background, setBackground] = useState<ProfessionalBackground>(EMPTY_BACKGROUND);
  const [motivation, setMotivation] = useState<Motivation>(EMPTY_MOTIVATION);
  const [pitch, setPitch] = useState("");

  const [behavIdx, setBehavIdx] = useState(0);
  const [sjtIdx, setSjtIdx] = useState(0);
  const [behavAnswers, setBehavAnswers] = useState<{ id: string; val: number }[]>([]);
  const [sjtAnswers, setSjtAnswers] = useState<{ id: string; optionId: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const total = questions.behavioral.length + questions.sjt.length;

  const litBars = useMemo(() => {
    const done = screen === "behav" ? behavIdx : questions.behavioral.length + sjtIdx;
    return Math.max(1, Math.ceil(((done + 1) / total) * 5));
  }, [screen, behavIdx, sjtIdx, total, questions.behavioral.length]);

  async function finalize(whyHireYou: string) {
    setScreen("submitting");
    const payload: SubmitPayload = {
      personalInfo,
      background,
      motivation,
      behavAnswers,
      sjtAnswers,
      openResponses: { pitch, whyHireYou },
    };
    const res = await submitTestAction(payload);
    if (res.ok) {
      router.push("/test/done");
    } else {
      setError(res.error ?? "Une erreur est survenue. Merci de réessayer.");
      setScreen("error");
    }
  }

  function selectLikert(val: number) {
    const q = questions.behavioral[behavIdx];
    setBehavAnswers((prev) => [...prev, { id: q.id, val }]);
    if (behavIdx + 1 < questions.behavioral.length) {
      setBehavIdx(behavIdx + 1);
    } else {
      setScreen("sjt");
    }
  }

  function selectOption(optionId: string) {
    const q = questions.sjt[sjtIdx];
    setSjtAnswers((prev) => [...prev, { id: q.id, optionId }]);
    if (sjtIdx + 1 < questions.sjt.length) {
      setSjtIdx(sjtIdx + 1);
    } else {
      setScreen("presentation");
    }
  }

  if (screen === "intro") {
    return (
      <TestShell>
        <div className="text-center">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-3">
            EDICOM · Télécontact.ma
          </div>
          <h1 className="font-display text-[26px] font-semibold leading-tight">
            Bonjour {candidateName.split(" ")[0]},<br />prêt(e) à commencer ?
          </h1>
          <p className="text-[14.5px] text-muted mt-4 leading-relaxed">
            Cette évaluation se déroule en plusieurs étapes courtes : vos informations, votre parcours, votre
            profil, quelques mises en situation, une courte présentation d&apos;EDICOM, et deux dernières
            questions. Comptez environ 15 minutes, et ne quittez pas la page avant la fin.
          </p>
          <PrimaryButton className="mt-8 w-full" onClick={() => setScreen("personalInfo")}>
            Commencer
          </PrimaryButton>
        </div>
      </TestShell>
    );
  }

  if (screen === "personalInfo") {
    return (
      <PersonalInfoStep
        initial={personalInfo}
        onNext={(data) => {
          setPersonalInfo(data);
          setScreen("background");
        }}
      />
    );
  }

  if (screen === "background") {
    return (
      <BackgroundStep
        initial={background}
        onNext={(data) => {
          setBackground(data);
          setScreen("motivation");
        }}
      />
    );
  }

  if (screen === "motivation") {
    return (
      <MotivationStep
        initial={motivation}
        onNext={(data) => {
          setMotivation(data);
          setScreen("behav");
        }}
      />
    );
  }

  if (screen === "behav") {
    const q = questions.behavioral[behavIdx];
    return (
      <TestShell>
        <TestTopLine label={`Question ${behavIdx + 1} / ${total}`} bars={litBars} />
        <SectionEyebrow>Votre profil</SectionEyebrow>
        <p className="font-display text-[19px] font-medium leading-snug mb-7">{q.text}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => selectLikert(v)}
              className="focus-ring flex-1 rounded-xl border border-line bg-white py-4 font-mono font-semibold text-[15px] text-ink/60 hover:border-copper hover:text-ink transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[11.5px] text-muted mt-2.5">
          <span>Pas du tout d&apos;accord</span>
          <span>Tout à fait d&apos;accord</span>
        </div>
      </TestShell>
    );
  }

  if (screen === "sjt") {
    const q = questions.sjt[sjtIdx];
    const letters = ["A", "B", "C", "D"];
    return (
      <TestShell>
        <TestTopLine label={`Question ${questions.behavioral.length + sjtIdx + 1} / ${total}`} bars={litBars} />
        <SectionEyebrow>Mise en situation</SectionEyebrow>
        <div className="bg-copper-soft border-l-[3px] border-copper rounded-2xl px-5 py-4 text-[15px] leading-relaxed mb-2">
          {q.text}
          <div className="font-semibold mt-2">Que faites-vous ?</div>
        </div>
        <div className="mt-4 space-y-2.5">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              onClick={() => selectOption(o.id)}
              className="focus-ring flex w-full text-left gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 hover:border-copper transition-colors"
            >
              <span className="font-mono text-copper font-semibold shrink-0">{letters[i]}</span>
              <span className="text-[14.5px] leading-snug">{o.text}</span>
            </button>
          ))}
        </div>
      </TestShell>
    );
  }

  if (screen === "presentation") {
    return <EdicomPresentation onFinish={() => setScreen("pitch")} />;
  }

  if (screen === "pitch") {
    return (
      <PitchStep
        initial={pitch}
        onNext={(text) => {
          setPitch(text);
          setScreen("finalQuestion");
        }}
      />
    );
  }

  if (screen === "finalQuestion") {
    return <FinalQuestionStep initial="" onSubmit={(text) => finalize(text)} />;
  }

  if (screen === "submitting") {
    return (
      <TestShell>
        <div className="text-center py-14">
          <div className="w-9 h-9 mx-auto rounded-full border-2 border-line border-t-copper animate-spin mb-5" />
          <p className="text-[14.5px] text-muted">Enregistrement de vos réponses…</p>
        </div>
      </TestShell>
    );
  }

  return (
    <TestShell>
      <div className="text-center py-10">
        <p className="text-[14.5px] text-coral">{error}</p>
        <PrimaryButton className="mt-6" onClick={() => setScreen("finalQuestion")}>
          Retour
        </PrimaryButton>
      </div>
    </TestShell>
  );
}
