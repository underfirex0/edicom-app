import { SignalMeter } from "@/components/SignalMeter";

export function TestShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="min-h-screen flex items-start justify-center px-6 py-14">
      <div className={wide ? "w-full max-w-2xl" : "w-full max-w-xl"}>
        <div className="bg-panel border border-line rounded-3xl shadow-panel p-8 md:p-10">{children}</div>
      </div>
    </main>
  );
}

export function TestTopLine({ label, bars }: { label: string; bars: number }) {
  return (
    <div className="flex items-center justify-between mb-7">
      <span className="font-mono text-[12px] text-muted">{label}</span>
      <SignalMeter litBars={bars} />
    </div>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-3">{children}</div>;
}
