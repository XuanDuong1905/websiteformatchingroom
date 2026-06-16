import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSearchQuery } from "@/lib/utils/searchParser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    if (q.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const parsed = parseSearchQuery(q);
    const suggestions: Array<{ text: string; type: "location" | "room" | "profile" }> = [];

    // Suggest District if parsed
    if (parsed.district) {
      suggestions.push({ text: `Khu vực: ${parsed.district}`, type: "location" });
    } else {
      // Free text district matching
      const districts = await prisma.room.findMany({
        where: { district: { contains: parsed.keyword } },
        select: { district: true },
        distinct: ["district"],
        take: 3,
      });
      districts.forEach((d: { district: string | null }) => {
        if (d.district) {
          suggestions.push({ text: `Phòng tại ${d.district}`, type: "location" });
        }
      });
    }

    // Suggest Rooms
    const rooms = await prisma.room.findMany({
      where: {
        status: "ACTIVE",
        title: { contains: parsed.keyword || q },
      },
      select: { title: true },
      take: 3,
    });
    rooms.forEach((r: { title: string }) => {
      suggestions.push({ text: r.title, type: "room" });
    });

    // Suggest Schools / Profiles
    const profiles = await prisma.userProfile.findMany({
      where: {
        schoolName: { contains: parsed.keyword || q },
      },
      select: { schoolName: true },
      distinct: ["schoolName"],
      take: 2,
    });
    profiles.forEach((p: { schoolName: string | null }) => {
      if (p.schoolName) {
        suggestions.push({ text: `Sinh viên ${p.schoolName}`, type: "profile" });
      }
    });

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Suggest API error", error);
    return NextResponse.json(
      { success: false, message: "Lỗi suggestion" },
      { status: 500 },
    );
  }
}
