import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReportService } from "@/server/services/report.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized: Admin or Staff reports access only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    const analytics = await ReportService.getAnalytics(range);
    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load reports" },
      { status: 500 }
    );
  }
}
