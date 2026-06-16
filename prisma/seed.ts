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
  console.log("Äang xÃ³a dá»¯ liá»‡u máº«u cÅ©...");
  await resetDatabase();

  const passwordHash = await hash(demoPassword, 10);
  const users = new Map<string, User>();
  const userData: Array<Prisma.UserCreateInput & { email: string }> = [
    {
      fullName: "Quáº£n trá»‹ viÃªn há»‡ thá»‘ng",
      email: "admin@example.com",
      phone: "0900000001",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      gender: "unknown",
      role: "ADMIN",
      status: "APPROVED",
      reputationScore: 5,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "Nguyá»…n HoÃ ng Nam",
      email: "owner1@example.com",
      phone: "0901000001",
      avatarUrl: "https://i.pravatar.cc/150?img=11",
      gender: "male",
      role: "LANDLORD",
      status: "APPROVED",
      reputationScore: 4.8,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "Tráº§n Thu HÆ°Æ¡ng",
      email: "owner2@example.com",
      phone: "0901000002",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      gender: "female",
      role: "LANDLORD",
      status: "APPROVED",
      reputationScore: 4.5,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "LÃª Minh KhÃ´i",
      email: "owner3@example.com",
      phone: "0901000003",
      avatarUrl: "https://i.pravatar.cc/150?img=13",
      gender: "male",
      role: "LANDLORD",
      status: "APPROVED",
      reputationScore: 3.9,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "Pháº¡m Gia Báº£o",
      email: "student1@example.com",
      phone: "0912000001",
      avatarUrl: "https://i.pravatar.cc/150?img=14",
      gender: "male",
      role: "STUDENT",
      status: "APPROVED",
      reputationScore: 4.7,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "VÃµ Ngá»c Anh",
      email: "student2@example.com",
      phone: "0912000002",
      avatarUrl: "https://i.pravatar.cc/150?img=45",
      gender: "female",
      role: "STUDENT",
      status: "APPROVED",
      reputationScore: 4.6,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "Äáº·ng Quá»‘c Huy",
      email: "student3@example.com",
      phone: "0912000003",
      avatarUrl: "https://i.pravatar.cc/150?img=15",
      gender: "male",
      role: "STUDENT",
      status: "APPROVED",
      reputationScore: 4.1,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "BÃ¹i Thanh Mai",
      email: "student4@example.com",
      phone: "0912000004",
      avatarUrl: "https://i.pravatar.cc/150?img=44",
      gender: "female",
      role: "STUDENT",
      status: "APPROVED",
      reputationScore: 4.9,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "Huá»³nh Minh TÃº",
      email: "student5@example.com",
      phone: "0912000005",
      avatarUrl: "https://i.pravatar.cc/150?img=16",
      gender: "other",
      role: "STUDENT",
      status: "APPROVED",
      reputationScore: 3.8,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "Äá»— Tháº£o Vy",
      email: "student6@example.com",
      phone: "0912000006",
      avatarUrl: "https://i.pravatar.cc/150?img=43",
      gender: "female",
      role: "STUDENT",
      status: "APPROVED",
      reputationScore: 4.4,
      isActive: true,
      password: passwordHash,
    },
    {
      fullName: "NgÃ´ ThÃ nh Äáº¡t",
      email: "student7@example.com",
      phone: "0912000007",
      avatarUrl: "https://i.pravatar.cc/150?img=17",
      gender: "male",
      role: "STUDENT",
      status: "REJECTED",
      reputationScore: 3.5,
      isActive: false,
      password: passwordHash,
    },
    {
      fullName: "DÆ°Æ¡ng KhÃ¡nh Linh",
      email: "student8@example.com",
      phone: "0912000008",
      avatarUrl: "https://i.pravatar.cc/150?img=42",
      gender: "unknown",
      role: "STUDENT",
      status: "APPROVED",
      reputationScore: 4.2,
      isActive: true,
      password: passwordHash,
    },
  ];

  for (const data of userData) {
    const user = await prisma.user.create({ data });
    users.set(user.email, user);
  }

  const getUser = (email: string) => {
    const user = users.get(email);
    if (!user) {
      throw new Error(`KhÃ´ng tÃ¬m tháº¥y user ${email}`);
    }
    return user;
  };

  const profileData = [
    ["admin@example.com", "Äáº¡i há»c Khoa há»c Tá»± nhiÃªn - ÄHQG TP.HCM", "CÃ´ng nghá»‡ thÃ´ng tin", 1995, "Thá»§ Äá»©c", "Thá»§ Äá»©c", "Quáº£n trá»‹ viÃªn há»— trá»£ xá»­ lÃ½ bÃ¡o cÃ¡o.", "high"],
    ["owner1@example.com", "Äáº¡i há»c BÃ¡ch Khoa", "Ká»¹ thuáº­t pháº§n má»m", 1988, "Thá»§ Äá»©c", "Thá»§ Äá»©c", "Chá»§ trá» Æ°u tiÃªn sinh viÃªn thuÃª lÃ¢u dÃ i.", "medium"],
    ["owner2@example.com", "Äáº¡i há»c Kinh táº¿ - Luáº­t", "Quáº£n trá»‹ kinh doanh", 1990, "BÃ¬nh Tháº¡nh", "BÃ¬nh Tháº¡nh", "Quáº£n lÃ½ phÃ²ng trá» minh báº¡ch, há»— trá»£ nhanh.", "medium"],
    ["owner3@example.com", "Äáº¡i há»c SÆ° pháº¡m Ká»¹ thuáº­t", "Káº¿ toÃ¡n", 1987, "DÄ© An", "DÄ© An", "CÃ³ nhiá»u phÃ²ng giÃ¡ phÃ¹ há»£p sinh viÃªn.", "low"],
    ["student1@example.com", "Äáº¡i há»c Khoa há»c Tá»± nhiÃªn - ÄHQG TP.HCM", "CÃ´ng nghá»‡ thÃ´ng tin", 2005, "Thá»§ Äá»©c", "Thá»§ Äá»©c", "TÃ¬m phÃ²ng yÃªn tÄ©nh Ä‘á»ƒ há»c táº­p.", "high"],
    ["student2@example.com", "Äáº¡i há»c BÃ¡ch Khoa", "Khoa há»c dá»¯ liá»‡u", 2004, "Quáº­n 10", "BÃ¬nh Tháº¡nh", "ThÃ­ch náº¥u Äƒn vÃ  giá»¯ phÃ²ng sáº¡ch sáº½.", "medium"],
    ["student3@example.com", "Äáº¡i há»c SÆ° pháº¡m Ká»¹ thuáº­t", "Ká»¹ thuáº­t pháº§n má»m", 2005, "GÃ² Váº¥p", "Thá»§ Äá»©c", "Æ¯u tiÃªn nÆ¡i cÃ³ chá»— gá»­i xe.", "low"],
    ["student4@example.com", "Äáº¡i há»c Kinh táº¿ - Luáº­t", "Quáº£n trá»‹ kinh doanh", 2004, "DÄ© An", "DÄ© An", "TÃ¬m báº¡n á»Ÿ ghÃ©p ná»¯, sinh hoáº¡t Ä‘iá»u Ä‘á»™.", "high"],
    ["student5@example.com", "Äáº¡i há»c BÃ¡ch Khoa", "CÃ´ng nghá»‡ thÃ´ng tin", 2003, "Quáº­n 10", "Quáº­n 10", "CÃ³ thá»ƒ á»Ÿ ghÃ©p vÃ  nuÃ´i mÃ¨o.", "medium"],
    ["student6@example.com", "Äáº¡i há»c Kinh táº¿ - Luáº­t", "Káº¿ toÃ¡n", 2005, "BÃ¬nh Tháº¡nh", "BÃ¬nh Tháº¡nh", "Æ¯u tiÃªn phÃ²ng cÃ³ WC riÃªng.", "high"],
    ["student7@example.com", "Äáº¡i há»c SÆ° pháº¡m Ká»¹ thuáº­t", "Ká»¹ thuáº­t pháº§n má»m", 2004, "GÃ² Váº¥p", "GÃ² Váº¥p", "TÃ¬m phÃ²ng chi phÃ­ tháº¥p.", "unknown"],
    ["student8@example.com", "Äáº¡i há»c Khoa há»c Tá»± nhiÃªn - ÄHQG TP.HCM", "Khoa há»c dá»¯ liá»‡u", 2005, "Thá»§ Äá»©c", "Thá»§ Äá»©c", "Muá»‘n á»Ÿ gáº§n trÆ°á»ng vÃ  cÃ³ há»£p Ä‘á»“ng.", "medium"],
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
    ["MÃ¡y láº¡nh", "air-conditioner"],
    ["GÃ¡c lá»­ng", "loft"],
    ["WC riÃªng", "toilet"],
    ["Chá»— gá»­i xe", "parking"],
    ["Camera", "camera"],
    ["Báº¿p", "kitchen"],
    ["MÃ¡y giáº·t", "washing-machine"],
    ["Ban cÃ´ng", "balcony"],
    ["Giá» giáº¥c tá»± do", "clock"],
    ["Tá»§ láº¡nh", "fridge"],
    ["MÃ¡y nÆ°á»›c nÃ³ng", "water-heater"],
  ] as const;

  await prisma.amenity.createMany({
    data: amenities.map(([name, icon]) => ({ name, icon })),
  });
  const amenityMap = new Map((await prisma.amenity.findMany()).map((amenity) => [amenity.name, amenity]));

  const getAmenity = (name: string) => {
    const amenity = amenityMap.get(name);
    if (!amenity) {
      throw new Error(`KhÃ´ng tÃ¬m tháº¥y tiá»‡n Ã­ch ${name}`);
    }
    return amenity;
  };

  const rooms = new Map<string, Room>();
  const roomData: Array<{ key: string; ownerEmail: string; data: Omit<Prisma.RoomUncheckedCreateInput, "landlordId"> }> = [
    {
      key: "linh-trung",
      ownerEmail: "owner1@example.com",
      data: {
        title: "PhÃ²ng trá» gáº§n HCMUS cÆ¡ sá»Ÿ Linh Trung",
        description: "PhÃ²ng sáº¡ch, an ninh, phÃ¹ há»£p sinh viÃªn há»c táº¡i khu Äáº¡i há»c Quá»‘c gia.",
        address: "12 Ä‘Æ°á»ng sá»‘ 4, phÆ°á»ng Linh Trung",
        district: "Thá»§ Äá»©c",
        ward: "Linh Trung",
        latitude: 10.8563,
        longitude: 106.7719,
        price: 2500000,
        deposit: 2500000,
        area: 22,
        electricPrice: 3500,
        waterPrice: 100000,
        wifiFee: 80000,
        parkingFee: 100000,
        maxOccupants: 2,
        currentOccupants: 1,
        availableSlots: 1,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-06-15"),
        verificationStatus: "verified",
        riskScore: 4,
        status: "ACTIVE",
      },
    },
    {
      key: "lang-dai-hoc",
      ownerEmail: "owner1@example.com",
      data: {
        title: "PhÃ²ng cÃ³ gÃ¡c gáº§n LÃ ng Äáº¡i há»c",
        description: "PhÃ²ng cÃ³ gÃ¡c lá»­ng, báº¿p nhá» vÃ  chá»— Ä‘á»ƒ xe trong nhÃ .",
        address: "68 Ä‘Æ°á»ng TÃ¢n Láº­p, phÆ°á»ng ÄÃ´ng HÃ²a",
        district: "DÄ© An",
        ward: "ÄÃ´ng HÃ²a",
        latitude: 10.8768,
        longitude: 106.8012,
        price: 2200000,
        deposit: 2200000,
        area: 24,
        electricPrice: 3500,
        waterPrice: 90000,
        wifiFee: 70000,
        parkingFee: 0,
        maxOccupants: 3,
        currentOccupants: 1,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-06-20"),
        verificationStatus: "verified",
        riskScore: 6,
        status: "ACTIVE",
      },
    },
    {
      key: "binh-thanh-mini",
      ownerEmail: "owner2@example.com",
      data: {
        title: "PhÃ²ng mini BÃ¬nh Tháº¡nh gáº§n báº¿n xe buÃ½t",
        description: "Thuáº­n tiá»‡n Ä‘i trung tÃ¢m, cÃ³ ban cÃ´ng thoÃ¡ng mÃ¡t.",
        address: "115 Ä‘Æ°á»ng Nguyá»…n Gia TrÃ­, phÆ°á»ng 25",
        district: "BÃ¬nh Tháº¡nh",
        ward: "PhÆ°á»ng 25",
        latitude: 10.8032,
        longitude: 106.7168,
        price: 3800000,
        deposit: 3800000,
        area: 26,
        electricPrice: 4000,
        waterPrice: 120000,
        wifiFee: 100000,
        parkingFee: 150000,
        maxOccupants: 2,
        currentOccupants: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-07-01"),
        verificationStatus: "verified",
        riskScore: 3,
        status: "ACTIVE",
      },
    },
    {
      key: "di-an-student",
      ownerEmail: "owner3@example.com",
      data: {
        title: "PhÃ²ng trá» DÄ© An giÃ¡ sinh viÃªn",
        description: "Chi phÃ­ há»£p lÃ½, gáº§n chá»£ vÃ  tráº¡m xe buÃ½t.",
        address: "22 Ä‘Æ°á»ng LÃ½ ThÆ°á»ng Kiá»‡t, phÆ°á»ng DÄ© An",
        district: "DÄ© An",
        ward: "DÄ© An",
        latitude: 10.9051,
        longitude: 106.7694,
        price: 1800000,
        deposit: 1000000,
        area: 18,
        electricPrice: 3500,
        waterPrice: 80000,
        wifiFee: 60000,
        parkingFee: 50000,
        maxOccupants: 2,
        currentOccupants: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 3,
        availableFrom: date("2026-06-10"),
        verificationStatus: "verified",
        riskScore: 8,
        status: "ACTIVE",
      },
    },
    {
      key: "quan-10",
      ownerEmail: "owner2@example.com",
      data: {
        title: "PhÃ²ng Quáº­n 10 gáº§n trÆ°á»ng Ä‘áº¡i há»c",
        description: "PhÃ²ng Ä‘áº§y Ä‘á»§ tiá»‡n nghi cÆ¡ báº£n, khu vá»±c Ä‘Ã´ng sinh viÃªn.",
        address: "235 Ä‘Æ°á»ng TÃ´ Hiáº¿n ThÃ nh, phÆ°á»ng 13",
        district: "Quáº­n 10",
        ward: "PhÆ°á»ng 13",
        latitude: 10.7747,
        longitude: 106.6679,
        price: 5000000,
        deposit: 5000000,
        area: 30,
        electricPrice: 4000,
        waterPrice: 150000,
        wifiFee: 100000,
        parkingFee: 200000,
        maxOccupants: 2,
        currentOccupants: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 12,
        availableFrom: date("2026-07-01"),
        verificationStatus: "pending",
        riskScore: 12,
        status: "PENDING",
      },
    },
    {
      key: "go-vap-balcony",
      ownerEmail: "owner3@example.com",
      data: {
        title: "PhÃ²ng cÃ³ ban cÃ´ng, giá» giáº¥c tá»± do",
        description: "CÃ³ ban cÃ´ng vÃ  lá»‘i Ä‘i riÃªng, phÃ¹ há»£p ngÆ°á»i Ä‘i lÃ m thÃªm.",
        address: "80 Ä‘Æ°á»ng Phan VÄƒn Trá»‹, phÆ°á»ng 10",
        district: "GÃ² Váº¥p",
        ward: "PhÆ°á»ng 10",
        latitude: 10.8297,
        longitude: 106.6809,
        price: 3200000,
        deposit: 2000000,
        area: 25,
        electricPrice: 3800,
        waterPrice: 100000,
        wifiFee: 80000,
        parkingFee: 100000,
        maxOccupants: 2,
        currentOccupants: 1,
        availableSlots: 1,
        hasContract: true,
        minStayMonths: 3,
        availableFrom: date("2026-06-25"),
        verificationStatus: "verified",
        riskScore: 7,
        status: "ACTIVE",
      },
    },
    {
      key: "cheap-no-contract",
      ownerEmail: "owner3@example.com",
      data: {
        title: "PhÃ²ng giÃ¡ ráº» nhÆ°ng thiáº¿u há»£p Ä‘á»“ng rÃµ rÃ ng",
        description: "PhÃ²ng giÃ¡ tháº¥p, thÃ´ng tin há»£p Ä‘á»“ng Ä‘ang cáº§n bá»• sung.",
        address: "19 Ä‘Æ°á»ng sá»‘ 8, phÆ°á»ng Linh XuÃ¢n",
        district: "Thá»§ Äá»©c",
        ward: "Linh XuÃ¢n",
        latitude: 10.8762,
        longitude: 106.7724,
        price: 1900000,
        deposit: 1900000,
        area: 17,
        electricPrice: 4500,
        waterPrice: 120000,
        wifiFee: 80000,
        parkingFee: 100000,
        maxOccupants: 2,
        currentOccupants: 0,
        availableSlots: 2,
        hasContract: false,
        minStayMonths: 1,
        availableFrom: date("2026-06-05"),
        verificationStatus: "unverified",
        riskScore: 48,
        status: "WARNING",
      },
    },
    {
      key: "rented-room",
      ownerEmail: "owner1@example.com",
      data: {
        title: "PhÃ²ng yÃªn tÄ©nh Ä‘Ã£ Ä‘Æ°á»£c thuÃª",
        description: "PhÃ²ng máº«u thá»ƒ hiá»‡n tráº¡ng thÃ¡i Ä‘Ã£ thuÃª.",
        address: "45 Ä‘Æ°á»ng sá»‘ 2, phÆ°á»ng Hiá»‡p BÃ¬nh ChÃ¡nh",
        district: "Thá»§ Äá»©c",
        ward: "Hiá»‡p BÃ¬nh ChÃ¡nh",
        latitude: 10.8317,
        longitude: 106.7315,
        price: 2800000,
        deposit: 2800000,
        area: 20,
        electricPrice: 3500,
        waterPrice: 90000,
        wifiFee: 70000,
        parkingFee: 100000,
        maxOccupants: 2,
        currentOccupants: 2,
        availableSlots: 0,
        hasContract: true,
        minStayMonths: 6,
        verificationStatus: "verified",
        riskScore: 2,
        status: "RENTED",
      },
    },
    {
      key: "pending-room",
      ownerEmail: "owner2@example.com",
      data: {
        title: "PhÃ²ng má»›i Ä‘Äƒng Ä‘ang chá» duyá»‡t",
        description: "PhÃ²ng má»›i, há»‡ thá»‘ng Ä‘ang chá» xÃ¡c minh thÃ´ng tin.",
        address: "74 Ä‘Æ°á»ng XÃ´ Viáº¿t Nghá»‡ TÄ©nh, phÆ°á»ng 21",
        district: "BÃ¬nh Tháº¡nh",
        ward: "PhÆ°á»ng 21",
        latitude: 10.7954,
        longitude: 106.7115,
        price: 3500000,
        deposit: 3500000,
        area: 23,
        electricPrice: 4000,
        waterPrice: 120000,
        wifiFee: 90000,
        parkingFee: 150000,
        maxOccupants: 2,
        currentOccupants: 0,
        availableSlots: 2,
        hasContract: true,
        minStayMonths: 6,
        availableFrom: date("2026-07-10"),
        verificationStatus: "pending",
        riskScore: 15,
        status: "PENDING",
      },
    },
    {
      key: "hidden-cost",
      ownerEmail: "owner3@example.com",
      data: {
        title: "PhÃ²ng cáº£nh bÃ¡o do bÃ¡o cÃ¡o chi phÃ­ áº©n",
        description: "BÃ i Ä‘Äƒng Ä‘Æ°á»£c giá»¯ Ä‘á»ƒ minh há»a quy trÃ¬nh cáº£nh bÃ¡o rá»§i ro.",
        address: "101 Ä‘Æ°á»ng Quang Trung, phÆ°á»ng 8",
        district: "GÃ² Váº¥p",
        ward: "PhÆ°á»ng 8",
        latitude: 10.8331,
        longitude: 106.6672,
        price: 2300000,
        deposit: 3000000,
        area: 19,
        electricPrice: 5000,
        waterPrice: 180000,
        wifiFee: 120000,
        parkingFee: 150000,
        serviceFee: 300000,
        maxOccupants: 2,
        currentOccupants: 0,
        availableSlots: 2,
        hasContract: false,
        minStayMonths: 1,
        availableFrom: date("2026-06-05"),
        verificationStatus: "unverified",
        riskScore: 68,
        status: "WARNING",
      },
    },
  ];

  for (const { key, ownerEmail, data } of roomData) {
    const room = await prisma.room.create({
      data: {
        landlordId: getUser(ownerEmail).id,
        ...data,
      },
    });
    rooms.set(key, room);
  }

  const getRoom = (key: string) => {
    const room = rooms.get(key);
    if (!room) {
      throw new Error(`KhÃ´ng tÃ¬m tháº¥y phÃ²ng ${key}`);
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
    "linh-trung": ["Wifi", "WC riÃªng", "Chá»— gá»­i xe", "Camera", "MÃ¡y giáº·t"],
    "lang-dai-hoc": ["Wifi", "GÃ¡c lá»­ng", "Chá»— gá»­i xe", "Báº¿p", "Giá» giáº¥c tá»± do"],
    "binh-thanh-mini": ["Wifi", "MÃ¡y láº¡nh", "WC riÃªng", "Camera", "Ban cÃ´ng", "MÃ¡y nÆ°á»›c nÃ³ng"],
    "di-an-student": ["Wifi", "Chá»— gá»­i xe", "Báº¿p"],
    "quan-10": ["Wifi", "MÃ¡y láº¡nh", "WC riÃªng", "Chá»— gá»­i xe", "Camera", "Tá»§ láº¡nh", "MÃ¡y nÆ°á»›c nÃ³ng"],
    "go-vap-balcony": ["Wifi", "WC riÃªng", "Chá»— gá»­i xe", "Ban cÃ´ng", "Giá» giáº¥c tá»± do"],
    "cheap-no-contract": ["Wifi", "GÃ¡c lá»­ng", "Chá»— gá»­i xe"],
    "rented-room": ["Wifi", "WC riÃªng", "Chá»— gá»­i xe", "Camera"],
    "pending-room": ["Wifi", "MÃ¡y láº¡nh", "WC riÃªng", "Chá»— gá»­i xe", "Báº¿p"],
    "hidden-cost": ["Wifi", "Chá»— gá»­i xe", "Giá» giáº¥c tá»± do"],
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
    ["linh-trung", false, false, false, "23:00", true, true, "Giá»¯ yÃªn tÄ©nh sau 22 giá»."],
    ["lang-dai-hoc", false, true, true, null, true, true, "ÄÆ°á»£c nuÃ´i thÃº cÆ°ng nhá»."],
    ["binh-thanh-mini", false, false, true, "23:00", true, true, "KhÃ´ng hÃºt thuá»‘c trong phÃ²ng."],
    ["di-an-student", false, false, false, "22:30", true, true, "KhÃ´ng dáº«n khÃ¡ch qua Ä‘Ãªm."],
    ["quan-10", false, false, true, null, true, true, "Giá» giáº¥c tá»± do, giá»¯ vá»‡ sinh chung."],
    ["go-vap-balcony", true, true, true, null, true, true, "Chá»‰ hÃºt thuá»‘c ngoÃ i ban cÃ´ng."],
    ["cheap-no-contract", true, false, true, "23:00", false, true, "Cáº§n há»i ká»¹ chá»§ trá» vá» há»£p Ä‘á»“ng."],
    ["rented-room", false, false, false, "23:00", true, true, "PhÃ²ng Ä‘Ã£ cÃ³ ngÆ°á»i thuÃª."],
    ["pending-room", false, true, true, null, true, true, "ThÃ´ng tin ná»™i quy Ä‘ang Ä‘Æ°á»£c duyá»‡t."],
    ["hidden-cost", true, false, true, null, false, true, "Cáº§n xÃ¡c nháº­n láº¡i toÃ n bá»™ phá»¥ phÃ­."],
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
    ["student1@example.com", "Thá»§ Äá»©c", 1800000, 3000000, 4, "HCMUS Linh Trung", true, true, true, "2026-06-15", "active"],
    ["student2@example.com", "BÃ¬nh Tháº¡nh", 2500000, 4000000, 5, "Äáº¡i há»c BÃ¡ch Khoa", true, true, true, "2026-07-01", "active"],
    ["student3@example.com", "Thá»§ Äá»©c", 1800000, 2800000, 6, "Äáº¡i há»c SÆ° pháº¡m Ká»¹ thuáº­t", false, true, false, "2026-06-20", "paused"],
    ["student4@example.com", "DÄ© An", 2000000, 3200000, 4, "Äáº¡i há»c Kinh táº¿ - Luáº­t", true, true, false, "2026-06-25", "active"],
    ["student5@example.com", "Quáº­n 10", 2500000, 5000000, 7, "Äáº¡i há»c BÃ¡ch Khoa", true, true, true, "2026-07-01", "active"],
    ["student6@example.com", "BÃ¬nh Tháº¡nh", 2800000, 5000000, 4, "Äáº¡i há»c Kinh táº¿ - Luáº­t", true, true, true, "2026-07-10", "active"],
    ["student7@example.com", "GÃ² Váº¥p", 1800000, 2500000, 8, "Äáº¡i há»c SÆ° pháº¡m Ká»¹ thuáº­t", false, true, false, "2026-06-05", "closed"],
    ["student8@example.com", "Thá»§ Äá»©c", 2000000, 3500000, 3, "HCMUS Linh Trung", true, true, true, "2026-06-15", "active"],
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
      throw new Error(`KhÃ´ng tÃ¬m tháº¥y yÃªu cáº§u tÃ¬m phÃ²ng cá»§a ${email}`);
    }
    return request;
  };

  const matchingData = [
    ["student1@example.com", null, "linh-trung", [96, 98, 90, 92, 95, 4], "PhÃ¹ há»£p ngÃ¢n sÃ¡ch, gáº§n trÆ°á»ng, cÃ³ há»£p Ä‘á»“ng rÃµ rÃ ng, rá»§i ro tháº¥p.", "suggested"],
    ["student1@example.com", null, "cheap-no-contract", [98, 88, 75, 70, 55, 48], "GiÃ¡ tá»‘t nhÆ°ng Ä‘iá»ƒm rá»§i ro cao do thiáº¿u há»£p Ä‘á»“ng rÃµ rÃ ng.", "viewed"],
    ["student2@example.com", null, "binh-thanh-mini", [90, 95, 88, 94, 92, 3], "PhÃ²ng gáº§n khu vá»±c mong muá»‘n, cÃ³ WC riÃªng vÃ  nhiá»u tiá»‡n Ã­ch.", "accepted"],
    ["student3@example.com", null, "lang-dai-hoc", [92, 90, 72, 84, 88, 6], "GiÃ¡ phÃ¹ há»£p, thuáº­n tiá»‡n Ä‘i há»c vÃ  cÃ³ chá»— gá»­i xe.", "suggested"],
    ["student4@example.com", null, "di-an-student", [98, 96, 86, 78, 89, 8], "Chi phÃ­ tháº¥p, gáº§n khu vá»±c mong muá»‘n vÃ  phÃ¹ há»£p sinh viÃªn.", "viewed"],
    ["student5@example.com", null, "quan-10", [82, 94, 80, 96, 86, 12], "Nhiá»u tiá»‡n Ã­ch vÃ  gáº§n trÆ°á»ng nhÆ°ng bÃ i Ä‘Äƒng Ä‘ang chá» xÃ¡c minh.", "suggested"],
    ["student6@example.com", null, "pending-room", [88, 92, 85, 90, 78, 15], "PhÃ²ng gáº§n khu vá»±c mong muá»‘n nhÆ°ng bÃ i Ä‘Äƒng chÆ°a xÃ¡c minh.", "rejected"],
    ["student7@example.com", null, "go-vap-balcony", [64, 96, 68, 80, 82, 7], "Vá»‹ trÃ­ phÃ¹ há»£p nhÆ°ng giÃ¡ hÆ¡i cao so vá»›i ngÃ¢n sÃ¡ch.", "expired"],
    ["student8@example.com", null, "linh-trung", [94, 99, 92, 90, 95, 4], "Gáº§n HCMUS, cÃ³ há»£p Ä‘á»“ng vÃ  Ä‘iá»ƒm tin cáº­y cao.", "accepted"],
    ["student8@example.com", null, "hidden-cost", [90, 60, 70, 62, 40, 68], "GiÃ¡ phÃ²ng vá»«a táº§m nhÆ°ng rá»§i ro cao do cÃ³ bÃ¡o cÃ¡o chi phÃ­ áº©n.", "rejected"],
    ["student1@example.com", "student4@example.com", null, [90, 88, 96, 82, 94, 2], "Lá»‘i sá»‘ng tÆ°Æ¡ng Ä‘á»“ng, cÃ¹ng Æ°u tiÃªn yÃªn tÄ©nh vÃ  khÃ´ng hÃºt thuá»‘c.", "suggested"],
    ["student2@example.com", "student6@example.com", "binh-thanh-mini", [88, 96, 92, 90, 93, 3], "CÃ¹ng tÃ¬m phÃ²ng BÃ¬nh Tháº¡nh, ngÃ¢n sÃ¡ch vÃ  thÃ³i quen sinh hoáº¡t phÃ¹ há»£p.", "accepted"],
    ["student3@example.com", "student7@example.com", null, [94, 80, 62, 70, 72, 10], "NgÃ¢n sÃ¡ch tÆ°Æ¡ng Ä‘á»“ng nhÆ°ng cáº§n trao Ä‘á»•i thÃªm vá» hÃºt thuá»‘c vÃ  vá»‡ sinh.", "viewed"],
    ["student4@example.com", "student8@example.com", "lang-dai-hoc", [91, 86, 94, 84, 92, 5], "CÃ¹ng Æ°u tiÃªn há»£p Ä‘á»“ng rÃµ rÃ ng vÃ  sinh hoáº¡t Ä‘iá»u Ä‘á»™.", "suggested"],
    ["student5@example.com", "student2@example.com", null, [86, 82, 78, 90, 88, 4], "CÃ³ thá»ƒ ghÃ©p phÃ²ng, cÃ¹ng thÃ­ch náº¥u Äƒn vÃ  cháº¥p nháº­n thÃº cÆ°ng.", "expired"],
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
    ["student1@example.com", null, "linh-trung", 5, "PhÃ²ng sáº¡ch, Ä‘Ãºng mÃ´ táº£, chá»§ nhÃ  há»— trá»£ tá»‘t.", "room", true],
    ["student2@example.com", null, "binh-thanh-mini", 4, "PhÃ²ng thoÃ¡ng vÃ  tiá»‡n Ä‘i há»c, phÃ­ gá»­i xe hÆ¡i cao.", "room", true],
    ["student3@example.com", null, "lang-dai-hoc", 4, "GÃ¡c rá»™ng, phÃ¹ há»£p á»Ÿ ghÃ©p sinh viÃªn.", "room", true],
    ["student4@example.com", null, "di-an-student", 5, "GiÃ¡ há»£p lÃ½ vÃ  khu vá»±c khÃ¡ yÃªn tÄ©nh.", "room", true],
    ["student5@example.com", null, "quan-10", 3, "PhÃ²ng á»•n nhÆ°ng cáº§n ghi rÃµ hÆ¡n vá» tiá»n Ä‘iá»‡n nÆ°á»›c.", "room", true],
    ["student6@example.com", null, "pending-room", 3, "ThÃ´ng tin phÃ²ng chÆ°a Ä‘áº§y Ä‘á»§, cáº§n bá»• sung hÃ¬nh áº£nh.", "room", false],
    ["student7@example.com", null, "hidden-cost", 1, "CÃ³ nhiá»u khoáº£n phÃ­ phÃ¡t sinh chÆ°a Ä‘Æ°á»£c nÃªu rÃµ.", "room", true],
    ["student8@example.com", "student1@example.com", null, 5, "Báº¡n á»Ÿ ghÃ©p giá»¯ vá»‡ sinh tá»‘t, sinh hoáº¡t yÃªn tÄ©nh.", "roommate", true],
    ["student1@example.com", "student4@example.com", null, 5, "Trao Ä‘á»•i lá»‹ch sá»± vÃ  cÃ³ giá» giáº¥c phÃ¹ há»£p.", "roommate", true],
    ["student2@example.com", "student6@example.com", null, 4, "CÃ³ Ã½ thá»©c dá»n dáº¹p vÃ  chia sáº» cÃ´ng viá»‡c chung.", "roommate", true],
    ["student3@example.com", "student7@example.com", null, 2, "Cáº§n thá»‘ng nháº¥t ká»¹ hÆ¡n vá» viá»‡c hÃºt thuá»‘c.", "roommate", false],
    ["student1@example.com", "owner1@example.com", null, 5, "Chá»§ trá» pháº£n há»“i nhanh, há»£p Ä‘á»“ng rÃµ rÃ ng.", "owner", true],
    ["student2@example.com", "owner2@example.com", null, 4, "Chá»§ nhÃ  há»— trá»£ tá»‘t vÃ  cung cáº¥p Ä‘á»§ thÃ´ng tin.", "owner", true],
    ["student7@example.com", "owner3@example.com", null, 2, "ThÃ´ng tin tiá»n Ä‘iá»‡n nÆ°á»›c cáº§n ghi rÃµ hÆ¡n.", "owner", true],
    ["student8@example.com", "owner1@example.com", null, 5, "TÆ° váº¥n nhiá»‡t tÃ¬nh, phÃ²ng Ä‘Ãºng hÃ¬nh áº£nh.", "owner", true],
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
    ["student1@example.com", "cheap-no-contract", "owner3@example.com", "unclear_contract", "BÃ i Ä‘Äƒng ghi cÃ³ há»£p Ä‘á»“ng nhÆ°ng khi liÃªn há»‡ láº¡i nÃ³i chá»‰ thá»a thuáº­n miá»‡ng.", null, "high", "reviewing", "admin@example.com"],
    ["student7@example.com", "hidden-cost", "owner3@example.com", "hidden_cost", "PhÃ­ Ä‘iá»‡n nÆ°á»›c thá»±c táº¿ cao hÆ¡n nhiá»u so vá»›i mÃ´ táº£.", "https://res.cloudinary.com/demo/image/upload/sample.jpg", "high", "resolved", "admin@example.com"],
    ["student5@example.com", null, "owner3@example.com", "deposit_scam", "NgÆ°á»i Ä‘Äƒng yÃªu cáº§u chuyá»ƒn cá»c trÆ°á»›c khi xem phÃ²ng.", null, "high", "pending", null],
    ["student6@example.com", "pending-room", null, "wrong_information", "ThÃ´ng tin diá»‡n tÃ­ch phÃ²ng khÃ´ng Ä‘Ãºng vá»›i thá»±c táº¿.", null, "medium", "reviewing", "admin@example.com"],
    ["student2@example.com", "hidden-cost", null, "unsafe_location", "Lá»‘i vÃ o phÃ²ng thiáº¿u Ä‘Ã¨n vÃ  khÃ¡ váº¯ng vÃ o buá»•i tá»‘i.", null, "medium", "pending", null],
    ["student4@example.com", null, "student7@example.com", "bad_roommate_behavior", "Báº¡n á»Ÿ ghÃ©p thÆ°á»ng xuyÃªn hÃºt thuá»‘c trong phÃ²ng dÃ¹ Ä‘Ã£ thá»‘ng nháº¥t trÆ°á»›c.", null, "medium", "resolved", "admin@example.com"],
    ["student8@example.com", "cheap-no-contract", "owner3@example.com", "fake_post", "HÃ¬nh áº£nh bÃ i Ä‘Äƒng khÃ¡c nhiá»u so vá»›i phÃ²ng Ä‘Æ°á»£c dáº«n Ä‘i xem.", "https://res.cloudinary.com/demo/image/upload/docs/models.jpg", "high", "rejected", "admin@example.com"],
    ["student3@example.com", "go-vap-balcony", null, "other", "Cáº§n bá»• sung hÆ°á»›ng dáº«n rÃµ hÆ¡n vá» khu vá»±c gá»­i xe.", null, "low", "pending", null],
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

  console.log("\nSeed database máº«u thÃ nh cÃ´ng.");
  console.table(counts);
  console.log(`
TÃ i khoáº£n demo:
  Admin:   admin@example.com   / ${demoPassword}
  Owner:   owner1@example.com  / ${demoPassword}
  Student: student1@example.com / ${demoPassword}
`);
}

main()
  .catch((error) => {
    console.error("Seed database tháº¥t báº¡i:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

