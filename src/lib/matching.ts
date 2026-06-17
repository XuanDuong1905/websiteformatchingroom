export type MatchingUser = {
  id: number;
  fullName: string;
  gender: string;
  reputationScore: unknown;
  profile: {
    schoolName: string | null;
    preferredDistrict: string | null;
    currentAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    birthYear: number | null;
  } | null;
  lifestyleProfile: {
    budgetMin: number | null;
    budgetMax: number | null;
    sleepTime: Date | string | null;
    wakeTime: Date | string | null;
    cleaningFrequency: string;
    noiseTolerance: string;
    privacyPreference: string;
    smoking: boolean;
    petFriendly: boolean;
    guestFrequency: string;
    cookingFrequency: string;
  } | null;
};

export type MatchResult = {
  user: {
    id: number;
    fullName: string;
    gender: string;
    school: string | null;
    reputationScore: unknown;
    latitude?: number | null;
    longitude?: number | null;
    birthYear?: number | null;
    currentAddress?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
  };
  matchScore: number;
  scores: {
    sleepScore: number;
    cleaningScore: number;
    privacyScore: number;
    noiseScore: number;
    guestScore: number;
    cookingScore: number;
  };
  reasons: string[];
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function hasBudgetOverlap(a: MatchingUser, b: MatchingUser) {
  const aLifestyle = a.lifestyleProfile;
  const bLifestyle = b.lifestyleProfile;

  // Dùng null check thật sự (== null) thay vì falsy check (!value)
  // để tránh lọc mất user có budgetMin = 0
  if (
    aLifestyle?.budgetMin == null ||
    aLifestyle.budgetMax == null ||
    bLifestyle?.budgetMin == null ||
    bLifestyle.budgetMax == null
  ) {
    return false;
  }

  return aLifestyle.budgetMin <= bLifestyle.budgetMax && bLifestyle.budgetMin <= aLifestyle.budgetMax;
}

function isDistrictCompatible(a: MatchingUser, b: MatchingUser) {
  const aDistrict = normalize(a.profile?.preferredDistrict);
  const bDistrict = normalize(b.profile?.preferredDistrict);

  // Nếu một trong hai chưa điền preferredDistrict thì không loại
  // Chỉ filter khi cả hai đều có district và khác nhau
  if (!aDistrict || !bDistrict) return true;
  return aDistrict === bDistrict;
}

function isSmokingCompatible(a: MatchingUser, b: MatchingUser) {
  // Schema TV1 chi co field smoking, chua tach "co hut thuoc" va "chap nhan hut thuoc".
  // Tam thoi chi ghep neu ca hai deu khong hut thuoc.
  return !a.lifestyleProfile?.smoking && !b.lifestyleProfile?.smoking;
}

function isPetCompatible(a: MatchingUser, b: MatchingUser) {
  // Schema TV1 chi co field petFriendly, chua tach "co thu cung" va "chap nhan thu cung".
  // Tam thoi xem petFriendly la khong xung dot neu hai ben cung gia tri.
  return a.lifestyleProfile?.petFriendly === b.lifestyleProfile?.petFriendly;
}

export function passHardMatching(a: MatchingUser, b: MatchingUser) {
  // Hard filter chỉ kiểm tra profile có tồn tại để tính điểm được.
  // Budget và district KHÔNG dùng làm điều kiện loại cứng:
  //   - Nhiều user chưa điền budget → hasBudgetOverlap trả false → lọc hết
  //   - Thay vào đó, budget/district sẽ đóng góp vào reasons (soft signal)
  // Ngưỡng matchScore > 50 sẽ lọc kết quả không phù hợp ở bước cuối.
  return Boolean(
    a.lifestyleProfile && b.lifestyleProfile && a.profile && b.profile
  );
}

function timeToMinutes(time: Date | string | null) {
  if (!time) return null;

  if (time instanceof Date) {
    return time.getHours() * 60 + time.getMinutes();
  }

  const value = String(time);
  const timePart = value.includes("T") ? value.split("T")[1] : value;
  const [hour, minute] = timePart.split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function timeScore(aTime: Date | string | null, bTime: Date | string | null) {
  const a = timeToMinutes(aTime);
  const b = timeToMinutes(bTime);

  if (a === null || b === null) return 0.5;

  const diff = Math.abs(a - b);
  const circularDiff = Math.min(diff, 1440 - diff);

  if (circularDiff <= 30) return 1;
  if (circularDiff <= 60) return 0.85;
  if (circularDiff <= 120) return 0.65;
  if (circularDiff <= 180) return 0.4;
  return 0.2;
}

function sameValueScore(a: string | null | undefined, b: string | null | undefined) {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right || left === "unknown" || right === "unknown") {
    return 0.5;
  }

  return left === right ? 1 : 0.45;
}

export function calculateMatch(a: MatchingUser, b: MatchingUser): MatchResult {
  const aLifestyle = a.lifestyleProfile;
  const bLifestyle = b.lifestyleProfile;

  if (!aLifestyle || !bLifestyle) {
    throw new Error("Missing lifestyle profile");
  }

  const sleepScore =
    (timeScore(aLifestyle.sleepTime, bLifestyle.sleepTime) +
      timeScore(aLifestyle.wakeTime, bLifestyle.wakeTime)) /
    2;
  const cleaningScore = sameValueScore(
    aLifestyle.cleaningFrequency,
    bLifestyle.cleaningFrequency,
  );
  const privacyScore = sameValueScore(
    aLifestyle.privacyPreference,
    bLifestyle.privacyPreference,
  );
  const noiseScore = sameValueScore(aLifestyle.noiseTolerance, bLifestyle.noiseTolerance);
  const guestScore = sameValueScore(aLifestyle.guestFrequency, bLifestyle.guestFrequency);
  const cookingScore = sameValueScore(aLifestyle.cookingFrequency, bLifestyle.cookingFrequency);

  const matchScore = Math.round(
    (0.25 * sleepScore + 0.20 * cleaningScore + 0.15 * privacyScore + 0.15 * noiseScore + 0.15 * guestScore + 0.10 * cookingScore) *
      100,
  );

  return {
    user: {
      id: b.id,
      fullName: b.fullName,
      gender: b.gender,
      school: b.profile?.schoolName || null,
      reputationScore: b.reputationScore,
      latitude: b.profile?.latitude,
      longitude: b.profile?.longitude,
      birthYear: b.profile?.birthYear,
      currentAddress: b.profile?.currentAddress,
      budgetMin: b.lifestyleProfile?.budgetMin,
      budgetMax: b.lifestyleProfile?.budgetMax,
    },
    matchScore,
    scores: {
      sleepScore,
      cleaningScore,
      privacyScore,
      noiseScore,
      guestScore,
      cookingScore,
    },
    reasons: buildReasons(a, b, {
      sleepScore,
      cleaningScore,
      privacyScore,
      noiseScore,
      guestScore,
      cookingScore,
    }),
  };
}

function buildReasons(
  a: MatchingUser,
  b: MatchingUser,
  scores: MatchResult["scores"],
) {
  const reasons: string[] = [];

  // Chỉ thêm reason ngân sách nếu thực sự overlap
  if (hasBudgetOverlap(a, b)) reasons.push("Ngân sách phù hợp");
  // Chỉ thêm reason khu vực nếu cả hai đều điền và trùng nhau
  const aDistrict = normalize(a.profile?.preferredDistrict);
  const bDistrict = normalize(b.profile?.preferredDistrict);
  if (aDistrict && bDistrict && aDistrict === bDistrict) reasons.push("Cùng khu vực mong muốn");

  if (scores.sleepScore >= 0.85) reasons.push("Giờ ngủ và giờ thức gần nhau");
  if (scores.cleaningScore === 1) reasons.push("Cùng tần suất dọn dẹp");
  if (scores.privacyScore === 1) reasons.push("Cùng quan điểm về không gian riêng tư");
  if (scores.noiseScore === 1) reasons.push("Cùng mức chấp nhận tiếng ồn");
  if (scores.guestScore === 1) reasons.push("Hợp quan điểm về việc dẫn khách");
  if (scores.cookingScore === 1) reasons.push("Cùng thói quen nấu ăn");
  if (!a.lifestyleProfile?.smoking && !b.lifestyleProfile?.smoking) {
    reasons.push("Không xung đột về hút thuốc");
  }
  if (a.lifestyleProfile?.petFriendly === b.lifestyleProfile?.petFriendly) {
    reasons.push("Không xung đột về thú cưng");
  }

  return reasons;
}

export function findBestMatches(currentUser: MatchingUser, candidateUsers: MatchingUser[]) {
  return candidateUsers
    .filter((user) => user.id !== currentUser.id)
    .filter((user) => passHardMatching(currentUser, user))
    .map((user) => calculateMatch(currentUser, user))
    .filter((result) => result.matchScore > 50) // Chỉ hiển thị khi độ phù hợp > 50%
    .sort((a, b) => b.matchScore - a.matchScore); // Điểm cao xếp trên
}
