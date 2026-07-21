// Signature visual element, reused across the candidate wizard (progress)
// and the admin dashboard (score readout) to tie the two experiences together.
export function SignalMeter({
  litBars,
  color = "#BD8A4F",
  trackColor = "#E7E3DA",
}: {
  litBars: number; // 0-5
  color?: string;
  trackColor?: string;
}) {
  const heights = [35, 55, 70, 85, 100];
  return (
    <div className="flex items-end gap-[3px] h-[18px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[5px] rounded-sm transition-colors"
          style={{ height: `${h}%`, backgroundColor: i < litBars ? color : trackColor }}
        />
      ))}
    </div>
  );
}

export function pctToBars(pct: number) {
  return Math.max(0, Math.min(5, Math.round((pct / 100) * 5)));
}
