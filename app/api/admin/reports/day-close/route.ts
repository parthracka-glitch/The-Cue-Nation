import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReportService } from "@/server/services/report.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await ReportService.getDayCloseSummary();
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate day close" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { actualCashPaise, notes } = await req.json();

    const record = await ReportService.submitDayClose({
      actualCashPaise,
      notes,
      staffUserId: session.user.id,
    });

    return NextResponse.json({ success: true, dayClose: record });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to commit day close" },
      { status: 500 }
    );
  }
}
