import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionService } from "@/server/services/session.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const floorState = await SessionService.getFloorState();
    return NextResponse.json(floorState);
  } catch (error) {
    console.error("Floor state error:", error);
    return NextResponse.json({ error: "Failed to fetch floor state" }, { status: 500 });
  }
}
