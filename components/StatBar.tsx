export function StatBar({
  label,
  value,
  max,
  displayValue,
  color = "#2F6F63",
}: {
  label: string;
  value: number;
  max: number;
  displayValue?: string;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-[168px] text-[13px] text-ink/75 shrink-0 truncate">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="w-12 text-right font-mono text-[12.5px] text-ink/70 shrink-0">
        {displayValue ?? value}
      </div>
    </div>
  );
}

export function BigStat({
  value,
  label,
  color,
  suffix,
}: {
  value: number | string;
  label: string;
  color?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="font-display text-[30px] font-semibold leading-none" style={color ? { color } : undefined}>
        {value}
        {suffix && <span className="text-[15px] text-muted font-sans ml-0.5">{suffix}</span>}
      </div>
      <div className="text-[13px] text-muted mt-1.5">{label}</div>
    </div>
  );
}
