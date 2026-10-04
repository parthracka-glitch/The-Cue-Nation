import prisma from "@/lib/db";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  meta?: any;
}

export async function logAudit(params: LogAuditParams, tx?: any) {
  try {
    const client = tx || prisma;

    let targetUserId = params.userId;
    if (!targetUserId) {
      const fallbackUser = await prisma.user.findFirst({ select: { id: true } });
      targetUserId = fallbackUser?.id;
    }

    if (!targetUserId) return;

    await client.auditLog.create({
      data: {
        userId: targetUserId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        meta: params.meta ? JSON.stringify(params.meta) : null,
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
