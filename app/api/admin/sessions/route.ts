import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { SessionService } from "@/server/services/session.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const newSession = await SessionService.startSession({
      ...body,
      createdById: session.user.id,
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error: any) {
    console.error("Start session error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to start table session" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, sessionId, tableId, targetTableId, statusOverride } = await req.json();

    if (action === "PAUSE" && sessionId) {
      const updated = await SessionService.pauseSession(sessionId, "Staff pause", session.user.id);
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "RESUME" && sessionId) {
      const updated = await SessionService.resumeSession(sessionId, session.user.id);
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "ADD_FRAME" && sessionId) {
      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: { framesPlayed: { increment: 1 } },
      });
      return NextResponse.json({ success: true, framesPlayed: updated.framesPlayed });
    }

    if (action === "MOVE_TABLE" && sessionId && targetTableId) {
      await SessionService.switchTable(sessionId, targetTableId, "Table transfer", session.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "SET_STATUS" && tableId && statusOverride) {
      await prisma.gameTable.update({
        where: { id: tableId },
        data: { status: statusOverride },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Session action error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to perform session action" },
      { status: 500 }
    );
  }
}
