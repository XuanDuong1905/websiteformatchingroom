import type { MatchItem } from "@/lib/api/matchApi";
import { formatGender, formatPercentScore } from "@/lib/utils/format";

type MatchCardProps = {
  match: MatchItem;
};

function ScoreRow({ label, value }: { label: string; value: number }) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const percent = safeValue <= 1 ? safeValue * 100 : safeValue;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {formatPercentScore(safeValue)}
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  );
}

export default function MatchCard({ match }: MatchCardProps) {
  const { user, matchScore, scores, reasons } = match;

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {user.fullName || "Người dùng chưa cập nhật tên"}
          </h3>

          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Giới tính: {formatGender(user.gender)}</p>
            <p>Trường: {user.school || "Chưa cập nhật"}</p>
            <p>Điểm uy tín: {user.reputationScore ?? 0}</p>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 px-4 py-3 text-center">
          <p className="text-sm font-medium text-blue-700">Độ phù hợp</p>
          <p className="text-3xl font-bold text-blue-700">
            {formatPercentScore(matchScore)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ScoreRow label="Giờ giấc sinh hoạt" value={scores.sleepScore} />
        <ScoreRow label="Tần suất dọn dẹp" value={scores.cleaningScore} />
        <ScoreRow label="Mức độ riêng tư" value={scores.privacyScore} />
        <ScoreRow label="Mức chấp nhận tiếng ồn" value={scores.noiseScore} />
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-semibold text-gray-900">Lý do phù hợp</h4>

        {reasons.length > 0 ? (
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
            {reasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Chưa có lý do phù hợp được trả về.
          </p>
        )}
      </div>
    </article>
  );
}
