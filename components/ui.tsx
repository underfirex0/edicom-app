import Link from "next/link";
import type { Recommendation } from "@/lib/types";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink/80 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "focus-ring w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14.5px] placeholder:text-muted/70 " +
        (props.className ?? "")
      }
    />
  );
}

export function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
) {
  return (
    <button
      {...props}
      className={
        "focus-ring rounded-xl bg-ink text-white font-medium text-[14px] px-5 py-2.5 hover:bg-black transition-colors disabled:opacity-35 disabled:cursor-not-allowed " +
        (props.className ?? "")
      }
    >
      {props.children}
    </button>
  );
}

export function GhostButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
) {
  return (
    <button
      {...props}
      className={
        "focus-ring rounded-xl border border-line bg-white text-ink font-medium text-[14px] px-5 py-2.5 hover:bg-paper transition-colors disabled:opacity-40 " +
        (props.className ?? "")
      }
    >
      {props.children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"bg-panel border border-line rounded-3xl shadow-panel " + className}>{children}</div>;
}

const RECO_META: Record<Recommendation, { label: string; text: string; bg: string; dot: string; hex: string }> = {
  good: { label: "Profil recommandé", text: "text-teal", bg: "bg-teal-soft", dot: "bg-teal", hex: "#2F6F63" },
  watch: { label: "À creuser en entretien", text: "text-amber", bg: "bg-amber-soft", dot: "bg-amber", hex: "#CE9A45" },
  risk: { label: "Profil à risque", text: "text-coral", bg: "bg-coral-soft", dot: "bg-coral", hex: "#C1584F" },
};

export function RecoBadge({ reco }: { reco: Recommendation }) {
  const m = RECO_META[reco];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-medium ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function recoMeta(reco: Recommendation) {
  return RECO_META[reco];
}

const STATUS_LABELS: Record<string, string> = {
  invited: "Invité",
  in_progress: "Test en cours",
  completed: "Test complété",
  interviewed: "Entretien passé",
  hired: "Recruté(e)",
  rejected: "Non retenu(e)",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-paper px-2.5 py-1 text-[11.5px] font-mono text-ink/70">
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="focus-ring font-mono text-[12px] text-muted hover:text-ink">
      ← {label}
    </Link>
  );
}
