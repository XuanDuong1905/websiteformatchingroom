# API TV4 cung cấp cho TV5

Các API này dùng schema TV1 đã chốt:

- `User`
- `UserProfile`
- `LifestyleProfile`
- `MatchingResult`

Không dùng model tạm `Profile` hoặc `Match`.

## 1. Tạo hoặc cập nhật hồ sơ

```text
POST /api/profiles
```

Body mẫu:

```json
{
  "userId": 1,
  "schoolName": "HCMUS",
  "preferredDistrict": "Thu Duc",
  "privacyLevel": "medium",
  "budgetMin": 1500000,
  "budgetMax": 3000000,
  "sleepTime": "23:00",
  "wakeTime": "06:30",
  "cleaningFrequency": "weekly",
  "noiseTolerance": "low",
  "privacyPreference": "medium",
  "smoking": false,
  "petFriendly": false,
  "guestFrequency": "rare"
}
```

## 2. Lấy hồ sơ theo userId

```text
GET /api/profiles/:userId
```

Ví dụ:

```text
GET /api/profiles/1
```

## 3. Cập nhật hồ sơ theo userId

```text
PUT /api/profiles/:userId
```

Ví dụ:

```text
PUT /api/profiles/1
```

Body gửi field nào thì cập nhật field đó.

## 4. Lấy kết quả matching

```text
GET /api/matches/:userId
```

Ví dụ:

```text
GET /api/matches/1
```

Response mẫu:

```json
{
  "success": true,
  "data": [
    {
      "user": {
        "id": 2,
        "fullName": "Tran Thi B",
        "gender": "female",
        "school": "UIT",
        "reputationScore": "0"
      },
      "matchScore": 100,
      "scores": {
        "sleepScore": 1,
        "cleaningScore": 1,
        "privacyScore": 1,
        "noiseScore": 1
      },
      "reasons": [
        "Ngân sách phù hợp",
        "Cùng khu vực mong muốn",
        "Giờ ngủ và giờ thức gần nhau"
      ]
    }
  ]
}
```

## Field TV5 dùng để hiển thị

```text
item.user.fullName
item.user.gender
item.user.school
item.matchScore
item.scores.sleepScore
item.scores.cleaningScore
item.scores.privacyScore
item.scores.noiseScore
item.reasons
```

## Ghi chú

- API matching dùng `UserProfile.preferredDistrict` để lọc khu vực.
- API matching dùng `LifestyleProfile.budgetMin/budgetMax` để lọc ngân sách.
- API matching dùng `LifestyleProfile.sleepTime/wakeTime`, `cleaningFrequency`, `privacyPreference`, `noiseTolerance` để tính điểm mềm.
- Schema TV1 chưa tách rõ `hasPet/acceptPet` và `isSmoker/acceptSmoking`, nên code tạm dùng `petFriendly` và `smoking` theo schema hiện tại.
