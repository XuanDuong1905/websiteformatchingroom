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
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        Chưa có điểm
      </span>
    );
  }

  if (normalizedScore >= 80) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Rất phù hợp
      </span>
    );
  }

  if (normalizedScore >= 65) {
    return (
      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
        Phù hợp
      </span>
    );
  }

  if (normalizedScore >= 50) {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        Có thể cân nhắc
      </span>
    );
  }

  return (
    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
      Ít phù hợp
    </span>
  );
}

export default function ScoreBar({ label, value }: ScoreBarProps) {
  const normalizedScore = normalizeScore(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-xs font-semibold text-slate-500">
          {normalizedScore === null ? "Chưa có" : `${normalizedScore}%`}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${normalizedScore ?? 0}%` }}
        />
      </div>
    </div>
  );
}