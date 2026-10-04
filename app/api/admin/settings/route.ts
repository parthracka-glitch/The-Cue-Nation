import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    });

    // Fetch simulated notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    // Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return NextResponse.json({
      settings: settingsMap,
      notifications,
      auditLogs,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// Reset Demo Data (re-seed) or Update Settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === "RESET_DEMO") {
      // Run seed command in child process
      await execAsync("npx tsx prisma/seed.ts");
      return NextResponse.json({ success: true, message: "Demo data reset successfully!" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Settings action failed:", error);
    return NextResponse.json({ error: "Failed to perform settings action" }, { status: 500 });
  }
}
