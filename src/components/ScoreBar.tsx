type ScoreBarProps = {
  label: string;
  value?: number | null;
};

function normalizeScore(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

export function ScoreBadge({ score }: { score?: number | null }) {
  const normalizedScore = normalizeScore(score);

  if (normalizedScore === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold tracking-normal text-slate-500 ring-1 ring-slate-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Chưa có điểm
      </span>
    );
  }

  if (normalizedScore >= 80) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-50 to-sky-50 px-3 py-1 text-xs font-semibold tracking-normal text-cyan-700 ring-1 ring-cyan-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
        Rất phù hợp
      </span>
    );
  }

  if (normalizedScore >= 65) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold tracking-normal text-sky-700 ring-1 ring-sky-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        Phù hợp
      </span>
    );
  }

  if (normalizedScore >= 50) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold tracking-normal text-amber-700 ring-1 ring-amber-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Có thể cân nhắc
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold tracking-normal text-slate-500 ring-1 ring-slate-200/60">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Ít phù hợp
    </span>
  );
}

export default function ScoreBar({ label, value }: ScoreBarProps) {
  const normalizedScore = normalizeScore(value);
  const pct = normalizedScore ?? 0;

  const barColor =
    pct >= 80
      ? "from-cyan-400 to-sky-500"
      : pct >= 60
        ? "from-sky-400 to-blue-400"
        : pct >= 40
          ? "from-amber-300 to-orange-400"
          : "from-red-300 to-red-400";

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs tracking-normal text-slate-500">
        <span>{label}</span>
        <span className="font-semibold tabular-nums text-slate-700">
          {normalizedScore === null ? "Chưa có" : normalizedScore}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          style={{
            width: `${pct}%`,
            transition: "width 600ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}