import { useId } from 'react';

/**
 * Lightweight dependency-free combo chart (bars + smooth line) matching the
 * reference "Rental time" widget. Pass data: [{ label, value }].
 * `highlight` is the index of the emphasised (gradient) bar.
 */
export default function MiniChart({ data = [], highlight = -1, height = 150, className = '' }) {
  const gid = useId().replace(/:/g, '');
  if (data.length === 0) return null;

  const W = 320;
  const H = height;
  const padX = 14;
  const padTop = 16;
  const padBottom = 26;
  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const step = innerW / data.length;
  const barW = Math.min(26, step * 0.5);

  const x = (i) => padX + step * i + step / 2;
  const y = (v) => padTop + innerH - (v / max) * innerH;

  // Smooth line path through the points (Catmull-Rom → cubic bezier)
  const pts = data.map((d, i) => [x(i), y(d.value)]);
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i === 0 ? 0 : i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const [x3, y3] = pts[i + 2 < pts.length ? i + 2 : i + 1];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    line += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${className}`} role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id={`bar-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={`line-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>

      {/* Bars */}
      {data.map((d, i) => {
        const bx = x(i) - barW / 2;
        const by = y(d.value);
        const isHi = i === highlight;
        return (
          <g key={i}>
            <rect
              x={bx}
              y={by}
              width={barW}
              height={padTop + innerH - by}
              rx={6}
              fill={isHi ? `url(#bar-${gid})` : 'rgba(255,255,255,0.07)'}
            />
            <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-slate-500" fontSize="10">
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Smooth line overlay */}
      <path d={line} fill="none" stroke={`url(#line-${gid})`} strokeWidth="2.5" strokeLinecap="round" />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === highlight ? 3.5 : 2} fill="#fff" opacity={i === highlight ? 1 : 0.5} />
      ))}
    </svg>
  );
}
