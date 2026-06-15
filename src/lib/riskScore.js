// Thuật toán tính điểm rủi ro phòng
export function calculateRoomRiskScore({
  price,
  deposit,
  description,
  address,
  imageCount,
  ownerReputation
}) {
  let score = 0;

  if (price !== undefined && price < 1000000) {
    score += 20;
  }

  // cọc quá 2 tháng tiền nhà
  if (deposit !== undefined && price !== undefined) {
    if (deposit > price * 2) {
      score += 20;
    }
  }

  // Thiếu ảnh thực tế
  if (imageCount === undefined || imageCount === 0) {
    score += 20;
  }

  // Địa chỉ không rõ ràng, ít mô tả
  if (!address || address.trim().length < 15) {
    score += 15;
  }

  // Mô tả sơ sài, không có thông tin cụ thể
  if (!description || description.trim().length < 50) {
    score += 15;
  }

  //Uy tín chủ trọ kém
  if (ownerReputation !== undefined && Number(ownerReputation) < 3.0) {
    score += 10;
  }

  // Giới hạn điểm ở mức 100
  return Math.min(score, 100);
}