// Small hand-drawn SVG icon set + bespoke illustrations for the
// EDICOM/Télécontact presentation — no external images, no dependencies,
// just crisp inline vector art that matches the brand palette.

const stroke = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconSearch({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <circle cx="10.5" cy="10.5" r="6.5" stroke={color} {...stroke} />
      <line x1="20" y1="20" x2="15.3" y2="15.3" stroke={color} {...stroke} />
    </svg>
  );
}

export function IconUserCheck({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <circle cx="9.5" cy="7.5" r="3.5" stroke={color} {...stroke} />
      <path d="M3 20c0-3.6 2.9-6.5 6.5-6.5S16 16.4 16 20" stroke={color} {...stroke} />
      <path d="M17 12l2 2 3.5-3.5" stroke={color} {...stroke} />
    </svg>
  );
}

export function IconTarget({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <circle cx="12" cy="12" r="8" stroke={color} {...stroke} />
      <circle cx="12" cy="12" r="4" stroke={color} {...stroke} />
      <circle cx="12" cy="12" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

export function IconCalendar({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke={color} {...stroke} />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke={color} {...stroke} />
      <line x1="8" y1="3" x2="8" y2="7" stroke={color} {...stroke} />
      <line x1="16" y1="3" x2="16" y2="7" stroke={color} {...stroke} />
    </svg>
  );
}

export function IconBarChart({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <line x1="5" y1="20" x2="5" y2="13" stroke={color} {...stroke} />
      <line x1="12" y1="20" x2="12" y2="7" stroke={color} {...stroke} />
      <line x1="19" y1="20" x2="19" y2="10" stroke={color} {...stroke} />
      <line x1="3" y1="20" x2="21" y2="20" stroke={color} {...stroke} />
    </svg>
  );
}

export function IconHome({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M4 11.5L12 4l8 7.5" stroke={color} {...stroke} />
      <path d="M6 10v9h12v-9" stroke={color} {...stroke} />
    </svg>
  );
}

export function IconMap({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6l-6-2z" stroke={color} {...stroke} />
      <line x1="9" y1="4" x2="9" y2="18" stroke={color} {...stroke} />
      <line x1="15" y1="6" x2="15" y2="20" stroke={color} {...stroke} />
    </svg>
  );
}

export function IconGlobe({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <circle cx="12" cy="12" r="8.5" stroke={color} {...stroke} />
      <ellipse cx="12" cy="12" rx="3.4" ry="8.5" stroke={color} {...stroke} />
      <line x1="3.5" y1="12" x2="20.5" y2="12" stroke={color} {...stroke} />
    </svg>
  );
}

const SOLUTION_ICONS = [IconSearch, IconUserCheck, IconTarget, IconCalendar, IconBarChart];
export function solutionIcon(i: number, color?: string) {
  const C = SOLUTION_ICONS[i % SOLUTION_ICONS.length];
  return <C color={color} />;
}

// ---------- Bespoke illustrations ----------

// Slide 1 — network of connected companies (275 000 entreprises réunies)
export function NetworkIllustration() {
  const nodes = [
    [40, 30], [110, 15], [175, 45], [150, 100], [70, 110], [20, 80], [130, 60], [95, 70],
  ];
  const edges: [number, number][] = [[0, 5], [0, 7], [1, 6], [1, 2], [2, 3], [3, 6], [4, 5], [4, 7], [6, 7], [3, 7]];
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#BD8A4F" strokeOpacity={0.35} strokeWidth={1}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 4 ? 5 : 3.2} fill={i === 4 ? "#BD8A4F" : "#F7F6F2"} className="eqc-node-blink" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  );
}

// Slide 2 — search radar (20 000 recherches / jour)
export function RadarIllustration() {
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      <circle cx="70" cy="70" r="30" fill="none" stroke="#BD8A4F" strokeWidth="1.4" className="eqc-radar-ring" />
      <circle cx="70" cy="70" r="30" fill="none" stroke="#BD8A4F" strokeWidth="1.4" className="eqc-radar-ring" style={{ animationDelay: "0.8s" }} />
      <circle cx="70" cy="70" r="30" fill="none" stroke="#BD8A4F" strokeWidth="1.4" className="eqc-radar-ring" style={{ animationDelay: "1.6s" }} />
      <circle cx="70" cy="70" r="22" fill="#2F6F63" />
      <g transform="translate(59,59)">
        <circle cx="8" cy="8" r="7" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
        <line x1="13.5" y1="13.5" x2="19" y2="19" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Slide 5 — a terrain visit path with pins popping in sequence
export function JourneyIllustration() {
  const points = [
    { x: 20, y: 95 },
    { x: 70, y: 55 },
    { x: 120, y: 75 },
    { x: 165, y: 30 },
  ];
  const path = `M${points.map((p) => `${p.x},${p.y}`).join(" L")}`;
  return (
    <svg viewBox="0 0 190 120" className="w-full h-full">
      <path d={path} fill="none" stroke="#2F6F63" strokeWidth="2" strokeDasharray="1 8" strokeLinecap="round" className="eqc-draw-path" />
      {points.map((p, i) => (
        <g key={i} className="eqc-pin-pop" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
          <circle cx={p.x} cy={p.y} r={i === points.length - 1 ? 7 : 5} fill={i === points.length - 1 ? "#BD8A4F" : "#2F6F63"} />
          <circle cx={p.x} cy={p.y} r={2} fill="#FFFFFF" />
        </g>
      ))}
    </svg>
  );
}
