import "dotenv/config";
import { Prisma, PrismaClient, type Room, type SearchRequest, type User } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hash } from "bcrypt";

const databaseUrl = process.env.DATABASE_URL ?? "mysql://root:@localhost:3306/ghep_tro_db";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

const demoPassword = "123456";
const time = (value: string) => new Date(`1970-01-01T${value}:00.000Z`);
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);
const roundScore = (value: number) => Math.round(value * 100) / 100;

function calculateScores({
  budgetScore,
  locationScore,
  lifestyleScore,
  amenityScore,
  trustScore,
  riskScore,
}: {
  budgetScore: number;
  locationScore: number;
  lifestyleScore: number;
  amenityScore: number;
  trustScore: number;
  riskScore: number;
}) {
  const compatibilityScore = roundScore(
    0.3 * budgetScore +
      0.25 * locationScore +
      0.2 * lifestyleScore +
      0.15 * amenityScore +
      0.1 * trustScore,
  );

  return {
    budgetScore,
    locationScore,
    lifestyleScore,
    amenityScore,
    trustScore,
    compatibilityScore,
    riskScore,
    finalScore: roundScore(compatibilityScore - 0.5 * riskScore),
  };
}

async function resetDatabase() {
  await prisma.riskReport.deleteMany();
  await prisma.review.deleteMany();
  await prisma.matchingResult.deleteMany();
  await prisma.searchRequest.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.roomRule.deleteMany();
  await prisma.roomImage.deleteMany();
  await prisma.room.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.lifestyleProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Đang xóa dữ liệu mẫu cũ...");
  await resetDatabase();

  const passwordHash = await hash(demoPassword, 10);
  const users = new Map<string, User>();
  const userData: Array<Prisma.UserCreateInput & { email: string }> = [
    {
      fullName: "Quản trị viên hệ thống",
      email: "admin@example.com",
      phone: "0900000001",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      gender: "unknown",
      role: "admin",
      reputationScore: 5,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Nguyễn Hoàng Nam",
      email: "owner1@example.com",
      phone: "0901000001",
      avatarUrl: "https://i.pravatar.cc/150?img=11",
      gender: "male",
      role: "owner",
      reputationScore: 4.8,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Trần Thu Hương",
      email: "owner2@example.com",
      phone: "0901000002",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      gender: "female",
      role: "owner",
      reputationScore: 4.5,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Lê Minh Khôi",
      email: "owner3@example.com",
      phone: "0901000003",
      avatarUrl: "https://i.pravatar.cc/150?img=13",
      gender: "male",
      role: "owner",
      reputationScore: 3.9,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Phạm Gia Bảo",
      email: "student1@example.com",
      phone: "0912000001",
      avatarUrl: "https://i.pravatar.cc/150?img=14",
      gender: "male",
      role: "student",
      reputationScore: 4.7,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Võ Ngọc Anh",
      email: "student2@example.com",
      phone: "0912000002",
      avatarUrl: "https://i.pravatar.cc/150?img=45",
      gender: "female",
      role: "student",
      reputationScore: 4.6,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Đặng Quốc Huy",
      email: "student3@example.com",
      phone: "0912000003",
      avatarUrl: "https://i.pravatar.cc/150?img=15",
      gender: "male",
      role: "student",
      reputationScore: 4.1,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Bùi Thanh Mai",
      email: "student4@example.com",
      phone: "0912000004",
      avatarUrl: "https://i.pravatar.cc/150?img=44",
      gender: "female",
      role: "student",
      reputationScore: 4.9,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Huỳnh Minh Tú",
      email: "student5@example.com",
      phone: "0912000005",
      avatarUrl: "https://i.pravatar.cc/150?img=16",
      gender: "other",
      role: "student",
      reputationScore: 3.8,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Đỗ Thảo Vy",
      email: "student6@example.com",
      phone: "0912000006",
      avatarUrl: "https://i.pravatar.cc/150?img=43",
      gender: "female",
      role: "student",
      reputationScore: 4.4,
      isActive: true,
      passwordHash,
    },
    {
      fullName: "Ngô Thành Đạt",
      email: "student7@example.com",
      phone: "0912000007",
      avatarUrl: "https://i.pravatar.cc/150?img=17",
      gender: "male",
      role: "student",
      reputationScore: 3.5,
      isActive: false,
      passwordHash,
    },
    {
      fullName: "Dương Khánh Linh",
      email: "student8@example.com",
      phone: "0912000008",
      avatarUrl: "https://i.pravatar.cc/150?img=42",
      gender: "unknown",
      role: "student",
      reputationScore: 4.2,
      isActive: true,
      passwordHash,
    },
  ];

  for (const data of userData) {
    const user = await prisma.user.create({ data });
    users.set(user.email, user);
  }

  const getUser = (email: string) => {
    const user = users.get(email);
    if (!user) {
      throw new Error(`Không tìm thấy user ${email}`);
    }
    return user;
  };

  const profileData = [
    ["admin@example.com", "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM", "Công nghệ thông tin", 1995, "Thủ Đức", "Thủ Đức", "Quản trị viên hỗ trợ xử lý báo cáo.", "high"],
    ["owner1@example.com", "Đại học Bách Khoa", "Kỹ thuật phần mềm", 1988, "Thủ Đức", "Thủ Đức", "Chủ trọ ưu tiên sinh viên thuê lâu dài.", "medium"],
    ["owner2@example.com", "Đại học Kinh tế - Luật", "Quản trị kinh doanh", 1990, "Bình Thạnh", "Bình Thạnh", "Quản lý phòng trọ minh bạch, hỗ trợ nhanh.", "medium"],
    ["owner3@example.com", "Đại học Sư phạm Kỹ thuật", "Kế toán", 1987, "Dĩ An", "Dĩ An", "Có nhiều phòng giá phù hợp sinh viên.", "low"],
    ["student1@example.com", "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM", "Công nghệ thông tin", 2005, "Thủ Đức", "Thủ Đức", "Tìm phòng yên tĩnh để học tập.", "high"],
    ["student2@example.com", "Đại học Bách Khoa", "Khoa học dữ liệu", 2004, "Quận 10", "Bình Thạnh", "Thích nấu ăn và giữ phòng sạch sẽ.", "medium"],
    ["student3@example.com", "Đại học Sư phạm Kỹ thuật", "Kỹ thuật phần mềm", 2005, "Gò Vấp", "Thủ Đức", "Ưu tiên nơi có chỗ gửi xe.", "low"],
    ["student4@example.com", "Đại học Kinh tế - Luật", "Quản trị kinh doanh", 2004, "Dĩ An", "Dĩ An", "Tìm bạn ở ghép nữ, sinh hoạt điều độ.", "high"],
    ["student5@example.com", "Đại học Bách Khoa", "Công nghệ thông tin", 2003, "Quận 10", "Quận 10", "Có thể ở ghép và nuôi mèo.", "medium"],
    ["student6@example.com", "Đại học Kinh tế - Luật", "Kế toán", 2005, "Bình Thạnh", "Bình Thạnh", "Ưu tiên phòng có WC riêng.", "high"],
    ["student7@example.com", "Đại học Sư phạm Kỹ thuật", "Kỹ thuật phần mềm", 2004, "Gò Vấp", "Gò Vấp", "Tìm phòng chi phí thấp.", "unknown"],
    ["student8@example.com", "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM", "Khoa học dữ liệu", 2005, "Thủ Đức", "Thủ Đức", "Muốn ở gần trường và có hợp đồng.", "medium"],
  ] as const;

  await prisma.userProfile.createMany({
    data: profileData.map(
      ([email, schoolName, major, birthYear, currentAddress, preferredDistrict, bio, privacyLevel]) => ({
        userId: getUser(email).id,
        schoolName,
        major,
        birthYear,
        currentAddress,
        preferredDistrict,
        bio,
        privacyLevel,
      }),
    ),
  });

  const lifestyleData = [
    ["student1@example.com", 1800000, 3000000, "23:00", "06:30", "weekly", "low", "high", false, false, "rarely", "sometimes"],
    ["student2@example.com", 2500000, 4000000, "00:00", "07:00", "daily", "medium", "medium", false, true, "sometimes", "often"],
    ["student3@example.com", 1800000, 2800000, "01:00", "07:30", "monthly", "high", "low", true, false, "often", "rarely"],
    ["student4@example.com", 2000000, 3200000, "22:30", "06:00", "weekly", "low", "high", false, false, "never", "sometimes"],
    ["student5@example.com", 2500000, 4500000, "01:30", "08:00", "weekly", "high", "medium", false, true, "often", "often"],
    ["student6@example.com", 2800000, 5000000, "23:30", "06:30", "daily", "low", "high", false, false, "rarely", "often"],
    ["student7@example.com", 1800000, 2500000, "00:30", "07:30", "rarely", "medium", "low", true, true, "sometimes", "rarely"],
    ["student8@example.com", 2000000, 3500000, "23:00", "06:00", "weekly", "low", "medium", false, false, "sometimes", "sometimes"],
  ] as const;

  await prisma.lifestyleProfile.createMany({
    data: lifestyleData.map(
      ([
        email,
        budgetMin,
        budgetMax,
        sleepTime,
        wakeTime,
        cleaningFrequency,
        noiseTolerance,
        privacyPreference,
        smoking,
        petFriendly,
        guestFrequency,
        cookingFrequency,
      ]) => ({
        userId: getUser(email).id,
        budgetMin,
        budgetMax,
        sleepTime: time(sleepTime),
        wakeTime: time(wakeTime),
        cleaningFrequency,
        noiseTolerance,
        privacyPreference,
        smoking,
        petFriendly,
        guestFrequency,
        cookingFrequency,
      }),
    ),
  });

  const amenities = [
    ["Wifi", "wifi"],
    ["Máy lạnh", "air-conditioner"],
    ["Gác lửng", "loft"],
    ["WC riêng", "toilet"],
    ["Chỗ gửi xe", "parking"],
    ["Camera", "camera"],
    ["Bếp", "kitchen"],
    ["Máy giặt", "washing-machine"],
    ["Ban công", "balcony"],
    ["Giờ giấc tự do", "clock"],
    ["Tủ lạnh", "fridge"],
    ["Máy nước nóng", "water-heater"],
  ] as const;

  await prisma.amenity.createMany({
    data: amenities.map(([name, icon]) => ({ name, icon })),
  });
  const amenityMap = new Map((await prisma.amenity.findMany()).map((amenity) => [amenity.name, amenity]));

  const getAmenity = (name: string) => {
    const amenity = amenityMap.get(name);
    if (!amenity) {
      throw new Error(`Không tìm thấy tiện ích ${name}`);
    }
    return amenity;
  };

  const rooms = new Map<string, Room>();
  const roomData: Array<{ key: string; ownerEmail: string; data: Omit<Prisma.RoomUncheckedCreateInput, "ownerId"> }> = [
    {
      key: "linh-trung",
      ownerEmail: "owner1@example.com",
      data: {
        title: "Phòng trọ gần HCMUS cơ sở Linh Trung",
        description: "Phòng sạch, an ninh, phù hợp sinh viên học tại khu Đại học Quốc gia.",
        address: "12 đường số 4, phường Linh Trung",
        district: "Thủ Đức",
        ward: "Linh Trung",
        latitude: 10.8563,
        longitude: 106.7719,
        price: 2500000,
        deposit: 2500000,
        area: 22,
        electricityFee: 3500,
        waterFee: 100000,
        wifiFee: 80000,
        parkingFee: 100000,
        maxPeople: 2,
        currentPeople: 1,
        availableSlots: 1,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-06-15"),
        verificationStatus: "verified",
        riskScore: 4,
        status: "active",
      },
    },
    {
      key: "lang-dai-hoc",
      ownerEmail: "owner1@example.com",
      data: {
        title: "Phòng có gác gần Làng Đại học",
        description: "Phòng có gác lửng, bếp nhỏ và chỗ để xe trong nhà.",
        address: "68 đường Tân Lập, phường Đông Hòa",
        district: "Dĩ An",
        ward: "Đông Hòa",
        latitude: 10.8768,
        longitude: 106.8012,
        price: 2200000,
        deposit: 2200000,
        area: 24,
        electricityFee: 3500,
        waterFee: 90000,
        wifiFee: 70000,
        parkingFee: 0,
        maxPeople: 3,
        currentPeople: 1,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-06-20"),
        verificationStatus: "verified",
        riskScore: 6,
        status: "active",
      },
    },
    {
      key: "binh-thanh-mini",
      ownerEmail: "owner2@example.com",
      data: {
        title: "Phòng mini Bình Thạnh gần bến xe buýt",
        description: "Thuận tiện đi trung tâm, có ban công thoáng mát.",
        address: "115 đường Nguyễn Gia Trí, phường 25",
        district: "Bình Thạnh",
        ward: "Phường 25",
        latitude: 10.8032,
        longitude: 106.7168,
        price: 3800000,
        deposit: 3800000,
        area: 26,
        electricityFee: 4000,
        waterFee: 120000,
        wifiFee: 100000,
        parkingFee: 150000,
        maxPeople: 2,
        currentPeople: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-07-01"),
        verificationStatus: "verified",
        riskScore: 3,
        status: "active",
      },
    },
    {
      key: "di-an-student",
      ownerEmail: "owner3@example.com",
      data: {
        title: "Phòng trọ Dĩ An giá sinh viên",
        description: "Chi phí hợp lý, gần chợ và trạm xe buýt.",
        address: "22 đường Lý Thường Kiệt, phường Dĩ An",
        district: "Dĩ An",
        ward: "Dĩ An",
        latitude: 10.9051,
        longitude: 106.7694,
        price: 1800000,
        deposit: 1000000,
        area: 18,
        electricityFee: 3500,
        waterFee: 80000,
        wifiFee: 60000,
        parkingFee: 50000,
        maxPeople: 2,
        currentPeople: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 3,
        availableFrom: date("2026-06-10"),
        verificationStatus: "verified",
        riskScore: 8,
        status: "active",
      },
    },
    {
      key: "quan-10",
      ownerEmail: "owner2@example.com",
      data: {
        title: "Phòng Quận 10 gần trường đại học",
        description: "Phòng đầy đủ tiện nghi cơ bản, khu vực đông sinh viên.",
        address: "235 đường Tô Hiến Thành, phường 13",
        district: "Quận 10",
        ward: "Phường 13",
        latitude: 10.7747,
        longitude: 106.6679,
        price: 5000000,
        deposit: 5000000,
        area: 30,
        electricityFee: 4000,
        waterFee: 150000,
        wifiFee: 100000,
        parkingFee: 200000,
        maxPeople: 2,
        currentPeople: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 12,
        availableFrom: date("2026-07-01"),
        verificationStatus: "pending",
        riskScore: 12,
        status: "pending",
      },
    },
    {
      key: "go-vap-balcony",
      ownerEmail: "owner3@example.com",
      data: {
        title: "Phòng có ban công, giờ giấc tự do",
        description: "Có ban công và lối đi riêng, phù hợp người đi làm thêm.",
        address: "80 đường Phan Văn Trị, phường 10",
        district: "Gò Vấp",
        ward: "Phường 10",
        latitude: 10.8297,
        longitude: 106.6809,
        price: 3200000,
        deposit: 2000000,
        area: 25,
        electricityFee: 3800,
        waterFee: 100000,
        wifiFee: 80000,
        parkingFee: 100000,
        maxPeople: 2,
        currentPeople: 1,
        availableSlots: 1,
        hasContract: true,
        minStayMonths: 3,
        availableFrom: date("2026-06-25"),
        verificationStatus: "verified",
        riskScore: 7,
        status: "active",
      },
    },
    {
      key: "cheap-no-contract",
      ownerEmail: "owner3@example.com",
      data: {
        title: "Phòng giá rẻ nhưng thiếu hợp đồng rõ ràng",
        description: "Phòng giá thấp, thông tin hợp đồng đang cần bổ sung.",
        address: "19 đường số 8, phường Linh Xuân",
        district: "Thủ Đức",
        ward: "Linh Xuân",
        latitude: 10.8762,
        longitude: 106.7724,
        price: 1900000,
        deposit: 1900000,
        area: 17,
        electricityFee: 4500,
        waterFee: 120000,
        wifiFee: 80000,
        parkingFee: 100000,
        maxPeople: 2,
        currentPeople: 0,
        availableSlots: 2,
        hasContract: false,
        minStayMonths: 1,
        availableFrom: date("2026-06-05"),
        verificationStatus: "unverified",
        riskScore: 48,
        status: "warning",
      },
    },
    {
      key: "rented-room",
      ownerEmail: "owner1@example.com",
      data: {
        title: "Phòng yên tĩnh đã được thuê",
        description: "Phòng mẫu thể hiện trạng thái đã thuê.",
        address: "45 đường số 2, phường Hiệp Bình Chánh",
        district: "Thủ Đức",
        ward: "Hiệp Bình Chánh",
        latitude: 10.8317,
        longitude: 106.7315,
        price: 2800000,
        deposit: 2800000,
        area: 20,
        electricityFee: 3500,
        waterFee: 90000,
        wifiFee: 70000,
        parkingFee: 100000,
        maxPeople: 2,
        currentPeople: 2,
        availableSlots: 0,
        hasContract: true,
        minStayMonths: 6,
        verificationStatus: "verified",
        riskScore: 2,
        status: "rented",
      },
    },
    {
      key: "pending-room",
      ownerEmail: "owner2@example.com",
      data: {
        title: "Phòng mới đăng đang chờ duyệt",
        description: "Phòng mới, hệ thống đang chờ xác minh thông tin.",
        address: "74 đường Xô Viết Nghệ Tĩnh, phường 21",
        district: "Bình Thạnh",
        ward: "Phường 21",
        latitude: 10.7954,
        longitude: 106.7115,
        price: 3500000,
        deposit: 3500000,
        area: 23,
        electricityFee: 4000,
        waterFee: 120000,
        wifiFee: 90000,
        parkingFee: 150000,
        maxPeople: 2,
        currentPeople: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-07-10"),
        verificationStatus: "pending",
        riskScore: 15,
        status: "pending",
      },
    },
    {
      key: "hidden-cost",
      ownerEmail: "owner3@example.com",
      data: {
        title: "Phòng cảnh báo do báo cáo chi phí ẩn",
        description: "Bài đăng được giữ để minh họa quy trình cảnh báo rủi ro.",
        address: "101 đường Quang Trung, phường 8",
        district: "Gò Vấp",
        ward: "Phường 8",
        latitude: 10.8331,
        longitude: 106.6672,
        price: 2300000,
        deposit: 3000000,
        area: 19,
        electricityFee: 5000,
        waterFee: 180000,
        wifiFee: 120000,
        parkingFee: 150000,
        otherFee: 300000,
        maxPeople: 2,
        currentPeople: 0,
        availableSlots: 2,
        hasContract: false,
        minStayMonths: 1,
        availableFrom: date("2026-06-05"),
        verificationStatus: "unverified",
        riskScore: 68,
        status: "warning",
      },
    },
  ];

  for (const { key, ownerEmail, data } of roomData) {
    const room = await prisma.room.create({
      data: {
        ownerId: getUser(ownerEmail).id,
        ...data,
      },
    });
    rooms.set(key, room);
  }

  const getRoom = (key: string) => {
    const room = rooms.get(key);
    if (!room) {
      throw new Error(`Không tìm thấy phòng ${key}`);
    }
    return room;
  };

  const cloudinaryRoomImageBaseUrl = "https://res.cloudinary.com/dxtavkgyh/image/upload/roommate-finder/rooms";
  await prisma.roomImage.createMany({
    data: [...rooms.entries()].flatMap(([key, room]) => [
      {
        roomId: room.id,
        imageUrl: `${cloudinaryRoomImageBaseUrl}/${key}-cover.webp`,
        cloudinaryPublicId: `roommate-finder/rooms/${key}-cover`,
        isCover: true,
        sortOrder: 0,
      },
      {
        roomId: room.id,
        imageUrl: `${cloudinaryRoomImageBaseUrl}/${key}-gallery-1.webp`,
        cloudinaryPublicId: `roommate-finder/rooms/${key}-gallery-1`,
        isCover: false,
        sortOrder: 1,
      },
    ]),
  });

  const roomAmenityAssignments: Record<string, string[]> = {
    "linh-trung": ["Wifi", "WC riêng", "Chỗ gửi xe", "Camera", "Máy giặt"],
    "lang-dai-hoc": ["Wifi", "Gác lửng", "Chỗ gửi xe", "Bếp", "Giờ giấc tự do"],
    "binh-thanh-mini": ["Wifi", "Máy lạnh", "WC riêng", "Camera", "Ban công", "Máy nước nóng"],
    "di-an-student": ["Wifi", "Chỗ gửi xe", "Bếp"],
    "quan-10": ["Wifi", "Máy lạnh", "WC riêng", "Chỗ gửi xe", "Camera", "Tủ lạnh", "Máy nước nóng"],
    "go-vap-balcony": ["Wifi", "WC riêng", "Chỗ gửi xe", "Ban công", "Giờ giấc tự do"],
    "cheap-no-contract": ["Wifi", "Gác lửng", "Chỗ gửi xe"],
    "rented-room": ["Wifi", "WC riêng", "Chỗ gửi xe", "Camera"],
    "pending-room": ["Wifi", "Máy lạnh", "WC riêng", "Chỗ gửi xe", "Bếp"],
    "hidden-cost": ["Wifi", "Chỗ gửi xe", "Giờ giấc tự do"],
  };

  await prisma.roomAmenity.createMany({
    data: Object.entries(roomAmenityAssignments).flatMap(([roomKey, amenityNames]) =>
      amenityNames.map((amenityName) => ({
        roomId: getRoom(roomKey).id,
        amenityId: getAmenity(amenityName).id,
      })),
    ),
  });

  const roomRuleData = [
    ["linh-trung", false, false, false, "23:00", true, true, "Giữ yên tĩnh sau 22 giờ."],
    ["lang-dai-hoc", false, true, true, null, true, true, "Được nuôi thú cưng nhỏ."],
    ["binh-thanh-mini", false, false, true, "23:00", true, true, "Không hút thuốc trong phòng."],
    ["di-an-student", false, false, false, "22:30", true, true, "Không dẫn khách qua đêm."],
    ["quan-10", false, false, true, null, true, true, "Giờ giấc tự do, giữ vệ sinh chung."],
    ["go-vap-balcony", true, true, true, null, true, true, "Chỉ hút thuốc ngoài ban công."],
    ["cheap-no-contract", true, false, true, "23:00", false, true, "Cần hỏi kỹ chủ trọ về hợp đồng."],
    ["rented-room", false, false, false, "23:00", true, true, "Phòng đã có người thuê."],
    ["pending-room", false, true, true, null, true, true, "Thông tin nội quy đang được duyệt."],
    ["hidden-cost", true, false, true, null, false, true, "Cần xác nhận lại toàn bộ phụ phí."],
  ] as const;

  for (const [roomKey, allowSmoking, allowPet, allowGuest, curfewTime, cookingAllowed, parkingAllowed, note] of roomRuleData) {
    await prisma.roomRule.create({
      data: {
        roomId: getRoom(roomKey).id,
        allowSmoking,
        allowPet,
        allowGuest,
        curfewTime: curfewTime ? time(curfewTime) : null,
        cookingAllowed,
        parkingAllowed,
        note,
      },
    });
  }

  const requests = new Map<string, SearchRequest>();
  const searchRequestData = [
    ["student1@example.com", "Thủ Đức", 1800000, 3000000, 4, "HCMUS Linh Trung", true, true, true, "2026-06-15", "active"],
    ["student2@example.com", "Bình Thạnh", 2500000, 4000000, 5, "Đại học Bách Khoa", true, true, true, "2026-07-01", "active"],
    ["student3@example.com", "Thủ Đức", 1800000, 2800000, 6, "Đại học Sư phạm Kỹ thuật", false, true, false, "2026-06-20", "paused"],
    ["student4@example.com", "Dĩ An", 2000000, 3200000, 4, "Đại học Kinh tế - Luật", true, true, false, "2026-06-25", "active"],
    ["student5@example.com", "Quận 10", 2500000, 5000000, 7, "Đại học Bách Khoa", true, true, true, "2026-07-01", "active"],
    ["student6@example.com", "Bình Thạnh", 2800000, 5000000, 4, "Đại học Kinh tế - Luật", true, true, true, "2026-07-10", "active"],
    ["student7@example.com", "Gò Vấp", 1800000, 2500000, 8, "Đại học Sư phạm Kỹ thuật", false, true, false, "2026-06-05", "closed"],
    ["student8@example.com", "Thủ Đức", 2000000, 3500000, 3, "HCMUS Linh Trung", true, true, true, "2026-06-15", "active"],
  ] as const;

  for (const [email, targetDistrict, budgetMin, budgetMax, maxDistanceKm, schoolOrWorkplace, needContract, needParking, needPrivateWc, preferredMoveInDate, status] of searchRequestData) {
    const request = await prisma.searchRequest.create({
      data: {
        userId: getUser(email).id,
        targetDistrict,
        budgetMin,
        budgetMax,
        maxDistanceKm,
        schoolOrWorkplace,
        needContract,
        needParking,
        needPrivateWc,
        preferredMoveInDate: date(preferredMoveInDate),
        status,
      },
    });
    requests.set(email, request);
  }

  const getRequest = (email: string) => {
    const request = requests.get(email);
    if (!request) {
      throw new Error(`Không tìm thấy yêu cầu tìm phòng của ${email}`);
    }
    return request;
  };

  const matchingData = [
    ["student1@example.com", null, "linh-trung", [96, 98, 90, 92, 95, 4], "Phù hợp ngân sách, gần trường, có hợp đồng rõ ràng, rủi ro thấp.", "suggested"],
    ["student1@example.com", null, "cheap-no-contract", [98, 88, 75, 70, 55, 48], "Giá tốt nhưng điểm rủi ro cao do thiếu hợp đồng rõ ràng.", "viewed"],
    ["student2@example.com", null, "binh-thanh-mini", [90, 95, 88, 94, 92, 3], "Phòng gần khu vực mong muốn, có WC riêng và nhiều tiện ích.", "accepted"],
    ["student3@example.com", null, "lang-dai-hoc", [92, 90, 72, 84, 88, 6], "Giá phù hợp, thuận tiện đi học và có chỗ gửi xe.", "suggested"],
    ["student4@example.com", null, "di-an-student", [98, 96, 86, 78, 89, 8], "Chi phí thấp, gần khu vực mong muốn và phù hợp sinh viên.", "viewed"],
    ["student5@example.com", null, "quan-10", [82, 94, 80, 96, 86, 12], "Nhiều tiện ích và gần trường nhưng bài đăng đang chờ xác minh.", "suggested"],
    ["student6@example.com", null, "pending-room", [88, 92, 85, 90, 78, 15], "Phòng gần khu vực mong muốn nhưng bài đăng chưa xác minh.", "rejected"],
    ["student7@example.com", null, "go-vap-balcony", [64, 96, 68, 80, 82, 7], "Vị trí phù hợp nhưng giá hơi cao so với ngân sách.", "expired"],
    ["student8@example.com", null, "linh-trung", [94, 99, 92, 90, 95, 4], "Gần HCMUS, có hợp đồng và điểm tin cậy cao.", "accepted"],
    ["student8@example.com", null, "hidden-cost", [90, 60, 70, 62, 40, 68], "Giá phòng vừa tầm nhưng rủi ro cao do có báo cáo chi phí ẩn.", "rejected"],
    ["student1@example.com", "student4@example.com", null, [90, 88, 96, 82, 94, 2], "Lối sống tương đồng, cùng ưu tiên yên tĩnh và không hút thuốc.", "suggested"],
    ["student2@example.com", "student6@example.com", "binh-thanh-mini", [88, 96, 92, 90, 93, 3], "Cùng tìm phòng Bình Thạnh, ngân sách và thói quen sinh hoạt phù hợp.", "accepted"],
    ["student3@example.com", "student7@example.com", null, [94, 80, 62, 70, 72, 10], "Ngân sách tương đồng nhưng cần trao đổi thêm về hút thuốc và vệ sinh.", "viewed"],
    ["student4@example.com", "student8@example.com", "lang-dai-hoc", [91, 86, 94, 84, 92, 5], "Cùng ưu tiên hợp đồng rõ ràng và sinh hoạt điều độ.", "suggested"],
    ["student5@example.com", "student2@example.com", null, [86, 82, 78, 90, 88, 4], "Có thể ghép phòng, cùng thích nấu ăn và chấp nhận thú cưng.", "expired"],
  ] as const;

  for (const [email, matchedEmail, roomKey, rawScores, reason, status] of matchingData) {
    const [budgetScore, locationScore, lifestyleScore, amenityScore, trustScore, riskScore] = rawScores;
    await prisma.matchingResult.create({
      data: {
        requestId: getRequest(email).id,
        userId: getUser(email).id,
        matchedUserId: matchedEmail ? getUser(matchedEmail).id : null,
        roomId: roomKey ? getRoom(roomKey).id : null,
        ...calculateScores({
          budgetScore,
          locationScore,
          lifestyleScore,
          amenityScore,
          trustScore,
          riskScore,
        }),
        reason,
        status,
      },
    });
  }

  const reviews: Prisma.ReviewUncheckedCreateInput[] = [
    ["student1@example.com", null, "linh-trung", 5, "Phòng sạch, đúng mô tả, chủ nhà hỗ trợ tốt.", "room", true],
    ["student2@example.com", null, "binh-thanh-mini", 4, "Phòng thoáng và tiện đi học, phí gửi xe hơi cao.", "room", true],
    ["student3@example.com", null, "lang-dai-hoc", 4, "Gác rộng, phù hợp ở ghép sinh viên.", "room", true],
    ["student4@example.com", null, "di-an-student", 5, "Giá hợp lý và khu vực khá yên tĩnh.", "room", true],
    ["student5@example.com", null, "quan-10", 3, "Phòng ổn nhưng cần ghi rõ hơn về tiền điện nước.", "room", true],
    ["student6@example.com", null, "pending-room", 3, "Thông tin phòng chưa đầy đủ, cần bổ sung hình ảnh.", "room", false],
    ["student7@example.com", null, "hidden-cost", 1, "Có nhiều khoản phí phát sinh chưa được nêu rõ.", "room", true],
    ["student8@example.com", "student1@example.com", null, 5, "Bạn ở ghép giữ vệ sinh tốt, sinh hoạt yên tĩnh.", "roommate", true],
    ["student1@example.com", "student4@example.com", null, 5, "Trao đổi lịch sự và có giờ giấc phù hợp.", "roommate", true],
    ["student2@example.com", "student6@example.com", null, 4, "Có ý thức dọn dẹp và chia sẻ công việc chung.", "roommate", true],
    ["student3@example.com", "student7@example.com", null, 2, "Cần thống nhất kỹ hơn về việc hút thuốc.", "roommate", false],
    ["student1@example.com", "owner1@example.com", null, 5, "Chủ trọ phản hồi nhanh, hợp đồng rõ ràng.", "owner", true],
    ["student2@example.com", "owner2@example.com", null, 4, "Chủ nhà hỗ trợ tốt và cung cấp đủ thông tin.", "owner", true],
    ["student7@example.com", "owner3@example.com", null, 2, "Thông tin tiền điện nước cần ghi rõ hơn.", "owner", true],
    ["student8@example.com", "owner1@example.com", null, 5, "Tư vấn nhiệt tình, phòng đúng hình ảnh.", "owner", true],
  ].map(([reviewerEmail, reviewedEmail, roomKey, rating, comment, reviewType, isVisible]) => ({
    reviewerId: getUser(reviewerEmail as string).id,
    reviewedUserId: reviewedEmail ? getUser(reviewedEmail as string).id : null,
    roomId: roomKey ? getRoom(roomKey as string).id : null,
    rating: rating as number,
    comment: comment as string,
    reviewType: reviewType as "room" | "roommate" | "owner",
    isVisible: isVisible as boolean,
  }));
  await prisma.review.createMany({ data: reviews });

  const riskReports: Prisma.RiskReportUncheckedCreateInput[] = [
    ["student1@example.com", "cheap-no-contract", "owner3@example.com", "unclear_contract", "Bài đăng ghi có hợp đồng nhưng khi liên hệ lại nói chỉ thỏa thuận miệng.", null, "high", "reviewing", "admin@example.com"],
    ["student7@example.com", "hidden-cost", "owner3@example.com", "hidden_cost", "Phí điện nước thực tế cao hơn nhiều so với mô tả.", "https://res.cloudinary.com/demo/image/upload/sample.jpg", "high", "resolved", "admin@example.com"],
    ["student5@example.com", null, "owner3@example.com", "deposit_scam", "Người đăng yêu cầu chuyển cọc trước khi xem phòng.", null, "high", "pending", null],
    ["student6@example.com", "pending-room", null, "wrong_information", "Thông tin diện tích phòng không đúng với thực tế.", null, "medium", "reviewing", "admin@example.com"],
    ["student2@example.com", "hidden-cost", null, "unsafe_location", "Lối vào phòng thiếu đèn và khá vắng vào buổi tối.", null, "medium", "pending", null],
    ["student4@example.com", null, "student7@example.com", "bad_roommate_behavior", "Bạn ở ghép thường xuyên hút thuốc trong phòng dù đã thống nhất trước.", null, "medium", "resolved", "admin@example.com"],
    ["student8@example.com", "cheap-no-contract", "owner3@example.com", "fake_post", "Hình ảnh bài đăng khác nhiều so với phòng được dẫn đi xem.", "https://res.cloudinary.com/demo/image/upload/docs/models.jpg", "high", "rejected", "admin@example.com"],
    ["student3@example.com", "go-vap-balcony", null, "other", "Cần bổ sung hướng dẫn rõ hơn về khu vực gửi xe.", null, "low", "pending", null],
  ].map(([reporterEmail, roomKey, reportedEmail, riskType, description, evidenceUrl, severity, status, handlerEmail]) => ({
    reporterId: getUser(reporterEmail as string).id,
    roomId: roomKey ? getRoom(roomKey as string).id : null,
    reportedUserId: reportedEmail ? getUser(reportedEmail as string).id : null,
    riskType: riskType as Prisma.RiskReportUncheckedCreateInput["riskType"],
    description: description as string,
    evidenceUrl: evidenceUrl as string | null,
    severity: severity as Prisma.RiskReportUncheckedCreateInput["severity"],
    status: status as Prisma.RiskReportUncheckedCreateInput["status"],
    handledBy: handlerEmail ? getUser(handlerEmail as string).id : null,
  }));
  await prisma.riskReport.createMany({ data: riskReports });

  const counts = {
    users: await prisma.user.count(),
    user_profiles: await prisma.userProfile.count(),
    lifestyle_profiles: await prisma.lifestyleProfile.count(),
    rooms: await prisma.room.count(),
    room_images: await prisma.roomImage.count(),
    amenities: await prisma.amenity.count(),
    room_amenities: await prisma.roomAmenity.count(),
    room_rules: await prisma.roomRule.count(),
    search_requests: await prisma.searchRequest.count(),
    matching_results: await prisma.matchingResult.count(),
    reviews: await prisma.review.count(),
    risk_reports: await prisma.riskReport.count(),
  };

  console.log("\nSeed database mẫu thành công.");
  console.table(counts);
  console.log(`
Tài khoản demo:
  Admin:   admin@example.com   / ${demoPassword}
  Owner:   owner1@example.com  / ${demoPassword}
  Student: student1@example.com / ${demoPassword}
`);
}

main()
  .catch((error) => {
    console.error("Seed database thất bại:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
