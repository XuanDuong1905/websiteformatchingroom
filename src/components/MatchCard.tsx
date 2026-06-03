import type { MatchItem } from "@/lib/api/matchApi";
import { formatGender, formatPercentScore } from "@/lib/utils/format";
import ScoreBar, { ScoreBadge } from "@/components/ScoreBar";

type MatchCardProps = {
  match: MatchItem;
};

export default function MatchCard({ match }: MatchCardProps) {
  const { user, matchScore, scores, reasons } = match;
  const safeMatchScore = Number.isFinite(matchScore) ? matchScore : 0;
  const safeReasons = Array.isArray(reasons) ? reasons : [];

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {user.fullName || "Người dùng chưa cập nhật tên"}
          </h3>

          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Giới tính: {formatGender(user.gender ?? undefined)}</p>
            <p>Trường: {user.school || "Chưa cập nhật"}</p>
            <p>Điểm uy tín: {user.reputationScore ?? 0}</p>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 px-4 py-3 text-center">
          <div className="mb-2 flex justify-center">
            <ScoreBadge score={safeMatchScore} />
          </div>
          <p className="text-sm font-medium text-blue-700">Độ phù hợp</p>
          <p className="text-3xl font-bold text-blue-700">
            {formatPercentScore(safeMatchScore)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ScoreBar label="Giờ giấc sinh hoạt" value={scores?.sleepScore} />
        <ScoreBar label="Tần suất dọn dẹp" value={scores?.cleaningScore} />
        <ScoreBar label="Mức độ riêng tư" value={scores?.privacyScore} />
        <ScoreBar label="Mức chấp nhận tiếng ồn" value={scores?.noiseScore} />
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-semibold text-gray-900">Lý do phù hợp</h4>

        {safeReasons.length > 0 ? (
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
            {safeReasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            No detailed reasons returned by the matching API yet.
          </p>
        )}
      </div>
    </article>
  );
}
