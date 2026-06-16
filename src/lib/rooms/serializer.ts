import { Prisma, type RoomImage, type User } from "@prisma/client";

type PublicLandlord = Pick<
  User,
  "id" | "fullName" | "phone" | "avatarUrl" | "reputationScore"
>;

export type RoomWithPublicRelations = Prisma.RoomGetPayload<{
  include: {
    images: true;
    landlord: {
      select: {
        id: true;
        fullName: true;
        phone: true;
        avatarUrl: true;
        reputationScore: true;
      };
    };
  };
}>;

function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  return value == null ? null : Number(value);
}

function serializeImage(image: RoomImage) {
  return {
    id: image.id,
    roomId: image.roomId,
    imageUrl: image.imageUrl,
    createdAt: image.createdAt,
  };
}

function serializeLandlord(landlord: PublicLandlord) {
  return {
    id: landlord.id,
    fullName: landlord.fullName,
    phone: landlord.phone,
    avatarUrl: landlord.avatarUrl,
    reputationScore: Number(landlord.reputationScore),
  };
}

export function serializeRoom(room: RoomWithPublicRelations) {
  const area = decimalToNumber(room.area);
  const latitude = decimalToNumber(room.latitude);
  const longitude = decimalToNumber(room.longitude);
  const images = room.images.map(serializeImage);
  const landlord = serializeLandlord(room.landlord);

  return {
    id: room.id,
    title: room.title,
    description: room.description,
    address: room.address,
    ward: room.ward,
    district: room.district,
    city: room.city,
    price: room.price,
    electricPrice: room.electricPrice,
    waterPrice: room.waterPrice,
    serviceFee: room.serviceFee,
    area,
    maxOccupants: room.maxOccupants,
    currentOccupants: room.currentOccupants,
    latitude,
    longitude,
    status: room.status,
    landlordId: room.landlordId,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    images,
    landlord,

    // Compatibility aliases for existing homepage/detail components.
    ownerId: room.landlordId,
    owner: landlord,
    electricityFee: room.electricPrice,
    waterFee: room.waterPrice,
    otherFee: room.serviceFee,
    maxPeople: room.maxOccupants,
    currentPeople: room.currentOccupants,
    availableSlots: Math.max(room.maxOccupants - room.currentOccupants, 0),
    riskScore: room.riskScore,
    deposit: room.deposit,
    hasContract: room.hasContract,
    minStayMonths: room.minStayMonths,
    verificationStatus: room.verificationStatus,
  };
}
